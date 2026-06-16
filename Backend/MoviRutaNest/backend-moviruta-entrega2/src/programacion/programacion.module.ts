import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from '../bus/entities/bus.entity';
import { Conductor } from '../conductor/entities/conductor.entity';
import { Ruta } from '../ruta/entities/ruta.entity';
import { Turno } from '../turno/entities/turno.entity';
import { ProgramacionController } from './programacion.controller';
import { ProgramacionService } from './programacion.service';
import { Programacion } from './entities/programacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Programacion, Ruta, Bus, Conductor, Turno])],
  controllers: [ProgramacionController],
  providers: [ProgramacionService],
  exports: [TypeOrmModule],
})
export class ProgramacionModule {}
