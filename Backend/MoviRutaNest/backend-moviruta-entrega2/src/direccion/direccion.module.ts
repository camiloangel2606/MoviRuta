import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ciudadano } from '../ciudadano/entities/ciudadano.entity';
import { DireccionController } from './direccion.controller';
import { DireccionService } from './direccion.service';
import { Direccion } from './entities/direccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Direccion, Ciudadano])],
  controllers: [DireccionController],
  providers: [DireccionService],
  exports: [TypeOrmModule],
})
export class DireccionModule {}
