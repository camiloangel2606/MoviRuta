import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { DestinatarioGrupo } from '../destinatario-grupo/entities/destinatario-grupo.entity';
import { DestinatarioPersona } from '../destinatario-persona/entities/destinatario-persona.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Persona } from '../persona/entities/persona.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { Mensaje } from './entities/mensaje.entity';

@Injectable()
export class MensajeService {
  constructor(
    @InjectRepository(Mensaje)
    private readonly mensajeRepository: Repository<Mensaje>,
    @InjectRepository(DestinatarioPersona)
    private readonly destinatarioPersonaRepository: Repository<DestinatarioPersona>,
    @InjectRepository(DestinatarioGrupo)
    private readonly destinatarioGrupoRepository: Repository<DestinatarioGrupo>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Grupo)
    private readonly grupoRepository: Repository<Grupo>,
  ) {}

  async create(createMensajeDto: CreateMensajeDto): Promise<Mensaje> {
    const destinatariosPersonaIds = createMensajeDto.destinatariosPersonaIds ?? [];
    const destinatariosGrupoIds = createMensajeDto.destinatariosGrupoIds ?? [];

    if (destinatariosPersonaIds.length === 0 && destinatariosGrupoIds.length === 0) {
      throw new BadRequestException('Debe incluir al menos un destinatario');
    }

    this.assertUniqueIds(destinatariosPersonaIds, 'persona');
    this.assertUniqueIds(destinatariosGrupoIds, 'grupo');

    const emisor = await this.personaRepository.findOne({
      where: { id: createMensajeDto.emisorId },
    });
    if (!emisor) {
      throw new NotFoundException('Persona not found');
    }

    const personas = await this.getPersonasOrThrow(destinatariosPersonaIds);
    const grupos = await this.getGruposOrThrow(destinatariosGrupoIds);

    try {
      return await this.mensajeRepository.manager.transaction(async (manager) => {
        const mensajeRepo = manager.getRepository(Mensaje);
        const destinatarioPersonaRepo = manager.getRepository(DestinatarioPersona);
        const destinatarioGrupoRepo = manager.getRepository(DestinatarioGrupo);

        const mensaje = mensajeRepo.create({
          emisor,
          contenido: createMensajeDto.contenido,
        });
        const mensajeCreado = await mensajeRepo.save(mensaje);

        if (personas.length > 0) {
          const destinatariosPersona = personas.map((persona) =>
            destinatarioPersonaRepo.create({
              mensaje: mensajeCreado,
              persona,
            }),
          );
          await destinatarioPersonaRepo.save(destinatariosPersona);
        }

        if (grupos.length > 0) {
          const destinatariosGrupo = grupos.map((grupo) =>
            destinatarioGrupoRepo.create({
              mensaje: mensajeCreado,
              grupo,
            }),
          );
          await destinatarioGrupoRepo.save(destinatariosGrupo);
        }

        const mensajeCompleto = await mensajeRepo.findOne({
          where: { id: mensajeCreado.id },
          relations: {
            emisor: true,
            destinatariosPersona: { persona: true },
            destinatariosGrupo: { grupo: true },
          },
        });

        if (!mensajeCompleto) {
          throw new NotFoundException('Mensaje not found');
        }

        return mensajeCompleto;
      });
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Mensaje[]> {
    return this.mensajeRepository
      .createQueryBuilder('mensaje')
      .leftJoinAndSelect('mensaje.emisor', 'emisor')
      .loadRelationCountAndMap('mensaje.totalDestinatariosPersona', 'mensaje.destinatariosPersona')
      .loadRelationCountAndMap('mensaje.totalDestinatariosGrupo', 'mensaje.destinatariosGrupo')
      .orderBy('mensaje.fechaEnvio', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Mensaje> {
    this.assertPositiveId(id, 'Mensaje id');
    const mensaje = await this.mensajeRepository.findOne({
      where: { id },
      relations: {
        emisor: true,
        destinatariosPersona: { persona: true },
        destinatariosGrupo: { grupo: true },
      },
    });
    if (!mensaje) {
      throw new NotFoundException('Mensaje not found');
    }
    return mensaje;
  }

  private async getPersonasOrThrow(ids: number[]): Promise<Persona[]> {
    if (ids.length === 0) {
      return [];
    }
    const personas = await this.personaRepository.find({ where: { id: In(ids) } });
    if (personas.length !== ids.length) {
      throw new NotFoundException('Some personas not found');
    }
    return personas;
  }

  private async getGruposOrThrow(ids: number[]): Promise<Grupo[]> {
    if (ids.length === 0) {
      return [];
    }
    const grupos = await this.grupoRepository.find({ where: { id: In(ids) } });
    if (grupos.length !== ids.length) {
      throw new NotFoundException('Some grupos not found');
    }
    return grupos;
  }

  private assertUniqueIds(ids: number[], label: string): void {
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      throw new ConflictException(`Duplicate ${label} recipients`);
    }
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
