import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateDireccionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ciudadanoId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  linea1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  linea2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  ciudad!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  departamento!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigoPostal?: string;
}
