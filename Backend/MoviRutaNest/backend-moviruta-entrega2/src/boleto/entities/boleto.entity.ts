import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ciudadano } from '../../ciudadano/entities/ciudadano.entity';
import { MetodoPagoCiudadano } from '../../metodo-pago-ciudadano/entities/metodo-pago-ciudadano.entity';
import { Programacion } from '../../programacion/entities/programacion.entity';
import { RutaParadero } from '../../ruta-paradero/entities/ruta-paradero.entity';

export enum BoletoEstado {
  ACTIVO     = 'ACTIVO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO  = 'CANCELADO',
}

@Entity({ name: 'boleto' })
export class Boleto {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Ciudadano, { nullable: false, onDelete: 'RESTRICT' })
  ciudadano!: Ciudadano;

  @ManyToOne(() => Programacion, { nullable: false, onDelete: 'RESTRICT' })
  programacion!: Programacion;

  @ManyToOne(() => RutaParadero, { nullable: false, onDelete: 'RESTRICT' })
  rutaParaderoOrigen!: RutaParadero;

  @ManyToOne(() => RutaParadero, { nullable: true, onDelete: 'SET NULL' })
  rutaParaderoDescenso?: RutaParadero | null;

  @ManyToOne(() => MetodoPagoCiudadano, { nullable: true, onDelete: 'SET NULL' })
  metodoPagoCiudadano?: MetodoPagoCiudadano | null;

  @Column({ type: 'enum', enum: BoletoEstado, default: BoletoEstado.ACTIVO })
  estado!: BoletoEstado;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costo!: string;

  // hora_fin: null mientras el viaje está ACTIVO, se llena al registrar descenso
  @Column({ name: 'hora_fin', type: 'datetime', nullable: true })
  horaFin?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}