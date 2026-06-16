import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateDestinatarioPersonaDto } from './dto/update-destinatario-persona.dto';
import { DestinatarioPersona } from './entities/destinatario-persona.entity';

@Injectable()
export class DestinatarioPersonaService {
  constructor(
    @InjectRepository(DestinatarioPersona)
    private readonly destinatarioPersonaRepository: Repository<DestinatarioPersona>,
  ) {}

  async updateLeido(
    id: number,
    updateDestinatarioPersonaDto: UpdateDestinatarioPersonaDto,
  ): Promise<DestinatarioPersona> {
    this.assertPositiveId(id, 'DestinatarioPersona id');
    const destinatario = await this.destinatarioPersonaRepository.findOne({
      where: { id },
    });
    if (!destinatario) {
      throw new NotFoundException('DestinatarioPersona not found');
    }
    destinatario.leido = updateDestinatarioPersonaDto.leido;
    return this.destinatarioPersonaRepository.save(destinatario);
  }

  private assertPositiveId(value: number, label: string): void {
    if (!Number.isInteger(value) || value < 1) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }
  }
}
