import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Persona } from './entities/persona.entity';
import { Ciudadano } from '../ciudadano/entities/ciudadano.entity';
import { Conductor } from '../conductor/entities/conductor.entity';
import { MetodoPago, MetodoPagoTipo } from '../metodo-pago/entities/metodo-pago.entity';
import { MetodoPagoCiudadano } from '../metodo-pago-ciudadano/entities/metodo-pago-ciudadano.entity';

@Injectable()
export class PersonaService {

  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,

    @InjectRepository(Ciudadano)
    private readonly ciudadanoRepository: Repository<Ciudadano>,

    @InjectRepository(Conductor)
    private readonly conductorRepository: Repository<Conductor>,

    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,

    @InjectRepository(MetodoPagoCiudadano)
    private readonly metodoPagoCiudadanoRepository: Repository<MetodoPagoCiudadano>,
  ) {}

  // Busca la persona por su UUID de seguridad e incluye el ciudadanoId en la respuesta
  async findBySecurityId(securityUserId: string): Promise<(Persona & { ciudadanoId: number | null }) | null> {
    const persona = await this.personaRepository.findOne({
      where: { securityUserId }
    });
    if (!persona) return null;

    const ciudadano = await this.ciudadanoRepository.findOne({
      where: { persona: { id: persona.id } },
    });

    return Object.assign(persona, { ciudadanoId: ciudadano?.id ?? null });
  }

  // Crea la fila en la tabla conductor si no existe (Usado por el POST del controlador)
  async verificarYCrearConductorManualmente(securityUserId: string): Promise<void> {
    const persona = await this.findBySecurityId(securityUserId);
    if (!persona) throw new NotFoundException('Persona no encontrada en el módulo de negocio');

    const existeConductor = await this.conductorRepository.findOne({
      where: { persona: { id: persona.id } }
    });

    if (!existeConductor) {
      const nuevoConductor = this.conductorRepository.create({
        persona: persona,
        licencia: null // Se inicializa vacío listo para ser llenado después
      });
      await this.conductorRepository.save(nuevoConductor);
      console.log(`[ÉXITO LOCAL] Fila creada en la tabla conductor para Persona ID: ${persona.id}`);
    } else {
      console.log(`[INFO] La persona ID: ${persona.id} ya tiene fila de conductor registrada.`);
    }
  }

  async create(createPersonaDto: CreatePersonaDto): Promise<Persona> {
    const nuevaPersona = this.personaRepository.create(createPersonaDto);
    let personaGuardada: Persona;

    try {
      personaGuardada = await this.personaRepository.save(nuevaPersona);
    } catch (error) {
      this.handleDbError(error);
    }

    let ciudadanoGuardado: Ciudadano;
    try {
      // Todo usuario registrado de base se inicializa en la tabla ciudadano
      const nuevoCiudadano = this.ciudadanoRepository.create({
        persona: personaGuardada,
        fechaNacimiento: null,
      });
      ciudadanoGuardado = await this.ciudadanoRepository.save(nuevoCiudadano);
      console.log(`[ÉXITO] Ciudadano vinculado automáticamente a la Persona ID: ${personaGuardada.id}`);
    } catch (error) {
      await this.personaRepository.remove(personaGuardada);
      throw new ConflictException('No se pudo inicializar la subtabla de Ciudadano. Registro cancelado.');
    }

    try {
      const metodoPagoTarjeta = await this.metodoPagoRepository.findOne({
        where: { tipo: MetodoPagoTipo.TARJETA },
      });

      if (metodoPagoTarjeta) {
        const tarjeta = this.metodoPagoCiudadanoRepository.create({
          ciudadano: ciudadanoGuardado,
          metodoPago: metodoPagoTarjeta,
          identificador: `TARJETA-${ciudadanoGuardado.id}`,
          saldo: '0.00',
        });
        await this.metodoPagoCiudadanoRepository.save(tarjeta);
        console.log(`[ÉXITO] Tarjeta prepagada creada automáticamente para Ciudadano ID: ${ciudadanoGuardado.id}`);
      } else {
        console.warn(`[ADVERTENCIA] No se encontró un MetodoPago de tipo TARJETA. Tarjeta no creada para Ciudadano ID: ${ciudadanoGuardado.id}`);
      }
    } catch (error) {
      console.error(`[ERROR] No se pudo crear la tarjeta prepagada para Ciudadano ID: ${ciudadanoGuardado.id}`, error);
    }

    return personaGuardada;
  }

  async findAll(): Promise<Persona[]> {
    return this.personaRepository.find();
  }

  async findOne(id: number): Promise<Persona> {
    const persona = await this.personaRepository.findOne({ where: { id } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    return persona;
  }

  async updateBySecurityId(securityUserId: string, updateData: any) {
    const persona = await this.findBySecurityId(securityUserId);
    if (!persona) {
      throw new NotFoundException('Persona no encontrada con ese ID de seguridad');
    }
    this.personaRepository.merge(persona, updateData);
    return await this.personaRepository.save(persona);
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto): Promise<Persona> {
    const persona = await this.findOne(id);
    Object.assign(persona, updatePersonaDto);
    try {
      return await this.personaRepository.save(persona);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async remove(id: number): Promise<Persona> {
    const persona = await this.findOne(id);
    try {
      await this.personaRepository.remove(persona);
      return persona;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string; message?: string } | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        if (driverError.message?.includes('security_user_id')) {
          throw new ConflictException('Este usuario de seguridad ya tiene una persona vinculada.');
        }
        throw new ConflictException('El correo electrónico ya está registrado.');
      }
    }
    throw error;
  }
}