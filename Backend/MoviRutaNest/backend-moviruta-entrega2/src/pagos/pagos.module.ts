import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetodoPagoCiudadano } from '../metodo-pago-ciudadano/entities/metodo-pago-ciudadano.entity';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';

@Module({
  imports: [TypeOrmModule.forFeature([MetodoPagoCiudadano])],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
