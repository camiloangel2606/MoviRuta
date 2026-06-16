import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from '../bus/entities/bus.entity';
import { GpsController } from './gps.controller';
import { GpsService } from './gps.service';
import { Gps } from './entities/gps.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gps, Bus])],
  controllers: [GpsController],
  providers: [GpsService],
  exports: [TypeOrmModule],
})
export class GpsModule {}
