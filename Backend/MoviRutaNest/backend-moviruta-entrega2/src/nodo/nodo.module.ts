import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodoController } from './nodo.controller';
import { NodoService } from './nodo.service';
import { Nodo } from './entities/nodo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nodo])],
  controllers: [NodoController],
  providers: [NodoService],
  exports: [TypeOrmModule],
})
export class NodoModule {}
