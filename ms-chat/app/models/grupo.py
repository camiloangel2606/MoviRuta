from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class TipoGrupo(str, Enum):
    publico = "publico"
    privado = "privado"


class RolMiembro(str, Enum):
    admin = "admin"
    miembro = "miembro"


class GrupoCreate(BaseModel):
    nombre: str
    descripcion: str
    tipo: TipoGrupo
    miembros_ids: List[str] = []
    imagen_url: Optional[str] = None
