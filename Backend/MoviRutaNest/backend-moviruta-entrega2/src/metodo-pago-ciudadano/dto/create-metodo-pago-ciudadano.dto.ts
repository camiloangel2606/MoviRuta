import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateMetodoPagoCiudadanoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ciudadanoId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  metodoPagoId!: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  identificador!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  saldo!: number;
}
