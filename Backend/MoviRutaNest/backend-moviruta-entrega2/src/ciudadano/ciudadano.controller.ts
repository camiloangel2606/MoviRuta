import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CiudadanoService } from './ciudadano.service';
import { CreateCiudadanoDto } from './dto/create-ciudadano.dto';
import { UpdateCiudadanoDto } from './dto/update-ciudadano.dto';
import { UseGuards } from '@nestjs/common';
import { SecurityGuard } from 'src/core/guards/security.guard';

@Controller('ciudadano')
export class CiudadanoController {
  constructor(private readonly ciudadanoService: CiudadanoService) {}
  
  @Post()
  create(@Body() createCiudadanoDto: CreateCiudadanoDto) {
    return this.ciudadanoService.create(createCiudadanoDto);
  }

  @Get()
  findAll() {
    return this.ciudadanoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const ciudadanoId = this.toPositiveInt(id, 'Ciudadano id');
    return this.ciudadanoService.findOne(ciudadanoId);
  }

  @Patch('by-persona/:personaId')
  updateByPersona(@Param('personaId') personaId: string, @Body() updateCiudadanoDto: UpdateCiudadanoDto) {
    const pid = this.toPositiveInt(personaId, 'Persona id');
    return this.ciudadanoService.updateByPersonaId(pid, updateCiudadanoDto);
  }

  @Patch(':id')
  //@UseGuards(SecurityGuard) // <-- SÓLO AQUÍ. Intercepta el PATCH.
  update(@Param('id') id: string, @Body() updateCiudadanoDto: UpdateCiudadanoDto) {
    const ciudadanoId = this.toPositiveInt(id, 'Ciudadano id');
    return this.ciudadanoService.update(ciudadanoId, updateCiudadanoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const ciudadanoId = this.toPositiveInt(id, 'Ciudadano id');
    return this.ciudadanoService.remove(ciudadanoId);
  }

  private toPositiveInt(value: string, label: string): number {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 1) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }
    return numberValue;
  }
}
