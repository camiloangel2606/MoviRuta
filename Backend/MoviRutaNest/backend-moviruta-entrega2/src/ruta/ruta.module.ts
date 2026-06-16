import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RutaService } from './ruta.service';
import { RutaController } from './ruta.controller';
import { Ruta } from './entities/ruta.entity';
import { RutaParadero } from '../ruta-paradero/entities/ruta-paradero.entity';
import { Paradero } from '../paradero/entities/paradero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ruta, RutaParadero, Paradero])],
  controllers: [RutaController],
  providers: [RutaService],
  exports: [TypeOrmModule],
})
export class RutaModule {}