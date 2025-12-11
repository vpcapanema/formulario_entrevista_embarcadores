from pydantic import BaseModel
from typing import Optional


class ProdutoTransportadoPayload(BaseModel):
    """EXATAMENTE como está no banco: 1 NOT NULL + 12 OPCIONAIS = 16 campos (3 FKs gerenciadas pelo backend)"""
    # NOT NULL (1 campo)
    carga: str
    
    # OPCIONAIS (12 campos)
    movimentacao: Optional[float] = None
    distancia: Optional[float] = None
    modalidade: Optional[str] = None
    acondicionamento: Optional[str] = None
    ordem: Optional[int] = None
    observacoes: Optional[str] = None
    origem_pais: Optional[int] = None
    destino_pais: Optional[int] = None
    origem_estado: Optional[str] = None
    origem_municipio: Optional[str] = None
    destino_estado: Optional[str] = None
    destino_municipio: Optional[str] = None
    
    class Config:
        populate_by_name = True


# VERSÃO ANTIGA ABAIXO - DELETAR
class _OLD_ProdutoTransportadoPayload(BaseModel):
    """Schema baseado na estrutura REAL do banco: produtos_transportados (16 campos)"""
    # NOT NULL (apenas 1 campo obrigatório)
    carga: str  # VARCHAR(255) NOT NULL
    
    # Opcionais (12 campos)
    movimentacao: Optional[float] = None  # NUMERIC(12, 2)
    distancia: Optional[float] = None  # NUMERIC(10, 2)
    modalidade: Optional[str] = None  # VARCHAR(50)
    acondicionamento: Optional[str] = None  # VARCHAR(100)
    ordem: Optional[int] = None  # INTEGER
    observacoes: Optional[str] = None  # TEXT
    origem_pais: Optional[int] = None  # INTEGER FK
    destino_pais: Optional[int] = None  # INTEGER FK
    origem_estado: Optional[str] = None  # VARCHAR(2)
    origem_municipio: Optional[str] = None  # VARCHAR(10)
    destino_estado: Optional[str] = None  # VARCHAR(2)
    destino_municipio: Optional[str] = None  # VARCHAR(10)
    
    class Config:
        populate_by_name = True
