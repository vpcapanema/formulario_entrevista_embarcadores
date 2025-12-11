from pydantic import BaseModel
from typing import Optional


class EntrevistadoPayload(BaseModel):
    """EXATAMENTE como está no banco: 2 NOT NULL + 10 OPCIONAIS = 14 campos"""
    # NOT NULL (2 campos)
    nome: str
    funcao: str
    
    # OPCIONAIS (10 campos)
    telefone: Optional[str] = None
    email: Optional[str] = None
    principal: Optional[bool] = None
    estado_civil: Optional[str] = None
    nacionalidade: Optional[str] = None
    uf_naturalidade: Optional[str] = None
    municipio_naturalidade: Optional[str] = None
    
    class Config:
        populate_by_name = True
