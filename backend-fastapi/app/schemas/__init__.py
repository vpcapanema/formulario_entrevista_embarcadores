"""
============================================================
PYDANTIC SCHEMAS - FastAPI PLI 2050
============================================================
Orquestrador de schemas
Importa e re-exporta schemas dos módulos individuais
"""

from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from app.utils.timezone import format_brasilia
import re

# ============================================================
# IMPORTS DOS SCHEMAS MODULARES
# ============================================================
from app.schemas.empresa import EmpresaPayload
from app.schemas.entrevistado import EntrevistadoPayload
from app.schemas.pesquisa import PesquisaPayload
from app.schemas.produto import ProdutoTransportadoPayload

# Re-exportar para compatibilidade
__all__ = [
    'EmpresaPayload',
    'EntrevistadoPayload', 
    'PesquisaPayload',
    'ProdutoTransportadoPayload',
    'DividedSubmitPayload',
    'SubmitFormResponse',
    'HealthResponse',
    'SubmitFormData',  # Legado
]

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


# ============================================================
# DIVIDED PAYLOAD SCHEMA
# ============================================================

class DividedSubmitPayload(BaseModel):
    """Schema principal para payload dividido em 4 subpayloads"""
    empresa: EmpresaPayload
    entrevistado: EntrevistadoPayload
    pesquisa: PesquisaPayload
    produtos: List[ProdutoTransportadoPayload]

    class Config:
        populate_by_name = True


# ============================================================
# SUBMIT FORM - SCHEMA LEGADO (MANTER POR COMPATIBILIDADE)
# ============================================================

