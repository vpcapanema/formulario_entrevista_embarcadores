from typing import Any, Dict, List
from app.schemas import (
    DividedSubmitPayload,
    EmpresaPayload,
    EntrevistadoPayload,
    PesquisaPayload,
    ProdutoTransportadoPayload,
)


def _map_produto(prod: Any) -> Dict:
    # aceita dicts ou Pydantic models com atributos
    def g(k):
        if isinstance(prod, dict):
            return prod.get(k)
        return getattr(prod, k, None)

    return {
        "carga": g("carga"),
        "movimentacao": g("movimentacao"),
        "distancia": g("distancia"),
        "modalidade": g("modalidade"),
        "acondicionamento": g("acondicionamento"),
        "ordem": g("ordem") or None,
        "observacoes": g("observacoes"),
        # legacy payload usa `origem`/`destino` strings; mapear para campos de município
        "origem_municipio": g("origem"),
        "destino_municipio": g("destino"),
    }


def legacy_to_divided(legacy: Any) -> DividedSubmitPayload:
    """Converte o payload legado (SubmitFormData / camelCase) para
    `DividedSubmitPayload` com nomes canônicos (snake_case).

    Aceita tanto instância Pydantic quanto dict.
    """
    # helper para acessar campos
    def get(obj, key, alt=None):
        if obj is None:
            return alt
        if isinstance(obj, dict):
            return obj.get(key, alt)
        return getattr(obj, key, alt)

    # Empresa
    razao_social = get(legacy, "razaoSocial") or get(legacy, "nomeEmpresa")
    empresa = EmpresaPayload(
        tipo_empresa=get(legacy, "tipoEmpresa"),
        municipio=get(legacy, "municipio"),
        razao_social=razao_social,
        outro_tipo=get(legacy, "outroTipo"),
        estado=get(legacy, "estado"),
        nome_fantasia=get(legacy, "nomeFantasia"),
        telefone=get(legacy, "telefone"),
        email=get(legacy, "email"),
        id_municipio=get(legacy, "idMunicipio"),
        logradouro=get(legacy, "logradouro"),
        numero=get(legacy, "numero"),
        complemento=get(legacy, "complemento"),
        bairro=get(legacy, "bairro"),
        cep=get(legacy, "cep"),
        cnpj=get(legacy, "cnpj"),
        endereco=get(legacy, "endereco"),
        uf=get(legacy, "uf"),
        site=get(legacy, "site"),
        porte_empresa=get(legacy, "porteEmpresa"),
        setor_atividade=get(legacy, "setorAtividade"),
        cnae=get(legacy, "cnae"),
        faturamento_anual=get(legacy, "faturamentoAnual"),
        numero_funcionarios=get(legacy, "numeroFuncionarios"),
        ano_fundacao=get(legacy, "anoFundacao"),
        inscricao_estadual=get(legacy, "inscricaoEstadual"),
        inscricao_municipal=get(legacy, "inscricaoMunicipal"),
        natureza_juridica=get(legacy, "naturezaJuridica"),
        situacao_cadastral=get(legacy, "situacaoCadastral"),
        data_situacao_cadastral=get(legacy, "dataSituacaoCadastral"),
        motivo_situacao_cadastral=get(legacy, "motivoSituacaoCadastral"),
        situacao_especial=get(legacy, "situacaoEspecial"),
        data_situacao_especial=get(legacy, "dataSituacaoEspecial"),
    )

    # Entrevistado
    entrevistado = EntrevistadoPayload(
        nome=get(legacy, "nome"),
        funcao=get(legacy, "funcao"),
        telefone=get(legacy, "telefone"),
        email=get(legacy, "email"),
        principal=get(legacy, "principal"),
        estado_civil=get(legacy, "estadoCivil"),
        nacionalidade=get(legacy, "nacionalidade"),
        uf_naturalidade=get(legacy, "ufNaturalidade"),
        municipio_naturalidade=get(legacy, "municipioNaturalidade"),
    )

    # Pesquisa
    pesquisa = PesquisaPayload(
        tipo_responsavel=get(legacy, "tipoResponsavel"),
        id_responsavel=get(legacy, "idResponsavel"),
        produto_principal=get(legacy, "produtoPrincipal"),
        agrupamento_produto=get(legacy, "agrupamentoProduto"),
        tipo_transporte=get(legacy, "tipoTransporte"),
        origem_pais=get(legacy, "origemPais"),
        destino_pais=get(legacy, "destinoPais"),
        distancia=get(legacy, "distancia"),
        tem_paradas=get(legacy, "temParadas"),
        modos=get(legacy, "modos") or get(legacy, "modosTransporte") or [],
        peso_carga=get(legacy, "pesoCarga"),
        unidade_peso=get(legacy, "unidadePeso"),
        custo_transporte=get(legacy, "custoTransporte"),
        valor_carga=get(legacy, "valorCarga"),
        tipo_embalagem=get(legacy, "tipoEmbalagem"),
        carga_perigosa=get(legacy, "cargaPerigosa"),
        tempo_dias=get(legacy, "tempoDias"),
        tempo_horas=get(legacy, "tempoHoras"),
        tempo_minutos=get(legacy, "tempoMinutos"),
        frequencia=get(legacy, "frequencia"),
        importancia_custo=get(legacy, "importanciaCusto"),
        variacao_custo=get(legacy, "variacaoCusto"),
        importancia_tempo=get(legacy, "importanciaTempo"),
        variacao_tempo=get(legacy, "variacaoTempo"),
        importancia_confiabilidade=get(legacy, "importanciaConfiabilidade"),
        variacao_confiabilidade=get(legacy, "variacaoConfiabilidade"),
        importancia_seguranca=get(legacy, "importanciaSeguranca"),
        variacao_seguranca=get(legacy, "variacaoSeguranca"),
        importancia_capacidade=get(legacy, "importanciaCapacidade"),
        variacao_capacidade=get(legacy, "variacaoCapacidade"),
        tipo_cadeia=get(legacy, "tipoCadeia"),
        status=get(legacy, "status"),
        outro_produto=get(legacy, "outroProduto"),
        origem_estado=get(legacy, "origemEstado"),
        origem_municipio=get(legacy, "origemMunicipio"),
        destino_estado=get(legacy, "destinoEstado"),
        destino_municipio=get(legacy, "destinoMunicipio"),
        config_veiculo=get(legacy, "configVeiculo"),
        frequencia_outra=get(legacy, "frequenciaOutra"),
        modais_alternativos=get(legacy, "modaisAlternativos"),
        fator_adicional=get(legacy, "fatorAdicional"),
        dificuldades=get(legacy, "dificuldades"),
        detalhe_dificuldade=get(legacy, "detalheDificuldade"),
        observacoes=get(legacy, "observacoes"),
        capacidade_utilizada=get(legacy, "capacidadeUtilizada"),
        num_paradas=get(legacy, "numParadas"),
        frequencia_diaria=get(legacy, "frequenciaDiaria"),
        consentimento=get(legacy, "consentimento"),
        transporta_carga=get(legacy, "transportaCarga"),
        origem_instalacao=get(legacy, "origemInstalacao"),
        destino_instalacao=get(legacy, "destinoInstalacao"),
        volume_anual_toneladas=get(legacy, "volumeAnualToneladas"),
        tipo_produto=get(legacy, "tipoProduto"),
        classe_produto=get(legacy, "classeProduto"),
        produtos_especificos=get(legacy, "produtosEspecificos"),
        modal_predominante=get(legacy, "modalPredominante"),
        modal_secundario=get(legacy, "modalSecundario"),
        modal_terciario=get(legacy, "modalTerciario"),
        proprio_terceirizado=get(legacy, "proprioTerceirizado"),
        qtd_caminhoes_proprios=get(legacy, "qtdCaminhoesProprios"),
        qtd_caminhoes_terceirizados=get(legacy, "qtdCaminhoesTerceirizados"),
        tempo_transporte=get(legacy, "tempoTransporte"),
        custo_medio_tonelada=get(legacy, "custoMedioTonelada"),
        pedagio_custo=get(legacy, "pedagioCusto"),
        frete_custo=get(legacy, "freteCusto"),
        manutencao_custo=get(legacy, "manutencaoCusto"),
        outros_custos=get(legacy, "outrosCustos"),
        principais_desafios=get(legacy, "principaisDesafios"),
        investimento_sustentavel=get(legacy, "investimentoSustentavel"),
        reducao_emissoes=get(legacy, "reducaoEmissoes"),
        tecnologias_interesse=get(legacy, "tecnologiasInteresse"),
        uso_tecnologia=get(legacy, "usoTecnologia"),
        grau_automacao=get(legacy, "grauAutomacao"),
        rastreamento_carga=get(legacy, "rastreamentoCarga"),
        uso_dados=get(legacy, "usoDados"),
        conhecimento_hidrovias=get(legacy, "conhecimentoHidrovias"),
        viabilidade_hidrovia=get(legacy, "viabilidadeHidrovia"),
        pontos_melhoria=get(legacy, "pontosMelhoria"),
        interesse_parcerias=get(legacy, "interesseParcerias"),
        feedback_formulario=get(legacy, "feedbackFormulario"),
        id_instalacao_origem=get(legacy, "idInstalacaoOrigem"),
        observacoes_produto_principal=get(legacy, "observacoesProdutoPrincipal"),
        observacoes_sazonalidade=get(legacy, "observacoesSazonalidade"),
    )

    # Produtos
    produtos_input = get(legacy, "produtos") or []
    produtos_list: List[ProdutoTransportadoPayload] = []
    for p in produtos_input:
        mapped = _map_produto(p)
        produtos_list.append(ProdutoTransportadoPayload(**mapped))

    divided = DividedSubmitPayload(
        empresa=empresa,
        entrevistado=entrevistado,
        pesquisa=pesquisa,
        produtos=produtos_list,
    )

    return divided
