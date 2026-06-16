import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { IncidenteEstado, IncidenteTipo } from '../entities/incidente.entity';

export class QueryIncidenteDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  busId?: number;

  @IsOptional()
  @IsEnum(IncidenteTipo)
  tipo?: IncidenteTipo;

  @IsOptional()
  @IsEnum(IncidenteEstado)
  estado?: IncidenteEstado;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
