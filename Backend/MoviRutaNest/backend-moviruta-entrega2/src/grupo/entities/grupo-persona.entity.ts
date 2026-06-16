import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity';
import { Grupo } from './grupo.entity';

export enum GrupoPersonaRol {
  MIEMBRO = 'MIEMBRO',
  ADMIN = 'ADMIN',
}

@Entity({ name: 'grupo_persona' })
@Unique(['grupo', 'persona'])
export class GrupoPersona {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Grupo, (grupo) => grupo.miembros, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  grupo!: Grupo;

  @ManyToOne(() => Persona, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  persona!: Persona;

  @Column({ type: 'enum', enum: GrupoPersonaRol, nullable: true })
  rol?: GrupoPersonaRol | null;

  @CreateDateColumn({ name: 'fecha_union' })
  fechaUnion!: Date;
}
