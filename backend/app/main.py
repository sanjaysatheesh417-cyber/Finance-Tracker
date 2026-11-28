from fastapi import FastAPI
from .database import health_check, engine, Base
from .core.config import settings
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .routers.auth import router as auth_router
from .routers.transaction import router as transaction_router
from .routers.category import router as category_router
from .routers.reports import router as reports_router
from .routers.budgets import router as budgets_router
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
from .core.limiter import limiter
from .core.logging_config import setup_logging
import logging
from sqlalchemy import text

setup_logging(settings.LOG_LEVEL, settings.LOG_JSON_FORMAT)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    with engine.begin() as conn:
        conn.execute(text("SELECT pg_advisory_xact_lock(724001)"))
        Base.metadata.create_all(bind=conn)
        logger.info("startup complete environment=%s", settings.ENVIRONMENT)
    yield

prod = settings.ENVIRONMENT == "production"

app = FastAPI(
    title="Finance Tracker",
    lifespan=lifespan,
    docs_url=None if prod else "/docs",
    redoc_url=None,
    openapi_url=None if prod else "/openapi.json"
)

app.state.limiter = limiter
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET","POST","DELETE","PATCH"],
    allow_headers=["Content-Type", "authorization"]
)

app.include_router(auth_router)
app.include_router(transaction_router)
app.include_router(category_router)
app.include_router(reports_router)
app.include_router(budgets_router)

@app.get("/health", include_in_schema=False)
def health():
    if not health_check():
        return JSONResponse({"status":"unavailable"}, status_code=503)
    return {"status":"ok"}