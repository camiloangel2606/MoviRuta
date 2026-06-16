import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEmpresaDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	nombre!: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(30)
	nit?: string | null;
}
