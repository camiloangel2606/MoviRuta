import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FindProgramacionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rutaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  busId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  conductorId?: number;

  @IsOptional()
  @IsString()
  fecha?: string;

  @IsOptional()
  @IsString()
  estado?: string;
}