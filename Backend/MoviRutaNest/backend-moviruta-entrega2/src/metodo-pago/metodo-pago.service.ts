import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';
import { MetodoPago } from './entities/metodo-pago.entity';

@Injectable()
export class MetodoPagoService {
  constructor(
    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,
  ) {}

  async create(createMetodoPagoDto: CreateMetodoPagoDto): Promise<MetodoPago> {
    const metodoPago = this.metodoPagoRepository.create(createMetodoPagoDto);
    try {
      return await this.metodoPagoRepository.save(metodoPago);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<MetodoPago[]> {
    return this.metodoPagoRepository.find();
  }

  async findOne(id: number): Promise<MetodoPago> {
    const metodoPago = await this.metodoPagoRepository.findOne({ where: { id } });
    if (!metodoPago) {
      throw new NotFoundException('MetodoPago not found');
    }
    return metodoPago;
  }

  async update(id: number, updateMetodoPagoDto: UpdateMetodoPagoDto): Promise<MetodoPago> {
    const metodoPago = await this.metodoPagoRepository.findOne({ where: { id } });
    if (!metodoPago) {
      throw new NotFoundException('MetodoPago not found');
    }

    Object.assign(metodoPago, updateMetodoPagoDto);

    try {
      return await this.metodoPagoRepository.save(metodoPago);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<MetodoPago> {
    const metodoPago = await this.metodoPagoRepository.findOne({ where: { id } });
    if (!metodoPago) {
      throw new NotFoundException('MetodoPago not found');
    }
    try {
      await this.metodoPagoRepository.remove(metodoPago);
      return metodoPago;
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
}
