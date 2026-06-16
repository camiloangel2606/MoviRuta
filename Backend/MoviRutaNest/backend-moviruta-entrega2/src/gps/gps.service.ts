import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Bus } from '../bus/entities/bus.entity';
import { CreateGpsDto } from './dto/create-gps.dto';
import { UpdateGpsPosicionDto } from './dto/update-gps-posicion.dto';
import { UpdateGpsDto } from './dto/update-gps.dto';
import { Gps } from './entities/gps.entity';

@Injectable()
export class GpsService {
  constructor(
    @InjectRepository(Gps)
    private readonly gpsRepository: Repository<Gps>,
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
  ) {}

  async create(createGpsDto: CreateGpsDto): Promise<Gps> {
    const bus = await this.getBusOrThrow(createGpsDto.busId);
    const gps = this.gpsRepository.create({
      bus,
      deviceId: createGpsDto.deviceId,
    });
    try {
      return await this.gpsRepository.save(gps);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Gps[]> {
    return this.gpsRepository.find({ relations: ['bus'] });
  }

  async findOne(id: number): Promise<Gps> {
    const gps = await this.gpsRepository.findOne({
      where: { id },
      relations: ['bus'],
    });
    if (!gps) {
      throw new NotFoundException('Gps not found');
    }
    return gps;
  }

  async update(id: number, updateGpsDto: UpdateGpsDto): Promise<Gps> {
    const gps = await this.gpsRepository.findOne({
      where: { id },
      relations: ['bus'],
    });
    if (!gps) {
      throw new NotFoundException('Gps not found');
    }

    const { busId, deviceId } = updateGpsDto;
    if (busId !== undefined) {
      await this.ensureBusDisponible(busId, id);
      gps.bus = await this.getBusOrThrow(busId);
    }
    if (deviceId !== undefined) {
      gps.deviceId = deviceId;
    }

    try {
      return await this.gpsRepository.save(gps);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async updatePosicion(id: number, posicion: UpdateGpsPosicionDto): Promise<Gps> {
    const gps = await this.gpsRepository.findOne({ where: { id } });
    if (!gps) {
      throw new NotFoundException('Gps not found');
    }

    gps.latitud = this.formatDecimal(posicion.lat, 7);
    gps.longitud = this.formatDecimal(posicion.lng, 7);

    try {
      return await this.gpsRepository.save(gps);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Gps> {
    const gps = await this.gpsRepository.findOne({ where: { id } });
    if (!gps) {
      throw new NotFoundException('Gps not found');
    }
    try {
      await this.gpsRepository.remove(gps);
      return gps;
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

  private async ensureBusDisponible(busId: number, gpsId: number): Promise<void> {
    const existing = await this.gpsRepository.findOne({
      where: {
        bus: { id: busId },
      },
      relations: ['bus'],
    });

    if (existing && existing.id !== gpsId) {
      throw new ConflictException('Bus already has a GPS assigned');
    }
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Duplicate value');
      }
      if (driverError?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new NotFoundException('Bus not found');
      }
    }
    throw error;
  }

  private formatDecimal(value: number, decimals: number): string {
    return Number(value).toFixed(decimals);
  }
}
