"""
Backup: app/routers/pesquisas/routes.py (pre-recreate)
"""

# Original content saved for recovery

from fastapi import APIRouter

router = APIRouter(prefix="/api/pesquisas", tags=["pesquisas"])


@router.get("/listar")
async def listar_pesquisas_stub():
    return {"success": True, "data": [], "total": 0}


@router.get("/{id_pesquisa}")
async def obter_pesquisa_stub(id_pesquisa: int):
    return {"id_pesquisa": id_pesquisa, "message": "endpoint temporário"}


@router.delete("/{id_pesquisa}")
async def deletar_pesquisa_stub(id_pesquisa: int):
    return {"success": True, "message": f"Pesquisa {id_pesquisa} (stub) deletada"}
