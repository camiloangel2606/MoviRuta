import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DireccionService } from './direccion.service';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UpdateDireccionDto } from './dto/update-direccion.dto';

@Controller('direccion')
export class DireccionController {
  constructor(private readonly direccionService: DireccionService) {}

  @Post()
  create(@Body() createDireccionDto: CreateDireccionDto) {
    return this.direccionService.create(createDireccionDto);
  }

  @Get()
  findAll() {
    return this.direccionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const direccionId = this.toPositiveInt(id, 'Direccion id');
    return this.direccionService.findOne(direccionId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDireccionDto: UpdateDireccionDto) {
    const direccionId = this.toPositiveInt(id, 'Direccion id');
    return this.direccionService.update(direccionId, updateDireccionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const direccionId = this.toPositiveInt(id, 'Direccion id');
    return this.direccionService.remove(direccionId);
  }

  private toPositiveInt(value: string, label: string): number {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 1) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }
    return numberValue;
  }
}
