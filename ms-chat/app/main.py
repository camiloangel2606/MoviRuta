from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import close_db, connect_db
from app.routes import grupos, mensajes, ws


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(title="ms-chat", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mensajes.router, prefix="/api/chat", tags=["Mensajes"])
app.include_router(grupos.router, prefix="/api/chat", tags=["Grupos"])
app.include_router(ws.router, tags=["WebSocket"])
