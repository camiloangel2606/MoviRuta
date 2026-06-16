from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class TipoMensaje(str, Enum):
    directo = "directo"
    grupo = "grupo"


class MensajeDirectoCreate(BaseModel):
    destinatario_id: str
    contenido: str
    ubicacion: Optional[dict] = None


class MensajeGrupoCreate(BaseModel):
    grupo_id: str
    contenido: str


class AlertaCreate(BaseModel):
    contenido: str
    alcance: str  # todos | ruta | zona
    urgente: bool = False
    ruta_id: Optional[str] = None
    zona: Optional[str] = None
    programado_en: Optional[datetime] = None
