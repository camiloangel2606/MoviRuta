import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DestinatarioGrupo } from '../destinatario-grupo/entities/destinatario-grupo.entity';
import { DestinatarioPersona } from '../destinatario-persona/entities/destinatario-persona.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Persona } from '../persona/entities/persona.entity';
import { MensajeController } from './mensaje.controller';
import { MensajeService } from './mensaje.service';
import { Mensaje } from './entities/mensaje.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Mensaje,
      DestinatarioPersona,
      DestinatarioGrupo,
      Persona,
      Grupo,
    ]),
  ],
  controllers: [MensajeController],
  providers: [MensajeService],
  exports: [TypeOrmModule],
})
export class MensajeModule {}
