import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Persona } from '../persona/entities/persona.entity';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { UpdateConductorDto } from './dto/update-conductor.dto';
import { Conductor } from './entities/conductor.entity';

@Injectable()
export class ConductorService {
  constructor(
    @InjectRepository(Conductor)
    private readonly conductorRepository: Repository<Conductor>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) {}

  async create(createConductorDto: CreateConductorDto): Promise<Conductor> {
    const persona = await this.getPersonaOrThrow(createConductorDto.personaId);

    const existing = await this.conductorRepository.findOne({
      where: { persona: { id: persona.id } },
    });
    if (existing) {
      throw new ConflictException('Persona already has conductor');
    }

    const conductor = this.conductorRepository.create({
      persona,
      licencia: createConductorDto.licencia ?? null,
    });

    try {
      return await this.conductorRepository.save(conductor);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Conductor[]> {
    return this.conductorRepository.find({ relations: ['persona'] });
  }

  async findOne(id: number): Promise<Conductor> {
    const conductor = await this.conductorRepository.findOne({
      where: { id },
      relations: ['persona'],
    });
    if (!conductor) {
      throw new NotFoundException('Conductor not found');
    }
    return conductor;
  }

  async update(id: number, updateConductorDto: UpdateConductorDto): Promise<Conductor> {
    const conductor = await this.conductorRepository.findOne({
      where: { id },
      relations: ['persona'],
    });
    if (!conductor) {
      throw new NotFoundException('Conductor not found');
    }

    if (updateConductorDto.personaId !== undefined) {
      const persona = await this.getPersonaOrThrow(updateConductorDto.personaId);

      const existing = await this.conductorRepository.findOne({
        where: { persona: { id: persona.id } },
      });
      if (existing && existing.id !== conductor.id) {
        throw new ConflictException('Persona already has conductor');
      }

      conductor.persona = persona;
    }

    if (updateConductorDto.licencia !== undefined) {
      conductor.licencia = updateConductorDto.licencia;
    }

    try {
      return await this.conductorRepository.save(conductor);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Conductor> {
    const conductor = await this.conductorRepository.findOne({ where: { id } });
    if (!conductor) {
      throw new NotFoundException('Conductor not found');
    }

    try {
      await this.conductorRepository.remove(conductor);
      return conductor;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private async getPersonaOrThrow(id: number): Promise<Persona> {
    const persona = await this.personaRepository.findOne({ where: { id } });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }
    return persona;
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Persona already has conductor');
      }
      if (driverError?.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException('Conductor has related records');
      }
    }
    throw error;
  }
}
