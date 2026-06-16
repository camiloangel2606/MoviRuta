import { PartialType } from '@nestjs/mapped-types';
import { CreateRutaParaderoDto } from './create-ruta-paradero.dto';

export class UpdateRutaParaderoDto extends PartialType(CreateRutaParaderoDto) {}
