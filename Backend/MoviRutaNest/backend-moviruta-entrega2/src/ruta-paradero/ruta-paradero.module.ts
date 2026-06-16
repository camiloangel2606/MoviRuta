import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RutaParaderoService } from './ruta-paradero.service';
import { RutaParaderoController } from './ruta-paradero.controller';
import { RutaParadero } from './entities/ruta-paradero.entity';
import { Ruta } from '../ruta/entities/ruta.entity';
import { Paradero } from '../paradero/entities/paradero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RutaParadero, Ruta, Paradero])],
  controllers: [RutaParaderoController],
  providers: [RutaParaderoService],
  exports: [TypeOrmModule],
})
export class RutaParaderoModule {}