import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { HistorialTipo } from '../entities/historial.entity';

export class CreateHistorialDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  boletoId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  paraderoId!: number;

  @IsEnum(HistorialTipo)
  tipo!: HistorialTipo;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orden?: number;
}
