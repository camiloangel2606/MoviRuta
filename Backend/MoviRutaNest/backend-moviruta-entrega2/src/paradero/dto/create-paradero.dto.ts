import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Max, Min } from 'class-validator';
import { ParaderoTipo } from '../entities/paradero.entity';

export class CreateParaderoDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(140)
	nombre!: string;

	@Type(() => Number)
	@IsNumber({ maxDecimalPlaces: 7 })
	@Min(-90)
	@Max(90)
	latitud!: number;

	@Type(() => Number)
	@IsNumber({ maxDecimalPlaces: 7 })
	@Min(-180)
	@Max(180)
	longitud!: number;

	@IsOptional()
	@IsEnum(ParaderoTipo)
	tipo?: ParaderoTipo;
}
