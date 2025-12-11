"""
Backup: app/routers/external/__init__.py (pre-recreate)
"""

# Original content saved for recovery

# Router para consultas externas (Receita Federal, IBGE, etc)

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
import logging

from app.services.receita_federal import ReceitaFederalService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/cnpj/{cnpj}")
async def consultar_cnpj(cnpj: str) -> Dict[str, Any]:
    return {"success": False, "message": "Backup content"}


@router.get("/cnpj/{cnpj}/validar")
async def validar_cnpj(cnpj: str) -> Dict[str, Any]:
    return {"success": False, "message": "Backup content"}
