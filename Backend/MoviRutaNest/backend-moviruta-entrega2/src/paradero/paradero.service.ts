import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateParaderoDto } from './dto/create-paradero.dto';
import { UpdateParaderoDto } from './dto/update-paradero.dto';
import { Paradero } from './entities/paradero.entity';

@Injectable()
export class ParaderoService {
  constructor(
    @InjectRepository(Paradero)
    private readonly paraderoRepository: Repository<Paradero>,
  ) {}

  async create(createParaderoDto: CreateParaderoDto): Promise<Paradero> {
    const paradero = this.paraderoRepository.create({
      ...createParaderoDto,
      latitud: this.formatDecimal(createParaderoDto.latitud, 7),
      longitud: this.formatDecimal(createParaderoDto.longitud, 7),
    });
    try {
      return await this.paraderoRepository.save(paradero);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Paradero[]> {
    return this.paraderoRepository.find({
      relations: { rutasEnLasQueAparece: { ruta: true } },
    });
  }

  async findOne(id: number): Promise<Paradero> {
    const paradero = await this.paraderoRepository.findOne({
      where: { id },
      relations: { rutasEnLasQueAparece: { ruta: true } },
    });
    if (!paradero) {
      throw new NotFoundException('Paradero not found');
    }
    return paradero;
  }

  async update(id: number, updateParaderoDto: UpdateParaderoDto): Promise<Paradero> {
    const paradero = await this.paraderoRepository.findOne({ where: { id } });
    if (!paradero) {
      throw new NotFoundException('Paradero not found');
    }
    const { latitud, longitud, ...updateData } = updateParaderoDto;
    Object.assign(paradero, updateData);

    if (latitud !== undefined) {
      paradero.latitud = this.formatDecimal(latitud, 7);
    }
    if (longitud !== undefined) {
      paradero.longitud = this.formatDecimal(longitud, 7);
    }
    try {
      return await this.paraderoRepository.save(paradero);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Paradero> {
    const paradero = await this.paraderoRepository.findOne({ where: { id } });
    if (!paradero) {
      throw new NotFoundException('Paradero not found');
    }
    try {
      await this.paraderoRepository.remove(paradero);
      return paradero;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findCercanos(lat: number, lng: number): Promise<
    Array<{ paradero: Paradero; distanciaKm: number }>
  > {
    const earthRadiusKm = 6371;

    const { entities, raw } = await this.paraderoRepository
      .createQueryBuilder('p')
      .addSelect(
        `(${earthRadiusKm} * acos(` +
          `cos(radians(:lat)) * cos(radians(CAST(p.latitud AS DECIMAL(10,7)))) * ` +
          `cos(radians(CAST(p.longitud AS DECIMAL(10,7))) - radians(:lng)) + ` +
          `sin(radians(:lat)) * sin(radians(CAST(p.latitud AS DECIMAL(10,7))))` +
        `))`,
        'distancia_km',
      )
      .setParameters({ lat, lng })
      .orderBy('distancia_km', 'ASC')
      .limit(5)
      .getRawAndEntities();

    return entities.map((paradero, index) => ({
      paradero,
      distanciaKm: Number(raw[index]?.distancia_km ?? 0),
    }));
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Duplicate value');
      }
      if (driverError?.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new BadRequestException('Cannot delete paradero with rutas');
      }
    }
    throw error;
  }

  private formatDecimal(value: number, decimals: number): string {
    return Number(value).toFixed(decimals);
  }
}
