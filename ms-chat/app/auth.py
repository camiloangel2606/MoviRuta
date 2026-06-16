import os

import httpx
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

SECURITY_URL = os.getenv("SECURITY_URL", "http://localhost:5050/api")

_security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> dict:
    token = credentials.credentials
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{SECURITY_URL}/auth/validate",
                headers={"Authorization": f"Bearer {token}"},
                timeout=5.0,
            )
        if resp.status_code == 200:
            return resp.json()
    except httpx.RequestError:
        pass
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
    )
