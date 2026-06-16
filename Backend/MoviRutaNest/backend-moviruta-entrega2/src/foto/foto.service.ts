import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Incidente } from '../incidente/entities/incidente.entity';
import { CreateFotoDto } from './dto/create-foto.dto';
import { UpdateFotoDto } from './dto/update-foto.dto';
import { Foto } from './entities/foto.entity';

@Injectable()
export class FotoService {
  constructor(
    @InjectRepository(Foto)
    private readonly fotoRepository: Repository<Foto>,
    @InjectRepository(Incidente)
    private readonly incidenteRepository: Repository<Incidente>,
  ) {}

  async create(createDto: CreateFotoDto): Promise<Foto> {
    const incidente = await this.getIncidenteOrThrow(createDto.incidenteId);

    const total = await this.fotoRepository.count({ where: { incidente: { id: incidente.id } } });
    if (total >= 5) {
      throw new BadRequestException('Max 5 fotos por incidente');
    }

    const foto = this.fotoRepository.create({
      incidente,
      url: createDto.url,
    });

    try {
      return await this.fotoRepository.save(foto);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Foto[]> {
    return this.fotoRepository.find({ relations: ['incidente'] });
  }

  async findOne(id: number): Promise<Foto> {
    const foto = await this.fotoRepository.findOne({
      where: { id },
      relations: ['incidente'],
    });
    if (!foto) {
      throw new NotFoundException('Foto not found');
    }
    return foto;
  }

  async update(id: number, updateDto: UpdateFotoDto): Promise<Foto> {
    const foto = await this.fotoRepository.findOne({ where: { id }, relations: ['incidente'] });
    if (!foto) {
      throw new NotFoundException('Foto not found');
    }

    if (updateDto.incidenteId !== undefined) {
      const incidente = await this.getIncidenteOrThrow(updateDto.incidenteId);
      const total = await this.fotoRepository.count({
        where: { incidente: { id: incidente.id } },
      });
      if (total >= 5) {
        throw new BadRequestException('Max 5 fotos por incidente');
      }
      foto.incidente = incidente;
    }
    if (updateDto.url !== undefined) {
      foto.url = updateDto.url;
    }

    try {
      return await this.fotoRepository.save(foto);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Foto> {
    const foto = await this.fotoRepository.findOne({ where: { id } });
    if (!foto) {
      throw new NotFoundException('Foto not found');
    }
    try {
      await this.fotoRepository.remove(foto);
      return foto;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private async getIncidenteOrThrow(id: number): Promise<Incidente> {
    const incidente = await this.incidenteRepository.findOne({ where: { id } });
    if (!incidente) {
      throw new NotFoundException('Incidente not found');
    }
    return incidente;
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new NotFoundException('Related resource not found');
      }
    }
    throw error;
  }
}
