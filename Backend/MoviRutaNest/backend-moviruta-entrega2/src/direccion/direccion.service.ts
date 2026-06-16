import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Ciudadano } from '../ciudadano/entities/ciudadano.entity';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UpdateDireccionDto } from './dto/update-direccion.dto';
import { Direccion } from './entities/direccion.entity';

@Injectable()
export class DireccionService {
  constructor(
    @InjectRepository(Direccion)
    private readonly direccionRepository: Repository<Direccion>,
    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepository: Repository<Ciudadano>,
  ) {}

  async create(createDireccionDto: CreateDireccionDto): Promise<Direccion> {
    const ciudadano = await this.getCiudadanoOrThrow(createDireccionDto.ciudadanoId);
    await this.ensureCiudadanoDisponible(ciudadano.id);

    const direccion = this.direccionRepository.create({
      ciudadano,
      linea1: createDireccionDto.linea1,
      linea2: createDireccionDto.linea2 ?? null,
      ciudad: createDireccionDto.ciudad,
      departamento: createDireccionDto.departamento,
      codigoPostal: createDireccionDto.codigoPostal ?? null,
    });

    try {
      return await this.direccionRepository.save(direccion);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Direccion[]> {
    return this.direccionRepository.find({ relations: ['ciudadano'] });
  }

  async findOne(id: number): Promise<Direccion> {
    const direccion = await this.direccionRepository.findOne({
      where: { id },
      relations: ['ciudadano'],
    });
    if (!direccion) {
      throw new NotFoundException('Direccion not found');
    }
    return direccion;
  }

  async update(id: number, updateDireccionDto: UpdateDireccionDto): Promise<Direccion> {
    const direccion = await this.direccionRepository.findOne({
      where: { id },
      relations: ['ciudadano'],
    });
    if (!direccion) {
      throw new NotFoundException('Direccion not found');
    }

    const { ciudadanoId, ...updateData } = updateDireccionDto;
    if (ciudadanoId !== undefined) {
      await this.ensureCiudadanoDisponible(ciudadanoId, id);
      direccion.ciudadano = await this.getCiudadanoOrThrow(ciudadanoId);
    }

    Object.assign(direccion, updateData);

    try {
      return await this.direccionRepository.save(direccion);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Direccion> {
    const direccion = await this.direccionRepository.findOne({ where: { id } });
    if (!direccion) {
      throw new NotFoundException('Direccion not found');
    }
    try {
      await this.direccionRepository.remove(direccion);
      return direccion;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private async getCiudadanoOrThrow(id: number): Promise<Ciudadano> {
    const ciudadano = await this.ciudadanoRepository.findOne({ where: { id } });
    if (!ciudadano) {
      throw new NotFoundException('Ciudadano not found');
    }
    return ciudadano;
  }

  private async ensureCiudadanoDisponible(ciudadanoId: number, direccionId?: number): Promise<void> {
    const existing = await this.direccionRepository.findOne({
      where: { ciudadano: { id: ciudadanoId } },
      relations: ['ciudadano'],
    });
    if (existing && existing.id !== direccionId) {
      throw new ConflictException('Ciudadano already has direccion');
    }
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Ciudadano already has direccion');
      }
      if (driverError?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new NotFoundException('Ciudadano not found');
      }
    }
    throw error;
  }
}
