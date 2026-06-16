import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Paradero } from '../paradero/entities/paradero.entity';
import { Ruta } from '../ruta/entities/ruta.entity';
import { CreateRutaParaderoDto } from './dto/create-ruta-paradero.dto';
import { UpdateRutaParaderoDto } from './dto/update-ruta-paradero.dto';
import { RutaParadero } from './entities/ruta-paradero.entity';

@Injectable()
export class RutaParaderoService {
  constructor(
    @InjectRepository(RutaParadero)
    private readonly rutaParaderoRepository: Repository<RutaParadero>,
    @InjectRepository(Ruta)
    private readonly rutaRepository: Repository<Ruta>,
    @InjectRepository(Paradero)
    private readonly paraderoRepository: Repository<Paradero>,
  ) {}

  async create(createRutaParaderoDto: CreateRutaParaderoDto): Promise<RutaParadero> {
    const { rutaId, paraderoId, ...rpData } = createRutaParaderoDto;
    const ruta = await this.getRutaOrThrow(rutaId);
    const paradero = await this.getParaderoOrThrow(paraderoId);

    const distancia =
      rpData.distanciaDesdeAnterior === undefined || rpData.distanciaDesdeAnterior === null
        ? null
        : this.formatDecimal(rpData.distanciaDesdeAnterior, 2);

    const rutaParadero = this.rutaParaderoRepository.create({
      ...rpData,
      distanciaDesdeAnterior: distancia,
      ruta,
      paradero,
    });

    try {
      return await this.rutaParaderoRepository.save(rutaParadero);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<RutaParadero[]> {
    return this.rutaParaderoRepository.find({ relations: ['ruta', 'paradero'] });
  }

  async findOne(id: number): Promise<RutaParadero> {
    const rutaParadero = await this.rutaParaderoRepository.findOne({
      where: { id },
      relations: ['ruta', 'paradero'],
    });
    if (!rutaParadero) {
      throw new NotFoundException('RutaParadero not found');
    }
    return rutaParadero;
  }

  async update(id: number, updateRutaParaderoDto: UpdateRutaParaderoDto): Promise<RutaParadero> {
    const rutaParadero = await this.rutaParaderoRepository.findOne({
      where: { id },
      relations: ['ruta', 'paradero'],
    });
    if (!rutaParadero) {
      throw new NotFoundException('RutaParadero not found');
    }

    const { rutaId, paraderoId, distanciaDesdeAnterior, ...updateData } = updateRutaParaderoDto;
    if (rutaId !== undefined) {
      rutaParadero.ruta = await this.getRutaOrThrow(rutaId);
    }
    if (paraderoId !== undefined) {
      rutaParadero.paradero = await this.getParaderoOrThrow(paraderoId);
    }
    Object.assign(rutaParadero, updateData);

    if (distanciaDesdeAnterior !== undefined) {
      rutaParadero.distanciaDesdeAnterior =
        distanciaDesdeAnterior === null
          ? null
          : this.formatDecimal(distanciaDesdeAnterior, 2);
    }

    try {
      return await this.rutaParaderoRepository.save(rutaParadero);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<RutaParadero> {
    const rutaParadero = await this.rutaParaderoRepository.findOne({ where: { id } });
    if (!rutaParadero) {
      throw new NotFoundException('RutaParadero not found');
    }
    try {
      await this.rutaParaderoRepository.remove(rutaParadero);
      return rutaParadero;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private async getRutaOrThrow(id: number): Promise<Ruta> {
    const ruta = await this.rutaRepository.findOne({ where: { id } });
    if (!ruta) {
      throw new NotFoundException('Ruta not found');
    }
    return ruta;
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
      const driverError = error.driverError as { code?: string; sqlMessage?: string } | undefined;
      const sqlMessage = driverError?.sqlMessage ?? '';
      if (driverError?.code === 'ER_DUP_ENTRY') {
        if (sqlMessage.includes('UQ_ruta_paradero_ruta_orden')) {
          throw new ConflictException('Ya existe un paradero con ese orden en la ruta');
        }
        if (sqlMessage.includes('UQ_ruta_paradero_ruta_paradero')) {
          throw new ConflictException('El paradero ya esta asociado a la ruta');
        }
        throw new ConflictException('Duplicate value');
      }
      if (driverError?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new NotFoundException('Ruta or paradero not found');
      }
    }
    throw error;
  }

  private formatDecimal(value: number, decimals: number): string {
    return Number(value).toFixed(decimals);
  }
}
