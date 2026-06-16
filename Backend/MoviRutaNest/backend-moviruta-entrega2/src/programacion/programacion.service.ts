import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Bus } from '../bus/entities/bus.entity';
import { Conductor } from '../conductor/entities/conductor.entity';
import { Ruta } from '../ruta/entities/ruta.entity';
import { CreateProgramacionDto } from './dto/create-programacion.dto';
import { FindProgramacionQueryDto } from './dto/find-programacion-query.dto';
import { UpdateProgramacionDto } from './dto/update-programacion.dto';
import { Programacion, ProgramacionRecurrente } from './entities/programacion.entity';

@Injectable()
export class ProgramacionService {
  constructor(
    @InjectRepository(Programacion)
    private readonly programacionRepository: Repository<Programacion>,
    @InjectRepository(Ruta)
    private readonly rutaRepository: Repository<Ruta>,
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
    @InjectRepository(Conductor)
    private readonly conductorRepository: Repository<Conductor>,
  ) {}

  async create(createProgramacionDto: CreateProgramacionDto): Promise<Programacion> {
    const ruta = await this.getRutaOrThrow(createProgramacionDto.rutaId);
    const bus = await this.getBusOrThrow(createProgramacionDto.busId);
    const conductor = await this.getConductorOrThrow(createProgramacionDto.conductorId);

    const toleranciaMinutos = createProgramacionDto.toleranciaMinutos ?? 0;
    await this.ensureNoOverlap(bus.id, createProgramacionDto.fecha, createProgramacionDto.horaSalida, toleranciaMinutos);

    const programacion = this.programacionRepository.create({
      ruta,
      bus,
      fecha: createProgramacionDto.fecha,
      horaSalida: createProgramacionDto.horaSalida,
      recurrente: createProgramacionDto.recurrente ?? ProgramacionRecurrente.UNICA,
      toleranciaMinutos,
      estado: 'PROGRAMADO',
      conductorAsignado: conductor,
    });

    try {
      return await this.programacionRepository.save(programacion);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(query: FindProgramacionQueryDto): Promise<Programacion[]> {
    const qb = this.programacionRepository
      .createQueryBuilder('programacion')
      .leftJoinAndSelect('programacion.ruta', 'ruta')
      .leftJoinAndSelect('ruta.paraderosEnRuta', 'paraderosEnRuta')       // ← añadido
      .leftJoinAndSelect('paraderosEnRuta.paradero', 'paradero')           // ← añadido
      .leftJoinAndSelect('programacion.bus', 'bus')
      .leftJoinAndSelect('programacion.conductorAsignado', 'conductorAsignado')
      .leftJoinAndSelect('conductorAsignado.persona', 'persona');

    if (query.rutaId) {
      qb.andWhere('ruta.id = :rutaId', { rutaId: query.rutaId });
    }
    if (query.busId) {
      qb.andWhere('bus.id = :busId', { busId: query.busId });
    }
    if (query.conductorId) {
      qb.andWhere('conductorAsignado.id = :conductorId', { conductorId: query.conductorId });
    }
    if (query.fecha) {
      qb.andWhere('programacion.fecha = :fecha', { fecha: query.fecha });
    }
    // ── Filtro de estado añadido ──────────────────────────────────────────
    if (query.estado) {
      qb.andWhere('programacion.estado = :estado', { estado: query.estado });
    }

    qb.orderBy('programacion.fecha', 'ASC')
      .addOrderBy('programacion.hora_salida', 'ASC')
      .addOrderBy('programacion.id', 'ASC');

    return qb.getMany();
  }

  async findOne(id: number): Promise<Programacion> {
    const programacion = await this.programacionRepository.findOne({
      where: { id },
      relations: {
        ruta: true,
        bus: true,
        conductorAsignado: { persona: true },
      },
    });

    if (!programacion) {
      throw new NotFoundException('Programacion not found');
    }

    return programacion;
  }

  async update(id: number, updateProgramacionDto: UpdateProgramacionDto): Promise<Programacion> {
    const programacion = await this.programacionRepository.findOne({
      where: { id },
      relations: {
        ruta: true,
        bus: true,
        conductorAsignado: true,
      },
    });
    if (!programacion) {
      throw new NotFoundException('Programacion not found');
    }

    if (updateProgramacionDto.rutaId !== undefined) {
      programacion.ruta = await this.getRutaOrThrow(updateProgramacionDto.rutaId);
    }

    if (updateProgramacionDto.busId !== undefined) {
      programacion.bus = await this.getBusOrThrow(updateProgramacionDto.busId);
    }

    if (updateProgramacionDto.conductorId !== undefined) {
      programacion.conductorAsignado = await this.getConductorOrThrow(
        updateProgramacionDto.conductorId,
      );
    }

    if (updateProgramacionDto.fecha !== undefined) {
      programacion.fecha = updateProgramacionDto.fecha;
    }

    if (updateProgramacionDto.horaSalida !== undefined) {
      programacion.horaSalida = updateProgramacionDto.horaSalida;
    }

    if (updateProgramacionDto.recurrente !== undefined) {
      programacion.recurrente = updateProgramacionDto.recurrente;
    }

    if (updateProgramacionDto.toleranciaMinutos !== undefined) {
      programacion.toleranciaMinutos = updateProgramacionDto.toleranciaMinutos;
    }

    if (updateProgramacionDto.estado !== undefined) {
      programacion.estado = updateProgramacionDto.estado;
    }

    const shouldValidate =
      updateProgramacionDto.busId !== undefined ||
      updateProgramacionDto.fecha !== undefined ||
      updateProgramacionDto.horaSalida !== undefined ||
      updateProgramacionDto.toleranciaMinutos !== undefined ||
      updateProgramacionDto.conductorId !== undefined;

    if (shouldValidate) {
      await this.ensureNoOverlap(
        programacion.bus.id,
        programacion.fecha,
        programacion.horaSalida,
        programacion.toleranciaMinutos,
        programacion.id,
      );
    }

    try {
      return await this.programacionRepository.save(programacion);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Programacion> {
    const programacion = await this.programacionRepository.findOne({ where: { id } });
    if (!programacion) {
      throw new NotFoundException('Programacion not found');
    }

    try {
      await this.programacionRepository.remove(programacion);
      return programacion;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private async ensureNoOverlap(
    busId: number,
    fecha: string,
    horaSalida: string,
    toleranciaMinutos: number,
    excludeId?: number,
  ): Promise<void> {
    const qb = this.programacionRepository
      .createQueryBuilder('programacion')
      .where('programacion.busId = :busId', { busId })
      .andWhere('programacion.fecha = :fecha', { fecha })
      .andWhere('programacion.estado NOT IN (:...estadosLibres)', {
        estadosLibres: ['FINALIZADO', 'CANCELADO'],
      })
      .andWhere(
        'ABS(TIME_TO_SEC(programacion.hora_salida) - TIME_TO_SEC(:horaSalida)) <= :toleranciaSegundos',
        {
          horaSalida,
          toleranciaSegundos: Math.max(toleranciaMinutos, 0) * 60,
        },
      );

    if (excludeId !== undefined) {
      qb.andWhere('programacion.id != :excludeId', { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException('Existe una programacion que se solapa para ese bus');
    }
  }

  private toDateTime(fecha: string, horaSalida: string): Date {
    return new Date(`${fecha}T${horaSalida}`);
  }

  private async getRutaOrThrow(id: number): Promise<Ruta> {
    const ruta = await this.rutaRepository.findOne({ where: { id } });
    if (!ruta) {
      throw new NotFoundException('Ruta not found');
    }
    return ruta;
  }

  private async getBusOrThrow(id: number): Promise<Bus> {
    const bus = await this.busRepository.findOne({ where: { id } });
    if (!bus) {
      throw new NotFoundException('Bus not found');
    }
    return bus;
  }

  private async getConductorOrThrow(id: number): Promise<Conductor> {
    const conductor = await this.conductorRepository.findOne({
      where: { id },
      relations: ['persona'],
    });
    if (!conductor) {
      throw new NotFoundException('Conductor not found');
    }
    return conductor;
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Duplicate value');
      }
      if (driverError?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new NotFoundException('Related resource not found');
      }
      if (driverError?.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException('Programacion has related records');
      }
    }
    throw error;
  }
}
