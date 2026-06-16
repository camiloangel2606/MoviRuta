import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateFotoDto } from './dto/create-foto.dto';
import { UpdateFotoDto } from './dto/update-foto.dto';
import { FotoService } from './foto.service';

@Controller('foto')
export class FotoController {
  constructor(private readonly fotoService: FotoService) {}

  @Post()
  create(@Body() createDto: CreateFotoDto) {
    return this.fotoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.fotoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const fotoId = this.toPositiveInt(id, 'Foto id');
    return this.fotoService.findOne(fotoId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFotoDto) {
    const fotoId = this.toPositiveInt(id, 'Foto id');
    return this.fotoService.update(fotoId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const fotoId = this.toPositiveInt(id, 'Foto id');
    return this.fotoService.remove(fotoId);
  }

  private toPositiveInt(value: string, label: string): number {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 1) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }
    return numberValue;
  }
}
