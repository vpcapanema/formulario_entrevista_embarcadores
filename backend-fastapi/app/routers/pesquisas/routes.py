"""
============================================================
ROUTER: PESQUISAS - FastAPI PLI 2050
============================================================
Endpoints para listagem e visualização de pesquisas
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, func, desc
from typing import List, Optional
from app.database import get_db, SCHEMA_NAME
import logging

router = APIRouter(prefix="/api/pesquisas", tags=["pesquisas"])
logger = logging.getLogger(__name__)

# ============================================================
# SCHEMAS DE RESPOSTA
# ============================================================

from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

class PesquisaListItem(BaseModel):
    """Item da lista de pesquisas"""
    id_pesquisa: int
    nome_empresa: str
    nome_entrevistado: str
    produto_principal: str
    origem_municipio: str
    origem_estado: str
    destino_municipio: str
    destino_estado: str
    data_entrevista: datetime
    tipo_transporte: str
    distancia: float
    
    class Config:
        from_attributes = True

class PesquisaDetalhada(BaseModel):
    """Pesquisa completa com todos os campos"""
    # IDs
    id_pesquisa: int
    id_empresa: int
    id_entrevistado: int
    
    # Empresa
    nome_empresa: str
    tipo_empresa: str
    cnpj: Optional[str] = None
    municipio_empresa: str
    
    # Entrevistado
    nome_entrevistado: str
    funcao_entrevistado: str
    telefone_entrevistado: str
    email_entrevistado: str
    
    # Produto
    produto_principal: str
    agrupamento_produto: str
    outro_produto: Optional[str] = None
    
    # Transporte
    tipo_transporte: str
    origem_pais: str
    origem_estado: str
    origem_municipio: str
    destino_pais: str
    destino_estado: str
    destino_municipio: str
    distancia: float
    tem_paradas: str
    num_paradas: Optional[int] = None
    
    # Modais
    modos: List[str]
    config_veiculo: Optional[str] = None
    
    # Carga
    peso_carga: float
    unidade_peso: str
    custo_transporte: float
    valor_carga: float
    tipo_embalagem: str
    carga_perigosa: str
    capacidade_utilizada: Optional[float] = None
    
    # Tempo
    tempo_dias: int
    tempo_horas: int
    tempo_minutos: int
    frequencia: str
    frequencia_diaria: Optional[float] = None
    
    # Importâncias
    importancia_custo: str
    variacao_custo: float
    importancia_tempo: str
    variacao_tempo: float
    importancia_confiabilidade: str
    variacao_confiabilidade: float
    importancia_seguranca: str
    variacao_seguranca: float
    importancia_capacidade: str
    variacao_capacidade: float
    
    # Estratégia
    tipo_cadeia: str
    modais_alternativos: Optional[List[str]] = None
    fator_adicional: Optional[str] = None
    
    # Dificuldades
    dificuldades: Optional[List[str]] = None
    detalhe_dificuldade: Optional[str] = None
    
    # Observações
    observacoes: Optional[str] = None
    data_entrevista: datetime
    
    class Config:
        from_attributes = True

class ProdutoTransportado(BaseModel):
    """Produto transportado"""
    id_produto: int
    carga: str
    movimentacao: Optional[float] = None
    origem: Optional[str] = None
    destino: Optional[str] = None
    distancia: Optional[float] = None
    modalidade: Optional[str] = None
    acondicionamento: Optional[str] = None
    ordem: int
    
    class Config:
        from_attributes = True

# ============================================================
# ENDPOINTS
# ============================================================

@router.get("/listar", response_model=List[PesquisaListItem])
async def listar_pesquisas(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    offset: int = Query(0, ge=0, description="Deslocamento para paginação"),
    ordem: str = Query("desc", regex="^(asc|desc)$", description="Ordem de data")
):
    """
    Lista todas as pesquisas com informações resumidas
    
    **Paginação:**
    - limit: número máximo de registros (padrão: 100, máximo: 1000)
    - offset: deslocamento (padrão: 0)
    
    **Ordenação:**
    - ordem: 'asc' (mais antigas primeiro) ou 'desc' (mais recentes primeiro)
    """
    
    try:
        # Query otimizada usando a view v_pesquisas_completa
        sql = text(f"""
            SELECT 
                id_pesquisa,
                nome_empresa,
                nome_entrevistado,
                produto_principal,
                origem_municipio,
                origem_estado,
                destino_municipio,
                destino_estado,
                data_entrevista,
                tipo_transporte,
                distancia::FLOAT as distancia
            FROM {SCHEMA_NAME}.v_pesquisas_completa
            ORDER BY data_entrevista {ordem.upper()}
            LIMIT :limit OFFSET :offset
        """)
        
        result = db.execute(sql, {"limit": limit, "offset": offset})
        pesquisas = []
        
        for row in result:
            pesquisas.append(PesquisaListItem(
                id_pesquisa=row.id_pesquisa,
                nome_empresa=row.nome_empresa,
                nome_entrevistado=row.nome_entrevistado,
                produto_principal=row.produto_principal,
                origem_municipio=row.origem_municipio,
                origem_estado=row.origem_estado,
                destino_municipio=row.destino_municipio,
                destino_estado=row.destino_estado,
                data_entrevista=row.data_entrevista,
                tipo_transporte=row.tipo_transporte,
                distancia=row.distancia
            ))
        
        logger.info(f"✅ Listadas {len(pesquisas)} pesquisas (limit={limit}, offset={offset})")
        return pesquisas
    
    except Exception as e:
        logger.error(f"❌ Erro ao listar pesquisas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar pesquisas: {str(e)}"
        )

@router.get("/total")
async def contar_pesquisas(db: Session = Depends(get_db)):
    """
    Retorna o total de pesquisas cadastradas
    """
    
    try:
        sql = text(f"""
            SELECT COUNT(*) as total
            FROM {SCHEMA_NAME}.pesquisas
            WHERE status = 'finalizada'
        """)
        
        result = db.execute(sql).fetchone()
        total = result[0] if result else 0
        
        return {"total": total}
    
    except Exception as e:
        logger.error(f"❌ Erro ao contar pesquisas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao contar pesquisas: {str(e)}"
        )

@router.get("/{id_pesquisa}", response_model=PesquisaDetalhada)
async def obter_pesquisa(
    id_pesquisa: int,
    db: Session = Depends(get_db)
):
    """
    Obtém uma pesquisa específica com todos os detalhes
    """
    
    try:
        sql = text(f"""
            SELECT 
                p.id_pesquisa,
                p.id_empresa,
                p.id_entrevistado,
                
                -- Empresa
                e.nome_empresa,
                e.tipo_empresa,
                e.cnpj,
                e.municipio as municipio_empresa,
                
                -- Entrevistado
                ent.nome as nome_entrevistado,
                f.nome as funcao_entrevistado,
                ent.telefone as telefone_entrevistado,
                ent.email as email_entrevistado,
                
                -- Produto
                p.produto_principal,
                p.agrupamento_produto,
                p.outro_produto,
                
                -- Transporte
                p.tipo_transporte,
                p.origem_pais,
                p.origem_estado,
                p.origem_municipio,
                p.destino_pais,
                p.destino_estado,
                p.destino_municipio,
                p.distancia::FLOAT,
                p.tem_paradas,
                p.num_paradas,
                
                -- Modais
                p.modos,
                p.config_veiculo,
                
                -- Carga
                p.peso_carga::FLOAT,
                p.unidade_peso,
                p.custo_transporte::FLOAT,
                p.valor_carga::FLOAT,
                p.tipo_embalagem,
                p.carga_perigosa,
                p.capacidade_utilizada::FLOAT,
                
                -- Tempo
                p.tempo_dias,
                p.tempo_horas,
                p.tempo_minutos,
                p.frequencia,
                p.frequencia_diaria::FLOAT,
                
                -- Importâncias
                p.importancia_custo,
                p.variacao_custo::FLOAT,
                p.importancia_tempo,
                p.variacao_tempo::FLOAT,
                p.importancia_confiabilidade,
                p.variacao_confiabilidade::FLOAT,
                p.importancia_seguranca,
                p.variacao_seguranca::FLOAT,
                p.importancia_capacidade,
                p.variacao_capacidade::FLOAT,
                
                -- Estratégia
                p.tipo_cadeia,
                p.modais_alternativos,
                p.fator_adicional,
                
                -- Dificuldades
                p.dificuldades,
                p.detalhe_dificuldade,
                
                -- Observações
                p.observacoes,
                p.data_entrevista
                
            FROM {SCHEMA_NAME}.pesquisas p
            INNER JOIN {SCHEMA_NAME}.empresas e ON p.id_empresa = e.id_empresa
            INNER JOIN {SCHEMA_NAME}.entrevistados ent ON p.id_entrevistado = ent.id_entrevistado
            LEFT JOIN {SCHEMA_NAME}.funcoes_entrevistado f ON ent.id_funcao = f.id_funcao
            WHERE p.id_pesquisa = :id_pesquisa
        """)
        
        result = db.execute(sql, {"id_pesquisa": id_pesquisa}).fetchone()
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pesquisa {id_pesquisa} não encontrada"
            )
        
        # Converter row para dict
        pesquisa_dict = dict(result._mapping)
        
        logger.info(f"✅ Pesquisa {id_pesquisa} obtida com sucesso")
        return PesquisaDetalhada(**pesquisa_dict)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao obter pesquisa {id_pesquisa}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar pesquisa: {str(e)}"
        )

@router.get("/{id_pesquisa}/produtos", response_model=List[ProdutoTransportado])
async def obter_produtos(
    id_pesquisa: int,
    db: Session = Depends(get_db)
):
    """
    Obtém todos os produtos transportados de uma pesquisa
    """
    
    try:
        sql = text(f"""
            SELECT 
                id_produto,
                carga,
                movimentacao::FLOAT,
                origem,
                destino,
                distancia::FLOAT,
                modalidade,
                acondicionamento,
                ordem
            FROM {SCHEMA_NAME}.produtos_transportados
            WHERE id_pesquisa = :id_pesquisa
            ORDER BY ordem
        """)
        
        result = db.execute(sql, {"id_pesquisa": id_pesquisa})
        produtos = []
        
        for row in result:
            produtos.append(ProdutoTransportado(
                id_produto=row.id_produto,
                carga=row.carga,
                movimentacao=row.movimentacao,
                origem=row.origem,
                destino=row.destino,
                distancia=row.distancia,
                modalidade=row.modalidade,
                acondicionamento=row.acondicionamento,
                ordem=row.ordem
            ))
        
        logger.info(f"✅ {len(produtos)} produtos obtidos para pesquisa {id_pesquisa}")
        return produtos
    
    except Exception as e:
        logger.error(f"❌ Erro ao obter produtos da pesquisa {id_pesquisa}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar produtos: {str(e)}"
        )

@router.delete("/{id_pesquisa}")
async def deletar_pesquisa(
    id_pesquisa: int,
    db: Session = Depends(get_db)
):
    """
    Deleta uma pesquisa (CASCADE: deleta produtos também)
    """
    
    try:
        # Verificar se pesquisa existe
        check_sql = text(f"""
            SELECT id_pesquisa 
            FROM {SCHEMA_NAME}.pesquisas 
            WHERE id_pesquisa = :id_pesquisa
        """)
        
        exists = db.execute(check_sql, {"id_pesquisa": id_pesquisa}).fetchone()
        
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pesquisa {id_pesquisa} não encontrada"
            )
        
        # Deletar (CASCADE deleta produtos automaticamente)
        delete_sql = text(f"""
            DELETE FROM {SCHEMA_NAME}.pesquisas
            WHERE id_pesquisa = :id_pesquisa
        """)
        
        db.execute(delete_sql, {"id_pesquisa": id_pesquisa})
        db.commit()
        
        logger.info(f"✅ Pesquisa {id_pesquisa} deletada com sucesso")
        return {
            "success": True,
            "message": f"Pesquisa {id_pesquisa} deletada com sucesso"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro ao deletar pesquisa {id_pesquisa}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar pesquisa: {str(e)}"
        )
