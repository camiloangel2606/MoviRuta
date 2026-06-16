import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePersonaDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	nombres!: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	apellidos!: string;

	@IsEmail()
	@IsNotEmpty()
	@MaxLength(150)
	email!: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(30)
	telefono?: string | null;

	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	securityUserId!: string;

	@IsOptional()
	@IsDateString()
	fechaNacimiento?: string | null;
}
