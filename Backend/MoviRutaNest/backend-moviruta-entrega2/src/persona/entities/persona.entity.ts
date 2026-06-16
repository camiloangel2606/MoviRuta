import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SecurityGuard } from '../../core/guards/security.guard';

@Entity({ name: 'persona' })
export class Persona {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  nombres!: string;

  @Column({ type: 'varchar', length: 120 })
  apellidos!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono?: string | null;

  // Ejemplo en TypeORM para el backend de negocio
  @Column({ name: 'security_user_id', type: 'varchar', length: 50, unique: true, nullable: true })
  securityUserId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
