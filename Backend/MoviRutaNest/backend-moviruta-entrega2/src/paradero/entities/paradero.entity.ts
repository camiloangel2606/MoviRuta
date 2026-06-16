import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RutaParadero } from '../../ruta-paradero/entities/ruta-paradero.entity';

export enum ParaderoTipo {
  PARADERO = 'PARADERO',
  ESTACION = 'ESTACION',
  TERMINAL = 'TERMINAL',
}

@Entity({ name: 'paradero' })
export class Paradero {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 140 })
  nombre!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitud!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitud!: string;

  @Column({ type: 'enum', enum: ParaderoTipo, default: ParaderoTipo.PARADERO })
  tipo!: ParaderoTipo;

  @OneToMany(() => RutaParadero, (rp) => rp.paradero)
  rutasEnLasQueAparece!: RutaParadero[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}