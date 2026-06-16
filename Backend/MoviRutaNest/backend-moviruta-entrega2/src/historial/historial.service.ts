import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Boleto } from '../boleto/entities/boleto.entity';
import { Paradero } from '../paradero/entities/paradero.entity';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { FindHistorialQueryDto } from './dto/find-historial-query.dto';
import { Historial, HistorialTipo } from './entities/historial.entity';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Historial)
    private readonly historialRepository: Repository<Historial>,
    @InjectRepository(Boleto)
    private readonly boletoRepository: Repository<Boleto>,
    @InjectRepository(Paradero)
    private readonly paraderoRepository: Repository<Paradero>,
  ) {}

  async create(createHistorialDto: CreateHistorialDto): Promise<Historial> {
    const boleto = await this.getBoletoOrThrow(createHistorialDto.boletoId);
    const paradero = await this.getParaderoOrThrow(createHistorialDto.paraderoId);

    if (createHistorialDto.tipo === HistorialTipo.ABORDAJE) {
      const existingAbordaje = await this.historialRepository.findOne({
        where: {
          boleto: { id: boleto.id },
          tipo: HistorialTipo.ABORDAJE,
        },
      });
      if (existingAbordaje) {
        throw new ConflictException('Boleto already has ABORDAJE in historial');
      }
    }

    const historial = this.historialRepository.create({
      boleto,
      paradero,
      tipo: createHistorialDto.tipo,
      orden: createHistorialDto.orden ?? null,
    });

    try {
      return await this.historialRepository.save(historial);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(query: FindHistorialQueryDto): Promise<Historial[]> {
    return this.historialRepository.find({
      where: query.boletoId
        ? { boleto: { id: query.boletoId } }
        : undefined,
      relations: {
        boleto: true,
        paradero: true,
      },
      order: { fecha: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Historial> {
    const historial = await this.historialRepository.findOne({
      where: { id },
      relations: {
        boleto: true,
        paradero: true,
      },
    });

    if (!historial) {
      throw new NotFoundException('Historial not found');
    }

    return historial;
  }

  async remove(id: number): Promise<Historial> {
    const historial = await this.historialRepository.findOne({ where: { id } });
    if (!historial) {
      throw new NotFoundException('Historial not found');
    }

    try {
      await this.historialRepository.remove(historial);
      return historial;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private async getBoletoOrThrow(id: number): Promise<Boleto> {
    const boleto = await this.boletoRepository.findOne({ where: { id } });
    if (!boleto) {
      throw new NotFoundException('Boleto not found');
    }
    return boleto;
  }

  private async getParaderoOrThrow(id: number): Promise<Paradero> {
    const paradero = await this.paraderoRepository.findOne({ where: { id } });
    if (!paradero) {
      throw new NotFoundException('Paradero not found');
    }
    return paradero;
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Duplicate historial for boleto and tipo');
      }
      if (driverError?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new NotFoundException('Related resource not found');
      }
      if (driverError?.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new BadRequestException('Cannot delete historial with related records');
      }
    }
    throw error;
  }
}
