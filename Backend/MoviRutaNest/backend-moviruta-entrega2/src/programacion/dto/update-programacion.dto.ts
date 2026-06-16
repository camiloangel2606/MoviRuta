import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateProgramacionDto } from './create-programacion.dto';

export class UpdateProgramacionDto extends PartialType(CreateProgramacionDto) {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  estado?: string;
}
