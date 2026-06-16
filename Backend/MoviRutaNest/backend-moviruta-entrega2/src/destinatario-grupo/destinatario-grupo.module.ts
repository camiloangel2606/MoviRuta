import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DestinatarioGrupo } from './entities/destinatario-grupo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DestinatarioGrupo])],
  exports: [TypeOrmModule],
})
export class DestinatarioGrupoModule {}
