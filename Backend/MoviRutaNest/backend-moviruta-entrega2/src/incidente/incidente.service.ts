import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Bus } from '../bus/entities/bus.entity';
import { Persona } from '../persona/entities/persona.entity';
import { Foto } from '../foto/entities/foto.entity';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { QueryIncidenteDto } from './dto/query-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { Incidente } from './entities/incidente.entity';

@Injectable()
export class IncidenteService {
  constructor(
    @InjectRepository(Incidente)
    private readonly incidenteRepository: Repository<Incidente>,
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Foto)
    private readonly fotoRepository: Repository<Foto>,
  ) {}

  async create(createDto: CreateIncidenteDto): Promise<Incidente> {
    const fotos = createDto.fotos ?? [];
    if (fotos.length > 5) {
      throw new BadRequestException('Max 5 fotos por incidente');
    }

    const bus = await this.getBusOrThrow(createDto.busId);
    const reportadoPor = createDto.reportadoPorId
      ? await this.getPersonaOrThrow(createDto.reportadoPorId)
      : null;

    try {
      return await this.incidenteRepository.manager.transaction(async (manager) => {
        const incidenteRepo = manager.getRepository(Incidente);
        const fotoRepo = manager.getRepository(Foto);

        const incidente = incidenteRepo.create({
          bus,
          reportadoPor: reportadoPor ?? null,
          tipo: createDto.tipo,
          gravedad: createDto.gravedad,
          descripcion: createDto.descripcion,
          estado: createDto.estado ?? undefined,
          latitud: this.formatDecimalOrNull(createDto.latitud, 7),
          longitud: this.formatDecimalOrNull(createDto.longitud, 7),
        });
        const incidenteCreado = await incidenteRepo.save(incidente);

        if (fotos.length > 0) {
          const nuevasFotos = fotos.map((url) =>
            fotoRepo.create({
              incidente: incidenteCreado,
              url,
            }),
          );
          await fotoRepo.save(nuevasFotos);
        }

        const incidenteCompleto = await incidenteRepo.findOne({
          where: { id: incidenteCreado.id },
          relations: ['bus', 'reportadoPor', 'fotos'],
        });
        if (!incidenteCompleto) {
          throw new NotFoundException('Incidente not found');
        }
        return incidenteCompleto;
      });
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(query: QueryIncidenteDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.incidenteRepository
      .createQueryBuilder('incidente')
      .leftJoinAndSelect('incidente.bus', 'bus')
      .leftJoinAndSelect('incidente.reportadoPor', 'reportadoPor')
      .leftJoinAndSelect('incidente.fotos', 'fotos');

    if (query.busId) {
      qb.andWhere('incidente.busId = :busId', { busId: query.busId });
    }
    if (query.tipo) {
      qb.andWhere('incidente.tipo = :tipo', { tipo: query.tipo });
    }
    if (query.estado) {
      qb.andWhere('incidente.estado = :estado', { estado: query.estado });
    }

    const [data, total] = await qb
      .orderBy('incidente.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Incidente> {
    const incidente = await this.incidenteRepository.findOne({
      where: { id },
      relations: ['bus', 'reportadoPor', 'fotos'],
    });
    if (!incidente) {
      throw new NotFoundException('Incidente not found');
    }
    return incidente;
  }

  async update(id: number, updateDto: UpdateIncidenteDto): Promise<Incidente> {
    const fotos = updateDto.fotos;
    if (fotos && fotos.length > 5) {
      throw new BadRequestException('Max 5 fotos por incidente');
    }

    const incidente = await this.incidenteRepository.findOne({
      where: { id },
      relations: ['bus', 'reportadoPor', 'fotos'],
    });
    if (!incidente) {
      throw new NotFoundException('Incidente not found');
    }

    if (updateDto.busId !== undefined) {
      incidente.bus = await this.getBusOrThrow(updateDto.busId);
    }
    if (updateDto.reportadoPorId !== undefined) {
      incidente.reportadoPor = await this.getPersonaOrThrow(updateDto.reportadoPorId);
    }
    if (updateDto.tipo !== undefined) {
      incidente.tipo = updateDto.tipo;
    }
    if (updateDto.gravedad !== undefined) {
      incidente.gravedad = updateDto.gravedad;
    }
    if (updateDto.descripcion !== undefined) {
      incidente.descripcion = updateDto.descripcion;
    }
    if (updateDto.estado !== undefined) {
      incidente.estado = updateDto.estado;
    }
    if (updateDto.latitud !== undefined) {
      incidente.latitud = this.formatDecimalOrNull(updateDto.latitud, 7);
    }
    if (updateDto.longitud !== undefined) {
      incidente.longitud = this.formatDecimalOrNull(updateDto.longitud, 7);
    }

    try {
      return await this.incidenteRepository.manager.transaction(async (manager) => {
        const incidenteRepo = manager.getRepository(Incidente);
        const fotoRepo = manager.getRepository(Foto);

        const actualizado = await incidenteRepo.save(incidente);

        if (fotos !== undefined) {
          await fotoRepo.delete({ incidente: { id: actualizado.id } });
          if (fotos.length > 0) {
            const nuevasFotos = fotos.map((url) =>
              fotoRepo.create({
                incidente: actualizado,
                url,
              }),
            );
            await fotoRepo.save(nuevasFotos);
          }
        }

        const incidenteCompleto = await incidenteRepo.findOne({
          where: { id: actualizado.id },
          relations: ['bus', 'reportadoPor', 'fotos'],
        });
        if (!incidenteCompleto) {
          throw new NotFoundException('Incidente not found');
        }
        return incidenteCompleto;
      });
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Incidente> {
    const incidente = await this.incidenteRepository.findOne({ where: { id } });
    if (!incidente) {
      throw new NotFoundException('Incidente not found');
    }
    try {
      await this.incidenteRepository.remove(incidente);
      return incidente;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private async getBusOrThrow(id: number): Promise<Bus> {
    const bus = await this.busRepository.findOne({ where: { id } });
    if (!bus) {
      throw new NotFoundException('Bus not found');
    }
    return bus;
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
      if (driverError?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new NotFoundException('Related resource not found');
      }
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Duplicate value');
      }
    }
    throw error;
  }

  private formatDecimalOrNull(value: number | undefined, decimals: number): string | null {
    if (value === undefined) {
      return null;
    }
    return Number(value).toFixed(decimals);
  }
}
