from fastapi import FastAPI
from .database import health_check
from .core.config import settings
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .routers.transaction import router as transaction_router

app = FastAPI(
    title="Finance Tracker",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET","POST"],
    allow_headers=["Content-Type", "authorization"]
)

app.include_router(transaction_router)

@app.get("/health", include_in_schema=False)
def health():
    if not health_check():
        return JSONResponse({"status":"unavailable"}, status_code=503)
    return {"status":"ok"}