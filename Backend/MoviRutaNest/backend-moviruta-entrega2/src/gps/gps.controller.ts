import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateGpsDto } from './dto/create-gps.dto';
import { UpdateGpsPosicionDto } from './dto/update-gps-posicion.dto';
import { UpdateGpsDto } from './dto/update-gps.dto';
import { GpsService } from './gps.service';

@Controller('gps')
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Post()
  create(@Body() createGpsDto: CreateGpsDto) {
    return this.gpsService.create(createGpsDto);
  }

  @Get()
  findAll() {
    return this.gpsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gpsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGpsDto: UpdateGpsDto) {
    return this.gpsService.update(+id, updateGpsDto);
  }

  @Patch(':id/posicion')
  updatePosicion(
    @Param('id') id: string,
    @Body() updateGpsPosicionDto: UpdateGpsPosicionDto,
  ) {
    return this.gpsService.updatePosicion(+id, updateGpsPosicionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gpsService.remove(+id);
  }
}
