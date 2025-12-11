"""
Backup: app/routers/analytics/routes.py (pre-recreate)
"""

# Original content saved for recovery (analytics routes were extensive)

from fastapi import APIRouter

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/kpis")
async def get_kpis_stub():
    return {"success": True, "data": {}}

@router.get("/distribuicao-modal")
async def get_distribuicao_modal_stub():
    return {"success": True, "data": {"labels": [], "values": [], "percentuais": []}}

@router.get("/produtos-top")
async def get_produtos_top_stub():
    return {"success": True, "data": {"labels": [], "values": [], "volumes": []}}
