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
import { Ruta } from '../../ruta/entities/ruta.entity';

export enum ProgramacionRecurrente {
  UNICA = 'UNICA',
  DIARIA = 'DIARIA',
  LUNES_A_VIERNES = 'LUNES_A_VIERNES',
  FINES_DE_SEMANA = 'FINES_DE_SEMANA',
}

@Entity({ name: 'programacion' })
export class Programacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Ruta, { nullable: false, onDelete: 'RESTRICT' })
  ruta!: Ruta;

  @ManyToOne(() => Bus, { nullable: false, onDelete: 'RESTRICT' })
  bus!: Bus;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ name: 'hora_salida', type: 'time' })
  horaSalida!: string;

  @Column({ type: 'enum', enum: ProgramacionRecurrente, default: ProgramacionRecurrente.UNICA })
  recurrente!: ProgramacionRecurrente;

  @Column({ name: 'tolerancia_minutos', type: 'int', default: 0 })
  toleranciaMinutos!: number;

  @Column({ type: 'varchar', length: 30, default: 'PROGRAMADO' })
  estado!: string;

  @ManyToOne(() => Conductor, { nullable: false, onDelete: 'RESTRICT' })
  conductorAsignado!: Conductor;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
