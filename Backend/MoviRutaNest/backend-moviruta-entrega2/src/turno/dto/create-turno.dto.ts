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
import { TurnoEstado } from '../entities/turno.entity';

export class CreateTurnoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  conductorId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  busId!: number;

  @IsDateString()
  inicio!: string;

  @IsOptional()
  @IsDateString()
  fin?: string;

  @IsOptional()
  @IsEnum(TurnoEstado)
  estado?: TurnoEstado;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;
}
