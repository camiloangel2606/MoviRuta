from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import close_db, connect_db
from app.routes import calendario, clima, pqrs


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(title="ms-n8n-agents", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clima.router, prefix="/api/agents", tags=["Clima"])
app.include_router(pqrs.router, prefix="/api/agents", tags=["PQRS"])
app.include_router(calendario.router, prefix="/api/agents", tags=["Calendario"])
