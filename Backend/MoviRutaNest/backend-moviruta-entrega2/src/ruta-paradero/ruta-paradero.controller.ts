import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RutaParaderoService } from './ruta-paradero.service';
import { CreateRutaParaderoDto } from './dto/create-ruta-paradero.dto';
import { UpdateRutaParaderoDto } from './dto/update-ruta-paradero.dto';

@Controller('ruta-paradero')
export class RutaParaderoController {
  constructor(private readonly rutaParaderoService: RutaParaderoService) {}

  @Post()
  create(@Body() createRutaParaderoDto: CreateRutaParaderoDto) {
    return this.rutaParaderoService.create(createRutaParaderoDto);
  }

  @Get()
  findAll() {
    return this.rutaParaderoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rutaParaderoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRutaParaderoDto: UpdateRutaParaderoDto) {
    return this.rutaParaderoService.update(+id, updateRutaParaderoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rutaParaderoService.remove(+id);
  }
}
