import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProgramacionService } from './programacion.service';
import { CreateProgramacionDto } from './dto/create-programacion.dto';
import { FindProgramacionQueryDto } from './dto/find-programacion-query.dto';
import { UpdateProgramacionDto } from './dto/update-programacion.dto';

@Controller('programacion')
export class ProgramacionController {
  constructor(private readonly programacionService: ProgramacionService) {}

  @Post()
  create(@Body() dto: CreateProgramacionDto) {
    return this.programacionService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindProgramacionQueryDto) {
    return this.programacionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.programacionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProgramacionDto) {
    return this.programacionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.programacionService.remove(id);
  }
}