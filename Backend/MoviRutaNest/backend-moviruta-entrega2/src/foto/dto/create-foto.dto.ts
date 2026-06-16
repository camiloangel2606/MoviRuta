import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateFotoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  incidenteId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  url!: string;
}
