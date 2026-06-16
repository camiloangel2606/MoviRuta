import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMensajeDto {
	@Type(() => Number)
	@IsInt()
	@Min(1)
	emisorId!: number;

	@IsString()
	@IsNotEmpty()
	contenido!: string;

	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@Type(() => Number)
	@IsInt({ each: true })
	@Min(1, { each: true })
	destinatariosPersonaIds?: number[];

	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@Type(() => Number)
	@IsInt({ each: true })
	@Min(1, { each: true })
	destinatariosGrupoIds?: number[];
}
