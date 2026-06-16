import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Ruta } from '../../ruta/entities/ruta.entity';
import { Paradero } from '../../paradero/entities/paradero.entity';

@Entity({ name: 'ruta_paradero' })
@Unique('UQ_ruta_paradero_ruta_orden', ['ruta', 'orden'])
@Unique('UQ_ruta_paradero_ruta_paradero', ['ruta', 'paradero'])
export class RutaParadero {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Ruta, (ruta) => ruta.paraderosEnRuta, { nullable: false, onDelete: 'CASCADE' })
  ruta!: Ruta;

  @ManyToOne(() => Paradero, (paradero) => paradero.rutasEnLasQueAparece, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  paradero!: Paradero;

  @Column({ type: 'int' })
  orden!: number;

  @Column({ name: 'distancia_desde_anterior', type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanciaDesdeAnterior?: string | null;

  @Column({ name: 'tiempo_estimado_desde_anterior', type: 'int', nullable: true })
  tiempoEstimadoDesdeAnterior?: number | null;
}