import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateRutaParaderoDto {
	@Type(() => Number)
	@IsInt()
	@Min(1)
	rutaId!: number;

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
