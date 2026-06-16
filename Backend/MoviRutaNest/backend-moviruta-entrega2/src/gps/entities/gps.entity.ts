import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Bus } from '../../bus/entities/bus.entity';

@Entity({ name: 'gps' })
@Unique(['bus'])
export class Gps {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Bus, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'busId' })
  bus!: Bus;

  @Column({ name: 'device_id', type: 'varchar', length: 120, unique: true })
  deviceId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud?: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
