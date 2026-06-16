import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RutaService } from './ruta.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { CreateRutaConParaderosDto } from './dto/create-ruta-con-paraderos.dto';
import { QueryRutaDto } from './dto/query-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';

@Controller('ruta')
export class RutaController {
  constructor(private readonly rutaService: RutaService) {}

  @Post()
  create(@Body() createRutaDto: CreateRutaDto) {
    return this.rutaService.create(createRutaDto);
  }

  @Post('con-paraderos')
  createConParaderos(@Body() createRutaDto: CreateRutaConParaderosDto) {
    return this.rutaService.createConParaderos(createRutaDto);
  }

  @Get()
  findAll(@Query() query: QueryRutaDto) {
    return this.rutaService.findAll(query.nombre);
  }

  @Get(':id/paraderos')
  findParaderos(@Param('id') id: string) {
    return this.rutaService.getParaderosDeRuta(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rutaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRutaDto: UpdateRutaDto) {
    return this.rutaService.update(+id, updateRutaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rutaService.remove(+id);
  }
}
