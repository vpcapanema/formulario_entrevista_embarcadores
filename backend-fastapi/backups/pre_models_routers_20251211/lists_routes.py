"""
Backup: app/routers/lists/routes.py (pre-recreate)
"""

# Original content saved for recovery

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["listas"])


@router.get("/estados")
async def get_estados_stub():
    return []


@router.get("/municipios")
async def get_municipios_stub(uf: str = None):
    return []


@router.get("/paises")
async def get_paises_stub():
    return []


@router.get("/instituicoes")
async def get_instituicoes_stub():
    return []


@router.get("/funcoes")
async def get_funcoes_stub():
    return []


@router.get("/entrevistadores")
async def get_entrevistadores_stub():
    return []
