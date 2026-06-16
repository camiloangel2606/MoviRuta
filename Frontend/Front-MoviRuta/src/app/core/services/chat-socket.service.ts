import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Ubicación de un bus emitida por ms-chat en tiempo real (evento "ubicacion_bus"). */
export interface UbicacionBus {
  conductor_id: string;
  ruta_id: string | null;
  lat: number;
  lng: number;
  timestamp: string;
}

/**
 * Cliente WebSocket del microservicio ms-chat (puerto 4000).
 *
 * Encapsula la conexión `ws://.../ws/{usuario_id}?token=JWT`, el envío de la
 * ubicación del conductor y la recepción en tiempo real de las posiciones de
 * los buses (broadcast "ubicacion_bus"). Reconecta automáticamente si se cae.
 */
@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private manualClose = false;

  private ubicacionesSubject = new Subject<UbicacionBus>();
  /** Stream de ubicaciones de buses recibidas en tiempo real. */
  public ubicaciones$: Observable<UbicacionBus> = this.ubicacionesSubject.asObservable();

  private connectedSubject = new Subject<boolean>();
  public connected$: Observable<boolean> = this.connectedSubject.asObservable();

  constructor(private zone: NgZone) {}

  /** Origen WS derivado de chatUrl: http://localhost:4000/api/chat -> ws://localhost:4000 */
  private get wsOrigin(): string {
    const base = environment.chatUrl.replace(/\/api\/chat\/?$/, '');
    return base.replace(/^http/, 'ws');
  }

  /** Lee el claim `id` del JWT guardado en localStorage (mismo que valida ms-chat). */
  private getUsuarioId(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id ?? payload.sub ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Abre la conexión WebSocket con el token actual. Si ya está abierta, no hace nada.
   * @param token JWT del usuario (de AuthService.getToken()).
   */
  connect(token: string): void {
    if (this.ws && this.ws.readyState <= WebSocket.OPEN) return;
    const usuarioId = this.getUsuarioId(token);
    if (!usuarioId) {
      console.warn('[ChatSocket] No se pudo extraer el id del token');
      return;
    }

    this.manualClose = false;
    const url = `${this.wsOrigin}/ws/${encodeURIComponent(usuarioId)}?token=${encodeURIComponent(token)}`;

    // Fuera de Angular: los eventos WS no deben disparar change-detection en cada mensaje.
    this.zone.runOutsideAngular(() => {
      const ws = new WebSocket(url);
      this.ws = ws;

      ws.onopen = () => {
        this.zone.run(() => this.connectedSubject.next(true));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg?.tipo === 'ubicacion_bus' && msg.data) {
            this.zone.run(() => this.ubicacionesSubject.next(msg.data as UbicacionBus));
          }
        } catch {
          /* mensaje no-JSON, ignorar */
        }
      };

      ws.onclose = () => {
        this.zone.run(() => this.connectedSubject.next(false));
        this.ws = null;
        if (!this.manualClose) this.scheduleReconnect(token);
      };

      ws.onerror = () => {
        ws.close();
      };
    });
  }

  private scheduleReconnect(token: string): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(token);
    }, 3000);
  }

  /** Envía la ubicación del conductor: { tipo: "ubicacion_conductor", data: {...} }. */
  enviarUbicacion(lat: number, lng: number, rutaId?: string | number | null): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        tipo: 'ubicacion_conductor',
        data: { lat, lng, ruta_id: rutaId != null ? String(rutaId) : null },
      })
    );
  }

  /** Cierra la conexión y cancela la reconexión automática. */
  disconnect(): void {
    this.manualClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }
}
