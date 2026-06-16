# ms-chat · Microservicio de comunicación en tiempo real

Microservicio de **FastAPI + WebSockets + MongoDB** que maneja la comunicación en
tiempo real del sistema de buses MoviRuta: mensajes directos, mensajes grupales,
alertas masivas y **ubicación de buses en vivo** (tracking GPS).

Cubre las HU-3004 a HU-3011. Corre en el puerto **4000**.

---

## Arquitectura general

```
Angular (4200) ──HTTP REST──► ms-chat (4000) ──► MongoDB (27017)
       │                          ▲
       └────────WebSocket─────────┘
                (ws://localhost:4000/ws/{usuario_id}?token=JWT)
```

- **Autenticación:** ms-chat **decodifica el JWT localmente** (HS512) con el mismo
  `JWT_SECRET` que firma `ms-security` (Spring Boot). **No** llama a ningún endpoint
  remoto de validación — ese endpoint (`/api/auth/validate`) nunca existió en
  ms-security. Los claims usados son `id`, `name`, `email`, `roles`.
- **Base de datos:** MongoDB con el driver async `motor`.

---

## Estructura de carpetas

```
ms-chat/
├── app/
│   ├── main.py               # App FastAPI, CORS, routers, lifespan (conexión a Mongo)
│   ├── auth.py               # decode_token() + get_current_user() — valida JWT local (HS512)
│   ├── database.py           # Conexión MongoDB con motor (connect_db / get_db / close_db)
│   ├── websocket_manager.py  # ConnectionManager: conexiones WS activas + broadcast
│   ├── models/
│   │   ├── mensaje.py        # Modelos Pydantic (MensajeDirecto, MensajeGrupo, Alerta)
│   │   └── grupo.py          # Modelos Pydantic (Grupo, roles, tipos)
│   └── routes/
│       ├── mensajes.py       # REST de mensajes, alertas y ubicaciones
│       ├── grupos.py         # REST de grupos y membresías
│       └── ws.py             # Endpoint WebSocket /ws/{usuario_id}
├── .env                      # MONGODB_URL, DB_NAME, JWT_SECRET, JWT_ALGORITHM, PORT
├── requirements.txt
└── Dockerfile
```

---

## Variables de entorno (`.env`)

| Variable        | Valor por defecto                      | Descripción                          |
|-----------------|----------------------------------------|--------------------------------------|
| `MONGODB_URL`   | `mongodb://localhost:27017`            | URL de MongoDB                       |
| `DB_NAME`       | `ms_chat`                              | Nombre de la base de datos           |
| `JWT_SECRET`    | (compartido con ms-security)           | Secreto HS512 para validar tokens    |
| `JWT_ALGORITHM` | `HS512`                                | Algoritmo de firma del JWT           |
| `SECURITY_URL`  | `http://localhost:5050/api`            | (legado, ya no se usa para validar)  |
| `PORT`          | `4000`                                 | Puerto del servicio                  |

> ⚠️ `JWT_SECRET` debe ser **idéntico** al de `ms-security` (`Backend/MoviRuta/.env`).
> En Docker se inyecta también desde `docker-compose.yml`.

---

## Colecciones de MongoDB

| Colección                | Documento                                                                 |
|--------------------------|---------------------------------------------------------------------------|
| `mensajes`               | `{ emisor_id, contenido, fecha_envio, leido, leido_en, tipo, destinatario_id?, grupo_id?, ubicacion? }` |
| `grupos`                 | `{ nombre, descripcion, tipo, creador_id, imagen_url?, creado_en }`       |
| `grupo_personas`         | `{ grupo_id, persona_id, rol, unido_en, bloqueado }`                      |
| `log_membresia`          | `{ grupo_id, accion, actor_id, afectado_id, fecha }`                      |
| `alertas`                | `{ emisor_id, contenido, alcance, urgente, ruta_id?, zona?, ... }`        |
| `ubicaciones_conductor`  | `{ conductor_id, ruta_id, lat, lng, timestamp }` (upsert: 1 por conductor) |

---

## Endpoints REST (`/api/chat`)

Todos requieren header `Authorization: Bearer <JWT>` (vía `Depends(get_current_user)`).

### Mensajes
- `POST /mensajes/directo` — `{ destinatario_id, contenido, ubicacion? }`
- `POST /mensajes/grupo` — `{ grupo_id, contenido }`
- `GET /mensajes/recibidos` — filtros: `tipo`, `leido`, `fecha_desde`, `fecha_hasta`
- `GET /mensajes/enviados`
- `PATCH /mensajes/{id}/leer` — marca leído (directo: destinatario; grupo: miembro)
- `DELETE /mensajes/{id}` — solo emisor o admin del grupo

### Grupos
- `GET /grupos/publicos`, `GET /grupos/mis-grupos`
- `POST /grupos` — `{ nombre, descripcion, tipo, miembros_ids[], imagen_url? }`
- `GET /grupos/{id}`, `POST /grupos/{id}/unirse`, `POST /grupos/{id}/abandonar`
- `GET /grupos/{id}/miembros`
- `POST /grupos/{id}/miembros/{persona_id}/promover`
- `DELETE /grupos/{id}/miembros/{persona_id}`
- `POST /grupos/{id}/miembros/{persona_id}/bloquear`
- `GET /grupos/{id}/log`

### Alertas (solo admin)
- `POST /alertas` — `{ contenido, alcance, urgente, ruta_id?, zona?, programado_en? }`
- `GET /alertas/{id}/estadisticas`

### Ubicaciones (tracking de buses)
- `GET /ubicaciones` — última ubicación de **todos** los buses activos
- `GET /ubicaciones/{conductor_id}` — última ubicación de **un** conductor

---

## WebSocket

`WS /ws/{usuario_id}?token=JWT`

- Al conectar valida el JWT y exige que `usuario_id` == claim `id` del token (si no, cierra `4003`).
- Reenvía los mensajes directos no leídos pendientes.
- Mensajes entrantes (JSON `{ tipo, data }`):

| `tipo`                 | `data`                              | Efecto                                                |
|------------------------|-------------------------------------|-------------------------------------------------------|
| `mensaje_directo`      | `{ destinatario_id, contenido, ubicacion? }` | Guarda en Mongo + `send_to_user` al destinatario |
| `mensaje_grupo`        | `{ grupo_id, contenido }`           | Guarda en Mongo + `send_to_group` a miembros activos  |
| `ubicacion_conductor`  | `{ lat, lng, ruta_id }`             | Upsert en `ubicaciones_conductor` + **broadcast** a todos |

- Eventos salientes hacia el cliente: `mensaje_nuevo`, `mensaje_grupo`,
  `mensaje_pendiente`, `alerta_masiva`, **`ubicacion_bus`** (`{ conductor_id, ruta_id, lat, lng, timestamp }`).

---

## Cómo ejecutar

### Con Docker (recomendado)
```powershell
# Desde la raíz del repo (MoviRuta/)
docker compose up -d mongodb ms-chat
docker logs moviruta-ms-chat --tail 20
```

### Local (requiere Python 3.11)
```powershell
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 4000 --reload
```

Documentación interactiva: http://localhost:4000/docs

---

## Funcionalidad destacada: tracking de buses en tiempo real

Ver **[docs/SEGUIMIENTO_TIEMPO_REAL.md](docs/SEGUIMIENTO_TIEMPO_REAL.md)** para el flujo
completo end-to-end (conductor → ms-chat → mapa), la integración Angular y los
simuladores de prueba.
