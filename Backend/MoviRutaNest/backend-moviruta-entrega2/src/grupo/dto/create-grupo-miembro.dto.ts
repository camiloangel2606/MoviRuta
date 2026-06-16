import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { GrupoPersonaRol } from '../entities/grupo-persona.entity';

export class CreateGrupoMiembroDto {
	@Type(() => Number)
	@IsInt()
	@Min(1)
	personaId!: number;

	@IsOptional()
	@IsEnum(GrupoPersonaRol)
	rol?: GrupoPersonaRol;
}
