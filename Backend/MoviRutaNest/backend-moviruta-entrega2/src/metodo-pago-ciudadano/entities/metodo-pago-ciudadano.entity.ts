import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Ciudadano } from '../../ciudadano/entities/ciudadano.entity';
import { MetodoPago } from '../../metodo-pago/entities/metodo-pago.entity';

@Entity({ name: 'metodo_pago_ciudadano' })
@Unique(['ciudadano', 'metodoPago', 'identificador'])
export class MetodoPagoCiudadano {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Ciudadano, { nullable: false, onDelete: 'CASCADE' })
  ciudadano!: Ciudadano;

  @ManyToOne(() => MetodoPago, { nullable: false, onDelete: 'CASCADE' })
  metodoPago!: MetodoPago;

  @Column({ type: 'varchar', length: 120 })
  identificador!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  saldo!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
