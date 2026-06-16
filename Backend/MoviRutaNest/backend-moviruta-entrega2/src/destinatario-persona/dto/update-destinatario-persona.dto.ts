import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateDestinatarioPersonaDto {
	@Type(() => Boolean)
	@IsBoolean()
	leido!: boolean;
}
