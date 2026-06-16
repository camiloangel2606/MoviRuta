import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Persona } from '../persona/entities/persona.entity';
import { CreateCiudadanoDto } from './dto/create-ciudadano.dto';
import { UpdateCiudadanoDto } from './dto/update-ciudadano.dto';
import { Ciudadano } from './entities/ciudadano.entity';

@Injectable()
export class CiudadanoService {
  constructor(
    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepository: Repository<Ciudadano>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) {}

  async create(createCiudadanoDto: CreateCiudadanoDto): Promise<Ciudadano> {
    const persona = await this.personaRepository.findOne({
      where: { id: createCiudadanoDto.personaId },
    });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    const existing = await this.ciudadanoRepository.findOne({
      where: { persona: { id: persona.id } },
    });
    if (existing) {
      throw new ConflictException('Persona already has ciudadano');
    }

    const ciudadano = this.ciudadanoRepository.create({
      persona,
      fechaNacimiento: createCiudadanoDto.fechaNacimiento ?? null,
    });

    try {
      return await this.ciudadanoRepository.save(ciudadano);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Ciudadano[]> {
    return this.ciudadanoRepository.find({ relations: ['persona'] });
  }

  async findOne(id: number): Promise<Ciudadano> {
    const ciudadano = await this.ciudadanoRepository.findOne({
      where: { id },
      relations: ['persona'],
    });
    if (!ciudadano) {
      throw new NotFoundException('Ciudadano not found');
    }
    return ciudadano;
  }

  async update(id: number, updateCiudadanoDto: UpdateCiudadanoDto): Promise<Ciudadano> {
    const ciudadano = await this.ciudadanoRepository.findOne({ where: { id } });
    if (!ciudadano) {
      throw new NotFoundException('Ciudadano not found');
    }

    if (updateCiudadanoDto.fechaNacimiento !== undefined) {
      ciudadano.fechaNacimiento = updateCiudadanoDto.fechaNacimiento;
    }

    try {
      return await this.ciudadanoRepository.save(ciudadano);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async updateByPersonaId(personaId: number, updateCiudadanoDto: UpdateCiudadanoDto): Promise<Ciudadano> {
    const ciudadano = await this.ciudadanoRepository.findOne({
      where: { persona: { id: personaId } },
      relations: ['persona'],
    });
    if (!ciudadano) {
      throw new NotFoundException('Ciudadano not found for persona ' + personaId);
    }

    if (updateCiudadanoDto.fechaNacimiento !== undefined) {
      ciudadano.fechaNacimiento = updateCiudadanoDto.fechaNacimiento;
    }

    try {
      return await this.ciudadanoRepository.save(ciudadano);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Ciudadano> {
    const ciudadano = await this.ciudadanoRepository.findOne({ where: { id } });
    if (!ciudadano) {
      throw new NotFoundException('Ciudadano not found');
    }
    try {
      await this.ciudadanoRepository.remove(ciudadano);
      return ciudadano;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Persona already has ciudadano');
      }
    }
    throw error;
  }
}
