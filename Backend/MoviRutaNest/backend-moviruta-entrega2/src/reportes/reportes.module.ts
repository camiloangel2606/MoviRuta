import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Boleto } from '../boleto/entities/boleto.entity';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Boleto])],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
