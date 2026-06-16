import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Ciudadano } from '../ciudadano/entities/ciudadano.entity';
import { MetodoPagoCiudadano } from '../metodo-pago-ciudadano/entities/metodo-pago-ciudadano.entity';
import { Programacion } from '../programacion/entities/programacion.entity';
import { RutaParadero } from '../ruta-paradero/entities/ruta-paradero.entity';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';
import { Boleto, BoletoEstado } from './entities/boleto.entity';

@Injectable()
export class BoletoService {
  constructor(
    @InjectRepository(Boleto)
    private readonly boletoRepo: Repository<Boleto>,

    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepo: Repository<Ciudadano>,

    @InjectRepository(Programacion)
    private readonly programacionRepo: Repository<Programacion>,

    @InjectRepository(RutaParadero)
    private readonly rutaParaderoRepo: Repository<RutaParadero>,

    @InjectRepository(MetodoPagoCiudadano)
    private readonly metodoPagoRepo: Repository<MetodoPagoCiudadano>,
  ) {}

  // ── HU-ENTR-2-003: Abordaje ───────────────────────────────────────────────

  async create(dto: CreateBoletoDto): Promise<Boleto> {

    // 1. Ciudadano
    const ciudadano = await this.ciudadanoRepo.findOne({
      where: { id: dto.ciudadanoId },
    });
    if (!ciudadano) throw new NotFoundException('Ciudadano no encontrado.');

    // 2. Programación con bus y ruta
    const programacion = await this.programacionRepo.findOne({
      where: { id: dto.programacionId },
      relations: { bus: true, ruta: true },
    });
    if (!programacion) throw new NotFoundException('Programación no encontrada.');
    // El abordaje se permite tanto si la programación está ACTIVO (aún no
    // arranca) como EN_CURSO (el bus va en ruta y el ciudadano se sube en
    // un paradero intermedio). FINALIZADO/CANCELADO sí bloquean.
    const estadosAbordaje = ['ACTIVO', 'EN_CURSO'];
    if (!estadosAbordaje.includes(programacion.estado)) {
      throw new BadRequestException(
        `La programación no permite abordaje (estado: ${programacion.estado}).`,
      );
    }

    // 3. Verificar capacidad del bus
    const boletosActivos = await this.boletoRepo.count({
      where: {
        programacion: { id: programacion.id },
        estado: BoletoEstado.ACTIVO,
      },
    });
    if (boletosActivos >= programacion.bus.capacidadMaxima) {
      throw new BadRequestException(
        `El bus ${programacion.bus.placa} ha alcanzado su capacidad máxima ` +
        `(${programacion.bus.capacidadMaxima} pasajeros).`,
      );
    }

    // 4. RutaParadero de origen (debe pertenecer a la ruta de la programación)
    const rutaParaderoOrigen = await this.rutaParaderoRepo.findOne({
      where: { id: dto.rutaParaderoOrigenId },
      relations: { ruta: true, paradero: true },
    });
    if (!rutaParaderoOrigen) {
      throw new NotFoundException('Paradero de origen no encontrado.');
    }
    if (rutaParaderoOrigen.ruta.id !== programacion.ruta.id) {
      throw new BadRequestException(
        'El paradero de origen no pertenece a la ruta de esta programación.',
      );
    }

    // 5. Método de pago y saldo
    const metodoPago = await this.metodoPagoRepo.findOne({
      where: { id: dto.metodoPagoId, ciudadano: { id: dto.ciudadanoId } },
    });
    if (!metodoPago) throw new NotFoundException('Método de pago no encontrado.');

    const costo          = parseFloat(programacion.ruta.tarifa as unknown as string);
    const saldoActual    = parseFloat(metodoPago.saldo as unknown as string);

    if (saldoActual < costo) {
      throw new BadRequestException(
        `Saldo insuficiente. Saldo disponible: $${saldoActual.toFixed(2)}, ` +
        `costo del viaje: $${costo.toFixed(2)}.`,
      );
    }

    // 6. Descontar saldo (Asignado como string compatible con columnas Decimal de BD)
    metodoPago.saldo = (saldoActual - costo).toFixed(2) as unknown as any;
    await this.metodoPagoRepo.save(metodoPago);

    // 7. Crear boleto
    const boleto = this.boletoRepo.create({
      ciudadano,
      programacion,
      rutaParaderoOrigen,
      metodoPagoCiudadano: metodoPago,
      estado: BoletoEstado.ACTIVO,
      costo:  costo.toFixed(2) as unknown as string,
      // horaInicio ya no existe — se lee de programacion.horaSalida
    });

    try {
      return await this.boletoRepo.save(boleto);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  // ── HU-ENTR-2-004: Descenso ───────────────────────────────────────────────

  async update(id: number, dto: UpdateBoletoDto): Promise<Boleto> {

    const boleto = await this.boletoRepo.findOne({
      where: { id },
      relations: {
        programacion: { bus: true, ruta: true },
        rutaParaderoOrigen: true,
      },
    });
    if (!boleto) throw new NotFoundException(`Boleto #${id} no encontrado.`);

    if (boleto.estado === BoletoEstado.COMPLETADO) {
      throw new BadRequestException(
        `El boleto #${id} ya está completado.`,
      );
    }

    if (dto.rutaParaderoDescensoId !== undefined) {
      
      const rutaParaderoDescenso = await this.rutaParaderoRepo.findOne({
        where: { id: dto.rutaParaderoDescensoId },
        relations: { ruta: true }
      });
      
      if (!rutaParaderoDescenso) {
        throw new NotFoundException('Paradero de descenso no encontrado.');
      }

      // Datos huérfanos: si el boleto no tiene programación o la programación
      // no tiene ruta cargada, no podemos validar la pertenencia → 400 claro
      // en vez de TypeError 500.
      if (!boleto.programacion || !boleto.programacion.ruta) {
        throw new BadRequestException(
          `El boleto #${id} tiene datos inconsistentes (programación o ruta no disponibles). ` +
          `No se puede registrar descenso.`,
        );
      }

      if (!rutaParaderoDescenso.ruta) {
        throw new BadRequestException(
          `El paradero de descenso #${dto.rutaParaderoDescensoId} no tiene ruta asociada.`,
        );
      }

      if (rutaParaderoDescenso.ruta.id !== boleto.programacion.ruta.id) {
        throw new BadRequestException(
          `El paradero de descenso #${dto.rutaParaderoDescensoId} ` +
          `no pertenece a la ruta de esta programación.`,
        );
      }

      const ordenOrigen   = Number(boleto.rutaParaderoOrigen?.orden);
      const ordenDescenso = Number(rutaParaderoDescenso.orden);

      if (!isNaN(ordenOrigen) && !isNaN(ordenDescenso) && ordenDescenso <= ordenOrigen) {
        throw new BadRequestException(
          `El paradero de descenso (orden ${ordenDescenso}) debe ser ` +
          `posterior al de abordaje (orden ${ordenOrigen}).`,
        );
      }

      boleto.rutaParaderoDescenso = rutaParaderoDescenso;
      boleto.estado               = BoletoEstado.COMPLETADO;
      boleto.horaFin              = new Date();
    }

    try {
      return await this.boletoRepo.save(boleto);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  // ── Consultas ─────────────────────────────────────────────────────────────

  async findAll(ciudadanoId?: number): Promise<Boleto[]> {
    return this.boletoRepo.find({
      where: ciudadanoId ? { ciudadano: { id: ciudadanoId } } : undefined,
      relations: {
        ciudadano:            { persona: true },
        programacion:         {
          bus:               true,
          ruta:              true,
          conductorAsignado: { persona: true },
        },
        rutaParaderoOrigen:   { paradero: true },
        rutaParaderoDescenso: { paradero: true },
      },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Boleto> {
    const boleto = await this.boletoRepo.findOne({
      where: { id },
      relations: {
        ciudadano:            { persona: true },
        programacion:         { bus: true, ruta: true, conductorAsignado: { persona: true } },
        rutaParaderoOrigen:   { paradero: true },
        rutaParaderoDescenso: { paradero: true },
      },
    });
    if (!boleto) throw new NotFoundException(`Boleto #${id} no encontrado.`);
    return boleto;
  }

  async remove(id: number): Promise<Boleto> {
    const boleto = await this.boletoRepo.findOne({ where: { id } });
    if (!boleto) throw new NotFoundException(`Boleto #${id} no encontrado.`);
    if (boleto.estado === BoletoEstado.ACTIVO) {
      throw new BadRequestException('No se puede eliminar un boleto activo.');
    }
    try {
      await this.boletoRepo.remove(boleto);
      return boleto;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driver = error.driverError as { code?: string } | undefined;
      if (driver?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Valor duplicado.');
      }
    }
    throw error;
  }
}