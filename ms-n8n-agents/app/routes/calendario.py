from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agents.calendario_agent import crear_cita, run_calendario_agent
from app.database import get_db

router = APIRouter()


class DisponibilidadRequest(BaseModel):
    tipo_atencion: str
    tipo_consulta: str
    motivo: str
    email_usuario: str


class AgendarRequest(BaseModel):
    fecha_hora: str
    tipo_atencion: str
    tipo_consulta: str
    motivo: str
    email_usuario: str


@router.post("/calendario/disponibilidad")
async def disponibilidad(body: DisponibilidadRequest):
    try:
        result = await asyncio.to_thread(
            run_calendario_agent,
            body.tipo_atencion,
            body.tipo_consulta,
            body.motivo,
            body.email_usuario,
        )
        return {"slots_disponibles": result["slots_disponibles"]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/calendario/agendar", status_code=201)
async def agendar(body: AgendarRequest):
    try:
        confirmacion = await asyncio.to_thread(
            crear_cita.invoke,
            {
                "fecha_hora": body.fecha_hora,
                "tipo_atencion": body.tipo_atencion,
                "tipo_consulta": body.tipo_consulta,
                "motivo": body.motivo,
                "email_usuario": body.email_usuario,
            },
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    db = get_db()
    await db.citas.insert_one({
        "fecha_hora": body.fecha_hora,
        "tipo_atencion": body.tipo_atencion,
        "tipo_consulta": body.tipo_consulta,
        "motivo": body.motivo,
        "email_usuario": body.email_usuario,
        "confirmacion": confirmacion,
        "creado_en": datetime.now(timezone.utc),
    })
    return confirmacion