class ProdutoTransportadoBase(BaseModel):
    """Schema base para produtos no payload legado"""
    carga: str
    movimentacao: Optional[Decimal] = None
    origem: Optional[str] = None
    destino: Optional[str] = None
    distancia: Optional[Decimal] = None
    modalidade: Optional[str] = None
    acondicionamento: Optional[str] = None
    observacoes: Optional[str] = None
    ordem: int = 1


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
    estadoCivil: Optional[str] = Field(None, alias="estadoCivil")
    nacionalidade: Optional[str] = None
    ufNaturalidade: Optional[str] = Field(None, alias="ufNaturalidade")
    municipioNaturalidade: Optional[str] = Field(None, alias="municipioNaturalidade")

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
    idResponsavel: Optional[int] = Field(None, alias="idResponsavel")  # Opcional - backend calcula
    consentimento: bool = False
    transportaCarga: bool = Field(False, alias="transportaCarga")

    # ---- PRODUTO ----
    produtoPrincipal: str = Field(..., alias="produtoPrincipal")
    agrupamentoProduto: str = Field(..., alias="agrupamentoProduto")
    outroProduto: Optional[str] = Field(None, alias="outroProduto")
    observacoesProdutoPrincipal: Optional[str] = Field(None, alias="observacoesProdutoPrincipal")

    # ---- TRANSPORTE ----
    tipoTransporte: str = Field(..., alias="tipoTransporte")

    # ---- ORIGEM ----
    origemPais: str = Field(..., alias="origemPais")
    origemEstado: Optional[str] = Field(None, alias="origemEstado")  # Obrigatório apenas se país = Brasil
    origemMunicipio: Optional[str] = Field(None, alias="origemMunicipio")  # Obrigatório apenas se país = Brasil

    # ---- DESTINO ----
    destinoPais: str = Field(..., alias="destinoPais")
    destinoEstado: Optional[str] = Field(None, alias="destinoEstado")  # Obrigatório apenas se país = Brasil
    destinoMunicipio: Optional[str] = Field(None, alias="destinoMunicipio")  # Obrigatório apenas se país = Brasil

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
    observacoesSazonalidade: Optional[str] = Field(None, alias="observacoesSazonalidade")

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

    # ============================================================
    # VALIDADORES CUSTOMIZADOS
    # ============================================================

    @model_validator(mode='before')
    @classmethod
    def convert_empty_strings_to_none(cls, data):
        """Converte strings vazias em None para campos opcionais"""
        if isinstance(data, dict):
            # Lista de campos que devem ficar como string vazia ao invés de None
            campos_string = {
                'telefone', 'outroTipo', 'numero', 'complemento', 'bairro', 
                'outroProduto', 'observacoesProdutoPrincipal', 'logradouro',
                'frequenciaOutra', 'observacoesSazonalidade', 'detalheDificuldade',
                'fatorAdicional', 'observacoes', 'cep', 'cnpj'
            }
            
            for key, value in data.items():
                # Se é string vazia e campo é opcional
                if isinstance(value, str) and value == '':
                    if key not in campos_string:
                        data[key] = None
        return data

    @field_validator('cnpj')
    @classmethod
    def validate_cnpj(cls, v):
        """
        Valida CNPJ brasileiro (formato + dígitos verificadores)
        Aceita: 00.000.000/0000-00 ou 00000000000000
        """
        if not v:
            return v

        # Remove formatação
        digits = re.sub(r'\D', '', v)

        # Valida comprimento
        if len(digits) != 14:
            raise ValueError(
                f'CNPJ inválido: deve ter 14 dígitos (recebeu {len(digits)}). '
                f'Formato esperado: 00.000.000/0000-00'
            )

        # Valida CNPJs conhecidos como inválidos
        if digits == digits[0] * 14:
            raise ValueError('CNPJ inválido: todos os dígitos são iguais')

        # Calcula dígitos verificadores
        def calc_digit(cnpj_part, weights):
            soma = sum(int(d) * w for d, w in zip(cnpj_part, weights))
            resto = soma % 11
            return 0 if resto < 2 else 11 - resto

        weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

        digit1 = calc_digit(digits[:12], weights1)
        digit2 = calc_digit(digits[:13], weights2)

        if int(digits[12]) != digit1 or int(digits[13]) != digit2:
            raise ValueError(
                'CNPJ inválido: dígitos verificadores incorretos. '
                'Verifique se o CNPJ foi digitado corretamente.'
            )

        return v

    @field_validator('telefone')
    @classmethod
    def validate_telefone(cls, v):
        """
        Valida telefone brasileiro
        Aceita: (00) 0000-0000, (00) 00000-0000, 00000000000
        """
        if not v:
            return v

        # Remove formatação
        digits = re.sub(r'\D', '', v)

        # Valida comprimento (10 ou 11 dígitos)
        if len(digits) not in [10, 11]:
            raise ValueError(
                f'Telefone inválido: deve ter 10 ou 11 dígitos (recebeu {len(digits)}). '
                f'Formato esperado: (00) 0000-0000 ou (00) 00000-0000'
            )

        # Valida DDD
        ddd = int(digits[:2])
        if ddd < 11 or ddd > 99:
            raise ValueError(f'DDD inválido: {ddd}. Deve estar entre 11 e 99.')

        return v

    @field_validator('cep')
    @classmethod
    def validate_cep(cls, v):
        """
        Valida CEP brasileiro
        Aceita: 00000-000 ou 00000000
        """
        if not v:
            return v

        # Remove formatação
        digits = re.sub(r'\D', '', v)

        if len(digits) != 8:
            raise ValueError(
                f'CEP inválido: deve ter 8 dígitos (recebeu {len(digits)}). '
                f'Formato esperado: 00000-000'
            )

        return v

    @field_validator('pesoCarga', 'custoTransporte', 'valorCarga')
    @classmethod
    def validate_valores_positivos(cls, v):
        """Valida que valores monetários/peso são positivos"""
        if v is not None and v <= 0:
            raise ValueError('Valor deve ser maior que zero')
        return v

    @field_validator('capacidadeUtilizada')
    @classmethod
    def validate_capacidade(cls, v):
        """Valida que capacidade é não-negativa"""
        if v is not None and v < 0:
            raise ValueError('Capacidade utilizada deve ser maior ou igual a 0%')
        return v

    @field_validator('numParadas')
    @classmethod
    def validate_paradas_positivo(cls, v):
        """Valida que número de paradas é positivo"""
        if v is not None and v <= 0:
            raise ValueError('Número de paradas deve ser maior que zero')
        return v

    @field_validator('tempoDias', 'tempoHoras', 'tempoMinutos')
    @classmethod
    def validate_tempo_positivo(cls, v):
        """Valida que tempo é não-negativo"""
        if v is not None and v < 0:
            raise ValueError('Tempo não pode ser negativo')
        return v

    @field_validator('tempoHoras')
    @classmethod
    def validate_horas(cls, v):
        """Valida que horas está entre 0 e 23"""
        if v is not None and (v < 0 or v > 23):
            raise ValueError('Horas deve estar entre 0 e 23')
        return v

    @field_validator('tempoMinutos')
    @classmethod
    def validate_minutos(cls, v):
        """Valida que minutos está entre 0 e 59"""
        if v is not None and (v < 0 or v > 59):
            raise ValueError('Minutos deve estar entre 0 e 59')
        return v

    @field_validator('modos')
    @classmethod
    def validate_modos(cls, v):
        """Valida que pelo menos um modo de transporte foi selecionado"""
        if not v or len(v) == 0:
            raise ValueError('Selecione pelo menos um modo de transporte')

        modos_validos = ['rodoviario', 'ferroviario', 'hidroviario', 'cabotagem', 'dutoviario', 'aeroviario']
        for modo in v:
            if modo not in modos_validos:
                raise ValueError(f'Modo de transporte inválido: {modo}')

        return v

    @model_validator(mode='after')
    def validate_campos_condicionais(self):
        """
        Validações cruzadas (campos condicionais)
        """
        # Se tem paradas = sim, número de paradas é obrigatório
        if self.temParadas == 'sim' and not self.numParadas:
            raise ValueError(
                'Campo "Número de paradas" é obrigatório quando tem_paradas = "sim"'
            )

        # Se modos inclui rodoviário, configuração de veículo é obrigatória
        if 'rodoviario' in self.modos and not self.configVeiculo:
            raise ValueError(
                'Campo "Configuração do veículo" é obrigatório quando modo rodoviário está selecionado'
            )

        # Se tipo empresa = outro, campo outro_tipo é obrigatório
        if self.tipoEmpresa == 'outro' and not self.outroTipo:
            raise ValueError(
                'Campo "Especificar outro tipo" é obrigatório quando tipo_empresa = "outro"'
            )

        # Valida que o tempo total não seja zero
        if self.tempoDias == 0 and self.tempoHoras == 0 and self.tempoMinutos == 0:
            raise ValueError('Tempo de transporte deve ser maior que zero')

        return self

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


# ============================================================
# DIVIDED PAYLOAD SCHEMAS (importados de arquivos separados)
# ============================================================

class DividedSubmitPayload(BaseModel):
    """Schema principal para payload dividido em 4 subpayloads"""
    empresa: EmpresaPayload
    entrevistado: EntrevistadoPayload
    pesquisa: PesquisaPayload
    produtos: List[ProdutoTransportadoPayload]

    class Config:
        populate_by_name = True
