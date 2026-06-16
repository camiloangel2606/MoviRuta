import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Mensaje } from '../../mensaje/entities/mensaje.entity';
import { Persona } from '../../persona/entities/persona.entity';

@Entity({ name: 'destinatario_persona' })
@Unique(['mensaje', 'persona'])
export class DestinatarioPersona {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Mensaje, (mensaje) => mensaje.destinatariosPersona, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  mensaje!: Mensaje;

  @ManyToOne(() => Persona, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  persona!: Persona;

  @Column({ type: 'boolean', default: false })
  leido!: boolean;
}
