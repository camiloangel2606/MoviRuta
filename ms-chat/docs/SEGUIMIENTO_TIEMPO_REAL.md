# Seguimiento de buses en tiempo real (WebSocket)

Documento de contexto del flujo completo: un **conductor comparte su GPS** y todos
los usuarios conectados ven el **bus moverse en el mapa en vivo**, a través del
microservicio `ms-chat` (WebSockets).

---

## 1. Visión general del flujo

```
┌─────────────────────┐   ubicacion_conductor    ┌──────────────┐   ubicacion_bus   ┌──────────────────┐
│ Conductor (Angular) │ ───────WebSocket───────►  │   ms-chat    │ ────broadcast───► │ Mapa Seguimiento │
│  "Mi turno" + GPS   │   { lat, lng, ruta_id }   │   (:4000)    │  a TODOS los WS   │   (Angular)      │
└─────────────────────┘                           └──────┬───────┘                   └──────────────────┘
                                                          │ upsert
                                                          ▼
                                                  ubicaciones_conductor (MongoDB)
```

1. El conductor activa el GPS → el navegador entrega su posición (`watchPosition`).
2. Cada **5 s** Angular envía `{ tipo: "ubicacion_conductor", data: { lat, lng, ruta_id } }`.
3. ms-chat guarda la última posición (upsert en `ubicaciones_conductor`) y hace
   **broadcast** del evento `ubicacion_bus` a todos los clientes conectados.
4. El mapa de seguimiento recibe el evento y crea/mueve un marcador verde 🟢.

> Convive con el flujo histórico por **polling** (conductor → REST negocio MySQL →
> mapa consulta `/gps` cada 10 s). El WebSocket **añade** el canal en vivo, no lo reemplaza.

---

## 2. Backend (ms-chat)

| Pieza | Archivo | Rol |
|-------|---------|-----|
| Handler WS `ubicacion_conductor` | `app/routes/ws.py` | Recibe GPS, upsert en Mongo, broadcast `ubicacion_bus` |
| `ConnectionManager.broadcast()` | `app/websocket_manager.py` | Envía a todas las conexiones activas |
| Endpoints REST de apoyo | `app/routes/mensajes.py` | `GET /ubicaciones`, `GET /ubicaciones/{conductor_id}` |

Validación del WS: el `usuario_id` de la URL debe coincidir con el claim `id` del JWT.

---

## 3. Frontend (Angular)

| Pieza | Archivo | Rol |
|-------|---------|-----|
| **Servicio WS** | `core/services/chat-socket.service.ts` | Conecta, envía ubicación, expone `ubicaciones$`, reconecta solo |
| **Emisor** | `features/conductor/dashboard/dashboard-conductor.component.ts` | Al activar GPS conecta el socket y emite cada 5 s (throttle) |
| **Receptor** | `features/seguimiento/seguimiento/seguimiento.component.ts` | Se suscribe a `ubicaciones$` y pinta/mueve marcadores |

### Detalles del receptor (mapa)
- **Filtra por ruta:** solo muestra el bus si su `ruta_id` == ruta seleccionada.
- Guarda la última posición de cada conductor (`ultimasUbicaciones`) para re-pintar
  al cambiar de ruta (`reRenderBusesEnVivo`).
- **Auto-centra** el mapa en el primer bus en vivo de la ruta (útil si el bus está
  en otra ciudad, p. ej. Manizales mientras el mapa arranca en Bogotá).
- Marcador verde con animación `.bus-en-vivo`; chip "N en vivo" en el header.

### `ChatSocketService` — API
```ts
connect(token: string): void                 // abre ws://localhost:4000/ws/{id}?token=...
enviarUbicacion(lat, lng, rutaId): void       // envía { tipo: 'ubicacion_conductor', data }
ubicaciones$: Observable<UbicacionBus>        // stream de eventos 'ubicacion_bus'
disconnect(): void
```
La URL WS se deriva de `environment.chatUrl` (quita `/api/chat`, http→ws). El
`usuario_id` se obtiene decodificando el claim `id` del JWT (coincide con el backend).

---

## 4. Simuladores de prueba

Páginas estáticas servidas por el dev server (`public/`), para probar **sin** montar
un turno real. Traen un token de conductor embebido (válido 7 días) con un **id
distinto** al de tu sesión (si emisor y receptor comparten id, el `ConnectionManager`
sobreescribe la conexión y el receptor deja de recibir).

| Archivo | URL | Ciudad / Ruta |
|---------|-----|---------------|
| `public/simulador-manizales.html` | http://localhost:4200/simulador-manizales.html | Manizales (Av. Santander), `ruta_id=5` |
| `public/simulador-conductor.html` | http://localhost:4200/simulador-conductor.html | Bogotá, `ruta_id=1` |

### Cómo probar
1. **Pestaña 1 (mapa):** login → **Seguimiento** → selecciona la ruta correspondiente
   (Manizales → "Ruta Transversal Manizales", id 5).
2. **Pestaña 2 (simulador):** abre la URL del simulador → **Iniciar recorrido**.
3. El mapa salta a la ciudad y verás el bus verde moverse cada 3 s. Cambia de ruta
   en el mapa → el bus desaparece (filtro por ruta); vuelve a la ruta → reaparece.

### Generar un token de conductor nuevo (si caduca)
```powershell
docker exec moviruta-ms-chat python -c "import jwt,datetime; print(jwt.encode({'id':'SIM-manizales-01','roles':['conductor'],'exp':datetime.datetime.utcnow()+datetime.timedelta(days=7)}, '<JWT_SECRET>', algorithm='HS512'))"
```

---

## 5. Rutas reales en la BD de negocio (MySQL)

| id | nombre                      |
|----|-----------------------------|
| 1  | Ruta Norte                  |
| 3  | Ruta Centro                 |
| 5  | Ruta Transversal Manizales  |
| 8  | Ruta Manizales Colectiva    |
| 11 | Tarea 2009                  |

---

## 6. Notas y arreglos relevantes

- **Auth local del JWT:** ms-chat decodifica el token con HS512 (no hay endpoint
  remoto de validación). El `JWT_SECRET` está compartido con ms-security y duplicado
  en `ms-chat/.env` y `docker-compose.yml`.
- **Fix finalizar programación:** al finalizar un turno, la programación quedaba
  `EN_CURSO` cuando el turno persistía de otro día (no se encontraba la programación
  de "hoy" y el error se tragaba). Ahora `sincronizarEstadoProgramacion` resuelve la
  programación por **bus + conductor** si falta el id, y avisa con toast si falla.
  El backend de negocio (NestJS :3000) siempre funcionó: `PATCH /programacion/{id}`
  con `{ estado }`.
