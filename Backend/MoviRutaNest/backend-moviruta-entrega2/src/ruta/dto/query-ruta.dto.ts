import { IsOptional, IsString, MaxLength } from 'class-validator';

export class QueryRutaDto {
	@IsOptional()
	@IsString()
	@MaxLength(120)
	nombre?: string;
}
