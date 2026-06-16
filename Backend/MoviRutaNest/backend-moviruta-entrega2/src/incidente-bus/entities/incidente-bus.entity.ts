import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Bus } from '../../bus/entities/bus.entity';
import { Incidente } from '../../incidente/entities/incidente.entity';

@Entity({ name: 'incidente_bus' })
@Unique(['bus', 'incidente'])
export class IncidenteBus {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Bus, { nullable: false, onDelete: 'CASCADE' })
  bus!: Bus;

  @ManyToOne(() => Incidente, { nullable: false, onDelete: 'CASCADE' })
  incidente!: Incidente;
}
