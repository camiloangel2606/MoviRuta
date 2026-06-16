import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DestinatarioGrupo } from '../../destinatario-grupo/entities/destinatario-grupo.entity';
import { DestinatarioPersona } from '../../destinatario-persona/entities/destinatario-persona.entity';
import { Persona } from '../../persona/entities/persona.entity';

@Entity({ name: 'mensaje' })
export class Mensaje {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Persona, { nullable: false, onDelete: 'RESTRICT' })
  emisor!: Persona;

  @Column({ type: 'text' })
  contenido!: string;

  @CreateDateColumn({ name: 'fecha_envio' })
  fechaEnvio!: Date;

  @OneToMany(() => DestinatarioPersona, (destinatario) => destinatario.mensaje)
  destinatariosPersona!: DestinatarioPersona[];

  @OneToMany(() => DestinatarioGrupo, (destinatario) => destinatario.mensaje)
  destinatariosGrupo!: DestinatarioGrupo[];

  totalDestinatariosPersona?: number;
  totalDestinatariosGrupo?: number;
}
