import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Bus } from '../../bus/entities/bus.entity';

@Entity({ name: 'empresa' })
export class Empresa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  // Opcional, pero útil para unicidad
  @Column({ type: 'varchar', length: 30, nullable: true, unique: true })
  nit?: string | null;

  @OneToMany(() => Bus, (bus) => bus.empresa)
  buses!: Bus[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}