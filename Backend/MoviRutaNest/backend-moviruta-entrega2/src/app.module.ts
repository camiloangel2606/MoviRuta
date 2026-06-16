import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaModule } from './empresa/empresa.module';
import { BusModule } from './bus/bus.module';
import { RutaModule } from './ruta/ruta.module';
import { ParaderoModule } from './paradero/paradero.module';
import { RutaParaderoModule } from './ruta-paradero/ruta-paradero.module';
import { GrupoModule } from './grupo/grupo.module';
import { MensajeModule } from './mensaje/mensaje.module';
import { DestinatarioPersonaModule } from './destinatario-persona/destinatario-persona.module';
import { DestinatarioGrupoModule } from './destinatario-grupo/destinatario-grupo.module';
import { CiudadanoModule } from './ciudadano/ciudadano.module';
import { NodoModule } from './nodo/nodo.module';
import { BoletoModule } from './boleto/boleto.module';
import { PersonaModule } from './persona/persona.module';
import { ConductorModule } from './conductor/conductor.module';
import { TurnoModule } from './turno/turno.module';
import { HistorialModule } from './historial/historial.module';
import { GpsModule } from './gps/gps.module';
import { DireccionModule } from './direccion/direccion.module';
import { MetodoPagoModule } from './metodo-pago/metodo-pago.module';
import { MetodoPagoCiudadanoModule } from './metodo-pago-ciudadano/metodo-pago-ciudadano.module';
import { IncidenteModule } from './incidente/incidente.module';
import { FotoModule } from './foto/foto.module';
import { IncidenteBusModule } from './incidente-bus/incidente-bus.module';
import { ProgramacionModule } from './programacion/programacion.module';
import { PagosModule } from './pagos/pagos.module';
import { ReportesModule } from './reportes/reportes.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,

      autoLoadEntities: true,

      // SOLO si quieres avanzar sin migraciones al inicio:
      // synchronize: true (solo 1-2 días) y luego lo apagas.
      synchronize: true,
    }),
    EmpresaModule,
    BusModule,
    RutaModule,
    ParaderoModule,
    RutaParaderoModule,
    PersonaModule,
    GrupoModule,
    MensajeModule,
    DestinatarioPersonaModule,
    DestinatarioGrupoModule,
    CiudadanoModule,
    NodoModule,
    BoletoModule,
    ConductorModule,
    TurnoModule,
    HistorialModule,
    GpsModule,
    DireccionModule,
    MetodoPagoModule,
    MetodoPagoCiudadanoModule,
    IncidenteModule,
    FotoModule,
    IncidenteBusModule,
    ProgramacionModule,
    PagosModule,
    ReportesModule,
    SeedModule,
  ],
})
export class AppModule {}