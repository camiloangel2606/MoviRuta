import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, QueryFailedError, Repository } from 'typeorm';
import { Paradero } from '../paradero/entities/paradero.entity';
import { RutaParadero } from '../ruta-paradero/entities/ruta-paradero.entity';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { CreateRutaConParaderosDto } from './dto/create-ruta-con-paraderos.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { Ruta } from './entities/ruta.entity';

@Injectable()
export class RutaService {
  constructor(
    @InjectRepository(Ruta)
    private readonly rutaRepository: Repository<Ruta>,
    @InjectRepository(RutaParadero)
    private readonly rutaParaderoRepository: Repository<RutaParadero>,
    @InjectRepository(Paradero)
    private readonly paraderoRepository: Repository<Paradero>,
  ) {}

  async create(createRutaDto: CreateRutaDto): Promise<Ruta> {
    const ruta = this.rutaRepository.create({
      ...createRutaDto,
      tarifa: this.formatDecimal(createRutaDto.tarifa, 2),
    });
    try {
      return await this.rutaRepository.save(ruta);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async createConParaderos(createRutaDto: CreateRutaConParaderosDto): Promise<Ruta> {
    const { paraderos, ...rutaData } = createRutaDto;

    if (paraderos.length < 3) {
      throw new BadRequestException('Debe incluir al menos 3 paraderos');
    }

    const ordenes = paraderos.map((paradero) => paradero.orden);
    const ordenesUnicas = new Set(ordenes);
    if (ordenesUnicas.size !== ordenes.length) {
      throw new BadRequestException('El orden de paraderos no puede repetirse');
    }

    const ordenesOrdenadas = [...ordenes].sort((a, b) => a - b);
    for (let index = 0; index < ordenesOrdenadas.length; index += 1) {
      if (ordenesOrdenadas[index] !== index + 1) {
        throw new BadRequestException('El orden debe ser secuencial desde 1');
      }
    }

    const paraderoIds = paraderos.map((paradero) => paradero.paraderoId);
    const paraderoIdSet = new Set(paraderoIds);
    if (paraderoIdSet.size !== paraderoIds.length) {
      throw new BadRequestException('No puede repetir paraderos en la ruta');
    }

    const existentes = await this.paraderoRepository.find({
      where: { id: In(paraderoIds) },
    });
    if (existentes.length !== paraderoIds.length) {
      throw new NotFoundException('Alguno de los paraderos no existe');
    }

    try {
      return await this.rutaRepository.manager.transaction(async (manager) => {
        const ruta = manager.getRepository(Ruta).create({
          ...rutaData,
          tarifa: this.formatDecimal(rutaData.tarifa, 2),
        });

        const rutaCreada = await manager.getRepository(Ruta).save(ruta);

        const paraderosEnRuta = paraderos.map((paradero) => {
          const distancia =
            paradero.distanciaDesdeAnterior === undefined || paradero.distanciaDesdeAnterior === null
              ? null
              : this.formatDecimal(paradero.distanciaDesdeAnterior, 2);

          return manager.getRepository(RutaParadero).create({
            ruta: rutaCreada,
            paradero: existentes.find((item) => item.id === paradero.paraderoId)!,
            orden: paradero.orden,
            distanciaDesdeAnterior: distancia,
            tiempoEstimadoDesdeAnterior: paradero.tiempoEstimadoDesdeAnterior ?? null,
          });
        });

        await manager.getRepository(RutaParadero).save(paraderosEnRuta);
        const rutaCompleta = await manager.getRepository(Ruta).findOneOrFail({
          where: { id: rutaCreada.id },
          relations: { paraderosEnRuta: { paradero: true } },
          order: { paraderosEnRuta: { orden: 'ASC' } },
        });

        rutaCompleta.paraderosEnRuta.sort((left, right) => left.orden - right.orden);
        return rutaCompleta;
      });
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(nombre?: string): Promise<Ruta[]> {
    const where = nombre ? { nombre: Like(`%${nombre}%`) } : undefined;
    return this.rutaRepository.find({
      where,
      relations: { paraderosEnRuta: { paradero: true } },
      order: { paraderosEnRuta: { orden: 'ASC' } },
    });
  }

  async findOne(id: number): Promise<Ruta> {
    const ruta = await this.rutaRepository.findOne({
      where: { id },
      relations: { paraderosEnRuta: { paradero: true } },
      order: { paraderosEnRuta: { orden: 'ASC' } },
    });
    if (!ruta) {
      throw new NotFoundException('Ruta not found');
    }
    return ruta;
  }

  async getParaderosDeRuta(id: number): Promise<
    Array<{
      orden: number;
      distanciaDesdeAnterior: string | null;
      tiempoEstimadoDesdeAnterior: number | null;
      paradero: Paradero;
    }>
  > {
    const ruta = await this.rutaRepository.findOne({ where: { id } });
    if (!ruta) {
      throw new NotFoundException('Ruta not found');
    }

    const items = await this.rutaParaderoRepository
      .createQueryBuilder('rp')
      .innerJoinAndSelect('rp.paradero', 'paradero')
      .where('rp.rutaId = :rutaId', { rutaId: id })
      .orderBy('rp.orden', 'ASC')
      .getMany();

    return items.map((item) => ({
      orden: item.orden,
      distanciaDesdeAnterior: item.distanciaDesdeAnterior ?? null,
      tiempoEstimadoDesdeAnterior: item.tiempoEstimadoDesdeAnterior ?? null,
      paradero: item.paradero,
    }));
  }

  async update(id: number, updateRutaDto: UpdateRutaDto): Promise<Ruta> {
    const ruta = await this.rutaRepository.findOne({ where: { id } });
    if (!ruta) {
      throw new NotFoundException('Ruta not found');
    }

    const { tarifa, ...updateData } = updateRutaDto;
    Object.assign(ruta, updateData);
    if (tarifa !== undefined) {
      ruta.tarifa = this.formatDecimal(tarifa, 2);
    }

    try {
      return await this.rutaRepository.save(ruta);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Ruta> {
    const ruta = await this.rutaRepository.findOne({ where: { id } });
    if (!ruta) {
      throw new NotFoundException('Ruta not found');
    }
    try {
      await this.rutaRepository.remove(ruta);
      return ruta;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string; sqlMessage?: string } | undefined;
      const sqlMessage = driverError?.sqlMessage ?? '';
      if (driverError?.code === 'ER_DUP_ENTRY') {
        if (sqlMessage.includes('ruta.nombre')) {
          throw new ConflictException('Ya existe una ruta con ese nombre');
        }
        if (sqlMessage.includes('UQ_ruta_paradero_ruta_orden')) {
          throw new ConflictException('Ya existe un orden repetido en la ruta');
        }
        if (sqlMessage.includes('UQ_ruta_paradero_ruta_paradero')) {
          throw new ConflictException('El paradero ya esta asociado a la ruta');
        }
        throw new ConflictException('Duplicate value');
      }
      if (driverError?.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new BadRequestException('Cannot delete ruta with paraderos');
      }
    }
    throw error;
  }

  private formatDecimal(value: number, decimals: number): string {
    return Number(value).toFixed(decimals);
  }
}
