import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoPago, MetodoPagoTipo } from '../metodo-pago/entities/metodo-pago.entity';
import { MetodoPagoCiudadano } from '../metodo-pago-ciudadano/entities/metodo-pago-ciudadano.entity';
import { Ciudadano } from '../ciudadano/entities/ciudadano.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,
    @InjectRepository(MetodoPagoCiudadano)
    private readonly metodoPagoCiudadanoRepository: Repository<MetodoPagoCiudadano>,
    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepository: Repository<Ciudadano>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const metodoPagoTarjeta = await this.garantizarMetodoPagoTarjeta();
    await this.crearTarjetasParaCiudadanosSinTarjeta(metodoPagoTarjeta);
  }

  private async garantizarMetodoPagoTarjeta(): Promise<MetodoPago> {
    const existing = await this.metodoPagoRepository.findOne({
      where: { tipo: MetodoPagoTipo.TARJETA },
    });

    if (existing) {
      this.logger.log(`MetodoPago TARJETA ya existe (id=${existing.id}, nombre="${existing.nombre}")`);
      return existing;
    }

    const nuevo = this.metodoPagoRepository.create({
      nombre: 'Tarjeta Prepagada',
      tipo: MetodoPagoTipo.TARJETA,
    });
    const guardado = await this.metodoPagoRepository.save(nuevo);
    this.logger.log(`[SEED] MetodoPago "Tarjeta Prepagada" creado (id=${guardado.id})`);
    return guardado;
  }

  private async crearTarjetasParaCiudadanosSinTarjeta(metodoPagoTarjeta: MetodoPago): Promise<void> {
    const ciudadanos = await this.ciudadanoRepository.find();
    let creadas = 0;

    for (const ciudadano of ciudadanos) {
      const tieneTarjeta = await this.metodoPagoCiudadanoRepository.findOne({
        where: {
          ciudadano: { id: ciudadano.id },
          metodoPago: { id: metodoPagoTarjeta.id },
        },
      });

      if (!tieneTarjeta) {
        const tarjeta = this.metodoPagoCiudadanoRepository.create({
          ciudadano,
          metodoPago: metodoPagoTarjeta,
          identificador: `TARJETA-${ciudadano.id}`,
          saldo: '0.00',
        });
        await this.metodoPagoCiudadanoRepository.save(tarjeta);
        creadas++;
      }
    }

    if (creadas > 0) {
      this.logger.log(`[SEED] ${creadas} tarjeta(s) prepagada(s) creada(s) para ciudadanos sin tarjeta`);
    } else {
      this.logger.log(`[SEED] Todos los ciudadanos ya tienen tarjeta prepagada`);
    }
  }
}
