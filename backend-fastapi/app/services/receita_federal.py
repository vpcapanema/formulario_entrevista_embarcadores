"""
Serviço de integração com API da Receita Federal via BrasilAPI
Consulta dados de CNPJ para preencher automaticamente informações da empresa
"""

import httpx
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class ReceitaFederalService:
    """
    Integração com BrasilAPI para consulta de CNPJ
    
    API: https://brasilapi.com.br/api/cnpj/v1/{cnpj}
    
    Retorna:
    - razao_social: Nome oficial da empresa
    - municipio: Cidade da sede (código IBGE)
    - uf: Estado da sede
    """
    
    BASE_URL = "https://brasilapi.com.br/api/cnpj/v1"
    TIMEOUT = 10.0  # segundos
    
    @staticmethod
    def limpar_cnpj(cnpj: str) -> str:
        """Remove caracteres especiais do CNPJ (pontos, barras, hífens)"""
        return ''.join(filter(str.isdigit, cnpj))
    
    @staticmethod
    async def consultar_cnpj(cnpj: str) -> Optional[Dict[str, Any]]:
        """
        Consulta dados do CNPJ na API da Receita Federal
        
        Args:
            cnpj: CNPJ com ou sem formatação (00.000.000/0000-00)
            
        Returns:
            Dict com dados da empresa ou None se não encontrado
            
        Exemplo de retorno:
        {
            "cnpj": "00000000000191",
            "razao_social": "EMPRESA EXEMPLO LTDA",
            "nome_fantasia": "EXEMPLO",
            "municipio": "3550308",  # Código IBGE 7 dígitos
            "uf": "SP",
            "cep": "01310-100",
            "logradouro": "Avenida Paulista",
            "numero": "1000",
            "bairro": "Bela Vista",
            "situacao_cadastral": "ATIVA"
        }
        """
        
        cnpj_limpo = ReceitaFederalService.limpar_cnpj(cnpj)
        
        if len(cnpj_limpo) != 14:
            logger.warning(f"CNPJ inválido (deve ter 14 dígitos): {cnpj}")
            return None
        
        url = f"{ReceitaFederalService.BASE_URL}/{cnpj_limpo}"
        
        try:
            async with httpx.AsyncClient(timeout=ReceitaFederalService.TIMEOUT) as client:
                logger.info(f"🔍 Consultando CNPJ {cnpj_limpo} na Receita Federal...")
                
                response = await client.get(url)
                
                if response.status_code == 404:
                    logger.warning(f"❌ CNPJ {cnpj_limpo} não encontrado na Receita Federal")
                    return None
                
                if response.status_code != 200:
                    logger.error(f"❌ Erro ao consultar CNPJ: HTTP {response.status_code}")
                    return None
                
                dados = response.json()
                
                # Extrai campos relevantes
                resultado = {
                    "cnpj": dados.get("cnpj"),
                    "razao_social": dados.get("razao_social", "").strip(),
                    "nome_fantasia": dados.get("nome_fantasia", "").strip(),
                    "municipio": dados.get("municipio"),  # Nome do município (uppercase, sem acentos - ex: "BRASILIA")
                    "uf": dados.get("uf", "").upper(),
                    "cep": dados.get("cep", ""),
                    "logradouro": dados.get("logradouro", ""),
                    "numero": dados.get("numero", ""),
                    "bairro": dados.get("bairro", ""),
                    "situacao_cadastral": dados.get("situacao_cadastral", ""),
                    "data_situacao_cadastral": dados.get("data_situacao_cadastral", ""),
                    "atividade_principal": dados.get("cnae_fiscal_descricao", "")
                }
                
                logger.info(f"✅ CNPJ consultado: {resultado['razao_social']} - {resultado['municipio']}/{resultado['uf']}")
                
                return resultado
                
        except httpx.TimeoutException:
            logger.error(f"⏱️ Timeout ao consultar CNPJ {cnpj_limpo} (>{ReceitaFederalService.TIMEOUT}s)")
            return None
        
        except httpx.RequestError as e:
            logger.error(f"❌ Erro de conexão ao consultar CNPJ: {e}")
            return None
        
        except Exception as e:
            logger.error(f"❌ Erro inesperado ao consultar CNPJ: {e}")
            return None
    
    @staticmethod
    async def validar_cnpj(cnpj: str) -> bool:
        """
        Valida se CNPJ existe na Receita Federal
        
        Args:
            cnpj: CNPJ com ou sem formatação
            
        Returns:
            True se CNPJ existe e está ativo, False caso contrário
        """
        
        dados = await ReceitaFederalService.consultar_cnpj(cnpj)
        
        if not dados:
            return False
        
        # Verifica se empresa está ativa
        situacao = dados.get("situacao_cadastral", "").upper()
        
        if situacao != "ATIVA":
            logger.warning(f"⚠️ CNPJ {cnpj} não está ativo: {situacao}")
            return False
        
        return True
