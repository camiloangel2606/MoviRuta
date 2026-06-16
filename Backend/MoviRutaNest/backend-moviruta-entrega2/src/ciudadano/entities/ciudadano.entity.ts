import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity';

@Entity({ name: 'ciudadano' })
@Unique(['persona'])
export class Ciudadano {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Persona, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personaId' })
  persona!: Persona;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
