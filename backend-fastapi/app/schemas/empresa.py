from pydantic import BaseModel
from typing import Optional
from datetime import date


class EmpresaPayload(BaseModel):
    """EXATAMENTE como está no banco: 3 NOT NULL + 31 OPCIONAIS = 35 campos"""
    # NOT NULL (3 campos)
    tipo_empresa: str
    municipio: str
    razao_social: str
    
    # OPCIONAIS (31 campos)
    outro_tipo: Optional[str] = None
    estado: Optional[str] = None
    nome_fantasia: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    id_municipio: Optional[int] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cep: Optional[str] = None
    cnpj: Optional[str] = None
    endereco: Optional[str] = None
    uf: Optional[str] = None
    site: Optional[str] = None
    porte_empresa: Optional[str] = None
    setor_atividade: Optional[str] = None
    cnae: Optional[str] = None
    faturamento_anual: Optional[str] = None
    numero_funcionarios: Optional[int] = None
    ano_fundacao: Optional[int] = None
    inscricao_estadual: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    natureza_juridica: Optional[str] = None
    situacao_cadastral: Optional[str] = None
    data_situacao_cadastral: Optional[date] = None
    motivo_situacao_cadastral: Optional[str] = None
    situacao_especial: Optional[str] = None
    data_situacao_especial: Optional[date] = None
    
    class Config:
        populate_by_name = True
