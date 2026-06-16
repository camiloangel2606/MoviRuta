import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Empresa } from './entities/empresa.entity';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const empresa = this.empresaRepository.create(createEmpresaDto);
    try {
      return await this.empresaRepository.save(empresa);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async findAll(): Promise<Empresa[]> {
    return this.empresaRepository.find();
  }

  async findOne(id: number): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({
      where: { id },
      relations: ['buses'],
    });
    if (!empresa) {
      throw new NotFoundException('Empresa not found');
    }
    return empresa;
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({ where: { id } });
    if (!empresa) {
      throw new NotFoundException('Empresa not found');
    }
    Object.assign(empresa, updateEmpresaDto);
    try {
      return await this.empresaRepository.save(empresa);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({ where: { id } });
    if (!empresa) {
      throw new NotFoundException('Empresa not found');
    }
    try {
      await this.empresaRepository.remove(empresa);
      return empresa;
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
      if (driverError?.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new BadRequestException('Cannot delete empresa with buses');
      }
    }
    throw error;
  }
}
