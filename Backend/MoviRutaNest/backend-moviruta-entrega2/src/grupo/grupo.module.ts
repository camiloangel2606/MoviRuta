import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from '../persona/entities/persona.entity';
import { GrupoController } from './grupo.controller';
import { GrupoService } from './grupo.service';
import { GrupoPersona } from './entities/grupo-persona.entity';
import { Grupo } from './entities/grupo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grupo, GrupoPersona, Persona])],
  controllers: [GrupoController],
  providers: [GrupoService],
  exports: [TypeOrmModule],
})
export class GrupoModule {}
