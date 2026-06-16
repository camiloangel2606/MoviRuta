from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.database import get_db
from app.websocket_manager import manager

router = APIRouter()


@router.websocket("/ws/{usuario_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    usuario_id: str,
    token: str = Query(...),
):
    user = await manager.validate_token(token)
    if not user:
        await websocket.close(code=4001)
        return

    # El usuario_id del path debe coincidir con el token
    if str(user.get("id", "")) != usuario_id:
        await websocket.close(code=4003)
        return

    await manager.connect(usuario_id, websocket)
    db = get_db()

    # Enviar mensajes directos no leídos al reconectar
    pendientes = await db.mensajes.find(
        {"destinatario_id": usuario_id, "leido": False, "tipo": "directo"}
    ).to_list(None)
    for msg in pendientes:
        msg["id"] = str(msg.pop("_id"))
        await manager.send_to_user(usuario_id, {"tipo": "mensaje_pendiente", "data": msg})

    try:
        while True:
            data = await websocket.receive_json()
            tipo = data.get("tipo")
            payload = data.get("data", {})
            now = datetime.now(timezone.utc)

            if tipo == "mensaje_directo":
                destinatario_id = payload.get("destinatario_id")
                contenido = payload.get("contenido")
                if not destinatario_id or not contenido:
                    continue
                msg = {
                    "emisor_id": usuario_id,
                    "contenido": contenido,
                    "fecha_envio": now,
                    "leido": False,
                    "leido_en": None,
                    "tipo": "directo",
                    "destinatario_id": destinatario_id,
                    "grupo_id": None,
                    "ubicacion": payload.get("ubicacion"),
                }
                result = await db.mensajes.insert_one(msg)
                msg["id"] = str(result.inserted_id)
                msg.pop("_id", None)
                await manager.send_to_user(
                    destinatario_id, {"tipo": "mensaje_nuevo", "data": msg}
                )

            elif tipo == "mensaje_grupo":
                grupo_id = payload.get("grupo_id")
                contenido = payload.get("contenido")
                if not grupo_id or not contenido:
                    continue
                miembro = await db.grupo_personas.find_one(
                    {"grupo_id": grupo_id, "persona_id": usuario_id, "bloqueado": False}
                )
                if not miembro:
                    continue
                msg = {
                    "emisor_id": usuario_id,
                    "contenido": contenido,
                    "fecha_envio": now,
                    "leido": False,
                    "leido_en": None,
                    "tipo": "grupo",
                    "destinatario_id": None,
                    "grupo_id": grupo_id,
                    "ubicacion": None,
                }
                result = await db.mensajes.insert_one(msg)
                msg["id"] = str(result.inserted_id)
                msg.pop("_id", None)
                await manager.send_to_group(
                    grupo_id,
                    {"tipo": "mensaje_grupo", "data": msg},
                    excluir_ids=[usuario_id],
                )

            elif tipo == "ubicacion_conductor":
                # El conductor envía su GPS desde "mi turno" cada 5-15 segundos.
                # Se persiste la última ubicación y se hace broadcast a todos.
                lat = payload.get("lat")
                lng = payload.get("lng")
                ruta_id = payload.get("ruta_id")
                if lat is None or lng is None:
                    continue
                ubicacion_doc = {
                    "conductor_id": usuario_id,
                    "ruta_id": ruta_id,
                    "lat": lat,
                    "lng": lng,
                    "timestamp": now,
                }
                await db.ubicaciones_conductor.replace_one(
                    {"conductor_id": usuario_id},
                    ubicacion_doc,
                    upsert=True,
                )
                await manager.broadcast({"tipo": "ubicacion_bus", "data": ubicacion_doc})

    except WebSocketDisconnect:
        manager.disconnect(usuario_id)
