import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Incidente } from '../../incidente/entities/incidente.entity';

@Entity({ name: 'foto' })
export class Foto {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Incidente, (incidente) => incidente.fotos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  incidente!: Incidente;

  @Column({ type: 'varchar', length: 400 })
  url!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
