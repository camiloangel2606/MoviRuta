import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from '../bus/entities/bus.entity';
import { Conductor } from '../conductor/entities/conductor.entity';
import { TurnoController } from './turno.controller';
import { TurnoService } from './turno.service';
import { Turno } from './entities/turno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Turno, Conductor, Bus])],
  controllers: [TurnoController],
  providers: [TurnoService],
  exports: [TypeOrmModule],
})
export class TurnoModule {}
