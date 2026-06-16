import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Empresa } from '../empresa/entities/empresa.entity';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { Bus } from './entities/bus.entity';

@Injectable()
export class BusService {
  constructor(
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(createBusDto: CreateBusDto): Promise<Bus> {
    const { empresaId, ...busData } = createBusDto;
    const empresa = await this.getEmpresaOrThrow(empresaId);
    const bus = this.busRepository.create({ ...busData, empresa });
    try {
      return await this.busRepository.save(bus);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Bus[]> {
    return this.busRepository.find({ relations: ['empresa'] });
  }

  async findOne(id: number): Promise<Bus> {
    const bus = await this.busRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });
    if (!bus) {
      throw new NotFoundException('Bus not found');
    }
    return bus;
  }

  async update(id: number, updateBusDto: UpdateBusDto): Promise<Bus> {
    const bus = await this.busRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });
    if (!bus) {
      throw new NotFoundException('Bus not found');
    }

    const { empresaId, ...updateData } = updateBusDto;
    if (empresaId !== undefined) {
      bus.empresa = await this.getEmpresaOrThrow(empresaId);
    }
    Object.assign(bus, updateData);

    try {
      return await this.busRepository.save(bus);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Bus> {
    const bus = await this.busRepository.findOne({ where: { id } });
    if (!bus) {
      throw new NotFoundException('Bus not found');
    }
    try {
      await this.busRepository.remove(bus);
      return bus;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private async getEmpresaOrThrow(id: number): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({ where: { id } });
    if (!empresa) {
      throw new NotFoundException('Empresa not found');
    }
    return empresa;
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Duplicate value');
      }
      if (driverError?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new NotFoundException('Empresa not found');
      }
    }
    throw error;
  }
}
