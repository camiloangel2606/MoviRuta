import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGrupoDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	nombre!: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	descripcion?: string | null;
}
