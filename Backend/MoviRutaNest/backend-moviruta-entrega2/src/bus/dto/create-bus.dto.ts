import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { BusEstado } from '../entities/bus.entity';

export class CreateBusDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(10)
	placa!: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(60)
	modelo!: string;

	@Type(() => Number)
	@IsInt()
	anio!: number;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	capacidadMaxima!: number;

	@IsOptional()
	@IsEnum(BusEstado)
	estado?: BusEstado;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	empresaId!: number;
}
