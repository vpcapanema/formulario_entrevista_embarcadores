"""
============================================================
ROUTER: ENTREVISTADORES
============================================================
Endpoints para buscar dados completos de entrevistadores
incluindo informações da instituição associada.
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
import asyncpg
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/entrevistadores",
    tags=["Entrevistadores"]
)


async def get_db_connection():
    """Cria conexão com o banco de dados PostgreSQL usando DATABASE_URL"""
    database_url = os.getenv(
        'DATABASE_URL',
        'postgresql://sigma_user:pzRszi7xZ4IzjehPVNdCR73DNCJ9jiq5@dpg-d5rc90pr0fns73e2q4n0-a.oregon-postgres.render.com:5432/sigma_pli_qr53'
    )
    return await asyncpg.connect(database_url, ssl='require')


@router.get("")
async def listar_entrevistadores():
    """
    Lista todos os entrevistadores com dados básicos.
    Retorna: id_entrevistador, nome_completo para popular dropdown.
    """
    try:
        conn = await get_db_connection()
        rows = await conn.fetch('''
            SELECT id_entrevistador, nome_completo 
            FROM formulario_embarcadores.entrevistadores 
            ORDER BY nome_completo
        ''')
        await conn.close()
        
        return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Erro ao listar entrevistadores: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id_entrevistador}")
async def get_entrevistador_completo(id_entrevistador: int):
    """
    Busca dados COMPLETOS de um entrevistador específico.
    
    Retorna:
    - Todos os campos da tabela entrevistadores
    - Todos os campos da tabela instituicoes (via id_instituicao)
    
    Usado para preencher o Card 0 do PDF com informações detalhadas.
    """
    try:
        conn = await get_db_connection()
        
        # 1. Buscar entrevistador
        entrevistador = await conn.fetchrow('''
            SELECT * 
            FROM formulario_embarcadores.entrevistadores 
            WHERE id_entrevistador = $1
        ''', id_entrevistador)
        
        if not entrevistador:
            await conn.close()
            raise HTTPException(
                status_code=404, 
                detail=f"Entrevistador com id {id_entrevistador} não encontrado"
            )
        
        entrevistador_dict = dict(entrevistador)
        
        # 2. Buscar instituição associada (se houver)
        instituicao_dict = None
        if entrevistador_dict.get('id_instituicao'):
            instituicao = await conn.fetchrow('''
                SELECT * 
                FROM formulario_embarcadores.instituicoes 
                WHERE id_instituicao = $1
            ''', entrevistador_dict['id_instituicao'])
            
            if instituicao:
                instituicao_dict = dict(instituicao)
        
        await conn.close()
        
        # 3. Montar resposta completa
        return {
            "success": True,
            "entrevistador": entrevistador_dict,
            "instituicao": instituicao_dict
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar entrevistador {id_entrevistador}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
