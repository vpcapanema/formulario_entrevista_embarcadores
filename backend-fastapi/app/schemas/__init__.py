"""
============================================================
PYDANTIC SCHEMAS - FastAPI PLI 2050
============================================================
Schemas de validação para requests e responses
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# ============================================================
# SCHEMAS AUXILIARES
# ============================================================

class ProdutoTransportadoBase(BaseModel):
    carga: str
    movimentacao: Optional[Decimal] = None
    origem: Optional[str] = None
    destino: Optional[str] = None
    distancia: Optional[Decimal] = None
    modalidade: Optional[str] = None
    acondicionamento: Optional[str] = None
    ordem: int = 1

class ProdutoTransportadoCreate(ProdutoTransportadoBase):
    pass

class ProdutoTransportadoResponse(ProdutoTransportadoBase):
    id_produto: int
    id_pesquisa: int
    id_empresa: int
    
    class Config:
        from_attributes = True

# ============================================================
# EMPRESA SCHEMAS
# ============================================================

class EmpresaBase(BaseModel):
    nome_empresa: str
    tipo_empresa: str = Field(..., pattern="^(embarcador|transportador|operador|outro)$")
    outro_tipo: Optional[str] = None
    municipio: str
    estado: Optional[str] = None
    cnpj: Optional[str] = None
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    id_municipio: Optional[int] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cep: Optional[str] = None
    cnpj_digits: Optional[str] = None

class EmpresaCreate(EmpresaBase):
    @field_validator('cnpj')
    @classmethod
    def validate_cnpj_format(cls, v):
        if v and len(v.replace('.', '').replace('/', '').replace('-', '')) not in [14, 18]:
            raise ValueError('CNPJ deve ter 14 dígitos')
        return v

class EmpresaResponse(EmpresaBase):
    id_empresa: int
    data_cadastro: datetime
    data_atualizacao: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ============================================================
# ENTREVISTADO SCHEMAS
# ============================================================

class EntrevistadoBase(BaseModel):
    nome: str
    funcao: str
    telefone: str
    email: EmailStr
    principal: bool = False

class EntrevistadoCreate(EntrevistadoBase):
    id_empresa: int

class EntrevistadoResponse(EntrevistadoBase):
    id_entrevistado: int
    id_empresa: int
    data_cadastro: datetime
    data_atualizacao: Optional[datetime] = None
    email_lower: Optional[str] = None
    
    class Config:
        from_attributes = True

# ============================================================
# PESQUISA SCHEMAS
# ============================================================

class PesquisaBase(BaseModel):
    # Responsável
    tipo_responsavel: str = Field(..., pattern="^(entrevistador|entrevistado)$")
    id_responsavel: int
    
    # Produto
    produto_principal: str
    agrupamento_produto: str
    outro_produto: Optional[str] = None
    
    # Transporte
    tipo_transporte: str = Field(..., pattern="^(importacao|exportacao|local|nao-sei)$")
    
    # Origem
    origem_pais: str
    origem_estado: str
    origem_municipio: str
    origem_instalacao: Optional[str] = None
    
    # Destino
    destino_pais: str
    destino_estado: str
    destino_municipio: str
    destino_instalacao: Optional[str] = None
    
    # Distância e Paradas
    distancia: Decimal
    tem_paradas: str = Field(..., pattern="^(sim|nao|nao-sei)$")
    num_paradas: Optional[int] = Field(None, gt=0)
    
    # Modais
    modos: List[str]
    config_veiculo: Optional[str] = None
    modal_predominante: Optional[str] = None
    modal_secundario: Optional[str] = None
    modal_terciario: Optional[str] = None
    
    # Capacidade e Peso
    capacidade_utilizada: Optional[Decimal] = Field(None, ge=0, le=100)
    peso_carga: Decimal
    unidade_peso: str
    
    # Custos
    custo_transporte: Decimal
    valor_carga: Decimal
    custo_medio_tonelada: Optional[Decimal] = None
    pedagio_custo: Optional[Decimal] = None
    frete_custo: Optional[Decimal] = None
    manutencao_custo: Optional[Decimal] = None
    outros_custos: Optional[Decimal] = None
    
    # Embalagem
    tipo_embalagem: str
    carga_perigosa: str = Field(..., pattern="^(sim|nao|nao-sei)$")
    
    # Tempo
    tempo_dias: int
    tempo_horas: int
    tempo_minutos: int
    tempo_transporte: Optional[str] = None
    
    # Frequência
    frequencia: str
    frequencia_diaria: Optional[Decimal] = Field(None, gt=0)
    frequencia_outra: Optional[str] = None
    
    # Importâncias
    importancia_custo: str
    variacao_custo: Decimal
    importancia_tempo: str
    variacao_tempo: Decimal
    importancia_confiabilidade: str
    variacao_confiabilidade: Decimal
    importancia_seguranca: str
    variacao_seguranca: Decimal
    importancia_capacidade: str
    variacao_capacidade: Decimal
    
    # Estratégia
    tipo_cadeia: str
    modais_alternativos: Optional[List[str]] = None
    fator_adicional: Optional[str] = None
    
    # Dificuldades
    dificuldades: Optional[List[str]] = None
    detalhe_dificuldade: Optional[str] = None
    
    # Frota
    proprio_terceirizado: Optional[str] = None
    qtd_caminhoes_proprios: Optional[int] = None
    qtd_caminhoes_terceirizados: Optional[int] = None
    
    # Volume
    volume_anual_toneladas: Optional[Decimal] = None
    tipo_produto: Optional[str] = None
    classe_produto: Optional[str] = None
    produtos_especificos: Optional[str] = None
    
    # Desafios
    principais_desafios: Optional[str] = None
    investimento_sustentavel: Optional[str] = None
    reducao_emissoes: Optional[str] = None
    tecnologias_interesse: Optional[str] = None
    
    # Tecnologia
    uso_tecnologia: Optional[str] = None
    grau_automacao: Optional[str] = None
    rastreamento_carga: bool = False
    uso_dados: Optional[str] = None
    
    # Hidrovias
    conhecimento_hidrovias: Optional[str] = None
    viabilidade_hidrovia: Optional[str] = None
    pontos_melhoria: Optional[str] = None
    
    # Outros
    interesse_parcerias: bool = False
    feedback_formulario: Optional[str] = None
    observacoes: Optional[str] = None
    consentimento: bool = False
    transporta_carga: bool = False
    id_instalacao_origem: Optional[int] = None
    status: str = "finalizada"

class PesquisaCreate(PesquisaBase):
    id_empresa: int
    id_entrevistado: int

class PesquisaResponse(PesquisaBase):
    id_pesquisa: int
    id_empresa: int
    id_entrevistado: int
    data_entrevista: datetime
    data_atualizacao: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ============================================================
# SUBMIT FORM - SCHEMA COMPLETO
# ============================================================

class SubmitFormData(BaseModel):
    """
    Schema para o endpoint POST /api/submit-form
    Recebe payload completo do frontend e salva em 4 tabelas
    """
    
    # ---- DADOS DO ENTREVISTADO ----
    nome: str
    funcao: str
    telefone: str
    email: EmailStr
    
    # ---- DADOS DA EMPRESA ----
    nomeEmpresa: str = Field(..., alias="nomeEmpresa")
    tipoEmpresa: str = Field(..., alias="tipoEmpresa")
    outroTipo: Optional[str] = Field(None, alias="outroTipo")
    municipio: str
    cnpj: Optional[str] = None
    razaoSocial: Optional[str] = Field(None, alias="razaoSocial")
    nomeFantasia: Optional[str] = Field(None, alias="nomeFantasia")
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cep: Optional[str] = None
    
    # ---- METADADOS ----
    tipoResponsavel: str = Field(..., alias="tipoResponsavel")
    idResponsavel: int = Field(..., alias="idResponsavel")
    consentimento: bool = False
    transportaCarga: bool = Field(False, alias="transportaCarga")
    
    # ---- PRODUTO ----
    produtoPrincipal: str = Field(..., alias="produtoPrincipal")
    agrupamentoProduto: str = Field(..., alias="agrupamentoProduto")
    outroProduto: Optional[str] = Field(None, alias="outroProduto")
    
    # ---- TRANSPORTE ----
    tipoTransporte: str = Field(..., alias="tipoTransporte")
    
    # ---- ORIGEM ----
    origemPais: str = Field(..., alias="origemPais")
    origemEstado: str = Field(..., alias="origemEstado")
    origemMunicipio: str = Field(..., alias="origemMunicipio")
    
    # ---- DESTINO ----
    destinoPais: str = Field(..., alias="destinoPais")
    destinoEstado: str = Field(..., alias="destinoEstado")
    destinoMunicipio: str = Field(..., alias="destinoMunicipio")
    
    # ---- DISTÂNCIA E PARADAS ----
    distancia: Decimal
    temParadas: str = Field(..., alias="temParadas")
    numParadas: Optional[int] = Field(None, alias="numParadas")
    
    # ---- MODAIS ----
    modos: List[str]
    configVeiculo: Optional[str] = Field(None, alias="configVeiculo")
    
    # ---- CAPACIDADE E PESO ----
    capacidadeUtilizada: Optional[Decimal] = Field(None, alias="capacidadeUtilizada")
    pesoCarga: Decimal = Field(..., alias="pesoCarga")
    unidadePeso: str = Field(..., alias="unidadePeso")
    
    # ---- CUSTOS ----
    custoTransporte: Decimal = Field(..., alias="custoTransporte")
    valorCarga: Decimal = Field(..., alias="valorCarga")
    
    # ---- EMBALAGEM ----
    tipoEmbalagem: str = Field(..., alias="tipoEmbalagem")
    cargaPerigosa: str = Field(..., alias="cargaPerigosa")
    
    # ---- TEMPO ----
    tempoDias: int = Field(..., alias="tempoDias")
    tempoHoras: int = Field(..., alias="tempoHoras")
    tempoMinutos: int = Field(..., alias="tempoMinutos")
    
    # ---- FREQUÊNCIA ----
    frequencia: str
    frequenciaDiaria: Optional[Decimal] = Field(None, alias="frequenciaDiaria")
    frequenciaOutra: Optional[str] = Field(None, alias="frequenciaOutra")
    
    # ---- IMPORTÂNCIAS ----
    importanciaCusto: str = Field(..., alias="importanciaCusto")
    variacaoCusto: Decimal = Field(..., alias="variacaoCusto")
    importanciaTempo: str = Field(..., alias="importanciaTempo")
    variacaoTempo: Decimal = Field(..., alias="variacaoTempo")
    importanciaConfiabilidade: str = Field(..., alias="importanciaConfiabilidade")
    variacaoConfiabilidade: Decimal = Field(..., alias="variacaoConfiabilidade")
    importanciaSeguranca: str = Field(..., alias="importanciaSeguranca")
    variacaoSeguranca: Decimal = Field(..., alias="variacaoSeguranca")
    importanciaCapacidade: str = Field(..., alias="importanciaCapacidade")
    variacaoCapacidade: Decimal = Field(..., alias="variacaoCapacidade")
    
    # ---- ESTRATÉGIA ----
    tipoCadeia: str = Field(..., alias="tipoCadeia")
    modaisAlternativos: Optional[List[str]] = Field(None, alias="modaisAlternativos")
    fatorAdicional: Optional[str] = Field(None, alias="fatorAdicional")
    
    # ---- DIFICULDADES ----
    dificuldades: Optional[List[str]] = None
    detalheDificuldade: Optional[str] = Field(None, alias="detalheDificuldade")
    
    # ---- OBSERVAÇÕES ----
    observacoes: Optional[str] = None
    
    # ---- PRODUTOS TRANSPORTADOS (ARRAY) ----
    produtos: List[ProdutoTransportadoBase] = []
    
    class Config:
        populate_by_name = True  # Permite usar aliases


# ============================================================
# RESPONSE SCHEMAS
# ============================================================

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    database: str
    message: Optional[str] = None

class SubmitFormResponse(BaseModel):
    success: bool
    message: str
    data: dict
    id_pesquisa: Optional[int] = None
    id_empresa: Optional[int] = None
    id_entrevistado: Optional[int] = None
    produtos_inseridos: int = 0

