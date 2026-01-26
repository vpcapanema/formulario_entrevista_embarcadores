"""
RECREATED: models/__init__.py
Recreated on 2025-12-11 to align with `app/schemas` payload fields.

============================================================
SQLALCHEMY MODELS - FastAPI PLI 2050
============================================================
Models para todas as tabelas do schema formulario_embarcadores
"""
# pylint: disable=E1102

from sqlalchemy import (
    Column, Integer, String, Numeric, Boolean, Text, Date,
    TIMESTAMP, ForeignKey, ARRAY, CheckConstraint, Index, DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func  # pylint: disable=E1102
from app.database import Base

# Schema name
SCHEMA = "formulario_embarcadores"

# ============================================================
# TABELAS AUXILIARES
# ============================================================


class Instituicao(Base):
    """Modelo para instituições parceiras do projeto PLI 2050."""
    __tablename__ = "instituicoes"
    __table_args__ = {"schema": SCHEMA}

    id_instituicao = Column(Integer, primary_key=True, index=True)
    nome_instituicao = Column(String(255), nullable=False, unique=True)
    tipo_instituicao = Column(String(50))
    cnpj = Column(String(18))


class EstadoBrasil(Base):
    """Modelo para estados brasileiros."""
    __tablename__ = "estados_brasil"
    __table_args__ = {"schema": SCHEMA}

    id_estado = Column(Integer, primary_key=True, index=True)
    uf = Column(String(2), nullable=False, unique=True)
    nome_estado = Column(String(50), nullable=False)
    regiao = Column(String(20), nullable=False)


class Pais(Base):
    """Modelo para países."""
    __tablename__ = "paises"
    __table_args__ = {"schema": SCHEMA}

    id_pais = Column(Integer, primary_key=True, index=True)
    nome_pais = Column(String(100), nullable=False, unique=True)
    codigo_iso2 = Column(String(2))
    codigo_iso3 = Column(String(3))
    relevancia = Column(Integer, default=0)


class MunicipioSP(Base):
    """DEPRECATED: Mantido para compatibilidade. Use MunicipioBrasil."""
    __tablename__ = "municipios_sp"
    __table_args__ = {"schema": SCHEMA}

    id_municipio = Column(Integer, primary_key=True, index=True)
    nome_municipio = Column(String(100), nullable=False, unique=True)
    codigo_ibge = Column(String(7), unique=True)
    regiao = Column(String(50))


class MunicipioBrasil(Base):
    """Tabela completa de municípios do IBGE (5570+ registros)"""
    __tablename__ = "dim_municipio"
    __table_args__ = {"schema": "dados_brasil"}

    codigo_municipio = Column(String(7), primary_key=True, index=True)  # Código IBGE
    nome_municipio = Column(String(100), nullable=False, index=True)
    uf = Column(String(2), nullable=False, index=True)  # Essencial para filtro
    nome_uf = Column(String(50))  # Nome completo do estado


class FuncaoEntrevistado(Base):
    """Modelo para funções dos entrevistados."""
    __tablename__ = "funcoes_entrevistado"
    __table_args__ = {"schema": SCHEMA}

    id_funcao = Column(Integer, primary_key=True, index=True)
    nome_funcao = Column(String(100), nullable=False, unique=True)

# ============================================================
# TABELA: ENTREVISTADORES
# ============================================================


class Entrevistador(Base):
    """Modelo para entrevistadores."""
    __tablename__ = "entrevistadores"
    __table_args__ = {"schema": SCHEMA}

    id_entrevistador = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    id_instituicao = Column(Integer, ForeignKey(f"{SCHEMA}.instituicoes.id_instituicao"))

    # Relationship
    instituicao = relationship("Instituicao")

# ============================================================
# TABELA: EMPRESAS
# ============================================================


class Empresa(Base):
    """Modelo para empresas embarcadoras e transportadoras."""
    __tablename__ = "empresas"
    __table_args__ = (
        CheckConstraint(
            "tipo_empresa IN ('embarcador', 'transportador', 'operador', 'outro')",
            name="check_tipo_empresa"
        ),
        Index("idx_empresas_razao_social", "razao_social"),
        Index("idx_empresas_cnpj", "cnpj"),
        Index("idx_empresas_municipio", "municipio"),
        Index("idx_empresas_tipo", "tipo_empresa"),
        {"schema": SCHEMA}
    )

    id_empresa = Column(Integer, primary_key=True, index=True)
    razao_social = Column(String(255), nullable=False)
    # Campo renomeado conforme migration 20251108
    tipo_empresa = Column(String(50), nullable=False)
    outro_tipo = Column(String(255))
    municipio = Column(String(255), nullable=False)
    estado = Column(String(100))
    cnpj = Column(String(14), unique=True)  # Apenas dígitos (14 chars) conforme migration

    # Campos adicionais da Receita Federal
    nome_fantasia = Column(String(255))
    telefone = Column(String(20))
    email = Column(String(255))
    id_municipio = Column(Integer)
    logradouro = Column(String(255))
    numero = Column(String(20))
    complemento = Column(String(100))
    bairro = Column(String(100))
    cep = Column(String(8))
    # cnpj_digits removed to match schema (deprecated)

    # Novos campos da Receita Federal (migration 20251210)
    endereco = Column(String(255))
    uf = Column(String(2))
    site = Column(String(255))
    porte_empresa = Column(String(50))
    setor_atividade = Column(String(255))
    cnae = Column(String(20))
    faturamento_anual = Column(String(50))
    numero_funcionarios = Column(Integer)
    ano_fundacao = Column(Integer)
    inscricao_estadual = Column(String(20))
    inscricao_municipal = Column(String(20))
    natureza_juridica = Column(String(255))
    situacao_cadastral = Column(String(50))
    data_situacao_cadastral = Column(Date)
    motivo_situacao_cadastral = Column(String(255))
    situacao_especial = Column(String(50))
    data_situacao_especial = Column(Date)

    # Relationships
    entrevistados = relationship("Entrevistado", back_populates="empresa", cascade="all, delete-orphan")
    pesquisas = relationship("Pesquisa", back_populates="empresa")
    produtos = relationship("ProdutoTransportado", back_populates="empresa")

# ============================================================
# TABELA: ENTREVISTADOS
# ============================================================


class Entrevistado(Base):
    """Modelo para entrevistados das empresas."""
    __tablename__ = "entrevistados"
    __table_args__ = (
        CheckConstraint(
            "email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' OR email IS NULL",
            name="email_entrevistado_valido"
        ),
        Index("idx_entrevistados_empresa", "id_empresa"),
        Index("idx_entrevistados_email", "email"),
        Index("idx_entrevistados_principal", "principal"),
        {"schema": SCHEMA}
    )

    id_entrevistado = Column(Integer, primary_key=True, index=True)
    id_empresa = Column(Integer, ForeignKey(f"{SCHEMA}.empresas.id_empresa",
                                     ondelete="CASCADE"), nullable=False)
    nome = Column(String(255), nullable=False)
    funcao = Column(String(255), nullable=False)
    telefone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    principal = Column(Boolean, default=False)
    # timestamps and email_lower removed to match schemas
    # Campos de naturalidade e estado civil (adicionados em 20251114)
    estado_civil = Column(String(20))
    nacionalidade = Column(String(20))
    uf_naturalidade = Column(String(2))
    municipio_naturalidade = Column(String(7))

    # Relationships
    empresa = relationship("Empresa", back_populates="entrevistados")
    pesquisas = relationship("Pesquisa", back_populates="entrevistado")

# ============================================================
# TABELA: PESQUISAS
# ============================================================


class Pesquisa(Base):
    """Modelo para pesquisas de formulários PLI 2050."""
    __tablename__ = "pesquisas"
    __table_args__ = (
        CheckConstraint(
            "tipo_responsavel IN ('entrevistador', 'entrevistado')",
            name="check_tipo_responsavel"
        ),
        CheckConstraint(
            "status IN ('rascunho', 'finalizada', 'validada')",
            name="check_status"
        ),
        CheckConstraint(
            "tipo_transporte IN ('importacao', 'exportacao', 'local', 'nao-sei')",
            name="check_tipo_transporte"
        ),
        CheckConstraint(
            "tem_paradas IN ('sim', 'nao', 'nao-sei')",
            name="check_tem_paradas"
        ),
        CheckConstraint(
            "carga_perigosa IN ('sim', 'nao', 'nao-sei')",
            name="check_carga_perigosa"
        ),
        CheckConstraint(
            "num_paradas > 0",
            name="check_num_paradas"
        ),
        CheckConstraint(
            "capacidade_utilizada >= 0 AND capacidade_utilizada <= 100",
            name="check_capacidade_utilizada"
        ),
        CheckConstraint(
            "frequencia_diaria > 0",
            name="check_frequencia_diaria"
        ),
        Index("idx_pesquisas_empresa", "id_empresa"),
        Index("idx_pesquisas_entrevistado", "id_entrevistado"),
        Index("idx_pesquisas_produto", "produto_principal"),
        Index("idx_pesquisas_status", "status"),
        Index("idx_pesquisas_responsavel", "id_responsavel"),
        Index("idx_pesquisas_agrupamento", "agrupamento_produto"),
        Index("idx_pesquisas_modos", "modos", postgresql_using="gin"),
        {"schema": SCHEMA}
    )

    # Primary Key & Foreign Keys
    id_pesquisa = Column(Integer, primary_key=True, index=True)
    id_empresa = Column(Integer, ForeignKey(f"{SCHEMA}.empresas.id_empresa"), nullable=False)
    id_entrevistado = Column(Integer, ForeignKey(f"{SCHEMA}.entrevistados.id_entrevistado"),
                              nullable=False)
    tipo_responsavel = Column(String(20), nullable=False)
    id_responsavel = Column(Integer, nullable=False)

    # Timestamps
    data_entrevista = Column(DateTime(timezone=True), default=func.now())  # pylint: disable=not-callable
    data_atualizacao = Column(DateTime(timezone=True), onupdate=func.now())  # pylint: disable=not-callable
    status = Column(String(20), default="finalizada")

    # Produto
    produto_principal = Column(String(255), nullable=False)
    agrupamento_produto = Column(String(100), nullable=False)
    outro_produto = Column(String(255))
    observacoes_produto_principal = Column(Text)

    # Transporte
    tipo_transporte = Column(String(50), nullable=False)

    # Origem
    origem_pais = Column(String(100), nullable=False)
    origem_estado = Column(String(100))  # NULLABLE no banco
    origem_municipio = Column(String(255))  # NULLABLE no banco
    origem_instalacao = Column(String(255))

    # Destino
    destino_pais = Column(String(100), nullable=False)
    destino_estado = Column(String(100))  # NULLABLE no banco
    destino_municipio = Column(String(255))  # NULLABLE no banco
    destino_instalacao = Column(String(255))

    # Distância e paradas
    distancia = Column(Numeric(10, 2), nullable=False)
    tem_paradas = Column(String(3), nullable=False)
    num_paradas = Column(Integer)

    # Modais (ARRAY)
    modos = Column(ARRAY(Text), nullable=False)
    config_veiculo = Column(String(100))
    modal_predominante = Column(String(50))
    modal_secundario = Column(String(50))
    modal_terciario = Column(String(50))

    # Capacidade e Peso
    capacidade_utilizada = Column(Numeric(5, 2))
    peso_carga = Column(Numeric(12, 2), nullable=False)
    unidade_peso = Column(String(20), nullable=False)

    # Custos
    custo_transporte = Column(Numeric(12, 2), nullable=False)
    valor_carga = Column(Numeric(15, 2), nullable=False)
    custo_medio_tonelada = Column(Numeric(15, 2))
    pedagio_custo = Column(Numeric(15, 2))
    frete_custo = Column(Numeric(15, 2))
    manutencao_custo = Column(Numeric(15, 2))
    outros_custos = Column(Numeric(15, 2))

    # Embalagem e Segurança
    tipo_embalagem = Column(String(100), nullable=False)
    carga_perigosa = Column(String(3), nullable=False)

    # Tempo
    tempo_dias = Column(Integer, nullable=False)
    tempo_horas = Column(Integer, nullable=False)
    tempo_minutos = Column(Integer, nullable=False)
    tempo_transporte = Column(String(50))

    # Frequência
    frequencia = Column(String(50), nullable=False)
    frequencia_diaria = Column(Numeric(4, 1))
    frequencia_outra = Column(String(255))
    observacoes_sazonalidade = Column(Text)

    # Importâncias e Variações
    importancia_custo = Column(String(20), nullable=False)
    variacao_custo = Column(Numeric(5, 2), nullable=False)
    importancia_tempo = Column(String(20), nullable=False)
    variacao_tempo = Column(Numeric(5, 2), nullable=False)
    importancia_confiabilidade = Column(String(20), nullable=False)
    variacao_confiabilidade = Column(Numeric(5, 2), nullable=False)
    importancia_seguranca = Column(String(20), nullable=False)
    variacao_seguranca = Column(Numeric(5, 2), nullable=False)
    importancia_capacidade = Column(String(20), nullable=False)
    variacao_capacidade = Column(Numeric(5, 2), nullable=False)

    # Estratégia
    tipo_cadeia = Column(String(50), nullable=False)
    modais_alternativos = Column(ARRAY(Text))
    fator_adicional = Column(Text)

    # Dificuldades
    dificuldades = Column(ARRAY(Text))
    detalhe_dificuldade = Column(Text)

    # Frota
    proprio_terceirizado = Column(String(50))
    qtd_caminhoes_proprios = Column(Integer)
    qtd_caminhoes_terceirizados = Column(Integer)

    # Volume
    volume_anual_toneladas = Column(Numeric(15, 2))
    tipo_produto = Column(String(100))
    classe_produto = Column(String(100))
    produtos_especificos = Column(Text)

    # Desafios e Sustentabilidade
    principais_desafios = Column(Text)
    investimento_sustentavel = Column(String(10))
    reducao_emissoes = Column(Text)
    tecnologias_interesse = Column(Text)

    # Tecnologia
    uso_tecnologia = Column(String(50))
    grau_automacao = Column(String(50))
    rastreamento_carga = Column(Boolean, default=False)
    uso_dados = Column(Text)

    # Hidrovias
    conhecimento_hidrovias = Column(String(50))
    viabilidade_hidrovia = Column(String(50))
    pontos_melhoria = Column(Text)

    # Parcerias e Feedback
    interesse_parcerias = Column(Boolean, default=False)
    feedback_formulario = Column(Text)

    # Outros
    observacoes = Column(Text)
    consentimento = Column(Boolean, default=False)
    transporta_carga = Column(Boolean, default=False)
    id_instalacao_origem = Column(Integer)

    # Relationships
    empresa = relationship("Empresa", back_populates="pesquisas")
    entrevistado = relationship("Entrevistado", back_populates="pesquisas")
    produtos_transportados = relationship("ProdutoTransportado", back_populates="pesquisa",
                                         cascade="all, delete-orphan")

# ============================================================
# TABELA: PRODUTOS TRANSPORTADOS
# ============================================================


class ProdutoTransportado(Base):
    """Modelo para produtos transportados nas pesquisas."""
    __tablename__ = "produtos_transportados"
    __table_args__ = (
        Index("idx_produtos_pesquisa", "id_pesquisa"),
        Index("idx_produtos_empresa", "id_empresa"),
        Index("idx_produtos_carga", "carga"),
        {"schema": SCHEMA}
    )

    id_produto = Column(Integer, primary_key=True, index=True)
    id_pesquisa = Column(
        Integer,
        ForeignKey(f"{SCHEMA}.pesquisas.id_pesquisa", ondelete="CASCADE"),
        nullable=False
    )
    id_empresa = Column(Integer, ForeignKey(f"{SCHEMA}.empresas.id_empresa"), nullable=False)
    carga = Column(String(255), nullable=False)
    movimentacao = Column(Numeric(12, 2))
    distancia = Column(Numeric(10, 2))
    modalidade = Column(String(50))
    acondicionamento = Column(String(100))
    ordem = Column(Integer, default=1)
    observacoes = Column(Text)
    
    # Campos de localização (migração 20251106)
    origem_pais = Column(Integer)  # FK to paises.id_pais
    destino_pais = Column(Integer)  # FK to paises.id_pais
    origem_estado = Column(String(2))  # UF
    origem_municipio = Column(String(10))  # Código IBGE
    destino_estado = Column(String(2))  # UF
    destino_municipio = Column(String(10))  # Código IBGE

    # Relationships
    pesquisa = relationship("Pesquisa", back_populates="produtos_transportados")
    empresa = relationship("Empresa", back_populates="produtos")
