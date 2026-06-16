import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetodoPagoController } from './metodo-pago.controller';
import { MetodoPagoService } from './metodo-pago.service';
import { MetodoPago } from './entities/metodo-pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetodoPago])],
  controllers: [MetodoPagoController],
  providers: [MetodoPagoService],
  exports: [TypeOrmModule],
})
export class MetodoPagoModule {}
