import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MetodoPagoCiudadanoService } from './metodo-pago-ciudadano.service';
import { CreateMetodoPagoCiudadanoDto } from './dto/create-metodo-pago-ciudadano.dto';
import { UpdateMetodoPagoCiudadanoDto } from './dto/update-metodo-pago-ciudadano.dto';

@Controller('metodo-pago-ciudadano')
export class MetodoPagoCiudadanoController {
  constructor(private readonly metodoPagoCiudadanoService: MetodoPagoCiudadanoService) {}

  @Post()
  create(@Body() createDto: CreateMetodoPagoCiudadanoDto) {
    return this.metodoPagoCiudadanoService.create(createDto);
  }

  @Get()
  findAll(@Query('ciudadanoId') ciudadanoId?: string) {
    const cid = ciudadanoId !== undefined ? Number(ciudadanoId) : undefined;
    return this.metodoPagoCiudadanoService.findAll(cid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const recordId = this.toPositiveInt(id, 'MetodoPagoCiudadano id');
    return this.metodoPagoCiudadanoService.findOne(recordId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMetodoPagoCiudadanoDto) {
    const recordId = this.toPositiveInt(id, 'MetodoPagoCiudadano id');
    return this.metodoPagoCiudadanoService.update(recordId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const recordId = this.toPositiveInt(id, 'MetodoPagoCiudadano id');
    return this.metodoPagoCiudadanoService.remove(recordId);
  }

  private toPositiveInt(value: string, label: string): number {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 1) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }
    return numberValue;
  }
}
