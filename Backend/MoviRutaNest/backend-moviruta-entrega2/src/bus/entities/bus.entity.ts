import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

export enum BusEstado {
  OPERATIVO = 'OPERATIVO',
  MANTENIMIENTO = 'MANTENIMIENTO',
  FUERA_SERVICIO = 'FUERA_SERVICIO',
}

@Entity({ name: 'bus' })
export class Bus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  placa!: string;

  @Column({ type: 'varchar', length: 60 })
  modelo!: string;

  @Column({ type: 'int' })
  anio!: number;

  @Column({ name: 'capacidad_maxima', type: 'int' })
  capacidadMaxima!: number;

  @Column({ type: 'enum', enum: BusEstado, default: BusEstado.OPERATIVO })
  estado!: BusEstado;

  @ManyToOne(() => Empresa, (empresa) => empresa.buses, { nullable: false, onDelete: 'RESTRICT' })
  empresa!: Empresa;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}