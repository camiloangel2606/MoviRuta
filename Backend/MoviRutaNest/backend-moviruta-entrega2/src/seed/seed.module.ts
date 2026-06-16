import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetodoPago } from '../metodo-pago/entities/metodo-pago.entity';
import { MetodoPagoCiudadano } from '../metodo-pago-ciudadano/entities/metodo-pago-ciudadano.entity';
import { Ciudadano } from '../ciudadano/entities/ciudadano.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([MetodoPago, MetodoPagoCiudadano, Ciudadano])],
  providers: [SeedService],
})
export class SeedModule {}
