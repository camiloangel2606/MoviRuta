import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Boleto } from '../boleto/entities/boleto.entity';
import { Paradero } from '../paradero/entities/paradero.entity';
import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';
import { Historial } from './entities/historial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Historial, Boleto, Paradero])],
  controllers: [HistorialController],
  providers: [HistorialService],
  exports: [TypeOrmModule],
})
export class HistorialModule {}
