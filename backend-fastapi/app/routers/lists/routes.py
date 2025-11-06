"""
============================================================
ROUTER: LISTAS AUXILIARES - FastAPI PLI 2050
============================================================
Endpoints GET para popular dropdowns do frontend
Com cache para otimizar performance
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    EstadoBrasil, Pais, MunicipioSP, MunicipioBrasil,
    Instituicao, FuncaoEntrevistado, Entrevistador
)
from functools import lru_cache
import logging

router = APIRouter(prefix="/api", tags=["listas"])
logger = logging.getLogger(__name__)

# ============================================================
# CACHE GLOBAL (em memória)
# ============================================================
# Cache das listas auxiliares que mudam pouco
# Evita queries repetidas ao banco
_municipios_cache = {}  # {uf: [municipios]}

# ============================================================
# ESTADOS
# ============================================================

@router.get("/estados")
async def get_estados(db: Session = Depends(get_db)):
    """Retorna todos os estados do Brasil ordenados por nome"""
    estados = db.query(EstadoBrasil).order_by(EstadoBrasil.nome_estado).all()
    return [
        {
            "id_estado": e.id_estado,
            "uf": e.uf,
            "nome_estado": e.nome_estado,
            "regiao": e.regiao
        }
        for e in estados
    ]

# ============================================================
# MUNICÍPIOS DO BRASIL (com filtro por UF + cache)
# ============================================================

@router.get("/municipios")
async def get_municipios(
    uf: str = Query(None, description="Filtro por UF (ex: SP, RJ, MG). Se omitido, retorna TODOS (5570+)"),
    db: Session = Depends(get_db)
):
    """
    Retorna municípios do Brasil ordenados por nome
    
    **RECOMENDADO**: Sempre usar filtro `?uf=SP` para evitar lista gigante
    
    **Performance**:
    - Com filtro: ~50-200 municípios (rápido)
    - Sem filtro: 5570 municípios (lento, evitar no frontend)
    
    **Cache**: Resultados são cacheados em memória para UFs já consultadas
    
    **Exemplos**:
    - `/api/municipios?uf=SP` → 645 municípios de São Paulo
    - `/api/municipios?uf=RJ` → 92 municípios do Rio de Janeiro
    - `/api/municipios` → TODOS (não recomendado para dropdowns)
    """
    
    # Verificar cache primeiro
    if uf and uf in _municipios_cache:
        logger.info(f"✅ Cache HIT para UF={uf} ({len(_municipios_cache[uf])} municípios)")
        return _municipios_cache[uf]
    
    # Query no banco
    query = db.query(MunicipioBrasil)
    
    if uf:
        # Filtrar por UF (RECOMENDADO)
        query = query.filter(MunicipioBrasil.uf == uf.upper())
        logger.info(f"🔍 Consultando municípios de {uf.upper()}")
    else:
        # TODOS os municípios (5570+) - EVITAR em produção
        logger.warning("⚠️ Consultando TODOS os 5570 municípios (sem filtro UF) - Performance degradada!")
    
    municipios = query.order_by(MunicipioBrasil.nome_municipio).all()
    
    resultado = [
        {
            "codigo_municipio": m.codigo_municipio,  # Código IBGE (7 dígitos)
            "nome_municipio": m.nome_municipio,
            "uf": m.uf,
            "nome_uf": m.nome_uf
        }
        for m in municipios
    ]
    
    # Salvar no cache se for consulta por UF
    if uf:
        _municipios_cache[uf.upper()] = resultado
        logger.info(f"💾 Cache salvo para UF={uf.upper()} ({len(resultado)} municípios)")
    
    return resultado

# ============================================================
# PAÍSES
# ============================================================

@router.get("/paises")
async def get_paises(db: Session = Depends(get_db)):
    """Retorna todos os países ordenados por relevância e nome"""
    paises = db.query(Pais).order_by(Pais.relevancia.desc(), Pais.nome_pais).all()
    return [
        {
            "id_pais": p.id_pais,
            "nome_pais": p.nome_pais,
            "codigo_iso2": p.codigo_iso2,
            "codigo_iso3": p.codigo_iso3,
            "relevancia": p.relevancia
        }
        for p in paises
    ]

# ============================================================
# INSTITUIÇÕES
# ============================================================

@router.get("/instituicoes")
async def get_instituicoes(db: Session = Depends(get_db)):
    """Retorna todas as instituições ordenadas por nome"""
    instituicoes = db.query(Instituicao).order_by(Instituicao.nome_instituicao).all()
    return [
        {
            "id_instituicao": i.id_instituicao,
            "nome_instituicao": i.nome_instituicao,
            "tipo_instituicao": i.tipo_instituicao,
            "cnpj": i.cnpj
        }
        for i in instituicoes
    ]

# ============================================================
# FUNÇÕES/CARGOS DE ENTREVISTADOS
# ============================================================

@router.get("/funcoes")
async def get_funcoes(db: Session = Depends(get_db)):
    """Retorna todas as funções disponíveis ordenadas por nome"""
    funcoes = db.query(FuncaoEntrevistado).order_by(FuncaoEntrevistado.nome_funcao).all()
    return [
        {
            "id_funcao": f.id_funcao,
            "nome_funcao": f.nome_funcao
        }
        for f in funcoes
    ]

# ============================================================
# ENTREVISTADORES
# ============================================================

@router.get("/entrevistadores")
async def get_entrevistadores(db: Session = Depends(get_db)):
    """Retorna todos os entrevistadores ordenados por nome"""
    entrevistadores = db.query(Entrevistador).order_by(Entrevistador.nome_completo).all()
    return [
        {
            "id_entrevistador": e.id_entrevistador,
            "nome_completo": e.nome_completo,
            "email": e.email,
            "id_instituicao": e.id_instituicao
        }
        for e in entrevistadores
    ]
