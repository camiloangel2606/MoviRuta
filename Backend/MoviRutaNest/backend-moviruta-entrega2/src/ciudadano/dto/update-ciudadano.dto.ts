import { IsDateString, IsOptional } from 'class-validator';

export class UpdateCiudadanoDto {
	@IsOptional()
	@IsDateString()
	fechaNacimiento?: string;
}
