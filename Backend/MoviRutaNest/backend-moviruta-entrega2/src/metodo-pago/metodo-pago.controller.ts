import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { MetodoPagoService } from './metodo-pago.service';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';

@Controller('metodo-pago')
export class MetodoPagoController {
  constructor(private readonly metodoPagoService: MetodoPagoService) {}

  @Post()
  create(@Body() createMetodoPagoDto: CreateMetodoPagoDto) {
    return this.metodoPagoService.create(createMetodoPagoDto);
  }

  @Get()
  findAll() {
    return this.metodoPagoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const metodoPagoId = this.toPositiveInt(id, 'MetodoPago id');
    return this.metodoPagoService.findOne(metodoPagoId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMetodoPagoDto: UpdateMetodoPagoDto) {
    const metodoPagoId = this.toPositiveInt(id, 'MetodoPago id');
    return this.metodoPagoService.update(metodoPagoId, updateMetodoPagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const metodoPagoId = this.toPositiveInt(id, 'MetodoPago id');
    return this.metodoPagoService.remove(metodoPagoId);
  }

  private toPositiveInt(value: string, label: string): number {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 1) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }
    return numberValue;
  }
}
