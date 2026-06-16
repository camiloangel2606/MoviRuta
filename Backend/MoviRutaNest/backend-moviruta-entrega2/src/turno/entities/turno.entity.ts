import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Bus } from '../../bus/entities/bus.entity';
import { Conductor } from '../../conductor/entities/conductor.entity';

export enum TurnoEstado {
  PROGRAMADO = 'PROGRAMADO',
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
}

@Entity({ name: 'turno' })
export class Turno {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Conductor, { nullable: false, onDelete: 'RESTRICT' })
  conductor!: Conductor;

  @ManyToOne(() => Bus, { nullable: false, onDelete: 'RESTRICT' })
  bus!: Bus;

  @Column({ type: 'datetime' })
  inicio!: Date;

  @Column({ type: 'datetime', nullable: true })
  fin?: Date | null;

  @Column({ type: 'enum', enum: TurnoEstado, default: TurnoEstado.PROGRAMADO })
  estado!: TurnoEstado;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observaciones?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
