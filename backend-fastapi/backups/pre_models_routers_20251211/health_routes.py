"""
Backup: app/routers/health/routes.py (pre-recreate)
"""

# Original content saved for recovery

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check_stub():
    return {"status": "OK", "database": "unknown", "timestamp": None}


@router.get("/info")
async def api_info():
    return {"api": "PLI 2050 - Sistema de Formulários", "status": "online"}
