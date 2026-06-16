import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Ciudadano } from '../ciudadano/entities/ciudadano.entity';
import { MetodoPago } from '../metodo-pago/entities/metodo-pago.entity';
import { CreateMetodoPagoCiudadanoDto } from './dto/create-metodo-pago-ciudadano.dto';
import { UpdateMetodoPagoCiudadanoDto } from './dto/update-metodo-pago-ciudadano.dto';
import { MetodoPagoCiudadano } from './entities/metodo-pago-ciudadano.entity';

@Injectable()
export class MetodoPagoCiudadanoService {
  constructor(
    @InjectRepository(MetodoPagoCiudadano)
    private readonly metodoPagoCiudadanoRepository: Repository<MetodoPagoCiudadano>,
    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepository: Repository<Ciudadano>,
    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,
  ) {}

  async create(
    createDto: CreateMetodoPagoCiudadanoDto,
  ): Promise<MetodoPagoCiudadano> {
    const ciudadano = await this.getCiudadanoOrThrow(createDto.ciudadanoId);
    const metodoPago = await this.getMetodoPagoOrThrow(createDto.metodoPagoId);

    await this.ensureIdentificadorDisponible(
      ciudadano.id,
      metodoPago.id,
      createDto.identificador,
    );

    const metodoPagoCiudadano = this.metodoPagoCiudadanoRepository.create({
      ciudadano,
      metodoPago,
      identificador: createDto.identificador,
      saldo: this.formatDecimal(createDto.saldo, 2),
    });

    try {
      return await this.metodoPagoCiudadanoRepository.save(metodoPagoCiudadano);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(ciudadanoId?: number): Promise<MetodoPagoCiudadano[]> {
    return this.metodoPagoCiudadanoRepository.find({
      where: ciudadanoId ? { ciudadano: { id: ciudadanoId } } : {},
      relations: ['ciudadano', 'metodoPago'],
    });
  }

  async findOne(id: number): Promise<MetodoPagoCiudadano> {
    const metodoPagoCiudadano = await this.metodoPagoCiudadanoRepository.findOne({
      where: { id },
      relations: ['ciudadano', 'metodoPago'],
    });
    if (!metodoPagoCiudadano) {
      throw new NotFoundException('MetodoPagoCiudadano not found');
    }
    return metodoPagoCiudadano;
  }

  async update(
    id: number,
    updateDto: UpdateMetodoPagoCiudadanoDto,
  ): Promise<MetodoPagoCiudadano> {
    const metodoPagoCiudadano = await this.metodoPagoCiudadanoRepository.findOne({
      where: { id },
      relations: ['ciudadano', 'metodoPago'],
    });
    if (!metodoPagoCiudadano) {
      throw new NotFoundException('MetodoPagoCiudadano not found');
    }

    const ciudadanoId = updateDto.ciudadanoId ?? metodoPagoCiudadano.ciudadano.id;
    const metodoPagoId = updateDto.metodoPagoId ?? metodoPagoCiudadano.metodoPago.id;
    const identificador = updateDto.identificador ?? metodoPagoCiudadano.identificador;

    if (
      ciudadanoId !== metodoPagoCiudadano.ciudadano.id ||
      metodoPagoId !== metodoPagoCiudadano.metodoPago.id ||
      identificador !== metodoPagoCiudadano.identificador
    ) {
      await this.ensureIdentificadorDisponible(ciudadanoId, metodoPagoId, identificador, id);
    }

    if (updateDto.ciudadanoId !== undefined) {
      metodoPagoCiudadano.ciudadano = await this.getCiudadanoOrThrow(updateDto.ciudadanoId);
    }
    if (updateDto.metodoPagoId !== undefined) {
      metodoPagoCiudadano.metodoPago = await this.getMetodoPagoOrThrow(updateDto.metodoPagoId);
    }
    if (updateDto.identificador !== undefined) {
      metodoPagoCiudadano.identificador = updateDto.identificador;
    }
    if (updateDto.saldo !== undefined) {
      metodoPagoCiudadano.saldo = this.formatDecimal(updateDto.saldo, 2);
    }

    try {
      return await this.metodoPagoCiudadanoRepository.save(metodoPagoCiudadano);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<MetodoPagoCiudadano> {
    const metodoPagoCiudadano = await this.metodoPagoCiudadanoRepository.findOne({ where: { id } });
    if (!metodoPagoCiudadano) {
      throw new NotFoundException('MetodoPagoCiudadano not found');
    }
    try {
      await this.metodoPagoCiudadanoRepository.remove(metodoPagoCiudadano);
      return metodoPagoCiudadano;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private async getCiudadanoOrThrow(id: number): Promise<Ciudadano> {
    const ciudadano = await this.ciudadanoRepository.findOne({ where: { id } });
    if (!ciudadano) {
      throw new NotFoundException('Ciudadano not found');
    }
    return ciudadano;
  }

  private async getMetodoPagoOrThrow(id: number): Promise<MetodoPago> {
    const metodoPago = await this.metodoPagoRepository.findOne({ where: { id } });
    if (!metodoPago) {
      throw new NotFoundException('MetodoPago not found');
    }
    return metodoPago;
  }

  private async ensureIdentificadorDisponible(
    ciudadanoId: number,
    metodoPagoId: number,
    identificador: string,
    recordId?: number,
  ): Promise<void> {
    const existing = await this.metodoPagoCiudadanoRepository.findOne({
      where: {
        ciudadano: { id: ciudadanoId },
        metodoPago: { id: metodoPagoId },
        identificador,
      },
      relations: ['ciudadano', 'metodoPago'],
    });

    if (existing && existing.id !== recordId) {
      throw new ConflictException('Identificador already registered for this metodoPago');
    }
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Duplicate metodoPagoCiudadano');
      }
      if (driverError?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new NotFoundException('Related resource not found');
      }
    }
    throw error;
  }

  private formatDecimal(value: number, decimals: number): string {
    return Number(value).toFixed(decimals);
  }
}
