"""
Analytics Routes - Endpoints para Dashboard Analytics
Foco em variáveis NUMÉRICAS: distancia, custo_transporte, valor_carga, peso_carga, capacidade_utilizada
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

from app.database import get_db

# Logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


# ============================================================
# KPIs - Indicadores Principais (NUMÉRICOS)
# ============================================================

@router.get("/kpis")
async def get_kpis(db: Session = Depends(get_db)):
    """
    Retorna KPIs principais com métricas NUMÉRICAS
    """
    try:
        query = text("""
            SELECT
                COUNT(*) as total_pesquisas,
                COUNT(DISTINCT empresa_razao_social) as total_empresas,
                COALESCE(SUM(peso_carga), 0) as volume_total_kg,
                COALESCE(SUM(custo_transporte), 0) as custo_total,
                COALESCE(AVG(distancia), 0) as distancia_media,
                COALESCE(AVG(capacidade_utilizada), 0) as capacidade_media,
                COALESCE(AVG(custo_transporte), 0) as custo_medio,
                COALESCE(SUM(valor_carga), 0) as valor_total_carga
            FROM formulario_embarcadores.v_pesquisas_completa
        """)
        
        result = db.execute(query).fetchone()
        
        return {
            "success": True,
            "data": {
                "total_pesquisas": result[0] or 0,
                "total_empresas": result[1] or 0,
                "volume_total_kg": round(float(result[2] or 0), 1),
                "custo_total": round(float(result[3] or 0), 2),
                "distancia_media": round(float(result[4] or 0), 1),
                "capacidade_media": round(float(result[5] or 0), 1),
                "custo_medio": round(float(result[6] or 0), 2),
                "valor_total_carga": round(float(result[7] or 0), 2)
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro KPIs: {str(e)}")
        return {"success": False, "message": str(e), "data": {}}


# ============================================================
# GRÁFICO 1: Volume (Peso) por Produto
# ============================================================

@router.get("/volume-por-produto")
async def get_volume_por_produto(limit: int = Query(10, ge=1, le=20), db: Session = Depends(get_db)):
    """
    Soma de peso_carga agrupado por produto_principal
    Gráfico de barras horizontais
    """
    try:
        query = text("""
            SELECT 
                COALESCE(produto_principal, 'Não informado') as produto,
                SUM(COALESCE(peso_carga, 0)) as volume_total,
                COUNT(*) as num_viagens,
                AVG(COALESCE(peso_carga, 0)) as media_por_viagem
            FROM formulario_embarcadores.v_pesquisas_completa
            WHERE peso_carga IS NOT NULL AND peso_carga > 0
            GROUP BY produto_principal
            ORDER BY volume_total DESC
            LIMIT :limit
        """)
        
        results = db.execute(query, {"limit": limit}).fetchall()
        
        if not results:
            return {"success": True, "data": {"labels": [], "volumes": [], "viagens": []}}
        
        return {
            "success": True,
            "data": {
                "labels": [r[0] for r in results],
                "volumes": [round(float(r[1] or 0), 1) for r in results],
                "viagens": [r[2] for r in results],
                "medias": [round(float(r[3] or 0), 1) for r in results]
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro volume por produto: {str(e)}")
        return {"success": False, "message": str(e), "data": {"labels": [], "volumes": []}}


# ============================================================
# GRÁFICO 2: Custo Total por Estado de Origem
# ============================================================

@router.get("/custo-por-estado")
async def get_custo_por_estado(limit: int = Query(10, ge=1, le=27), db: Session = Depends(get_db)):
    """
    Soma de custo_transporte agrupado por estado de origem
    Gráfico de barras verticais
    """
    try:
        query = text("""
            SELECT 
                COALESCE(origem_estado_nome, 'Não informado') as estado,
                SUM(COALESCE(custo_transporte, 0)) as custo_total,
                COUNT(*) as num_viagens,
                AVG(COALESCE(custo_transporte, 0)) as custo_medio
            FROM formulario_embarcadores.v_pesquisas_completa
            WHERE custo_transporte IS NOT NULL AND custo_transporte > 0
            GROUP BY origem_estado_nome
            ORDER BY custo_total DESC
            LIMIT :limit
        """)
        
        results = db.execute(query, {"limit": limit}).fetchall()
        
        if not results:
            return {"success": True, "data": {"labels": [], "custos": [], "medios": []}}
        
        return {
            "success": True,
            "data": {
                "labels": [r[0] for r in results],
                "custos": [round(float(r[1] or 0), 2) for r in results],
                "viagens": [r[2] for r in results],
                "medios": [round(float(r[3] or 0), 2) for r in results]
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro custo por estado: {str(e)}")
        return {"success": False, "message": str(e), "data": {"labels": [], "custos": []}}


# ============================================================
# GRÁFICO 3: Distribuição de Distância (Histograma)
# ============================================================

@router.get("/distribuicao-distancia")
async def get_distribuicao_distancia(db: Session = Depends(get_db)):
    """
    Histograma de distâncias em faixas
    """
    try:
        query = text("""
            WITH faixas AS (
                SELECT 
                    CASE 
                        WHEN distancia < 100 THEN '0-100 km'
                        WHEN distancia >= 100 AND distancia < 300 THEN '100-300 km'
                        WHEN distancia >= 300 AND distancia < 500 THEN '300-500 km'
                        WHEN distancia >= 500 AND distancia < 1000 THEN '500-1000 km'
                        WHEN distancia >= 1000 AND distancia < 2000 THEN '1000-2000 km'
                        ELSE '2000+ km'
                    END as faixa,
                    CASE 
                        WHEN distancia < 100 THEN 1
                        WHEN distancia >= 100 AND distancia < 300 THEN 2
                        WHEN distancia >= 300 AND distancia < 500 THEN 3
                        WHEN distancia >= 500 AND distancia < 1000 THEN 4
                        WHEN distancia >= 1000 AND distancia < 2000 THEN 5
                        ELSE 6
                    END as ordem,
                    distancia,
                    custo_transporte
                FROM formulario_embarcadores.v_pesquisas_completa
                WHERE distancia IS NOT NULL AND distancia > 0
            )
            SELECT 
                faixa,
                COUNT(*) as quantidade,
                AVG(distancia) as media_faixa,
                SUM(custo_transporte) as custo_faixa,
                ordem
            FROM faixas
            GROUP BY faixa, ordem
            ORDER BY ordem
        """)
        
        results = db.execute(query).fetchall()
        
        # Garantir todas as faixas existam
        faixas_ordem = ['0-100 km', '100-300 km', '300-500 km', '500-1000 km', '1000-2000 km', '2000+ km']
        dados_dict = {r[0]: {"qtd": r[1], "media": r[2], "custo": r[3]} for r in results}
        
        labels = faixas_ordem
        quantidades = [dados_dict.get(f, {"qtd": 0})["qtd"] for f in faixas_ordem]
        medias = [round(float(dados_dict.get(f, {"media": 0})["media"] or 0), 1) for f in faixas_ordem]
        custos = [round(float(dados_dict.get(f, {"custo": 0})["custo"] or 0), 2) for f in faixas_ordem]
        
        return {
            "success": True,
            "data": {
                "labels": labels,
                "quantidades": quantidades,
                "medias": medias,
                "custos": custos
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro distribuição distância: {str(e)}")
        return {"success": False, "message": str(e), "data": {"labels": [], "quantidades": []}}


# ============================================================
# GRÁFICO 4: Capacidade Utilizada por Modal
# ============================================================

@router.get("/capacidade-por-modal")
async def get_capacidade_por_modal(db: Session = Depends(get_db)):
    """
    Média de capacidade_utilizada por modal de transporte
    """
    try:
        query = text("""
            SELECT 
                UNNEST(modos) as modal,
                AVG(COALESCE(capacidade_utilizada, 0)) as capacidade_media,
                COUNT(*) as num_viagens,
                SUM(COALESCE(peso_carga, 0)) as volume_total
            FROM formulario_embarcadores.v_pesquisas_completa
            WHERE modos IS NOT NULL AND capacidade_utilizada IS NOT NULL
            GROUP BY modal
            ORDER BY capacidade_media DESC
        """)
        
        results = db.execute(query).fetchall()
        
        if not results:
            return {"success": True, "data": {"labels": [], "capacidades": [], "viagens": []}}
        
        # Mapear nomes amigáveis
        nomes_modal = {
            'rodoviario': 'Rodoviário',
            'ferroviario': 'Ferroviário',
            'aquaviario': 'Aquaviário',
            'aereo': 'Aéreo',
            'dutoviario': 'Dutoviário'
        }
        
        return {
            "success": True,
            "data": {
                "labels": [nomes_modal.get(r[0], r[0]) for r in results],
                "capacidades": [round(float(r[1] or 0), 1) for r in results],
                "viagens": [r[2] for r in results],
                "volumes": [round(float(r[3] or 0), 1) for r in results]
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro capacidade por modal: {str(e)}")
        return {"success": False, "message": str(e), "data": {"labels": [], "capacidades": []}}


# ============================================================
# GRÁFICO 5: Custo vs Distância (Scatter Plot)
# ============================================================

@router.get("/custo-distancia")
async def get_custo_distancia(db: Session = Depends(get_db)):
    """
    Dados para scatter plot: custo_transporte vs distancia
    """
    try:
        query = text("""
            SELECT 
                distancia,
                custo_transporte,
                produto_principal,
                empresa_razao_social,
                CASE WHEN distancia > 0 THEN custo_transporte / distancia ELSE 0 END as custo_por_km
            FROM formulario_embarcadores.v_pesquisas_completa
            WHERE distancia IS NOT NULL 
              AND distancia > 0
              AND custo_transporte IS NOT NULL 
              AND custo_transporte > 0
            ORDER BY distancia
            LIMIT 100
        """)
        
        results = db.execute(query).fetchall()
        
        if not results:
            return {"success": True, "data": {"pontos": [], "custo_medio_por_km": 0}}
        
        pontos = []
        for r in results:
            pontos.append({
                "x": float(r[0]),
                "y": float(r[1]),
                "produto": r[2] or "N/A",
                "empresa": r[3] or "N/A",
                "custo_km": round(float(r[4] or 0), 2)
            })
        
        # Estatísticas
        total_custo = sum(p["y"] for p in pontos)
        total_dist = sum(p["x"] for p in pontos)
        custo_por_km = total_custo / total_dist if total_dist > 0 else 0
        
        return {
            "success": True,
            "data": {
                "pontos": pontos,
                "custo_medio_por_km": round(custo_por_km, 2),
                "total_registros": len(pontos),
                "distancia_total": round(total_dist, 1),
                "custo_total": round(total_custo, 2)
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro custo-distancia: {str(e)}")
        return {"success": False, "message": str(e), "data": {"pontos": []}}


# ============================================================
# GRÁFICO 6: Valor de Carga por Tipo de Transporte
# ============================================================

@router.get("/valor-por-tipo")
async def get_valor_por_tipo(db: Session = Depends(get_db)):
    """
    Soma de valor_carga por tipo_transporte (local/importação/exportação)
    """
    try:
        query = text("""
            SELECT 
                tipo_transporte,
                SUM(COALESCE(valor_carga, 0)) as valor_total,
                COUNT(*) as num_viagens,
                AVG(COALESCE(valor_carga, 0)) as valor_medio,
                SUM(COALESCE(peso_carga, 0)) as volume_total
            FROM formulario_embarcadores.v_pesquisas_completa
            WHERE tipo_transporte IS NOT NULL AND valor_carga > 0
            GROUP BY tipo_transporte
            ORDER BY valor_total DESC
        """)
        
        results = db.execute(query).fetchall()
        
        if not results:
            return {"success": True, "data": {"labels": [], "valores": [], "viagens": []}}
        
        nomes = {
            'local': 'Transporte Local',
            'importacao': 'Importação',
            'exportacao': 'Exportação'
        }
        
        return {
            "success": True,
            "data": {
                "labels": [nomes.get(r[0], r[0]) for r in results],
                "valores": [round(float(r[1] or 0), 2) for r in results],
                "viagens": [r[2] for r in results],
                "medios": [round(float(r[3] or 0), 2) for r in results],
                "volumes": [round(float(r[4] or 0), 1) for r in results]
            }
        }
    except Exception as e:
        logger.error(f"❌ Erro valor por tipo: {str(e)}")
        return {"success": False, "message": str(e), "data": {"labels": [], "valores": []}}


# ============================================================
# ENDPOINTS LEGADOS (manter compatibilidade)
# ============================================================

@router.get("/distribuicao-modal")
async def get_distribuicao_modal(db: Session = Depends(get_db)):
    """Distribuição por modal (compatibilidade)"""
    try:
        query = text("""
            SELECT UNNEST(modos) as modal, COUNT(*) as quantidade
            FROM formulario_embarcadores.v_pesquisas_completa
            WHERE modos IS NOT NULL
            GROUP BY modal ORDER BY quantidade DESC
        """)
        results = db.execute(query).fetchall()
        if not results:
            return {"success": True, "data": {"labels": [], "values": [], "percentuais": []}}
        total = sum(r[1] for r in results)
        return {
            "success": True,
            "data": {
                "labels": [r[0] for r in results],
                "values": [r[1] for r in results],
                "percentuais": [round(100 * r[1] / total, 1) for r in results]
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e), "data": {"labels": [], "values": []}}


@router.get("/produtos-top")
async def get_produtos_top(limit: int = Query(10), db: Session = Depends(get_db)):
    """Top produtos (compatibilidade)"""
    try:
        query = text("""
            SELECT produto_principal, COUNT(*) as quantidade, SUM(peso_carga) as volume
            FROM formulario_embarcadores.v_pesquisas_completa
            WHERE produto_principal IS NOT NULL
            GROUP BY produto_principal ORDER BY quantidade DESC LIMIT :limit
        """)
        results = db.execute(query, {"limit": limit}).fetchall()
        return {
            "success": True,
            "data": {
                "labels": [r[0] for r in results],
                "values": [r[1] for r in results],
                "volumes": [float(r[2] or 0) for r in results]
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e), "data": {"labels": [], "values": []}}


@router.get("/importancias")
async def get_importancias(db: Session = Depends(get_db)):
    """Importância dos fatores (compatibilidade)"""
    try:
        query = text("""
            SELECT
                COUNT(*) FILTER (WHERE importancia_custo IN ('muito-alta', 'muito-importante')) * 100.0 / NULLIF(COUNT(*), 0),
                COUNT(*) FILTER (WHERE importancia_tempo IN ('muito-alta', 'muito-importante')) * 100.0 / NULLIF(COUNT(*), 0),
                COUNT(*) FILTER (WHERE importancia_confiabilidade IN ('muito-alta', 'muito-importante')) * 100.0 / NULLIF(COUNT(*), 0),
                COUNT(*) FILTER (WHERE importancia_seguranca IN ('muito-alta', 'muito-importante')) * 100.0 / NULLIF(COUNT(*), 0),
                COUNT(*) FILTER (WHERE importancia_capacidade IN ('muito-alta', 'muito-importante')) * 100.0 / NULLIF(COUNT(*), 0)
            FROM formulario_embarcadores.v_pesquisas_completa
        """)
        result = db.execute(query).fetchone()
        return {
            "success": True,
            "data": {
                "labels": ["Custo", "Tempo", "Confiabilidade", "Segurança", "Capacidade"],
                "muito_importante": [round(float(result[i] or 0), 1) for i in range(5)]
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e), "data": {"labels": [], "muito_importante": []}}


@router.get("/dificuldades")
async def get_dificuldades(db: Session = Depends(get_db)):
    """Dificuldades reportadas (compatibilidade)"""
    try:
        query = text("""
            SELECT UNNEST(dificuldades) as dificuldade, COUNT(*) as quantidade
            FROM formulario_embarcadores.v_pesquisas_completa
            WHERE dificuldades IS NOT NULL
            GROUP BY dificuldade ORDER BY quantidade DESC
        """)
        results = db.execute(query).fetchall()
        if not results:
            return {"success": True, "data": {"labels": [], "values": [], "percentuais": []}}
        total = sum(r[1] for r in results)
        return {
            "success": True,
            "data": {
                "labels": [r[0] for r in results],
                "values": [r[1] for r in results],
                "percentuais": [round(100 * r[1] / total, 1) for r in results]
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e), "data": {"labels": [], "values": []}}


@router.get("/estados")
async def get_estados(db: Session = Depends(get_db)):
    """Fluxo por estados (compatibilidade)"""
    try:
        query_origem = text("""
            SELECT origem_estado_nome, COUNT(*), SUM(custo_transporte) as custo
            FROM formulario_embarcadores.v_pesquisas_completa
            WHERE origem_estado_nome IS NOT NULL 
            GROUP BY origem_estado_nome ORDER BY COUNT(*) DESC LIMIT 10
        """)
        query_destino = text("""
            SELECT destino_estado_nome, COUNT(*), SUM(custo_transporte) as custo
            FROM formulario_embarcadores.v_pesquisas_completa
            WHERE destino_estado_nome IS NOT NULL 
            GROUP BY destino_estado_nome ORDER BY COUNT(*) DESC LIMIT 10
        """)
        origens = db.execute(query_origem).fetchall()
        destinos = db.execute(query_destino).fetchall()
        return {
            "success": True,
            "data": {
                "origens": {
                    "labels": [r[0] for r in origens],
                    "values": [r[1] for r in origens],
                    "custos": [float(r[2] or 0) for r in origens]
                },
                "destinos": {
                    "labels": [r[0] for r in destinos],
                    "values": [r[1] for r in destinos],
                    "custos": [float(r[2] or 0) for r in destinos]
                }
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e), "data": {"origens": {}, "destinos": {}}}
