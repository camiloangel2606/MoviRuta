import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateBoletoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ciudadanoId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  programacionId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  rutaParaderoOrigenId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  metodoPagoId!: number;
}