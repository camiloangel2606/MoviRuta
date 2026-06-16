import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Boleto } from '../../boleto/entities/boleto.entity';
import { Paradero } from '../../paradero/entities/paradero.entity';

export enum HistorialTipo {
  ABORDAJE = 'ABORDAJE',
  DESCENSO = 'DESCENSO',
}

@Entity({ name: 'historial' })
@Unique(['boleto', 'tipo'])
export class Historial {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Boleto, { nullable: false, onDelete: 'CASCADE' })
  boleto!: Boleto;

  @ManyToOne(() => Paradero, { nullable: false, onDelete: 'RESTRICT' })
  paradero!: Paradero;

  @Column({ type: 'enum', enum: HistorialTipo })
  tipo!: HistorialTipo;

  @CreateDateColumn({ type: 'datetime' })
  fecha!: Date;

  @Column({ type: 'int', nullable: true })
  orden?: number | null;
}
