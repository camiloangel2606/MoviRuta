import { IsOptional, IsString, MaxLength } from 'class-validator';

export class IniciarTurnoDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;
}
