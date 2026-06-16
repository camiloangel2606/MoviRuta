import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ProgramacionRecurrente } from '../entities/programacion.entity';

export class CreateProgramacionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rutaId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  busId!: number;

  @IsDateString()
  fecha!: string;

  @IsString()
  @MaxLength(8)
  horaSalida!: string;

  @IsOptional()
  @IsEnum(ProgramacionRecurrente)
  recurrente?: ProgramacionRecurrente;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  toleranciaMinutos?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  conductorId!: number;
}
