import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { DemografiaQueryDto } from './dto/demografia-query.dto';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // HU-2014: Reporte de ingresos por mes y método de pago
  // GET /reportes/ingresos?meses=6
  @Get('ingresos')
  ingresos(
    @Query('meses', new DefaultValuePipe(6), ParseIntPipe) meses: number,
  ) {
    return this.reportesService.ingresosPorMes(meses);
  }

  // HU-2015: Reporte demográfico por rango etario
  // GET /reportes/demografia?rutaId=1&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
  @Get('demografia')
  demografia(@Query() query: DemografiaQueryDto) {
    return this.reportesService.demografia(query);
  }
}
