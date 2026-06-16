import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Persona } from '../persona/entities/persona.entity';
import { CreateGrupoMiembroDto } from './dto/create-grupo-miembro.dto';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { GrupoPersona } from './entities/grupo-persona.entity';
import { Grupo } from './entities/grupo.entity';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private readonly grupoRepository: Repository<Grupo>,
    @InjectRepository(GrupoPersona)
    private readonly grupoPersonaRepository: Repository<GrupoPersona>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) {}

  async create(createGrupoDto: CreateGrupoDto): Promise<Grupo> {
    const grupo = this.grupoRepository.create(createGrupoDto);
    try {
      return await this.grupoRepository.save(grupo);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Grupo[]> {
    return this.grupoRepository.find();
  }

  async findOne(id: number): Promise<Grupo> {
    this.assertPositiveId(id, 'Grupo id');
    const grupo = await this.grupoRepository.findOne({ where: { id } });
    if (!grupo) {
      throw new NotFoundException('Grupo not found');
    }
    return grupo;
  }

  async update(id: number, updateGrupoDto: UpdateGrupoDto): Promise<Grupo> {
    this.assertPositiveId(id, 'Grupo id');
    const grupo = await this.grupoRepository.findOne({ where: { id } });
    if (!grupo) {
      throw new NotFoundException('Grupo not found');
    }
    Object.assign(grupo, updateGrupoDto);
    try {
      return await this.grupoRepository.save(grupo);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Grupo> {
    this.assertPositiveId(id, 'Grupo id');
    const grupo = await this.grupoRepository.findOne({ where: { id } });
    if (!grupo) {
      throw new NotFoundException('Grupo not found');
    }
    try {
      await this.grupoRepository.remove(grupo);
      return grupo;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async addMember(
    grupoId: number,
    createGrupoMiembroDto: CreateGrupoMiembroDto,
  ): Promise<GrupoPersona> {
    this.assertPositiveId(grupoId, 'Grupo id');
    this.assertPositiveId(createGrupoMiembroDto.personaId, 'Persona id');
    const grupo = await this.getGrupoOrThrow(grupoId);
    const persona = await this.getPersonaOrThrow(createGrupoMiembroDto.personaId);

    const existing = await this.grupoPersonaRepository.findOne({
      where: { grupo: { id: grupo.id }, persona: { id: persona.id } },
    });
    if (existing) {
      throw new ConflictException('Persona already in group');
    }

    const miembro = this.grupoPersonaRepository.create({
      grupo,
      persona,
      rol: createGrupoMiembroDto.rol,
    });
    try {
      return await this.grupoPersonaRepository.save(miembro);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findMembers(grupoId: number): Promise<GrupoPersona[]> {
    this.assertPositiveId(grupoId, 'Grupo id');
    await this.getGrupoOrThrow(grupoId);
    return this.grupoPersonaRepository.find({
      where: { grupo: { id: grupoId } },
      relations: ['persona'],
    });
  }

  async removeMember(grupoId: number, personaId: number): Promise<GrupoPersona> {
    this.assertPositiveId(grupoId, 'Grupo id');
    this.assertPositiveId(personaId, 'Persona id');
    await this.getGrupoOrThrow(grupoId);
    await this.getPersonaOrThrow(personaId);

    const miembro = await this.grupoPersonaRepository.findOne({
      where: { grupo: { id: grupoId }, persona: { id: personaId } },
      relations: ['persona'],
    });
    if (!miembro) {
      throw new NotFoundException('Membership not found');
    }

    try {
      await this.grupoPersonaRepository.remove(miembro);
      return miembro;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private async getGrupoOrThrow(id: number): Promise<Grupo> {
    const grupo = await this.grupoRepository.findOne({ where: { id } });
    if (!grupo) {
      throw new NotFoundException('Grupo not found');
    }
    return grupo;
  }

  private async getPersonaOrThrow(id: number): Promise<Persona> {
    const persona = await this.personaRepository.findOne({ where: { id } });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }
    return persona;
  }

  private assertPositiveId(value: number, label: string): void {
    if (!Number.isInteger(value) || value < 1) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Duplicate value');
      }
    }
    throw error;
  }
}
