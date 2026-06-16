import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { IniciarTurnoDto } from './dto/iniciar-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { TurnoEstado } from './entities/turno.entity';
import { TurnoService } from './turno.service';

@Controller('turno')
export class TurnoController {
  constructor(private readonly turnoService: TurnoService) {}

  @Post()
  create(@Body() createTurnoDto: CreateTurnoDto) {
    return this.turnoService.create(createTurnoDto);
  }

  @Get()
  findAll() {
    return this.turnoService.findAll();
  }

  @Get('conductor/:conductorId')
  findByConductor(
    @Param('conductorId', ParseIntPipe) conductorId: number,
    @Query('estados') estadosRaw?: string,
  ) {
    const estadosValidos = Object.values(TurnoEstado);
    const estados = estadosRaw
      ? estadosRaw.split(',').map((e) => {
          const val = e.trim().toUpperCase();
          if (!estadosValidos.includes(val as TurnoEstado)) {
            throw new BadRequestException(
              `Estado inválido: "${e.trim()}". Valores permitidos: ${estadosValidos.join(', ')}`,
            );
          }
          return val as TurnoEstado;
        })
      : undefined;

    return this.turnoService.findByConductor(conductorId, estados);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.turnoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTurnoDto: UpdateTurnoDto,
  ) {
    return this.turnoService.update(id, updateTurnoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.turnoService.remove(id);
  }

  @Post(':id/iniciar')
  iniciar(
    @Param('id', ParseIntPipe) id: number,
    @Body() iniciarTurnoDto: IniciarTurnoDto,
  ) {
    return this.turnoService.iniciar(id, iniciarTurnoDto);
  }

  @Post(':id/finalizar')
  finalizar(@Param('id', ParseIntPipe) id: number) {
    return this.turnoService.finalizar(id);
  }
}
