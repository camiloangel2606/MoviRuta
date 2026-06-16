import { Type } from 'class-transformer';
import {
	ArrayMinSize,
	ArrayNotEmpty,
	ArrayUnique,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	Min,
	ValidateNested,
} from 'class-validator';

export class CreateRutaParaderoItemDto {
	@Type(() => Number)
	@IsInt()
	@Min(1)
	paraderoId!: number;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	orden!: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	distanciaDesdeAnterior?: number | null;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	tiempoEstimadoDesdeAnterior?: number | null;
}

export class CreateRutaConParaderosDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	nombre!: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	descripcion?: string | null;

	@Type(() => Number)
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	tarifa!: number;

	@ArrayNotEmpty()
	@ArrayMinSize(3)
	@ArrayUnique((item: CreateRutaParaderoItemDto) => item.paraderoId)
	@ArrayUnique((item: CreateRutaParaderoItemDto) => item.orden)
	@ValidateNested({ each: true })
	@Type(() => CreateRutaParaderoItemDto)
	paraderos!: CreateRutaParaderoItemDto[];
}
