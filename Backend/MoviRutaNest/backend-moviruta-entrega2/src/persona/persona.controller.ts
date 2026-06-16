import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Headers, UseGuards } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { SecurityGuard } from 'src/core/guards/security.guard';

@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personaService.create(createPersonaDto);
  }

  @Get()
  findAll() {
    return this.personaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personaService.findOne(+id);
  }

  @Patch('security/:securityUserId')
  //@UseGuards(SecurityGuard)
  updateBySecurityId(
    @Param('securityUserId') securityUserId: string,
    @Body() updatePersonaDto: UpdatePersonaDto
  ) {
    return this.personaService.updateBySecurityId(securityUserId, updatePersonaDto);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personaService.update(+id, updatePersonaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personaService.remove(+id);
  }

  // 1. MANTENEMOS EL GET (Para que Angular verifique si la persona existe al cargar el perfil)
  @Get('security/:securityUserId')
  async getPerfilSincronizado(@Param('securityUserId') securityUserId: string) {
    // Buscamos la persona directamente en la BD de NestJS sin llamar a Spring Boot por debajo
    const persona = await this.personaService.findBySecurityId(securityUserId);
    if (!persona) {
      throw new NotFoundException('Persona no encontrada en el módulo de negocio');
    }
    return persona;
  }

  @Post('security/:securityUserId/verificar-conductor')
  async verificarConductor(@Param('securityUserId') securityUserId: string) {
    return await this.personaService.verificarYCrearConductorManualmente(securityUserId);
  }
}
