import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Grupo } from '../../grupo/entities/grupo.entity';
import { Mensaje } from '../../mensaje/entities/mensaje.entity';

@Entity({ name: 'destinatario_grupo' })
@Unique(['mensaje', 'grupo'])
export class DestinatarioGrupo {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Mensaje, (mensaje) => mensaje.destinatariosGrupo, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  mensaje!: Mensaje;

  @ManyToOne(() => Grupo, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  grupo!: Grupo;
}
