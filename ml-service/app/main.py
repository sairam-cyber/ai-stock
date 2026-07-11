"""AI Stock Platform — ML Service (FastAPI)"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import stock, ai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Stock ML Service",
    description="Machine learning predictions, stock analysis, and AI-powered insights",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins in dev for easier local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Include Routers ───────────────────────────
app.include_router(stock.router)
app.include_router(ai.router)


@app.get("/")
async def root():
    return {"status": "ok", "service": "ai-stock-ml-service"}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "ai-stock-ml-service",
        "version": "1.0.0",
    }

