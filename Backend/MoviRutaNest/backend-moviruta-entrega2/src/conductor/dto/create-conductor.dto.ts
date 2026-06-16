import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateConductorDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  personaId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  licencia?: string;
}
