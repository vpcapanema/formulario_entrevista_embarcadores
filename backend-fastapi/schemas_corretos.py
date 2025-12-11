#!/usr/bin/env python3
"""
SCHEMAS CORRETOS - DIVIDEDSUBMITPAYLOAD
Baseados nos DDLs reais do banco de dados
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# ===========================================================================
# EMPRESA PAYLOAD - Campos do DDL real
# ===========================================================================
class EmpresaPayloadCorreto(BaseModel):
    """
    DDL: CREATE TABLE empresas(
        id_empresa SERIAL NOT NULL,  # AUTO
        tipo_empresa varchar(50) NOT NULL,
        outro_tipo varchar(255),
        municipio varchar(255) NOT NULL,
        estado varchar(100),
        data_cadastro timestamp with time zone DEFAULT now(),  # AUTO
        data_atualizacao timestamp with time zone,  # AUTO
        razao_social varchar(255) NOT NULL,
        ... (todos os outros campos opcionais)
    """
    # NOT NULL (obrigatórios)
    tipo_empresa: str
    municipio: str
    razao_social: str
    
    # Opcionais
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


# ===========================================================================
# ENTREVISTADO PAYLOAD - Campos do DDL real
# ===========================================================================
class EntrevistadoPayloadCorreto(BaseModel):
    """
    DDL: CREATE TABLE entrevistados(
        id_entrevistado SERIAL NOT NULL,  # AUTO
        id_empresa integer NOT NULL,  # INSERIDO pelo backend
        nome varchar(255) NOT NULL,
        funcao varchar(255) NOT NULL,
        telefone varchar(20),
        email varchar(255),
        principal boolean DEFAULT false,
        data_cadastro timestamp with time zone DEFAULT now(),  # AUTO
        data_atualizacao timestamp with time zone,  # AUTO
        email_lower varchar(255),  # AUTO (trigger)
        estado_civil varchar(20),
        nacionalidade varchar(20),
        uf_naturalidade varchar(2),
        municipio_naturalidade varchar(7)
    """
    # NOT NULL
    nome: str
    funcao: str
    
    # Opcionais
    telefone: Optional[str] = None
    email: Optional[str] = None
    principal: Optional[bool] = None
    estado_civil: Optional[str] = None
    nacionalidade: Optional[str] = None
    uf_naturalidade: Optional[str] = None
    municipio_naturalidade: Optional[str] = None


# ===========================================================================
# PESQUISA PAYLOAD - Campos do DDL real (92 campos!)
# ===========================================================================
class PesquisaPayloadCorreto(BaseModel):
    """
    DDL: CREATE TABLE pesquisas(
        id_pesquisa SERIAL NOT NULL,  # AUTO
        id_empresa integer NOT NULL,  # INSERIDO pelo backend
        id_entrevistado integer NOT NULL,  # INSERIDO pelo backend
        tipo_responsavel varchar(20) NOT NULL,
        id_responsavel integer NOT NULL,
        data_entrevista timestamp with time zone DEFAULT now(),
        data_atualizacao timestamp with time zone,  # AUTO
        status varchar(20) DEFAULT 'finalizada'::character varying,
        produto_principal varchar(255) NOT NULL,
        ... (32 campos NOT NULL no total)
    """
    # NOT NULL (obrigatórios) - 32 campos
    tipo_responsavel: str
    id_responsavel: int
    produto_principal: str
    agrupamento_produto: str
    tipo_transporte: str
    origem_pais: str
    destino_pais: str
    distancia: float
    tem_paradas: str
    modos: List[str]
    peso_carga: float
    unidade_peso: str
    custo_transporte: float
    valor_carga: float
    tipo_embalagem: str
    carga_perigosa: str
    tempo_dias: int
    tempo_horas: int
    tempo_minutos: int
    frequencia: str
    importancia_custo: str
    variacao_custo: float
    importancia_tempo: str
    variacao_tempo: float
    importancia_confiabilidade: str
    variacao_confiabilidade: float
    importancia_seguranca: str
    variacao_seguranca: float
    importancia_capacidade: str
    variacao_capacidade: float
    tipo_cadeia: str
    
    # Opcionais - 60+ campos
    data_entrevista: Optional[str] = None  # timestamp
    status: Optional[str] = None
    outro_produto: Optional[str] = None
    origem_estado: Optional[str] = None
    origem_municipio: Optional[str] = None
    destino_estado: Optional[str] = None
    destino_municipio: Optional[str] = None
    config_veiculo: Optional[str] = None
    frequencia_outra: Optional[str] = None
    modais_alternativos: Optional[List[str]] = None
    fator_adicional: Optional[str] = None
    dificuldades: Optional[List[str]] = None
    detalhe_dificuldade: Optional[str] = None
    observacoes: Optional[str] = None
    capacidade_utilizada: Optional[float] = None
    num_paradas: Optional[int] = None
    frequencia_diaria: Optional[float] = None
    consentimento: Optional[bool] = None
    transporta_carga: Optional[bool] = None
    origem_instalacao: Optional[str] = None
    destino_instalacao: Optional[str] = None
    volume_anual_toneladas: Optional[float] = None
    tipo_produto: Optional[str] = None
    classe_produto: Optional[str] = None
    produtos_especificos: Optional[str] = None
    modal_predominante: Optional[str] = None
    modal_secundario: Optional[str] = None
    modal_terciario: Optional[str] = None
    proprio_terceirizado: Optional[str] = None
    qtd_caminhoes_proprios: Optional[int] = None
    qtd_caminhoes_terceirizados: Optional[int] = None
    tempo_transporte: Optional[str] = None
    custo_medio_tonelada: Optional[float] = None
    pedagio_custo: Optional[float] = None
    frete_custo: Optional[float] = None
    manutencao_custo: Optional[float] = None
    outros_custos: Optional[float] = None
    principais_desafios: Optional[str] = None
    investimento_sustentavel: Optional[str] = None
    reducao_emissoes: Optional[str] = None
    tecnologias_interesse: Optional[str] = None
    uso_tecnologia: Optional[str] = None
    grau_automacao: Optional[str] = None
    rastreamento_carga: Optional[bool] = None
    uso_dados: Optional[str] = None
    conhecimento_hidrovias: Optional[str] = None
    viabilidade_hidrovia: Optional[str] = None
    pontos_melhoria: Optional[str] = None
    interesse_parcerias: Optional[bool] = None
    feedback_formulario: Optional[str] = None
    id_instalacao_origem: Optional[int] = None
    observacoes_produto_principal: Optional[str] = None
    observacoes_sazonalidade: Optional[str] = None


# ===========================================================================
# PRODUTO TRANSPORTADO PAYLOAD - Campos do DDL real
# ===========================================================================
class ProdutoTransportadoPayloadCorreto(BaseModel):
    """
    DDL: produtos_transportados (
        id_produto SERIAL NOT NULL,  # AUTO
        id_pesquisa INTEGER NOT NULL,  # INSERIDO pelo backend
        id_empresa INTEGER NOT NULL,  # INSERIDO pelo backend
        carga VARCHAR(255) NOT NULL,
        movimentacao NUMERIC(12, 2),
        distancia NUMERIC(10, 2),
        modalidade VARCHAR(50),
        acondicionamento VARCHAR(100),
        ordem INTEGER DEFAULT 1,
        observacoes TEXT,
        origem_pais INTEGER,
        destino_pais INTEGER,
        origem_estado VARCHAR(2),
        origem_municipio VARCHAR(10),
        destino_estado VARCHAR(2),
        destino_municipio VARCHAR(10)
    """
    # NOT NULL
    carga: str
    
    # Opcionais
    movimentacao: Optional[float] = None
    distancia: Optional[float] = None
    modalidade: Optional[str] = None
    acondicionamento: Optional[str] = None
    ordem: Optional[int] = 1
    observacoes: Optional[str] = None
    origem_pais: Optional[int] = None
    destino_pais: Optional[int] = None
    origem_estado: Optional[str] = None
    origem_municipio: Optional[str] = None
    destino_estado: Optional[str] = None
    destino_municipio: Optional[str] = None


# ===========================================================================
# DIVIDED SUBMIT PAYLOAD - Container dos 4 subpayloads
# ===========================================================================
class DividedSubmitPayloadCorreto(BaseModel):
    """Schema principal para payload dividido em 4 subpayloads"""
    empresa: EmpresaPayloadCorreto
    entrevistado: EntrevistadoPayloadCorreto
    pesquisa: PesquisaPayloadCorreto
    produtos: List[ProdutoTransportadoPayloadCorreto]

    class Config:
        populate_by_name = True


# ===========================================================================
# TESTE
# ===========================================================================
if __name__ == "__main__":
    import json
    import time
    
    # CNPJ único
    cnpj = str(int(time.time()))[-14:].zfill(14)
    
    # Payload mínimo apenas com NOT NULL
    payload = {
        "empresa": {
            "tipo_empresa": "Embarcador",
            "municipio": "São Paulo",
            "razao_social": f"Teste Ltda {cnpj}",
            "cnpj": cnpj
        },
        "entrevistado": {
            "nome": "João Silva",
            "funcao": "Gerente"
        },
        "pesquisa": {
            "tipo_responsavel": "entrevistador",
            "id_responsavel": 1,
            "produto_principal": "Soja",
            "agrupamento_produto": "Grãos",
            "tipo_transporte": "local",
            "origem_pais": "Brasil",
            "destino_pais": "Brasil",
            "distancia": 450.0,
            "tem_paradas": "nao",
            "modos": ["rodoviario"],
            "peso_carga": 25000.0,
            "unidade_peso": "kg",
            "custo_transporte": 5000.0,
            "valor_carga": 50000.0,
            "tipo_embalagem": "Granel",
            "carga_perigosa": "nao",
            "tempo_dias": 2,
            "tempo_horas": 6,
            "tempo_minutos": 30,
            "frequencia": "semanal",
            "importancia_custo": "alta",
            "variacao_custo": 10.0,
            "importancia_tempo": "alta",
            "variacao_tempo": 15.0,
            "importancia_confiabilidade": "alta",
            "variacao_confiabilidade": 5.0,
            "importancia_seguranca": "alta",
            "variacao_seguranca": 3.0,
            "importancia_capacidade": "media",
            "variacao_capacidade": 20.0,
            "tipo_cadeia": "direta"
        },
        "produtos": [
            {
                "carga": "Soja em grãos"
            }
        ]
    }
    
    # Validar
    try:
        validated = DividedSubmitPayloadCorreto(**payload)
        print("✅ Payload válido!")
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"❌ Erro de validação: {e}")
