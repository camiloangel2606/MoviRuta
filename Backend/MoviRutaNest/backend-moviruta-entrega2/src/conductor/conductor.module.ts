import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from '../persona/entities/persona.entity';
import { ConductorController } from './conductor.controller';
import { ConductorService } from './conductor.service';
import { Conductor } from './entities/conductor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conductor, Persona])],
  controllers: [ConductorController],
  providers: [ConductorService],
  exports: [TypeOrmModule],
})
export class ConductorModule {}
