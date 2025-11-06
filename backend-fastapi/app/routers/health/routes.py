"""
============================================================
ROUTER: HEALTH & INFO - FastAPI PLI 2050
============================================================
Endpoints de saúde e informações da API
"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import logging

from app.database import get_db

router = APIRouter(tags=["health"])
logger = logging.getLogger(__name__)

# ============================================================
# HEALTH CHECK
# ============================================================

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint - verifica status da API e conexão com banco
    
    Returns:
        200: API online e banco conectado
        503: Erro na conexão com banco
    """
    try:
        # Testar conexão com banco
        db.execute(text("SELECT 1"))
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "OK",
                "timestamp": datetime.now().isoformat(),
                "database": "Connected",
                "message": "API está online e conectada ao banco de dados"
            }
        )
    except Exception as e:
        logger.error(f"❌ Health check falhou: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "ERROR",
                "timestamp": datetime.now().isoformat(),
                "database": "Disconnected",
                "message": f"Erro na conexão: {str(e)}"
            }
        )

# ============================================================
# INFO DA API
# ============================================================

@router.get("/info")
async def api_info():
    """
    Retorna informações sobre a API e endpoints disponíveis
    """
    return {
        "api": "PLI 2050 - Sistema de Formulários",
        "version": "2.0.0",
        "framework": "FastAPI",
        "status": "online",
        "endpoints": {
            "health": "/health",
            "info": "/info",
            "docs": "/docs",
            "redoc": "/redoc",
            "submit_form": "/api/submit-form",
            "listas": {
                "estados": "/api/estados",
                "municipios": "/api/municipios",
                "paises": "/api/paises",
                "instituicoes": "/api/instituicoes",
                "funcoes": "/api/funcoes",
                "entrevistadores": "/api/entrevistadores"
            },
            "analytics": {
                "kpis": "/api/analytics/kpis",
                "distribuicao_modal": "/api/analytics/distribuicao-modal",
                "origem_destino": "/api/analytics/origem-destino"
            }
        },
        "timestamp": datetime.now().isoformat()
    }
