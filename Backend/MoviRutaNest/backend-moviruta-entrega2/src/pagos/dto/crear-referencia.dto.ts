import { IsNumberString, IsNumber, Min, Max } from 'class-validator';

export class CrearReferenciaDto {
  @IsNumberString()
  tarjetaId: string;

  @IsNumber()
  @Min(5000)
  @Max(500000)
  monto: number;
}
