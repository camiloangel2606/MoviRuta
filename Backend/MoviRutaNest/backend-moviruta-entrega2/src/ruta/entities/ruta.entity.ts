import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RutaParadero } from '../../ruta-paradero/entities/ruta-paradero.entity';

@Entity({ name: 'ruta' })
export class Ruta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  nombre!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tarifa!: string; // TypeORM recomienda decimal como string para no perder precisión

  @OneToMany(() => RutaParadero, (rp) => rp.ruta)
  paraderosEnRuta!: RutaParadero[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}