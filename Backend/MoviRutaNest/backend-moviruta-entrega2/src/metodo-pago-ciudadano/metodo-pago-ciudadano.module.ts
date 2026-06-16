import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ciudadano } from '../ciudadano/entities/ciudadano.entity';
import { MetodoPago } from '../metodo-pago/entities/metodo-pago.entity';
import { MetodoPagoCiudadanoController } from './metodo-pago-ciudadano.controller';
import { MetodoPagoCiudadanoService } from './metodo-pago-ciudadano.service';
import { MetodoPagoCiudadano } from './entities/metodo-pago-ciudadano.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetodoPagoCiudadano, Ciudadano, MetodoPago])],
  controllers: [MetodoPagoCiudadanoController],
  providers: [MetodoPagoCiudadanoService],
  exports: [TypeOrmModule],
})
export class MetodoPagoCiudadanoModule {}
