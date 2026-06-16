import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Boleto, BoletoEstado } from '../boleto/entities/boleto.entity';
import { DemografiaQueryDto } from './dto/demografia-query.dto';

export interface IngresosMensualesResponse {
  meses: string[];
  series: { metodoPago: string; data: number[] }[];
  totales: { metodoPago: string; total: number; porcentaje: number }[];
  totalGeneral: number;
  rango: { desde: string; hasta: string; meses: number };
}

export interface DemografiaResponse {
  rangos: {
    rango: string;
    cantidad: number;
    porcentaje: number;
    variacionVsMesAnterior: number;
  }[];
  totalPasajeros: number;
  rango: { desde: string; hasta: string; rutaId: number | null };
}

const RANGOS_ETARIOS = [
  'Menores (0-17)',
  'Jóvenes (18-25)',
  'Adultos jóvenes (26-40)',
  'Adultos (41-60)',
  'Adultos mayores (60+)',
  'Sin información',
] as const;

const MESES_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Boleto)
    private readonly boletoRepo: Repository<Boleto>,
  ) {}

  async ingresosPorMes(meses: number): Promise<IngresosMensualesResponse> {
    if (![3, 6, 12].includes(meses)) {
      throw new BadRequestException('El parámetro "meses" debe ser 3, 6 o 12.');
    }

    const hasta = new Date();
    const desde = new Date(hasta.getFullYear(), hasta.getMonth() - (meses - 1), 1);

    const boletos = await this.boletoRepo.find({
      where: { estado: BoletoEstado.COMPLETADO },
      relations: {
        metodoPagoCiudadano: { metodoPago: true },
        programacion: true,
      },
    });

    const bucketsMes: string[] = [];
    for (let i = 0; i < meses; i++) {
      const d = new Date(desde.getFullYear(), desde.getMonth() + i, 1);
      bucketsMes.push(`${MESES_ES[d.getMonth()]} ${d.getFullYear()}`);
    }

    // Mapa: metodoPagoNombre -> array(meses) de totales
    const seriesMap = new Map<string, number[]>();

    for (const b of boletos) {
      const refFecha =
        b.horaFin ?? b.programacion?.fecha ?? b.createdAt;
      if (!refFecha) continue;
      const fecha = new Date(refFecha);
      if (fecha < desde || fecha > hasta) continue;

      const idx =
        (fecha.getFullYear() - desde.getFullYear()) * 12 +
        (fecha.getMonth() - desde.getMonth());
      if (idx < 0 || idx >= meses) continue;

      const nombreMetodo =
        b.metodoPagoCiudadano?.metodoPago?.nombre ?? 'Sin método';
      const costo = parseFloat(b.costo as unknown as string) || 0;

      if (!seriesMap.has(nombreMetodo)) {
        seriesMap.set(nombreMetodo, new Array(meses).fill(0));
      }
      seriesMap.get(nombreMetodo)![idx] += costo;
    }

    const series = Array.from(seriesMap.entries())
      .map(([metodoPago, data]) => ({
        metodoPago,
        data: data.map((v) => Math.round(v * 100) / 100),
      }))
      .sort((a, b) => a.metodoPago.localeCompare(b.metodoPago));

    const totalGeneral = series.reduce(
      (acc, s) => acc + s.data.reduce((a, b) => a + b, 0),
      0,
    );

    const totales = series
      .map((s) => {
        const total = s.data.reduce((a, b) => a + b, 0);
        const porcentaje =
          totalGeneral > 0
            ? Math.round((total / totalGeneral) * 1000) / 10
            : 0;
        return {
          metodoPago: s.metodoPago,
          total: Math.round(total * 100) / 100,
          porcentaje,
        };
      })
      .sort((a, b) => b.total - a.total);

    return {
      meses: bucketsMes,
      series,
      totales,
      totalGeneral: Math.round(totalGeneral * 100) / 100,
      rango: {
        desde: desde.toISOString().slice(0, 10),
        hasta: hasta.toISOString().slice(0, 10),
        meses,
      },
    };
  }

  async demografia(query: DemografiaQueryDto): Promise<DemografiaResponse> {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const desde = query.fechaInicio
      ? this.parseLocalDate(query.fechaInicio)
      : primerDiaMes;
    const hasta = query.fechaFin
      ? this.parseLocalDate(query.fechaFin)
      : hoy;

    if (desde > hasta) {
      throw new BadRequestException('fechaInicio no puede ser posterior a fechaFin.');
    }

    const rutaId = query.rutaId ?? null;

    // Periodo anterior: mismo rango desplazado un mes atrás.
    const desdeAnterior = new Date(desde);
    desdeAnterior.setMonth(desdeAnterior.getMonth() - 1);
    const hastaAnterior = new Date(hasta);
    hastaAnterior.setMonth(hastaAnterior.getMonth() - 1);

    const conteoActual = await this.contarPorRango(desde, hasta, rutaId);
    const conteoAnterior = await this.contarPorRango(desdeAnterior, hastaAnterior, rutaId);

    const totalPasajeros = conteoActual.reduce((a, b) => a + b, 0);

    const rangos = RANGOS_ETARIOS.map((nombre, i) => {
      const cantidad = conteoActual[i];
      const porcentaje =
        totalPasajeros > 0
          ? Math.round((cantidad / totalPasajeros) * 1000) / 10
          : 0;
      return {
        rango: nombre,
        cantidad,
        porcentaje,
        variacionVsMesAnterior: cantidad - conteoAnterior[i],
      };
    });

    return {
      rangos,
      totalPasajeros,
      rango: {
        desde: this.toIsoLocal(desde),
        hasta: this.toIsoLocal(hasta),
        rutaId,
      },
    };
  }

  private async contarPorRango(
    desde: Date,
    hasta: Date,
    rutaId: number | null,
  ): Promise<number[]> {
    const desdeInicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate(), 0, 0, 0);
    const hastaFin = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate(), 23, 59, 59, 999);

    // Demografía: cualquier boleto que represente un viaje real (ACTIVO o COMPLETADO).
    // CANCELADO no cuenta porque el pasajero no viajó.
    const boletos = await this.boletoRepo.find({
      where: { estado: In([BoletoEstado.ACTIVO, BoletoEstado.COMPLETADO]) },
      relations: {
        ciudadano: true,
        programacion: { ruta: true },
      },
    });

    const buckets = new Array(RANGOS_ETARIOS.length).fill(0);

    // TODO: quitar logs después de verificar.
    console.log('[DEMOGRAFIA] boletos cargados:', boletos.length, 'desde', desdeInicio, 'hasta', hastaFin, 'rutaId', rutaId);
    for (const b of boletos) {
      console.log('[DEMOGRAFIA] boleto', {
        id: b.id,
        estado: b.estado,
        horaFin: b.horaFin,
        createdAt: b.createdAt,
        ciudadanoId: (b.ciudadano as any)?.id,
        fechaNacimiento: b.ciudadano?.fechaNacimiento,
        rutaId: (b.programacion as any)?.ruta?.id,
        programacionFecha: b.programacion?.fecha,
      });
    }

    for (const b of boletos) {
      // Fecha de referencia del boleto: igual patrón que el reporte de ingresos.
      const refRaw = b.horaFin ?? b.programacion?.fecha ?? b.createdAt;
      if (!refRaw) continue;
      const refBoleto = refRaw instanceof Date ? refRaw : new Date(refRaw);
      if (isNaN(refBoleto.getTime())) continue;
      if (refBoleto < desdeInicio || refBoleto > hastaFin) continue;

      if (rutaId != null) {
        const idRuta = (b.programacion as any)?.ruta?.id;
        if (Number(idRuta) !== Number(rutaId)) continue;
      }

      const fechaNac = b.ciudadano?.fechaNacimiento;
      const idx = this.indiceRango(fechaNac, refBoleto);
      buckets[idx]++;
    }

    return buckets;
  }

  private indiceRango(fechaNacimiento: string | Date | null | undefined, fechaRef: Date): number {
    if (!fechaNacimiento) return 5;

    // fechaNacimiento llega como "YYYY-MM-DD" (typeorm 'date'). new Date(string)
    // lo interpreta como UTC y en UTC-5 cae al día anterior, lo que tumba la
    // edad por 1 año en la frontera de cumpleaños. Parseamos como fecha local.
    let anio: number, mes: number, dia: number;
    if (typeof fechaNacimiento === 'string') {
      const soloFecha = fechaNacimiento.slice(0, 10);
      const partes = soloFecha.split('-').map(Number);
      if (partes.length !== 3 || partes.some((n) => isNaN(n))) return 5;
      [anio, mes, dia] = partes;
    } else {
      anio = fechaNacimiento.getFullYear();
      mes = fechaNacimiento.getMonth() + 1;
      dia = fechaNacimiento.getDate();
    }

    let edad = fechaRef.getFullYear() - anio;
    const diffMes = fechaRef.getMonth() + 1 - mes;
    if (diffMes < 0 || (diffMes === 0 && fechaRef.getDate() < dia)) edad--;

    if (edad < 0) return 5;
    if (edad <= 17) return 0;
    if (edad <= 25) return 1;
    if (edad <= 40) return 2;
    if (edad <= 60) return 3;
    return 4;
  }

  private parseLocalDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  private toIsoLocal(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
