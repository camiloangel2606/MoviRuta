import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum MetodoPagoTipo {
  TARJETA = 'TARJETA',
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

@Entity({ name: 'metodo_pago' })
export class MetodoPago {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  nombre!: string;

  @Column({ type: 'enum', enum: MetodoPagoTipo })
  tipo!: MetodoPagoTipo;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
