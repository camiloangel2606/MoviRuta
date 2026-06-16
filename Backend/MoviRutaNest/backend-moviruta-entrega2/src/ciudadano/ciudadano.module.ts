import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from '../persona/entities/persona.entity';
import { CiudadanoController } from './ciudadano.controller';
import { CiudadanoService } from './ciudadano.service';
import { Ciudadano } from './entities/ciudadano.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ciudadano, Persona])],
  controllers: [CiudadanoController],
  providers: [CiudadanoService],
  exports: [TypeOrmModule, CiudadanoService] // Exportamos el servicio para que pueda ser usado en otros módulos si es necesario,
})
export class CiudadanoModule {}
