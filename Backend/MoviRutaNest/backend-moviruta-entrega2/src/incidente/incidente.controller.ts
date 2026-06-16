import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { QueryIncidenteDto } from './dto/query-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { IncidenteService } from './incidente.service';

@Controller('incidente')
export class IncidenteController {
  constructor(private readonly incidenteService: IncidenteService) {}

  @Post()
  create(@Body() createIncidenteDto: CreateIncidenteDto) {
    return this.incidenteService.create(createIncidenteDto);
  }

  @Get()
  findAll(@Query() query: QueryIncidenteDto) {
    return this.incidenteService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.incidenteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateIncidenteDto: UpdateIncidenteDto) {
    return this.incidenteService.update(id, updateIncidenteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.incidenteService.remove(id);
  }
}
