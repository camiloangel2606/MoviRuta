from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_user
from app.database import get_db
from app.models.mensaje import AlertaCreate, MensajeDirectoCreate, MensajeGrupoCreate
from app.websocket_manager import manager

router = APIRouter()


def _serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


def _now() -> datetime:
    return datetime.now(timezone.utc)


@router.post("/mensajes/directo", status_code=201)
async def enviar_directo(body: MensajeDirectoCreate, user=Depends(get_current_user)):
    db = get_db()
    msg = {
        "emisor_id": user["id"],
        "contenido": body.contenido,
        "fecha_envio": _now(),
        "leido": False,
        "leido_en": None,
        "tipo": "directo",
        "destinatario_id": body.destinatario_id,
        "grupo_id": None,
        "ubicacion": body.ubicacion,
    }
    result = await db.mensajes.insert_one(msg)
    msg["id"] = str(result.inserted_id)
    msg.pop("_id", None)
    await manager.send_to_user(body.destinatario_id, {"tipo": "mensaje_nuevo", "data": msg})
    return msg


@router.post("/mensajes/grupo", status_code=201)
async def enviar_grupo(body: MensajeGrupoCreate, user=Depends(get_current_user)):
    db = get_db()
    miembro = await db.grupo_personas.find_one(
        {"grupo_id": body.grupo_id, "persona_id": user["id"], "bloqueado": False}
    )
    if not miembro:
        raise HTTPException(status_code=403, detail="No eres miembro activo de este grupo")
    msg = {
        "emisor_id": user["id"],
        "contenido": body.contenido,
        "fecha_envio": _now(),
        "leido": False,
        "leido_en": None,
        "tipo": "grupo",
        "destinatario_id": None,
        "grupo_id": body.grupo_id,
        "ubicacion": None,
    }
    result = await db.mensajes.insert_one(msg)
    msg["id"] = str(result.inserted_id)
    msg.pop("_id", None)
    await manager.send_to_group(
        body.grupo_id, {"tipo": "mensaje_grupo", "data": msg}, excluir_ids=[user["id"]]
    )
    return msg


@router.get("/mensajes/recibidos")
async def mensajes_recibidos(
    tipo: Optional[str] = None,
    leido: Optional[bool] = None,
    fecha_desde: Optional[datetime] = None,
    fecha_hasta: Optional[datetime] = None,
    user=Depends(get_current_user),
):
    db = get_db()
    filtro: dict = {"destinatario_id": user["id"]}
    if tipo:
        filtro["tipo"] = tipo
    if leido is not None:
        filtro["leido"] = leido
    if fecha_desde or fecha_hasta:
        rango: dict = {}
        if fecha_desde:
            rango["$gte"] = fecha_desde
        if fecha_hasta:
            rango["$lte"] = fecha_hasta
        filtro["fecha_envio"] = rango
    docs = await db.mensajes.find(filtro).sort("fecha_envio", -1).to_list(200)
    return [_serialize(d) for d in docs]


@router.get("/mensajes/enviados")
async def mensajes_enviados(user=Depends(get_current_user)):
    db = get_db()
    docs = await db.mensajes.find({"emisor_id": user["id"]}).sort("fecha_envio", -1).to_list(200)
    return [_serialize(d) for d in docs]


@router.patch("/mensajes/{id}/leer")
async def marcar_leido(id: str, user=Depends(get_current_user)):
    db = get_db()
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")
    result = await db.mensajes.update_one(
        {"_id": oid, "destinatario_id": user["id"]},
        {"$set": {"leido": True, "leido_en": _now()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    return {"ok": True}


@router.delete("/mensajes/{id}")
async def eliminar_mensaje(id: str, user=Depends(get_current_user)):
    db = get_db()
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")
    msg = await db.mensajes.find_one({"_id": oid})
    if not msg:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if msg["emisor_id"] != user["id"]:
        if msg.get("grupo_id"):
            admin = await db.grupo_personas.find_one(
                {"grupo_id": msg["grupo_id"], "persona_id": user["id"], "rol": "admin"}
            )
            if not admin:
                raise HTTPException(status_code=403, detail="Sin permiso para eliminar")
        else:
            raise HTTPException(status_code=403, detail="Sin permiso para eliminar")
    await db.mensajes.delete_one({"_id": oid})
    return {"ok": True}


@router.post("/alertas", status_code=201)
async def crear_alerta(body: AlertaCreate, user=Depends(get_current_user)):
    if str(user.get("rol", "")).lower() != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden enviar alertas")
    db = get_db()
    alerta = {
        "emisor_id": user["id"],
        "contenido": body.contenido,
        "alcance": body.alcance,
        "urgente": body.urgente,
        "ruta_id": body.ruta_id,
        "zona": body.zona,
        "programado_en": body.programado_en,
        "fecha_envio": _now(),
        "tipo": "alerta",
        "entregas": [],
        "lecturas": [],
    }
    result = await db.alertas.insert_one(alerta)
    alerta["id"] = str(result.inserted_id)
    alerta.pop("_id", None)
    if body.alcance == "todos":
        await manager.broadcast({"tipo": "alerta_masiva", "data": alerta})
    return alerta


@router.get("/alertas/{id}/estadisticas")
async def estadisticas_alerta(id: str, user=Depends(get_current_user)):
    if str(user.get("rol", "")).lower() != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")
    db = get_db()
    try:
        alerta = await db.alertas.find_one({"_id": ObjectId(id)})
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return {
        "id": str(alerta["_id"]),
        "contenido": alerta["contenido"],
        "urgente": alerta.get("urgente", False),
        "alcance": alerta.get("alcance"),
        "fecha_envio": alerta.get("fecha_envio"),
        "total_entregas": len(alerta.get("entregas", [])),
        "total_lecturas": len(alerta.get("lecturas", [])),
    }
