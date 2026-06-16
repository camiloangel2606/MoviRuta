import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateBoletoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rutaParaderoDescensoId?: number;
}