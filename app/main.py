from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import health
from .routers import campaigns, bloggers, counterparties, placements
from .routers import dashboard


def create_app() -> FastAPI:
    init_db()
    app = FastAPI(title="LestaHub API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health.router)
    app.include_router(campaigns.router)
    app.include_router(bloggers.router)
    app.include_router(counterparties.router)
    app.include_router(placements.router)
    app.include_router(dashboard.router)
    return app


app = create_app()
