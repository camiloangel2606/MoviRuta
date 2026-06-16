import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { CrearReferenciaDto } from './dto/crear-referencia.dto';
import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // Frontend llama aquí antes de abrir el checkout de ePayco
  @Post('referencia')
  crearReferencia(@Body() dto: CrearReferenciaDto) {
    return this.pagosService.crearReferencia(dto);
  }

  // ePayco llama aquí server-to-server (application/x-www-form-urlencoded)
  @Post('confirmacion')
  @HttpCode(200)
  confirmacion(@Body() body: Record<string, string>) {
    return this.pagosService.procesarConfirmacion(body);
  }

  // ePayco redirige el navegador aquí al terminar el flujo
  @Get('respuesta')
  respuesta(@Query() _query: Record<string, string>) {
    return { mensaje: 'Pago procesado. Puedes cerrar esta ventana.' };
  }
}
