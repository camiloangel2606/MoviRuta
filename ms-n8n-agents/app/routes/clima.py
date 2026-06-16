from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agents.clima_agent import run_clima_agent
from app.database import get_db

router = APIRouter()


class PronosticoRequest(BaseModel):
    ciudad: str
    horario_viaje: str


class AlertaRequest(BaseModel):
    usuario_id: str
    ciudad: str
    horario_viaje: str


@router.post("/clima/pronostico")
async def pronostico(body: PronosticoRequest):
    try:
        # El agente LangChain es síncrono; lo ejecutamos en thread pool
        result = await asyncio.to_thread(run_clima_agent, body.ciudad, body.horario_viaje)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/clima/activar-alerta")
async def activar_alerta(body: AlertaRequest):
    db = get_db()
    preferencia = {
        "usuario_id": body.usuario_id,
        "ciudad": body.ciudad,
        "horario_viaje": body.horario_viaje,
        "activa": True,
        "actualizado_en": datetime.now(timezone.utc),
    }
    await db.alertas_clima.update_one(
        {"usuario_id": body.usuario_id},
        {"$set": preferencia},
        upsert=True,
    )
    return {
        "ok": True,
        "mensaje": f"Alerta climática activada para {body.ciudad} a las {body.horario_viaje}",
    }
