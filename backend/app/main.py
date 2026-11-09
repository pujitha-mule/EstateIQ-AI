
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import Base, engine
from app import models

from app.routers import (
    auth,
    leads,
    bookings,
    chat,
    dashboard,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "EstateIQ AI real estate lead management, "
        "AI enquiry assistance and site visit booking."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register /api only once.
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(leads.router, prefix=settings.API_PREFIX)
app.include_router(bookings.router, prefix=settings.API_PREFIX)
app.include_router(chat.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "application": settings.APP_NAME,
        "status": "running",
        "message": "EstateIQ AI backend is running.",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": settings.APP_NAME,
    }
