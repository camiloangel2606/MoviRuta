import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity';

@Entity({ name: 'conductor' })
@Unique(['persona'])
export class Conductor {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Persona, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personaId' })
  persona!: Persona;

  @Column({ type: 'varchar', length: 50, nullable: true })
  licencia?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
