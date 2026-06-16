import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { UpdateConductorDto } from './dto/update-conductor.dto';
import { ConductorService } from './conductor.service';

@Controller('conductor')
export class ConductorController {
  constructor(private readonly conductorService: ConductorService) {}

  @Post()
  create(@Body() createConductorDto: CreateConductorDto) {
    return this.conductorService.create(createConductorDto);
  }

  @Get()
  findAll() {
    return this.conductorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.conductorService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConductorDto: UpdateConductorDto,
  ) {
    return this.conductorService.update(id, updateConductorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.conductorService.remove(id);
  }
}
