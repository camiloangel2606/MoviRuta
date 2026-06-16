import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incidente } from '../incidente/entities/incidente.entity';
import { FotoController } from './foto.controller';
import { FotoService } from './foto.service';
import { Foto } from './entities/foto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Foto, Incidente])],
  controllers: [FotoController],
  providers: [FotoService],
  exports: [TypeOrmModule],
})
export class FotoModule {}
