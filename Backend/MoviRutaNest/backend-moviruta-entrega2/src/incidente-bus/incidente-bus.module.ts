import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from '../bus/entities/bus.entity';
import { Incidente } from '../incidente/entities/incidente.entity';
import { IncidenteBus } from './entities/incidente-bus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IncidenteBus, Bus, Incidente])],
  exports: [TypeOrmModule],
})
export class IncidenteBusModule {}
