from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_user
from app.database import get_db
from app.models.grupo import GrupoCreate

router = APIRouter()


def _serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def _require_admin(db, grupo_id: str, persona_id: str):
    m = await db.grupo_personas.find_one(
        {"grupo_id": grupo_id, "persona_id": persona_id, "rol": "admin"}
    )
    if not m:
        raise HTTPException(status_code=403, detail="Se requiere rol de administrador")


@router.get("/grupos/publicos")
async def grupos_publicos(user=Depends(get_current_user)):
    db = get_db()
    grupos = await db.grupos.find({"tipo": "publico"}).to_list(200)
    result = []
    for g in grupos:
        g = _serialize(g)
        g["cantidad_miembros"] = await db.grupo_personas.count_documents(
            {"grupo_id": g["id"], "bloqueado": False}
        )
        result.append(g)
    return result


@router.get("/grupos/mis-grupos")
async def mis_grupos(user=Depends(get_current_user)):
    db = get_db()
    membresias = await db.grupo_personas.find(
        {"persona_id": user["id"], "bloqueado": False}
    ).to_list(None)
    result = []
    for m in membresias:
        try:
            g = await db.grupos.find_one({"_id": ObjectId(m["grupo_id"])})
            if g:
                g = _serialize(g)
                g["cantidad_miembros"] = await db.grupo_personas.count_documents(
                    {"grupo_id": g["id"], "bloqueado": False}
                )
                result.append(g)
        except Exception:
            continue
    return result


@router.post("/grupos", status_code=201)
async def crear_grupo(body: GrupoCreate, user=Depends(get_current_user)):
    db = get_db()
    now = _now()
    grupo = {
        "nombre": body.nombre,
        "descripcion": body.descripcion,
        "tipo": body.tipo,
        "creador_id": user["id"],
        "imagen_url": body.imagen_url,
        "creado_en": now,
    }
    result = await db.grupos.insert_one(grupo)
    grupo_id = str(result.inserted_id)

    await db.grupo_personas.insert_one({
        "grupo_id": grupo_id,
        "persona_id": user["id"],
        "rol": "admin",
        "unido_en": now,
        "bloqueado": False,
    })
    for pid in body.miembros_ids:
        if pid != user["id"]:
            await db.grupo_personas.insert_one({
                "grupo_id": grupo_id,
                "persona_id": pid,
                "rol": "miembro",
                "unido_en": now,
                "bloqueado": False,
            })

    grupo["id"] = grupo_id
    grupo.pop("_id", None)
    return grupo


@router.get("/grupos/{id}")
async def detalle_grupo(id: str, user=Depends(get_current_user)):
    db = get_db()
    try:
        g = await db.grupos.find_one({"_id": ObjectId(id)})
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")
    if not g:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
    g = _serialize(g)
    g["cantidad_miembros"] = await db.grupo_personas.count_documents(
        {"grupo_id": id, "bloqueado": False}
    )
    return g


@router.post("/grupos/{id}/unirse")
async def unirse(id: str, user=Depends(get_current_user)):
    db = get_db()
    try:
        g = await db.grupos.find_one({"_id": ObjectId(id)})
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")
    if not g:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
    if g["tipo"] != "publico":
        raise HTTPException(status_code=403, detail="El grupo es privado")
    ya_existe = await db.grupo_personas.find_one({"grupo_id": id, "persona_id": user["id"]})
    if ya_existe:
        raise HTTPException(status_code=400, detail="Ya eres miembro de este grupo")
    now = _now()
    await db.grupo_personas.insert_one({
        "grupo_id": id,
        "persona_id": user["id"],
        "rol": "miembro",
        "unido_en": now,
        "bloqueado": False,
    })
    await db.log_membresia.insert_one({
        "grupo_id": id,
        "accion": "unirse",
        "actor_id": user["id"],
        "afectado_id": user["id"],
        "fecha": now,
    })
    return {"ok": True}


@router.post("/grupos/{id}/abandonar")
async def abandonar(id: str, user=Depends(get_current_user)):
    db = get_db()
    result = await db.grupo_personas.delete_one({"grupo_id": id, "persona_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No eres miembro de este grupo")
    await db.log_membresia.insert_one({
        "grupo_id": id,
        "accion": "abandonar",
        "actor_id": user["id"],
        "afectado_id": user["id"],
        "fecha": _now(),
    })
    return {"ok": True}


@router.get("/grupos/{id}/miembros")
async def listar_miembros(id: str, user=Depends(get_current_user)):
    db = get_db()
    docs = await db.grupo_personas.find({"grupo_id": id}).to_list(None)
    return [
        {
            "persona_id": m["persona_id"],
            "rol": m["rol"],
            "unido_en": m["unido_en"],
            "bloqueado": m["bloqueado"],
        }
        for m in docs
    ]


@router.post("/grupos/{id}/miembros/{persona_id}/promover")
async def promover(id: str, persona_id: str, user=Depends(get_current_user)):
    db = get_db()
    await _require_admin(db, id, user["id"])
    result = await db.grupo_personas.update_one(
        {"grupo_id": id, "persona_id": persona_id},
        {"$set": {"rol": "admin"}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    await db.log_membresia.insert_one({
        "grupo_id": id,
        "accion": "promover",
        "actor_id": user["id"],
        "afectado_id": persona_id,
        "fecha": _now(),
    })
    return {"ok": True}


@router.delete("/grupos/{id}/miembros/{persona_id}")
async def remover_miembro(id: str, persona_id: str, user=Depends(get_current_user)):
    db = get_db()
    await _require_admin(db, id, user["id"])
    result = await db.grupo_personas.delete_one({"grupo_id": id, "persona_id": persona_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    await db.log_membresia.insert_one({
        "grupo_id": id,
        "accion": "remover",
        "actor_id": user["id"],
        "afectado_id": persona_id,
        "fecha": _now(),
    })
    return {"ok": True}


@router.post("/grupos/{id}/miembros/{persona_id}/bloquear")
async def bloquear(id: str, persona_id: str, user=Depends(get_current_user)):
    db = get_db()
    await _require_admin(db, id, user["id"])
    result = await db.grupo_personas.update_one(
        {"grupo_id": id, "persona_id": persona_id},
        {"$set": {"bloqueado": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Miembro no encontrado")
    await db.log_membresia.insert_one({
        "grupo_id": id,
        "accion": "bloquear",
        "actor_id": user["id"],
        "afectado_id": persona_id,
        "fecha": _now(),
    })
    return {"ok": True}


@router.get("/grupos/{id}/log")
async def log_membresia(id: str, user=Depends(get_current_user)):
    db = get_db()
    logs = await db.log_membresia.find({"grupo_id": id}).sort("fecha", -1).to_list(500)
    return [
        {
            "accion": l["accion"],
            "actor_id": l["actor_id"],
            "afectado_id": l["afectado_id"],
            "fecha": l["fecha"],
        }
        for l in logs
    ]
