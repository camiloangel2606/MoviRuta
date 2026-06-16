import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MetodoPagoTipo } from '../entities/metodo-pago.entity';

export class CreateMetodoPagoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @IsEnum(MetodoPagoTipo)
  tipo!: MetodoPagoTipo;
}
