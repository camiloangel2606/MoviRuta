import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Ciudadano } from '../../ciudadano/entities/ciudadano.entity';

@Entity({ name: 'direccion' })
@Unique(['ciudadano'])
export class Direccion {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Ciudadano, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ciudadanoId' })
  ciudadano!: Ciudadano;

  @Column({ name: 'linea_1', type: 'varchar', length: 200 })
  linea1!: string;

  @Column({ name: 'linea_2', type: 'varchar', length: 200, nullable: true })
  linea2?: string | null;

  @Column({ type: 'varchar', length: 120 })
  ciudad!: string;

  @Column({ type: 'varchar', length: 120 })
  departamento!: string;

  @Column({ name: 'codigo_postal', type: 'varchar', length: 20, nullable: true })
  codigoPostal?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
