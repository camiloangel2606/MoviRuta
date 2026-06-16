import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bus } from '../../bus/entities/bus.entity';
import { Persona } from '../../persona/entities/persona.entity';
import { Foto } from '../../foto/entities/foto.entity';

export enum IncidenteTipo {
  MECANICO = 'MECANICO',
  ACCIDENTE = 'ACCIDENTE',
  ELECTRICO = 'ELECTRICO',
  OTRO = 'OTRO',
}

export enum IncidenteGravedad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export enum IncidenteEstado {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO',
}

@Entity({ name: 'incidente' })
export class Incidente {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Bus, { nullable: false, onDelete: 'RESTRICT' })
  bus!: Bus;

  @ManyToOne(() => Persona, { nullable: true, onDelete: 'SET NULL' })
  reportadoPor?: Persona | null;

  @Column({ type: 'enum', enum: IncidenteTipo })
  tipo!: IncidenteTipo;

  @Column({ type: 'enum', enum: IncidenteGravedad })
  gravedad!: IncidenteGravedad;

  @Column({ type: 'varchar', length: 500 })
  descripcion!: string;

  @Column({ type: 'enum', enum: IncidenteEstado, default: IncidenteEstado.PENDIENTE })
  estado!: IncidenteEstado;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud?: string | null;

  @OneToMany(() => Foto, (foto) => foto.incidente)
  fotos!: Foto[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
