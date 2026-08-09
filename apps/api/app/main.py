"""Invest Copilot — API.

Outil d'information et d'apprentissage. Ceci n'est pas un conseil en
investissement.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import Base, engine
from .routers import assets, copilot, market, portfolio, simulator, watchlist
from .schemas import DISCLAIMER


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Invest Copilote API",
    description=DISCLAIMER,
    version="0.1.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (market.router, assets.router, portfolio.router, watchlist.router, simulator.router, copilot.router):
    app.include_router(router, prefix="/api")


@app.get("/api/health")
def health():
    from .services.market_data import get_market_data

    return {
        "status": "ok",
        "data_mode": get_market_data().mode,
        "disclaimer": DISCLAIMER,
    }
