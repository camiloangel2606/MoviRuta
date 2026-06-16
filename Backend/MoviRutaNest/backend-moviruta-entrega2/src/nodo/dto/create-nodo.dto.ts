import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { NodoTipo } from '../entities/nodo.entity';

export class CreateNodoDto {
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
	@IsEnum(NodoTipo)
	tipo?: NodoTipo;
}
