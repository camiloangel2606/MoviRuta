import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DestinatarioPersonaController } from './destinatario-persona.controller';
import { DestinatarioPersonaService } from './destinatario-persona.service';
import { DestinatarioPersona } from './entities/destinatario-persona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DestinatarioPersona])],
  controllers: [DestinatarioPersonaController],
  providers: [DestinatarioPersonaService],
  exports: [TypeOrmModule],
})
export class DestinatarioPersonaModule {}
