"""
============================================================
PESQUISAS ROUTER - Listagem e Visualização de Dados
============================================================
Endpoints para listar e visualizar dados da VIEW v_pesquisas_completa
IMPLEMENTAÇÃO REAL - Sem fallbacks ou mocks
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/pesquisas", tags=["pesquisas"])


@router.get("/listar")
async def listar_pesquisas(
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    offset: int = Query(0, ge=0, description="Offset para paginação"),
    db: Session = Depends(get_db)
):
    """
    Lista todas as pesquisas usando a VIEW v_pesquisas_completa
    Retorna dados REAIS do banco PostgreSQL (sem mocks/fallbacks)
    """
    try:
        # Query na VIEW completa
        query = text("""
            SELECT * FROM formulario_embarcadores.v_pesquisas_completa
            ORDER BY id_pesquisa DESC
            LIMIT :limit OFFSET :offset
        """)
        
        result = db.execute(query, {"limit": limit, "offset": offset})
        
        # Obter nomes das colunas
        columns = result.keys()
        
        # Converter para lista de dicionários
        data = []
        for row in result.fetchall():
            row_dict = {}
            for i, col in enumerate(columns):
                value = row[i]
                # Converter tipos especiais para JSON-serializable
                if hasattr(value, 'isoformat'):  # datetime
                    value = value.isoformat()
                elif isinstance(value, (list, tuple)):
                    value = list(value)
                row_dict[col] = value
            data.append(row_dict)
        
        # Contar total
        count_query = text("""
            SELECT COUNT(*) FROM formulario_embarcadores.v_pesquisas_completa
        """)
        total = db.execute(count_query).scalar()
        
        logger.info(f"✅ Listadas {len(data)} pesquisas (total: {total})")
        
        return {
            "success": True,
            "data": data,
            "pesquisas": data,  # Alias para compatibilidade com frontend
            "total": total,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"❌ Erro ao listar pesquisas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar pesquisas: {str(e)}")


@router.get("/estatisticas")
async def obter_estatisticas(db: Session = Depends(get_db)):
    """
    Retorna estatísticas gerais das pesquisas
    """
    try:
        query = text("""
            SELECT 
                COUNT(*) as total_pesquisas,
                COUNT(DISTINCT id_empresa) as total_empresas,
                COUNT(DISTINCT produto_principal) as total_produtos,
                COUNT(DISTINCT origem_estado_uf) as total_estados_origem,
                COUNT(DISTINCT destino_estado_uf) as total_estados_destino,
                AVG(distancia) as distancia_media,
                AVG(custo_transporte) as custo_medio,
                AVG(peso_carga) as peso_medio
            FROM formulario_embarcadores.v_pesquisas_completa
        """)
        
        result = db.execute(query).fetchone()
        
        return {
            "success": True,
            "data": {
                "total_pesquisas": result[0] or 0,
                "total_empresas": result[1] or 0,
                "total_produtos": result[2] or 0,
                "total_estados_origem": result[3] or 0,
                "total_estados_destino": result[4] or 0,
                "distancia_media": round(float(result[5] or 0), 2),
                "custo_medio": round(float(result[6] or 0), 2),
                "peso_medio": round(float(result[7] or 0), 2)
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Erro ao obter estatísticas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id_pesquisa}")
async def obter_pesquisa(id_pesquisa: int, db: Session = Depends(get_db)):
    """
    Retorna dados completos de uma pesquisa específica
    """
    try:
        query = text("""
            SELECT * FROM formulario_embarcadores.v_pesquisas_completa
            WHERE id_pesquisa = :id_pesquisa
        """)
        
        result = db.execute(query, {"id_pesquisa": id_pesquisa})
        columns = result.keys()
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Pesquisa {id_pesquisa} não encontrada")
        
        # Converter para dicionário
        data = {}
        for i, col in enumerate(columns):
            value = row[i]
            if hasattr(value, 'isoformat'):
                value = value.isoformat()
            elif isinstance(value, (list, tuple)):
                value = list(value)
            data[col] = value
        
        return {"success": True, "data": data}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao obter pesquisa {id_pesquisa}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id_pesquisa}")
async def deletar_pesquisa(id_pesquisa: int, db: Session = Depends(get_db)):
    """
    Deleta uma pesquisa e seus produtos relacionados
    """
    try:
        # Verificar se existe
        check_query = text("""
            SELECT id_pesquisa FROM formulario_embarcadores.pesquisas
            WHERE id_pesquisa = :id_pesquisa
        """)
        exists = db.execute(check_query, {"id_pesquisa": id_pesquisa}).fetchone()
        
        if not exists:
            raise HTTPException(status_code=404, detail=f"Pesquisa {id_pesquisa} não encontrada")
        
        # Deletar produtos relacionados primeiro (FK)
        db.execute(
            text("DELETE FROM formulario_embarcadores.produtos_transportados WHERE id_pesquisa = :id"),
            {"id": id_pesquisa}
        )
        
        # Deletar pesquisa
        db.execute(
            text("DELETE FROM formulario_embarcadores.pesquisas WHERE id_pesquisa = :id"),
            {"id": id_pesquisa}
        )
        
        db.commit()
        
        logger.info(f"✅ Pesquisa {id_pesquisa} deletada com sucesso")
        
        return {"success": True, "message": f"Pesquisa {id_pesquisa} deletada com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao deletar pesquisa {id_pesquisa}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
