import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Patch,
} from '@nestjs/common';
import { UpdateDestinatarioPersonaDto } from './dto/update-destinatario-persona.dto';
import { DestinatarioPersonaService } from './destinatario-persona.service';

@Controller('destinatario-persona')
export class DestinatarioPersonaController {
  constructor(private readonly destinatarioPersonaService: DestinatarioPersonaService) {}

  @Patch(':id/leido')
  updateLeido(
    @Param('id') id: string,
    @Body() updateDestinatarioPersonaDto: UpdateDestinatarioPersonaDto,
  ) {
    const destinatarioId = this.toPositiveInt(id, 'DestinatarioPersona id');
    return this.destinatarioPersonaService.updateLeido(
      destinatarioId,
      updateDestinatarioPersonaDto,
    );
  }

  private toPositiveInt(value: string, label: string): number {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 1) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }
    return numberValue;
  }
}
