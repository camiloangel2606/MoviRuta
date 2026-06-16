import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Bus } from '../bus/entities/bus.entity';
import { Conductor } from '../conductor/entities/conductor.entity';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { IniciarTurnoDto } from './dto/iniciar-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { Turno, TurnoEstado } from './entities/turno.entity';

@Injectable()
export class TurnoService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(Conductor)
    private readonly conductorRepository: Repository<Conductor>,
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
  ) {}

  async create(createTurnoDto: CreateTurnoDto): Promise<Turno> {
    const conductor = await this.getConductorOrThrow(createTurnoDto.conductorId);
    const bus = await this.getBusOrThrow(createTurnoDto.busId);

    const inicio = new Date(createTurnoDto.inicio);
    const fin = createTurnoDto.fin ? new Date(createTurnoDto.fin) : null;
    this.validateDateOrder(inicio, fin);

    if (createTurnoDto.estado === TurnoEstado.FINALIZADO && !fin) {
      throw new BadRequestException('Estado FINALIZADO requiere fin');
    }

    const turno = this.turnoRepository.create({
      conductor,
      bus,
      inicio,
      fin,
      estado: createTurnoDto.estado ?? TurnoEstado.PROGRAMADO,
      observaciones: createTurnoDto.observaciones ?? null,
    });

    try {
      return await this.turnoRepository.save(turno);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Turno[]> {
    return this.turnoRepository.find({
      relations: {
        conductor: { persona: true },
        bus: true,
      },
    });
  }

  async findByConductor(conductorId: number, estados?: TurnoEstado[]): Promise<Turno[]> {
    await this.getConductorOrThrow(conductorId);

    const qb = this.turnoRepository
      .createQueryBuilder('turno')
      .leftJoinAndSelect('turno.conductor', 'conductor')
      .leftJoinAndSelect('conductor.persona', 'persona')
      .leftJoinAndSelect('turno.bus', 'bus')
      .where('conductor.id = :conductorId', { conductorId })
      .orderBy('turno.inicio', 'DESC');

    if (estados && estados.length > 0) {
      qb.andWhere('turno.estado IN (:...estados)', { estados });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Turno> {
    const turno = await this.turnoRepository.findOne({
      where: { id },
      relations: {
        conductor: { persona: true },
        bus: true,
      },
    });
    if (!turno) {
      throw new NotFoundException('Turno not found');
    }
    return turno;
  }

  async update(id: number, updateTurnoDto: UpdateTurnoDto): Promise<Turno> {
    const turno = await this.turnoRepository.findOne({
      where: { id },
      relations: {
        conductor: true,
        bus: true,
      },
    });
    if (!turno) {
      throw new NotFoundException('Turno not found');
    }

    if (updateTurnoDto.conductorId !== undefined) {
      turno.conductor = await this.getConductorOrThrow(updateTurnoDto.conductorId);
    }

    if (updateTurnoDto.busId !== undefined) {
      turno.bus = await this.getBusOrThrow(updateTurnoDto.busId);
    }

    const nextInicio = updateTurnoDto.inicio
      ? new Date(updateTurnoDto.inicio)
      : turno.inicio;
    const nextFin = updateTurnoDto.fin !== undefined
      ? new Date(updateTurnoDto.fin)
      : (turno.fin ?? null);

    this.validateDateOrder(nextInicio, nextFin);

    const nextEstado = updateTurnoDto.estado ?? turno.estado;
    if (turno.estado === TurnoEstado.FINALIZADO && nextEstado !== TurnoEstado.FINALIZADO) {
      throw new BadRequestException('No se puede reabrir un turno finalizado');
    }
    if (nextEstado === TurnoEstado.FINALIZADO && !nextFin) {
      throw new BadRequestException('Estado FINALIZADO requiere fin o usar /turno/:id/finalizar');
    }

    turno.inicio = nextInicio;
    turno.fin = nextFin;
    turno.estado = nextEstado;

    if (updateTurnoDto.observaciones !== undefined) {
      turno.observaciones = updateTurnoDto.observaciones;
    }

    try {
      return await this.turnoRepository.save(turno);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Turno> {
    const turno = await this.turnoRepository.findOne({ where: { id } });
    if (!turno) {
      throw new NotFoundException('Turno not found');
    }

    try {
      await this.turnoRepository.remove(turno);
      return turno;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async iniciar(id: number, iniciarTurnoDto: IniciarTurnoDto): Promise<Turno> {
    const turno = await this.turnoRepository.findOne({ where: { id } });
    if (!turno) {
      throw new NotFoundException('Turno not found');
    }

    if (turno.estado !== TurnoEstado.PROGRAMADO) {
      throw new BadRequestException(
        `Solo se puede iniciar un turno en estado PROGRAMADO (estado actual: ${turno.estado})`,
      );
    }

    turno.estado = TurnoEstado.EN_CURSO;
    turno.inicio = new Date();

    if (iniciarTurnoDto.observaciones !== undefined) {
      turno.observaciones = iniciarTurnoDto.observaciones;
    }

    try {
      return await this.turnoRepository.save(turno);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async finalizar(id: number): Promise<Turno> {
    const turno = await this.turnoRepository.findOne({ where: { id } });
    if (!turno) {
      throw new NotFoundException('Turno not found');
    }

    if (turno.estado === TurnoEstado.FINALIZADO) {
      throw new BadRequestException('Turno already finalized');
    }

    if (!turno.inicio) {
      turno.inicio = new Date();
    }

    turno.estado = TurnoEstado.FINALIZADO;
    turno.fin = new Date();

    try {
      return await this.turnoRepository.save(turno);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private validateDateOrder(inicio: Date, fin?: Date | null): void {
    if (fin && fin < inicio) {
      throw new BadRequestException('fin must be greater than or equal to inicio');
    }
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

  private async getBusOrThrow(id: number): Promise<Bus> {
    const bus = await this.busRepository.findOne({ where: { id } });
    if (!bus) {
      throw new NotFoundException('Bus not found');
    }
    return bus;
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
        throw new ConflictException('Turno has related records');
      }
    }
    throw error;
  }
}
