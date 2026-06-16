import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, EMPTY, forkJoin, timer } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import * as L from 'leaflet';
import { SkeletonLoaderComponent } from '../../../shared/components/loader/loader.component';
import { ToastService } from '../../../core/services/toast.service';
import {
  Gps,
  Programacion,
  Ruta,
  RutaParadero,
  SeguimientoService,
} from './seguimiento.service';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
});

interface BusDato {
  programacion: Programacion;
  gps: Gps;
  lat: number;
  lng: number;
}

interface BusEnMapa extends BusDato {
  nearestParaderoNombre: string;
  etaMinutos: number | null;
  retrasado: boolean;
}

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.scss',
})
export class SeguimientoComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  rutas: Ruta[] = [];
  rutaSeleccionada: number | null = null;
  paraderosMapa: RutaParadero[] = [];
  busesActivos: BusEnMapa[] = [];
  miParaderoId: number | null = null;
  miParaderoNombre: string | null = null;

  isLoading = true;
  isCargandoMapa = false;
  errorCarga: string | null = null;

  private mapa: L.Map | null = null;
  private markersBuses = new Map<number, L.Marker>();
  private markersParaderos: L.CircleMarker[] = [];
  private retrasoAlertados = new Set<number>();
  private busDatos: BusDato[] = [];

  private rutaSubject = new BehaviorSubject<number | null>(null);

  constructor(
    private svc: SeguimientoService,
    private toast: ToastService,
    private zone: NgZone
  ) {
    this.rutaSubject
      .pipe(
        filter((id): id is number => id !== null),
        switchMap(rutaId => {
          this.isCargandoMapa = true;
          this.busDatos = [];
          this.busesActivos = [];
          this.miParaderoId = null;
          this.miParaderoNombre = null;
          this.retrasoAlertados.clear();
          this.limpiarMarcadores();

          return this.svc.getParaderosDeRuta(rutaId).pipe(
            switchMap(paraderos => {
              this.paraderosMapa = paraderos;
              this.dibujarParaderos();
              this.ajustarMapaAParaderos();
              this.isCargandoMapa = false;

              return timer(0, 10000).pipe(
                switchMap(() =>
                  forkJoin({
                    programaciones: this.svc.getProgramaciones(),
                    gpsData: this.svc.getGps(),
                  }).pipe(catchError(() => EMPTY))
                )
              );
            }),
            catchError(() => {
              this.isCargandoMapa = false;
              this.errorCarga = 'No se pudieron cargar los datos de la ruta.';
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ programaciones, gpsData }) => {
          this.procesarBuses(programaciones, gpsData, this.rutaSubject.value!);
        },
      });
  }

  ngOnInit(): void {
    this.svc.getRutas().subscribe({
      next: rutas => {
        this.rutas = rutas;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorCarga = 'No se pudieron cargar las rutas disponibles.';
      },
    });
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
    this.mapa = null;
  }

  @ViewChild('mapaEl') set mapaEl(el: ElementRef<HTMLDivElement>) {
    if (el && !this.mapa) {
      this.zone.runOutsideAngular(() => {
        this.mapa = L.map(el.nativeElement, { zoomControl: true }).setView(
          [4.6, -74.08],
          12
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        }).addTo(this.mapa);
      });
    }
  }

  onRutaChange(rutaId: number): void {
    this.errorCarga = null;
    this.rutaSubject.next(rutaId);
  }

  // ─────────────────────── Procesamiento ───────────────────────

  private procesarBuses(programaciones: Programacion[], gpsData: Gps[], rutaId: number): void {
    const activas = programaciones.filter(
      p => Number(p.ruta?.id) === rutaId && p.estado === 'EN_CURSO'
    );

    this.busDatos = [];
    for (const prog of activas) {
      const gps = gpsData.find(g => Number(g.bus?.id) === Number(prog.bus?.id));
      if (!gps || gps.latitud == null || gps.longitud == null) continue;
      const lat = parseFloat(gps.latitud as string);
      const lng = parseFloat(gps.longitud as string);
      if (isNaN(lat) || isNaN(lng)) continue;
      this.busDatos.push({ programacion: prog, gps, lat, lng });
    }

    this.computarBuses();
    this.actualizarMarcadoresBuses();
    this.verificarRetrasos();
  }

  private computarBuses(): void {
    this.busesActivos = this.busDatos.map(bd => {
      const nearest = this.findNearestParadero(bd.lat, bd.lng);
      const eta =
        this.miParaderoId != null
          ? this.calcularETA(bd.lat, bd.lng, this.miParaderoId)
          : null;
      const retrasado = this.checkRetraso(bd.programacion);
      return {
        ...bd,
        nearestParaderoNombre: nearest?.paradero.nombre ?? 'En ruta',
        etaMinutos: eta,
        retrasado,
      };
    });
  }

  // ─────────────────────── Mapa ───────────────────────

  private limpiarMarcadores(): void {
    this.zone.runOutsideAngular(() => {
      this.markersParaderos.forEach(m => m.remove());
      this.markersParaderos = [];
      this.markersBuses.forEach(m => m.remove());
      this.markersBuses.clear();
    });
  }

  private dibujarParaderos(): void {
    this.zone.runOutsideAngular(() => {
      this.markersParaderos.forEach(m => m.remove());
      this.markersParaderos = [];
      if (!this.mapa) return;

      for (const rp of this.paraderosMapa) {
        const lat = parseFloat(rp.paradero.latitud as string);
        const lng = parseFloat(rp.paradero.longitud as string);
        if (isNaN(lat) || isNaN(lng)) continue;

        const esSeleccionado = rp.paradero.id === this.miParaderoId;
        const marker = L.circleMarker([lat, lng], {
          radius: esSeleccionado ? 12 : 8,
          fillColor: esSeleccionado ? '#f57c00' : '#1976d2',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(this.mapa);

        marker.bindPopup(
          `<div style="min-width:140px">
            <b>${rp.paradero.nombre}</b><br>
            <span style="font-size:12px;color:#666">${rp.paradero.tipo} · Parada ${rp.orden}</span><br>
            <small style="color:#1976d2">Toca para seleccionar como tu paradero</small>
          </div>`
        );

        marker.on('click', () => {
          this.zone.run(() => {
            this.miParaderoId = rp.paradero.id;
            this.miParaderoNombre = rp.paradero.nombre;
            this.computarBuses();
            this.dibujarParaderos();
            this.actualizarMarcadoresBuses();
          });
        });

        this.markersParaderos.push(marker);
      }
    });
  }

  private actualizarMarcadoresBuses(): void {
    this.zone.runOutsideAngular(() => {
      if (!this.mapa) return;

      const activeBusIds = new Set(this.busesActivos.map(b => b.programacion.bus.id));
      this.markersBuses.forEach((marker, busId) => {
        if (!activeBusIds.has(busId)) {
          marker.remove();
          this.markersBuses.delete(busId);
        }
      });

      for (const bus of this.busesActivos) {
        const busId = bus.programacion.bus.id;
        const etaTexto =
          bus.etaMinutos != null
            ? `<br><b>ETA a tu paradero:</b> ~${bus.etaMinutos} min`
            : `<br><small style="color:#888">Selecciona un paradero para el tiempo estimado</small>`;
        const retrasoHtml = bus.retrasado
          ? `<br><span style="color:#d32f2f;font-size:12px">⚠ Posible retraso</span>`
          : '';
        const popupHtml = `
          <div style="min-width:160px">
            <b>Bus ${bus.programacion.bus.placa}</b><br>
            <span style="font-size:12px;color:#666">${bus.programacion.bus.modelo}</span><br>
            <b>Paradero cercano:</b> ${bus.nearestParaderoNombre}
            ${etaTexto}${retrasoHtml}
          </div>`;

        const iconHtml = `<div class="bus-map-marker${bus.retrasado ? ' bus-retrasado' : ''}">
          <span class="material-icons">directions_bus</span>
        </div>`;

        const icon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -20],
        });

        if (this.markersBuses.has(busId)) {
          const marker = this.markersBuses.get(busId)!;
          marker.setLatLng([bus.lat, bus.lng]);
          marker.setIcon(icon);
          marker.setPopupContent(popupHtml);
        } else {
          const marker = L.marker([bus.lat, bus.lng], { icon })
            .addTo(this.mapa)
            .bindPopup(popupHtml);
          this.markersBuses.set(busId, marker);
        }
      }
    });
  }

  private ajustarMapaAParaderos(): void {
    if (!this.mapa || this.paraderosMapa.length === 0) return;
    this.zone.runOutsideAngular(() => {
      const latlngs: L.LatLngExpression[] = [];
      for (const rp of this.paraderosMapa) {
        const lat = parseFloat(rp.paradero.latitud as string);
        const lng = parseFloat(rp.paradero.longitud as string);
        if (!isNaN(lat) && !isNaN(lng)) latlngs.push([lat, lng]);
      }
      if (latlngs.length > 0) {
        this.mapa!.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
      }
    });
  }

  // ─────────────────────── Helpers ───────────────────────

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private findNearestParadero(lat: number, lng: number): RutaParadero | undefined {
    let nearest: RutaParadero | undefined;
    let minDist = Infinity;
    for (const rp of this.paraderosMapa) {
      const pLat = parseFloat(rp.paradero.latitud as string);
      const pLng = parseFloat(rp.paradero.longitud as string);
      if (isNaN(pLat) || isNaN(pLng)) continue;
      const dist = this.haversineKm(lat, lng, pLat, pLng);
      if (dist < minDist) {
        minDist = dist;
        nearest = rp;
      }
    }
    return nearest;
  }

  private calcularETA(busLat: number, busLng: number, paraderoId: number): number {
    const targetRp = this.paraderosMapa.find(rp => rp.paradero.id === paraderoId);
    if (!targetRp) return 0;
    const targetLat = parseFloat(targetRp.paradero.latitud as string);
    const targetLng = parseFloat(targetRp.paradero.longitud as string);
    if (isNaN(targetLat) || isNaN(targetLng)) return 0;

    // Intento con tiempoEstimadoDesdeAnterior si el paradero objetivo está adelante en la ruta
    const nearest = this.findNearestParadero(busLat, busLng);
    if (nearest) {
      const sorted = [...this.paraderosMapa].sort((a, b) => a.orden - b.orden);
      const nearestIdx = sorted.findIndex(rp => rp.id === nearest.id);
      const targetIdx = sorted.findIndex(rp => rp.paradero.id === paraderoId);
      if (targetIdx > nearestIdx) {
        let totalMin = 0;
        let hasData = false;
        for (let i = nearestIdx + 1; i <= targetIdx; i++) {
          if (sorted[i].tiempoEstimadoDesdeAnterior != null) {
            totalMin += sorted[i].tiempoEstimadoDesdeAnterior!;
            hasData = true;
          }
        }
        if (hasData) return Math.max(0, Math.round(totalMin));
      }
    }

    // Fallback: Haversine / 25 km/h velocidad promedio de bus urbano
    const distKm = this.haversineKm(busLat, busLng, targetLat, targetLng);
    return Math.max(1, Math.round((distKm / 25) * 60));
  }

  private checkRetraso(prog: Programacion): boolean {
    const fechaStr = prog.fecha.substring(0, 10);
    const [year, month, day] = fechaStr.split('-').map(Number);
    const [hh, mm] = prog.horaSalida.split(':').map(Number);
    const salida = new Date(year, month - 1, day, hh, mm, 0, 0);
    const tolerancia = (prog.toleranciaMinutos ?? 0) + 10;
    return Date.now() > salida.getTime() + tolerancia * 60_000;
  }

  private verificarRetrasos(): void {
    for (const bus of this.busesActivos) {
      if (bus.retrasado && !this.retrasoAlertados.has(bus.programacion.id)) {
        this.retrasoAlertados.add(bus.programacion.id);
        this.toast.warning(
          `Bus ${bus.programacion.bus.placa} lleva más de 10 min de retraso`
        );
      }
    }
  }
}
