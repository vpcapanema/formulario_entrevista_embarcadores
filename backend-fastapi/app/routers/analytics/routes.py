"""
============================================================
ROUTER: ANALYTICS - FastAPI PLI 2050
============================================================
Endpoints para KPIs e gráficos calculados via SQL
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from app.database import get_db
from app.models import Pesquisa, ProdutoTransportado, Empresa
import logging

router = APIRouter(prefix="/api/analytics", tags=["analytics"])
logger = logging.getLogger(__name__)

# ============================================================
# KPIs PRINCIPAIS
# ============================================================

@router.get("/kpis")
async def get_kpis(db: Session = Depends(get_db)):
    """
    Retorna KPIs principais calculados via SQL:
    - Total de pesquisas
    - Total de empresas
    - Volume total transportado (toneladas)
    - Valor total de cargas (R$)
    - Distância média percorrida (km)
    """
    try:
        # Query SQL otimizada para calcular KPIs
        query = text("""
            SELECT
                COUNT(DISTINCT p.id_pesquisa) as total_pesquisas,
                COUNT(DISTINCT p.id_empresa) as total_empresas,
                COALESCE(SUM(p.peso_carga), 0) as volume_total,
                COALESCE(SUM(p.valor_carga), 0) as valor_total,
                COALESCE(AVG(p.distancia), 0) as distancia_media
            FROM formulario_embarcadores.pesquisas p
            WHERE p.status = 'finalizada'
        """)
        
        result = db.execute(query).fetchone()
        
        return {
            "success": True,
            "data": {
                "total_pesquisas": result[0] or 0,
                "total_empresas": result[1] or 0,
                "volume_total": float(result[2] or 0),
                "valor_total": float(result[3] or 0),
                "distancia_media": float(result[4] or 0)
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro ao calcular KPIs: {str(e)}")
        return {
            "success": False,
            "message": f"Erro ao calcular KPIs: {str(e)}"
        }

# ============================================================
# DISTRIBUIÇÃO POR MODAL
# ============================================================

@router.get("/distribuicao-modal")
async def get_distribuicao_modal(db: Session = Depends(get_db)):
    """
    Retorna distribuição de modais de transporte
    Formato: {labels: [...], values: [...], percentuais: [...]}
    """
    try:
        query = text("""
            SELECT
                modos as modal,
                COUNT(*) as quantidade,
                ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentual
            FROM formulario_embarcadores.pesquisas
            WHERE status = 'finalizada' AND modos IS NOT NULL
            GROUP BY modos
            ORDER BY quantidade DESC
        """)
        
        results = db.execute(query).fetchall()
        
        if not results:
            return {
                "success": True,
                "data": {
                    "labels": [],
                    "values": [],
                    "percentuais": []
                }
            }
        
        return {
            "success": True,
            "data": {
                "labels": [row[0] for row in results],
                "values": [row[1] for row in results],
                "percentuais": [float(row[2]) for row in results]
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro ao calcular distribuição modal: {str(e)}")
        return {
            "success": False,
            "message": f"Erro: {str(e)}"
        }

# ============================================================
# TOP ORIGENS E DESTINOS
# ============================================================

@router.get("/origem-destino")
async def get_origem_destino(db: Session = Depends(get_db)):
    """
    Retorna top 10 origens e destinos mais frequentes
    """
    try:
        # Top 10 origens
        query_origem = text("""
            SELECT
                origem_municipio || ' - ' || origem_estado as local,
                COUNT(*) as quantidade
            FROM formulario_embarcadores.pesquisas
            WHERE status = 'finalizada' AND origem_municipio IS NOT NULL
            GROUP BY origem_municipio, origem_estado
            ORDER BY quantidade DESC
            LIMIT 10
        """)
        
        # Top 10 destinos
        query_destino = text("""
            SELECT
                destino_municipio || ' - ' || destino_estado as local,
                COUNT(*) as quantidade
            FROM formulario_embarcadores.pesquisas
            WHERE status = 'finalizada' AND destino_municipio IS NOT NULL
            GROUP BY destino_municipio, destino_estado
            ORDER BY quantidade DESC
            LIMIT 10
        """)
        
        origens = db.execute(query_origem).fetchall()
        destinos = db.execute(query_destino).fetchall()
        
        return {
            "success": True,
            "data": {
                "origens": [
                    {"local": row[0], "quantidade": row[1]}
                    for row in origens
                ],
                "destinos": [
                    {"local": row[0], "quantidade": row[1]}
                    for row in destinos
                ]
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro ao calcular origem/destino: {str(e)}")
        return {
            "success": False,
            "message": f"Erro: {str(e)}"
        }

# ============================================================
# DISTRIBUIÇÃO POR TIPO DE TRANSPORTE
# ============================================================

@router.get("/tipo-transporte")
async def get_tipo_transporte(db: Session = Depends(get_db)):
    """
    Retorna distribuição por tipo de transporte
    Formato: {labels: [...], values: [...], percentuais: [...]}
    """
    try:
        query = text("""
            SELECT
                tipo_transporte,
                COUNT(*) as quantidade,
                ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentual
            FROM formulario_embarcadores.pesquisas
            WHERE status = 'finalizada' AND tipo_transporte IS NOT NULL
            GROUP BY tipo_transporte
            ORDER BY quantidade DESC
        """)
        
        results = db.execute(query).fetchall()
        
        if not results:
            return {
                "success": True,
                "data": {
                    "labels": [],
                    "values": [],
                    "percentuais": []
                }
            }
        
        return {
            "success": True,
            "data": {
                "labels": [row[0] for row in results],
                "values": [row[1] for row in results],
                "percentuais": [float(row[2]) for row in results]
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro ao calcular tipo transporte: {str(e)}")
        return {
            "success": False,
            "message": f"Erro: {str(e)}"
        }

# ============================================================
# PRODUTOS MAIS TRANSPORTADOS
# ============================================================

@router.get("/produtos-top")
async def get_produtos_top(db: Session = Depends(get_db)):
    """
    Retorna top 10 produtos mais transportados
    Formato: {labels: [...], values: [...], volumes: [...]}
    """
    try:
        query = text("""
            SELECT
                produto_principal,
                COUNT(*) as quantidade,
                SUM(peso_carga) as volume_total
            FROM formulario_embarcadores.pesquisas
            WHERE status = 'finalizada' AND produto_principal IS NOT NULL
            GROUP BY produto_principal
            ORDER BY quantidade DESC
            LIMIT 10
        """)
        
        results = db.execute(query).fetchall()
        
        if not results:
            return {
                "success": True,
                "data": {
                    "labels": [],
                    "values": [],
                    "volumes": []
                }
            }
        
        return {
            "success": True,
            "data": {
                "labels": [row[0] for row in results],
                "values": [row[1] for row in results],
                "volumes": [float(row[2] or 0) for row in results]
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro ao calcular produtos top: {str(e)}")
        return {
            "success": False,
            "message": f"Erro: {str(e)}"
        }

# ============================================================
# IMPORTÂNCIAS (PERCENTUAIS DE "MUITO IMPORTANTE")
# ============================================================

@router.get("/importancias")
async def get_importancias(db: Session = Depends(get_db)):
    """
    Retorna percentual de "muito importante" para cada fator
    Formato para gráfico radar: labels + datasets
    """
    try:
        query = text("""
            SELECT
                COUNT(*) FILTER (WHERE importancia_custo = 'muito-importante') * 100.0 / NULLIF(COUNT(*), 0) as custo_muito,
                COUNT(*) FILTER (WHERE importancia_custo = 'importante') * 100.0 / NULLIF(COUNT(*), 0) as custo_importante,
                COUNT(*) FILTER (WHERE importancia_tempo = 'muito-importante') * 100.0 / NULLIF(COUNT(*), 0) as tempo_muito,
                COUNT(*) FILTER (WHERE importancia_tempo = 'importante') * 100.0 / NULLIF(COUNT(*), 0) as tempo_importante,
                COUNT(*) FILTER (WHERE importancia_confiabilidade = 'muito-importante') * 100.0 / NULLIF(COUNT(*), 0) as confiab_muito,
                COUNT(*) FILTER (WHERE importancia_confiabilidade = 'importante') * 100.0 / NULLIF(COUNT(*), 0) as confiab_importante,
                COUNT(*) FILTER (WHERE importancia_seguranca = 'muito-importante') * 100.0 / NULLIF(COUNT(*), 0) as segur_muito,
                COUNT(*) FILTER (WHERE importancia_seguranca = 'importante') * 100.0 / NULLIF(COUNT(*), 0) as segur_importante,
                COUNT(*) FILTER (WHERE importancia_capacidade = 'muito-importante') * 100.0 / NULLIF(COUNT(*), 0) as capac_muito,
                COUNT(*) FILTER (WHERE importancia_capacidade = 'importante') * 100.0 / NULLIF(COUNT(*), 0) as capac_importante
            FROM formulario_embarcadores.pesquisas
            WHERE status = 'finalizada'
        """)
        
        result = db.execute(query).fetchone()
        
        return {
            "success": True,
            "data": {
                "labels": ["Custo", "Tempo", "Confiabilidade", "Segurança", "Capacidade"],
                "muito_importante": [
                    round(float(result[0] or 0), 1),  # Custo
                    round(float(result[2] or 0), 1),  # Tempo
                    round(float(result[4] or 0), 1),  # Confiabilidade
                    round(float(result[6] or 0), 1),  # Segurança
                    round(float(result[8] or 0), 1)   # Capacidade
                ],
                "importante": [
                    round(float(result[1] or 0), 1),  # Custo
                    round(float(result[3] or 0), 1),  # Tempo
                    round(float(result[5] or 0), 1),  # Confiabilidade
                    round(float(result[7] or 0), 1),  # Segurança
                    round(float(result[9] or 0), 1)   # Capacidade
                ]
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro ao calcular importâncias: {str(e)}")
        return {
            "success": False,
            "message": f"Erro: {str(e)}"
        }

# ============================================================
# FREQUÊNCIA DE TRANSPORTES
# ============================================================

@router.get("/frequencia")
async def get_frequencia(db: Session = Depends(get_db)):
    """
    Retorna distribuição de frequências de transporte
    Formato: {labels: [...], values: [...], percentuais: [...]}
    """
    try:
        query = text("""
            SELECT
                frequencia,
                COUNT(*) as quantidade,
                ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentual
            FROM formulario_embarcadores.pesquisas
            WHERE status = 'finalizada' AND frequencia IS NOT NULL
            GROUP BY frequencia
            ORDER BY quantidade DESC
        """)
        
        results = db.execute(query).fetchall()
        
        if not results:
            return {
                "success": True,
                "data": {
                    "labels": [],
                    "values": [],
                    "percentuais": []
                }
            }
        
        return {
            "success": True,
            "data": {
                "labels": [row[0] for row in results],
                "values": [row[1] for row in results],
                "percentuais": [float(row[2]) for row in results]
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro ao calcular frequência: {str(e)}")
        return {
            "success": False,
            "message": f"Erro: {str(e)}"
        }

# ============================================================
# DIFICULDADES REPORTADAS
# ============================================================

@router.get("/dificuldades")
async def get_dificuldades(db: Session = Depends(get_db)):
    """
    Retorna dificuldades mais reportadas
    Formato: {labels: [...], values: [...], percentuais: [...]}
    """
    try:
        query = text("""
            SELECT
                dificuldades,
                COUNT(*) as quantidade,
                ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentual
            FROM formulario_embarcadores.pesquisas
            WHERE status = 'finalizada' AND dificuldades IS NOT NULL
            GROUP BY dificuldades
            ORDER BY quantidade DESC
        """)
        
        results = db.execute(query).fetchall()
        
        if not results:
            return {
                "success": True,
                "data": {
                    "labels": [],
                    "values": [],
                    "percentuais": []
                }
            }
        
        return {
            "success": True,
            "data": {
                "labels": [row[0] for row in results],
                "values": [row[1] for row in results],
                "percentuais": [float(row[2]) for row in results]
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro ao calcular dificuldades: {str(e)}")
        return {
            "success": False,
            "message": f"Erro: {str(e)}"
        }
