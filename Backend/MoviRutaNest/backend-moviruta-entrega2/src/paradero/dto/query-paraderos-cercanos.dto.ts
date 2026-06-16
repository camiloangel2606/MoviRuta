import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class QueryParaderosCercanosDto {
	@Type(() => Number)
	@IsNumber({ maxDecimalPlaces: 7 })
	@Min(-90)
	@Max(90)
	lat!: number;

	@Type(() => Number)
	@IsNumber({ maxDecimalPlaces: 7 })
	@Min(-180)
	@Max(180)
	lng!: number;
}
