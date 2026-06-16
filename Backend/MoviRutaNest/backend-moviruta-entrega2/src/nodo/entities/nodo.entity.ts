import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NodoTipo {
  PARADERO = 'PARADERO',
  INTERSECCION = 'INTERSECCION',
}

@Entity({ name: 'nodo' })
export class Nodo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 140 })
  nombre!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitud!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitud!: string;

  @Column({ type: 'enum', enum: NodoTipo, default: NodoTipo.INTERSECCION })
  tipo!: NodoTipo;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
