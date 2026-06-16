import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IncidenteEstado, IncidenteGravedad, IncidenteTipo } from '../entities/incidente.entity';

export class CreateIncidenteDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  busId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  reportadoPorId?: number;

  @IsEnum(IncidenteTipo)
  tipo!: IncidenteTipo;

  @IsEnum(IncidenteGravedad)
  gravedad!: IncidenteGravedad;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descripcion!: string;

  @IsOptional()
  @IsEnum(IncidenteEstado)
  estado?: IncidenteEstado;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90)
  @Max(90)
  latitud?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  longitud?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MaxLength(400, { each: true })
  fotos?: string[];
}
