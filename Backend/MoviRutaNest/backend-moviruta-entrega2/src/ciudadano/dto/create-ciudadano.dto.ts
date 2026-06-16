import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateCiudadanoDto {
	@Type(() => Number)
	@IsInt()
	@Min(1)
	personaId!: number;

	@IsOptional()
	@IsDateString()
	fechaNacimiento?: string;
}
