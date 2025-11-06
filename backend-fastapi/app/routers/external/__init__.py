"""
Router para consultas externas (Receita Federal, IBGE, etc)
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
import logging

from app.services.receita_federal import ReceitaFederalService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/cnpj/{cnpj}")
async def consultar_cnpj(
    cnpj: str
) -> Dict[str, Any]:
    """
    Consulta dados de CNPJ na Receita Federal (via BrasilAPI)
    
    **Funcionalidade:**
    - Preenche automaticamente Q6b (razão social)
    - Preenche automaticamente Q7 (município da unidade de produção)
    
    **Exemplo de uso:**
    ```
    GET /api/external/cnpj/00000000000191
    GET /api/external/cnpj/00.000.000/0000-00  (com formatação)
    ```
    
    **Retorna:**
    ```json
    {
        "success": true,
        "data": {
            "cnpj": "00000000000191",
            "razao_social": "EMPRESA EXEMPLO LTDA",
            "nome_fantasia": "EXEMPLO",
            "municipio": "3550308",
            "uf": "SP",
            "cep": "01310-100",
            "situacao_cadastral": "ATIVA"
        }
    }
    ```
    
    **Erros:**
    - 404: CNPJ não encontrado
    - 400: CNPJ inválido
    - 503: API da Receita Federal indisponível
    """
    
    # Validar formato do CNPJ
    cnpj_limpo = ReceitaFederalService.limpar_cnpj(cnpj)
    
    if len(cnpj_limpo) != 14:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "message": "CNPJ inválido. Deve conter 14 dígitos.",
                "cnpj_recebido": cnpj
            }
        )
    
    # Consultar API da Receita Federal
    dados = await ReceitaFederalService.consultar_cnpj(cnpj)
    
    if not dados:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "message": f"CNPJ {cnpj_limpo} não encontrado na Receita Federal.",
                "cnpj": cnpj_limpo
            }
        )
    
    return {
        "success": True,
        "message": "CNPJ consultado com sucesso",
        "data": dados
    }


@router.get("/cnpj/{cnpj}/validar")
async def validar_cnpj(
    cnpj: str
) -> Dict[str, Any]:
    """
    Valida se CNPJ existe e está ativo na Receita Federal
    
    **Retorna:**
    ```json
    {
        "success": true,
        "cnpj": "00000000000191",
        "valido": true,
        "ativo": true
    }
    ```
    """
    
    cnpj_limpo = ReceitaFederalService.limpar_cnpj(cnpj)
    
    if len(cnpj_limpo) != 14:
        return {
            "success": False,
            "cnpj": cnpj_limpo,
            "valido": False,
            "ativo": False,
            "message": "CNPJ deve ter 14 dígitos"
        }
    
    # Validar na Receita Federal
    valido = await ReceitaFederalService.validar_cnpj(cnpj)
    
    return {
        "success": True,
        "cnpj": cnpj_limpo,
        "valido": valido,
        "ativo": valido,
        "message": "CNPJ válido e ativo" if valido else "CNPJ inválido ou inativo"
    }
