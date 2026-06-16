import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { MensajeService } from './mensaje.service';

@Controller('mensaje')
export class MensajeController {
  constructor(private readonly mensajeService: MensajeService) {}

  @Post()
  create(@Body() createMensajeDto: CreateMensajeDto) {
    return this.mensajeService.create(createMensajeDto);
  }

  @Get()
  findAll() {
    return this.mensajeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const mensajeId = this.toPositiveInt(id, 'Mensaje id');
    return this.mensajeService.findOne(mensajeId);
  }

  private toPositiveInt(value: string, label: string): number {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 1) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }
    return numberValue;
  }
}
