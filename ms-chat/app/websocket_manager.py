from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Dict, List

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import WebSocket

from app.auth import decode_token

load_dotenv()


def _to_serializable(obj):
    if isinstance(obj, dict):
        return {k: _to_serializable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_to_serializable(i) for i in obj]
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


class ConnectionManager:
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}

    async def validate_token(self, token: str) -> dict | None:
        return decode_token(token)

    async def connect(self, usuario_id: str, websocket: WebSocket):
        await websocket.accept()
        self.connections[usuario_id] = websocket

    def disconnect(self, usuario_id: str):
        self.connections.pop(usuario_id, None)

    async def send_to_user(self, usuario_id: str, data: dict):
        ws = self.connections.get(usuario_id)
        if ws:
            try:
                await ws.send_text(json.dumps(_to_serializable(data)))
            except Exception:
                self.disconnect(usuario_id)

    async def send_to_group(
        self, grupo_id: str, data: dict, excluir_ids: List[str] = []
    ):
        from app.database import get_db

        db = get_db()
        miembros = await db.grupo_personas.find(
            {"grupo_id": grupo_id, "bloqueado": False}
        ).to_list(None)
        for m in miembros:
            pid = m["persona_id"]
            if pid not in excluir_ids:
                await self.send_to_user(pid, data)

    async def broadcast(self, data: dict):
        serialized = json.dumps(_to_serializable(data))
        for usuario_id, ws in list(self.connections.items()):
            try:
                await ws.send_text(serialized)
            except Exception:
                self.disconnect(usuario_id)


manager = ConnectionManager()
