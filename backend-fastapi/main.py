"""
============================================================
MAIN APPLICATION - FastAPI PLI 2050
============================================================
API REST para Sistema de Formulários de Entrevistas
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from datetime import datetime
import logging
import os
from dotenv import load_dotenv
from pathlib import Path

# Carregar variáveis de ambiente
load_dotenv()

# Import routers (modularizados por domínio)
from app.routers.health import routes as health_router
from app.routers.submit import routes as submit_router
# from app.routers.lists import routes as lists_router  # DEPRECATED: Agora são JSONs estáticos
from app.routers.analytics import routes as analytics_router
from app.routers.external import router as external_router
from app.database import engine, Base, get_db

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================
# CRIAR APLICAÇÃO FASTAPI
# ============================================================

app = FastAPI(
    title="PLI 2050 - API Sistema de Formulários",
    description="API REST para coleta de dados de entrevistas com empresas embarcadoras de São Paulo",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================================
# CORS MIDDLEWARE
# ============================================================

# Origens permitidas (localhost + produção)
allowed_origins_str = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,http://127.0.0.1:8000"
)
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"✅ CORS habilitado para: {allowed_origins}")

# ============================================================
# MIDDLEWARE DE CACHE PARA ARQUIVOS ESTÁTICOS
# ============================================================

class CacheControlMiddleware(BaseHTTPMiddleware):
    """
    Adiciona headers de cache para arquivos estáticos
    - JSONs de listas: cache 1 ano (31536000s)
    - Outros estáticos (CSS/JS): cache 1 hora (3600s)
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Cache agressivo para JSONs de listas (raramente mudam)
        if request.url.path.startswith("/lists/"):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
            response.headers["X-Cache-Strategy"] = "1-year (static data)"
            
        # Cache moderado para CSS/JS (podem ter atualizações)
        elif any(request.url.path.startswith(prefix) for prefix in ["/css/", "/js/", "/vendor/"]):
            response.headers["Cache-Control"] = "public, max-age=3600"
            response.headers["X-Cache-Strategy"] = "1-hour (dynamic assets)"
            
        return response

app.add_middleware(CacheControlMiddleware)
logger.info("✅ Cache Control middleware habilitado (JSONs: 1 ano, assets: 1 hora)")

# ============================================================
# MONTAR ARQUIVOS ESTÁTICOS DO FRONTEND
# ============================================================

# Caminho para o frontend (relativo ao backend-fastapi)
frontend_path = Path(__file__).parent.parent / "frontend"

# Montar arquivos estáticos
app.mount("/css", StaticFiles(directory=str(frontend_path / "css")), name="css")
app.mount("/js", StaticFiles(directory=str(frontend_path / "js")), name="js")
app.mount("/assets", StaticFiles(directory=str(frontend_path / "assets")), name="assets")
app.mount("/vendor", StaticFiles(directory=str(frontend_path / "vendor")), name="vendor")

# NOVO: Montar JSONs estáticos de listas (cache habilitado) - CORRIGIDO PARA NOVO CAMINHO
app.mount("/lists", StaticFiles(directory=str(frontend_path / "html" / "lists")), name="lists")

logger.info(f"📁 Frontend estático montado de: {frontend_path}")
logger.info(f"📂 JSONs de listas disponíveis em: /lists/")

# ============================================================
# REGISTRAR ROUTERS (MODULARIZADOS)
# ============================================================

app.include_router(health_router.router)    # GET /health, /info
app.include_router(submit_router.router)    # POST /api/submit-form
# app.include_router(lists_router.router)   # DEPRECATED: Substituído por JSONs estáticos em /lists/
app.include_router(analytics_router.router) # GET /api/analytics/*
app.include_router(external_router, prefix="/api/external", tags=["External APIs"])  # GET /api/external/cnpj/*

# ============================================================
# ROOT ENDPOINT - SERVIR INDEX.HTML
# ============================================================

@app.get("/")
async def root():
    """
    Serve o frontend (index.html)
    """
    index_path = frontend_path / "html" / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    else:
        # Redirecionar para /info se frontend não encontrado
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url="/info")

# ============================================================
# STARTUP EVENT
# ============================================================

@app.on_event("startup")
async def startup_event():
    """
    Executa ao iniciar a aplicação
    """
    logger.info("="*60)
    logger.info("🚀 PLI 2050 - API Sistema de Formulários v2.0.0")
    logger.info("="*60)
    logger.info("📡 Framework: FastAPI")
    logger.info("📊 Database: PostgreSQL (RDS AWS)")
    logger.info(f"🔒 CORS: {len(allowed_origins)} origens permitidas")
    logger.info("📚 Docs: http://localhost:8000/docs")
    logger.info("🏥 Health: http://localhost:8000/health")
    logger.info("📊 Analytics: http://localhost:8000/api/analytics/kpis")
    logger.info("="*60)

# ============================================================
# SHUTDOWN EVENT
# ============================================================

@app.on_event("shutdown")
async def shutdown_event():
    """
    Executa ao desligar a aplicação
    """
    logger.info("⏹️  Desligando API PLI 2050...")
    logger.info("✅ API finalizada")

