from pydantic import BaseModel
from typing import Optional, List


class PesquisaPayload(BaseModel):
    """EXATAMENTE como está no banco: 34 NOT NULL + 54 OPCIONAIS = 88 campos"""
    # NOT NULL (34 campos) - EXCETO id_responsavel que é calculado pelo backend
    tipo_responsavel: str
    # ⭐ id_responsavel: Opcional no payload (backend calcula automaticamente)
    # - Se tipo_responsavel='entrevistador': frontend DEVE enviar valor
    # - Se tipo_responsavel='entrevistado': backend usa id_entrevistado recém-criado
    id_responsavel: Optional[int] = None
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
    
    # OPCIONAIS (54 campos)
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
    
    class Config:
        populate_by_name = True
