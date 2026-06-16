import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateNodoDto } from './dto/create-nodo.dto';
import { UpdateNodoDto } from './dto/update-nodo.dto';
import { Nodo } from './entities/nodo.entity';

@Injectable()
export class NodoService {
  constructor(
    @InjectRepository(Nodo)
    private readonly nodoRepository: Repository<Nodo>,
  ) {}

  async create(createNodoDto: CreateNodoDto): Promise<Nodo> {
    const nodo = this.nodoRepository.create({
      ...createNodoDto,
      latitud: this.formatDecimal(createNodoDto.latitud, 7),
      longitud: this.formatDecimal(createNodoDto.longitud, 7),
    });
    try {
      return await this.nodoRepository.save(nodo);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Nodo[]> {
    return this.nodoRepository.find();
  }

  async findOne(id: number): Promise<Nodo> {
    const nodo = await this.nodoRepository.findOne({ where: { id } });
    if (!nodo) {
      throw new NotFoundException('Nodo not found');
    }
    return nodo;
  }

  async update(id: number, updateNodoDto: UpdateNodoDto): Promise<Nodo> {
    const nodo = await this.nodoRepository.findOne({ where: { id } });
    if (!nodo) {
      throw new NotFoundException('Nodo not found');
    }

    const { latitud, longitud, ...updateData } = updateNodoDto;
    Object.assign(nodo, updateData);

    if (latitud !== undefined) {
      nodo.latitud = this.formatDecimal(latitud, 7);
    }
    if (longitud !== undefined) {
      nodo.longitud = this.formatDecimal(longitud, 7);
    }

    try {
      return await this.nodoRepository.save(nodo);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Nodo> {
    const nodo = await this.nodoRepository.findOne({ where: { id } });
    if (!nodo) {
      throw new NotFoundException('Nodo not found');
    }
    try {
      await this.nodoRepository.remove(nodo);
      return nodo;
    } catch (error) {
      this.handleDbError(error);
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

  private formatDecimal(value: number, decimals: number): string {
    return Number(value).toFixed(decimals);
  }
}
