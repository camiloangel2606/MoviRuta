import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateGpsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  busId!: number;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;
}
