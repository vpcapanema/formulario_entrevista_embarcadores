"""
Router para APIs externas - Consulta CNPJ via BrasilAPI (Receita Federal)

ENDPOINTS:
- GET /api/external/cnpj/{cnpj} - Consulta dados completos do CNPJ
- GET /api/external/cnpj/{cnpj}/validar - Valida se CNPJ existe e está ativo
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging
import httpx
from pydantic import BaseModel

router = APIRouter(tags=["external"])
logger = logging.getLogger(__name__)

# URL base da BrasilAPI
BRASILAPI_BASE_URL = "https://brasilapi.com.br/api"


class CNPJResponse(BaseModel):
    """Resposta formatada da consulta CNPJ"""
    success: bool
    message: str
    data: Dict[str, Any] = None


@router.get("/cnpj/{cnpj}")
async def consultar_cnpj(cnpj: str) -> CNPJResponse:
    """
    Consulta CNPJ na Receita Federal via BrasilAPI
    
    Args:
        cnpj: CNPJ com ou sem formatação (14 dígitos)
        
    Returns:
        Dados completos da empresa (razao_social, municipio, uf, etc.)
    """
    # Limpar CNPJ (remover formatação)
    cnpj_limpo = ''.join(filter(str.isdigit, cnpj))
    
    if len(cnpj_limpo) != 14:
        raise HTTPException(
            status_code=400,
            detail=f"CNPJ inválido. Digite 14 dígitos (recebido: {len(cnpj_limpo)})"
        )
    
    try:
        logger.info(f"🔍 Consultando CNPJ {cnpj_limpo} na BrasilAPI...")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{BRASILAPI_BASE_URL}/cnpj/v1/{cnpj_limpo}"
            )
            
            if response.status_code == 404:
                raise HTTPException(
                    status_code=404,
                    detail="CNPJ não encontrado na base da Receita Federal"
                )
            
            if response.status_code != 200:
                logger.error(f"❌ BrasilAPI retornou status {response.status_code}: {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Erro ao consultar CNPJ (status {response.status_code})"
                )
            
            dados_api = response.json()
            
            # Normalizar resposta para o formato esperado pelo frontend
            dados_formatados = {
                "razao_social": dados_api.get("razao_social", ""),
                "nome_fantasia": dados_api.get("nome_fantasia", ""),
                "situacao_cadastral": dados_api.get("descricao_situacao_cadastral", ""),
                "data_situacao_cadastral": dados_api.get("data_situacao_cadastral", ""),
                "cnpj": dados_api.get("cnpj", ""),
                "cnae_fiscal": dados_api.get("cnae_fiscal", ""),
                "descricao_cnae_fiscal": dados_api.get("cnae_fiscal_descricao", ""),
                "natureza_juridica": dados_api.get("natureza_juridica", ""),
                "capital_social": dados_api.get("capital_social", 0),
                "porte": dados_api.get("porte", ""),
                "data_inicio_atividade": dados_api.get("data_inicio_atividade", ""),
                # Endereço
                "logradouro": dados_api.get("logradouro", ""),
                "numero": dados_api.get("numero", ""),
                "complemento": dados_api.get("complemento", ""),
                "bairro": dados_api.get("bairro", ""),
                "cep": dados_api.get("cep", ""),
                "municipio": dados_api.get("municipio", ""),
                "uf": dados_api.get("uf", ""),
                # Contatos
                "ddd_telefone_1": dados_api.get("ddd_telefone_1", ""),
                "ddd_telefone_2": dados_api.get("ddd_telefone_2", ""),
                "email": dados_api.get("email", ""),
                # QSA (Quadro Societário)
                "qsa": dados_api.get("qsa", [])
            }
            
            logger.info(f"✅ CNPJ {cnpj_limpo} consultado: {dados_formatados.get('razao_social')}")
            
            return CNPJResponse(
                success=True,
                message="CNPJ consultado com sucesso",
                data=dados_formatados
            )
            
    except HTTPException:
        # Re-levantar HTTPException para que FastAPI trate corretamente
        raise
    except httpx.TimeoutException:
        logger.error("❌ Timeout ao consultar BrasilAPI")
        raise HTTPException(
            status_code=504,
            detail="Timeout: BrasilAPI demorou muito para responder (>10s)"
        )
    except httpx.RequestError as e:
        logger.error(f"❌ Erro de rede ao consultar BrasilAPI: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Erro de conexão com BrasilAPI: {str(e)}"
        )
    except Exception as e:
        logger.error(f"❌ Erro inesperado ao consultar CNPJ: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/cnpj/{cnpj}/validar")
async def validar_cnpj(cnpj: str) -> Dict[str, Any]:
    """
    Valida se CNPJ existe e está ativo na Receita Federal
    
    Args:
        cnpj: CNPJ com ou sem formatação (14 dígitos)
        
    Returns:
        {valido: bool, ativo: bool, mensagem: str}
    """
    resultado = await consultar_cnpj(cnpj)
    
    if not resultado.success:
        return {
            "valido": False,
            "ativo": False,
            "mensagem": resultado.message
        }
    
    situacao = resultado.data.get("situacao_cadastral", "").upper()
    ativo = "ATIVA" in situacao
    
    return {
        "valido": True,
        "ativo": ativo,
        "mensagem": f"CNPJ encontrado - Situação: {situacao}",
        "situacao_cadastral": situacao
    }
