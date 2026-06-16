import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from '../bus/entities/bus.entity';
import { Persona } from '../persona/entities/persona.entity';
import { Foto } from '../foto/entities/foto.entity';
import { IncidenteController } from './incidente.controller';
import { IncidenteService } from './incidente.service';
import { Incidente } from './entities/incidente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Incidente, Bus, Persona, Foto])],
  controllers: [IncidenteController],
  providers: [IncidenteService],
  exports: [TypeOrmModule],
})
export class IncidenteModule {}
