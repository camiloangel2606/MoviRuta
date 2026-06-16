from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agents.pqrs_agent import run_pqrs_agent
from app.database import get_db

router = APIRouter()


class PQRSCreate(BaseModel):
    tipo: str        # Queja | Reclamo | Sugerencia | Felicitacion
    categoria: str   # Conductor | Bus | Ruta | Tarjeta
    descripcion: str
    email_contacto: str
    fotos: Optional[List[str]] = []


@router.post("/pqrs/crear", status_code=201)
async def crear_pqrs(body: PQRSCreate):
    try:
        result = await asyncio.to_thread(
            run_pqrs_agent,
            body.tipo,
            body.categoria,
            body.descripcion,
            body.email_contacto,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    db = get_db()
    await db.pqrs.insert_one({
        "radicado": result["radicado"],
        "tipo": body.tipo,
        "categoria": body.categoria,
        "descripcion": body.descripcion,
        "email_contacto": body.email_contacto,
        "fotos": body.fotos,
        "departamento_email": result["departamento_email"],
        "estado": "recibido",
        "tiempo_estimado_dias": result["tiempo_estimado_dias"],
        "creado_en": datetime.now(timezone.utc),
    })
    return result


@router.get("/pqrs/{radicado}/estado")
async def estado_pqrs(radicado: str):
    db = get_db()
    doc = await db.pqrs.find_one({"radicado": radicado})
    if not doc:
        raise HTTPException(status_code=404, detail="PQRS no encontrado")
    doc["id"] = str(doc.pop("_id"))
    return doc
