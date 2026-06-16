import os

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS512")

_security = HTTPBearer()


def decode_token(token: str) -> dict | None:
    """Decodifica y valida el JWT emitido por ms-security (HS512).

    El token trae los claims: id, name, email, roles (lista).
    Devuelve un dict de usuario normalizado o None si es inválido/expirado.
    """
    if not JWT_SECRET:
        return None
    try:
        claims = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None

    roles = claims.get("roles", []) or []
    return {
        "id": claims.get("id") or claims.get("sub"),
        "name": claims.get("name"),
        "email": claims.get("email"),
        "roles": roles,
        # Compatibilidad: "admin" si tiene ese rol, si no el primero
        "rol": "admin" if "admin" in roles else (roles[0] if roles else None),
    }


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> dict:
    user = decode_token(credentials.credentials)
    if user and user.get("id"):
        return user
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
    )
