import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateGrupoMiembroDto } from './dto/create-grupo-miembro.dto';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { GrupoService } from './grupo.service';

@Controller('grupo')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Post()
  create(@Body() createGrupoDto: CreateGrupoDto) {
    return this.grupoService.create(createGrupoDto);
  }

  @Get()
  findAll() {
    return this.grupoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const grupoId = this.toPositiveInt(id, 'Grupo id');
    return this.grupoService.findOne(grupoId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGrupoDto: UpdateGrupoDto) {
    const grupoId = this.toPositiveInt(id, 'Grupo id');
    return this.grupoService.update(grupoId, updateGrupoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const grupoId = this.toPositiveInt(id, 'Grupo id');
    return this.grupoService.remove(grupoId);
  }

  @Post(':id/miembros')
  addMember(
    @Param('id') id: string,
    @Body() createGrupoMiembroDto: CreateGrupoMiembroDto,
  ) {
    const grupoId = this.toPositiveInt(id, 'Grupo id');
    return this.grupoService.addMember(grupoId, createGrupoMiembroDto);
  }

  @Get(':id/miembros')
  findMembers(@Param('id') id: string) {
    const grupoId = this.toPositiveInt(id, 'Grupo id');
    return this.grupoService.findMembers(grupoId);
  }

  @Delete(':id/miembros/:personaId')
  removeMember(
    @Param('id') id: string,
    @Param('personaId') personaId: string,
  ) {
    const grupoId = this.toPositiveInt(id, 'Grupo id');
    const personaIdNumber = this.toPositiveInt(personaId, 'Persona id');
    return this.grupoService.removeMember(grupoId, personaIdNumber);
  }

  private toPositiveInt(value: string, label: string): number {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 1) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }
    return numberValue;
  }
}
