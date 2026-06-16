import * as crypto from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoPagoCiudadano } from '../metodo-pago-ciudadano/entities/metodo-pago-ciudadano.entity';
import { CrearReferenciaDto } from './dto/crear-referencia.dto';

@Injectable()
export class PagosService {
  private readonly custId = process.env.EPAYCO_CUST_ID ?? '';
  private readonly pKey = process.env.EPAYCO_P_KEY ?? '';

  constructor(
    @InjectRepository(MetodoPagoCiudadano)
    private readonly metodoPagoRepo: Repository<MetodoPagoCiudadano>,
  ) {}

  async crearReferencia(dto: CrearReferenciaDto) {
    const tarjeta = await this.metodoPagoRepo.findOne({
      where: { id: +dto.tarjetaId },
      relations: { metodoPago: true },
    });
    if (!tarjeta) throw new NotFoundException('Tarjeta no encontrada');

    const referencia = `REC-${Date.now()}-${dto.tarjetaId}`;
    const tipo = tarjeta.metodoPago?.tipo ?? 'TARJETA';
    const descripcion = `Recarga tarjeta ${tipo} - $${dto.monto}`;

    return { referencia, monto: dto.monto, descripcion };
  }

  async procesarConfirmacion(body: Record<string, string>) {
    console.log('[ePayco] Confirmación recibida:', JSON.stringify(body, null, 2));

    const {
      x_ref_payco,
      x_transaction_id,
      x_id_invoice,
      x_response,
      x_amount,
      x_currency_code,
      x_signature,
    } = body;

    // x_invoice no existe en la respuesta real de ePayco; el invoice viene en x_id_invoice
    const x_invoice = x_id_invoice;

    // 1. Verificar firma ePayco
    // Fórmula oficial: custId^pKey^x_ref_payco^x_transaction_id^x_amount^x_currency_code
    const cadena = `${this.custId}^${this.pKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`;
    const firmaEsperada = crypto
      .createHash('sha256')
      .update(cadena)
      .digest('hex');

    console.log('[ePayco] Cadena de firma:', cadena);
    console.log('[ePayco] Firma esperada :', firmaEsperada);
    console.log('[ePayco] Firma recibida :', x_signature);

    if (firmaEsperada !== x_signature) {
      console.error('[ePayco] ERROR: firma inválida');
      return { success: false, reason: 'firma_invalida' };
    }

    // 2. Pago no aprobado
    console.log('[ePayco] x_response:', x_response);
    if (x_response !== 'Aceptada') {
      console.warn('[ePayco] Pago no aceptado, x_response =', x_response);
      return { success: false, reason: 'no_aceptada' };
    }

    // 3. Extraer tarjetaId del invoice (formato REC-{timestamp}-{tarjetaId})
    console.log('[ePayco] x_invoice:', x_invoice);
    const partes = (x_invoice ?? '').split('-');
    const tarjetaId = +partes[2];
    console.log('[ePayco] tarjetaId extraído:', tarjetaId, '| partes:', partes);
    if (!tarjetaId || isNaN(tarjetaId)) {
      console.error('[ePayco] ERROR: tarjetaId inválido');
      return { success: false, reason: 'tarjeta_id_invalido' };
    }

    // 4. Buscar tarjeta
    const tarjeta = await this.metodoPagoRepo.findOne({
      where: { id: tarjetaId },
    });
    console.log('[ePayco] tarjeta encontrada:', tarjeta ? `id=${tarjeta.id}` : 'NO ENCONTRADA');
    if (!tarjeta) return { success: false, reason: 'tarjeta_no_encontrada' };

    // 5. Acreditar saldo
    const saldoActual = parseFloat(tarjeta.saldo as unknown as string);
    const montoRecarga = parseFloat(x_amount);
    const saldoNuevo = (saldoActual + montoRecarga).toFixed(2);
    console.log(`[ePayco] Acreditando: ${saldoActual} + ${montoRecarga} = ${saldoNuevo}`);
    tarjeta.saldo = saldoNuevo as unknown as string;
    await this.metodoPagoRepo.save(tarjeta);
    console.log('[ePayco] Saldo actualizado OK');

    return { success: true };
  }
}
