import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

export interface Ruta {
  id: number;
  nombre: string;
  tarifa: number;
  descripcion?: string;
}

export interface Paradero {
  id: number;
  nombre: string;
  latitud: string | number;
  longitud: string | number;
  tipo: string;
}

export interface RutaParadero {
  id: number;
  orden: number;
  distanciaDesdeAnterior: number | null;
  tiempoEstimadoDesdeAnterior: number | null;
  paradero: Paradero;
}

export interface Bus {
  id: number;
  placa: string;
  modelo: string;
  estado: string;
}

export interface Programacion {
  id: number;
  ruta: { id: number; nombre: string };
  bus: Bus;
  conductorAsignado?: { id: number; persona?: { nombres: string; apellidos: string } };
  fecha: string;
  horaSalida: string;
  toleranciaMinutos: number;
  estado: string;
}

export interface Gps {
  id: number;
  bus: { id: number };
  deviceId: string;
  latitud: string | null;
  longitud: string | null;
}

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private base = environment.negocioUrl;

  constructor(private api: ApiService) {}

  getRutas(): Observable<Ruta[]> {
    return this.api.get<Ruta[]>(`${this.base}/ruta`);
  }

  getParaderosDeRuta(rutaId: number): Observable<RutaParadero[]> {
    return this.api.get<RutaParadero[]>(`${this.base}/ruta/${rutaId}/paraderos`);
  }

  getProgramaciones(): Observable<Programacion[]> {
    return this.api.get<any>(`${this.base}/programacion`).pipe(
      map(res => (Array.isArray(res) ? res : (res?.data ?? [])))
    );
  }

  getGps(): Observable<Gps[]> {
    return this.api.get<any>(`${this.base}/gps`).pipe(
      map(res => (Array.isArray(res) ? res : (res?.data ?? [])))
    );
  }
}
