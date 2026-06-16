import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoletoService } from './boleto.service';
import { BoletoController } from './boleto.controller';
import { Boleto } from './entities/boleto.entity';
import { Ciudadano } from '../ciudadano/entities/ciudadano.entity';
import { Programacion } from '../programacion/entities/programacion.entity'; // <-- Importa la entidad
import { RutaParadero } from '../ruta-paradero/entities/ruta-paradero.entity';
import { MetodoPagoCiudadano } from '../metodo-pago-ciudadano/entities/metodo-pago-ciudadano.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Boleto,
      Ciudadano,
      Programacion, // <-- AGREGA ESTA ENTIDAD AQUÍ
      RutaParadero,
      MetodoPagoCiudadano,
    ]),
  ],
  controllers: [BoletoController],
  providers: [BoletoService],
  exports: [BoletoService], // Opcional, por si lo usas fuera
})
export class BoletoModule {}