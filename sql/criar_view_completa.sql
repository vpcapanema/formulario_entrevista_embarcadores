-- =====================================================
-- VIEW: v_pesquisas_completa
-- Descrição: View completa com todos os campos das pesquisas
--            mostrando nomes legíveis ao invés de códigos
-- Schema: formulario_embarcadores
-- Criado em: Junho 2025
-- =====================================================

DROP VIEW IF EXISTS formulario_embarcadores.v_pesquisas_completa CASCADE;

CREATE OR REPLACE VIEW formulario_embarcadores.v_pesquisas_completa AS
SELECT 
    -- =====================================================
    -- IDENTIFICADORES
    -- =====================================================
    p.id_pesquisa,
    p.data_entrevista,
    p.data_atualizacao,
    p.status,
    
    -- =====================================================
    -- RESPONSAVEL PELO PREENCHIMENTO
    -- =====================================================
    p.tipo_responsavel,
    p.id_responsavel,
    CASE 
        WHEN p.tipo_responsavel = 'entrevistador' THEN ent_resp.nome_completo
        ELSE 'Entrevistado (empresa)'
    END AS nome_responsavel,
    CASE 
        WHEN p.tipo_responsavel = 'entrevistador' THEN inst.nome_instituicao
        ELSE NULL
    END AS instituicao_responsavel,
    
    -- =====================================================
    -- DADOS DA EMPRESA
    -- =====================================================
    p.id_empresa,
    emp.razao_social AS empresa_razao_social,
    emp.nome_fantasia AS empresa_nome_fantasia,
    emp.cnpj AS empresa_cnpj,
    emp.tipo_empresa AS empresa_tipo,
    emp.municipio AS empresa_municipio,
    emp.estado AS empresa_estado,
    emp.telefone AS empresa_telefone,
    emp.email AS empresa_email,
    emp.situacao_cadastral AS empresa_situacao_cadastral,
    
    -- =====================================================
    -- DADOS DO ENTREVISTADO
    -- =====================================================
    p.id_entrevistado,
    entrev.nome AS entrevistado_nome,
    entrev.funcao AS entrevistado_funcao_id,
    COALESCE(func.nome_funcao, entrev.funcao) AS entrevistado_funcao_nome,
    entrev.telefone AS entrevistado_telefone,
    entrev.email AS entrevistado_email,
    entrev.estado_civil AS entrevistado_estado_civil,
    entrev.nacionalidade AS entrevistado_nacionalidade,
    entrev.uf_naturalidade AS entrevistado_uf_naturalidade,
    COALESCE(est_nat.nome_estado, entrev.uf_naturalidade) AS entrevistado_estado_naturalidade_nome,
    entrev.municipio_naturalidade AS entrevistado_municipio_naturalidade,
    
    -- =====================================================
    -- PRODUTO PRINCIPAL
    -- =====================================================
    p.produto_principal,
    p.agrupamento_produto,
    p.outro_produto,
    
    -- =====================================================
    -- TRANSPORTE - ORIGEM E DESTINO
    -- =====================================================
    p.tipo_transporte,
    
    -- Origem País (texto ou código)
    p.origem_pais AS origem_pais_original,
    CASE 
        WHEN p.origem_pais ~ '^[0-9]+$' THEN COALESCE(pais_orig.nome_pais, p.origem_pais)
        ELSE p.origem_pais
    END AS origem_pais_nome,
    
    -- Origem Estado
    p.origem_estado AS origem_estado_uf,
    COALESCE(est_orig.nome_estado, p.origem_estado) AS origem_estado_nome,
    
    -- Origem Município (texto ou código IBGE)
    p.origem_municipio AS origem_municipio_original,
    CASE 
        WHEN p.origem_municipio ~ '^[0-9]+$' THEN COALESCE(mun_orig.nome_municipio, p.origem_municipio)
        ELSE p.origem_municipio
    END AS origem_municipio_nome,
    p.origem_instalacao,
    
    -- Destino País (texto ou código)
    p.destino_pais AS destino_pais_original,
    CASE 
        WHEN p.destino_pais ~ '^[0-9]+$' THEN COALESCE(pais_dest.nome_pais, p.destino_pais)
        ELSE p.destino_pais
    END AS destino_pais_nome,
    
    -- Destino Estado
    p.destino_estado AS destino_estado_uf,
    COALESCE(est_dest.nome_estado, p.destino_estado) AS destino_estado_nome,
    
    -- Destino Município (texto ou código IBGE)
    p.destino_municipio AS destino_municipio_original,
    CASE 
        WHEN p.destino_municipio ~ '^[0-9]+$' THEN COALESCE(mun_dest.nome_municipio, p.destino_municipio)
        ELSE p.destino_municipio
    END AS destino_municipio_nome,
    p.destino_instalacao,
    
    -- =====================================================
    -- CARACTERISTICAS DO TRANSPORTE
    -- =====================================================
    p.distancia,
    p.tem_paradas,
    p.num_paradas,
    p.modos,
    array_to_string(p.modos, ', ') AS modos_texto,
    p.config_veiculo,
    p.capacidade_utilizada,
    p.peso_carga,
    p.unidade_peso,
    p.custo_transporte,
    p.valor_carga,
    p.tipo_embalagem,
    p.carga_perigosa,
    
    -- Tempo formatado
    p.tempo_dias,
    p.tempo_horas,
    p.tempo_minutos,
    CONCAT(
        CASE WHEN COALESCE(p.tempo_dias, 0) > 0 THEN p.tempo_dias || 'd ' ELSE '' END,
        CASE WHEN COALESCE(p.tempo_horas, 0) > 0 THEN p.tempo_horas || 'h ' ELSE '' END,
        CASE WHEN COALESCE(p.tempo_minutos, 0) > 0 THEN p.tempo_minutos || 'min' ELSE '' END
    ) AS tempo_total_formatado,
    
    p.frequencia,
    p.frequencia_diaria,
    p.frequencia_outra,
    
    -- =====================================================
    -- FATORES DE DECISAO MODAL
    -- =====================================================
    p.importancia_custo,
    p.variacao_custo,
    p.importancia_tempo,
    p.variacao_tempo,
    p.importancia_confiabilidade,
    p.variacao_confiabilidade,
    p.importancia_seguranca,
    p.variacao_seguranca,
    p.importancia_capacidade,
    p.variacao_capacidade,
    
    -- =====================================================
    -- ANALISE ESTRATEGICA
    -- =====================================================
    p.tipo_cadeia,
    p.modais_alternativos,
    array_to_string(p.modais_alternativos, ', ') AS modais_alternativos_texto,
    p.fator_adicional,
    
    -- =====================================================
    -- DIFICULDADES
    -- =====================================================
    p.dificuldades,
    array_to_string(p.dificuldades, ', ') AS dificuldades_texto,
    p.detalhe_dificuldade,
    
    -- =====================================================
    -- OBSERVACOES
    -- =====================================================
    p.observacoes,
    p.observacoes_produto_principal,
    p.observacoes_sazonalidade,
    
    -- =====================================================
    -- CAMPOS ADICIONAIS
    -- =====================================================
    p.modal_predominante,
    p.modal_secundario,
    p.modal_terciario,
    p.custo_medio_tonelada,
    p.pedagio_custo,
    p.frete_custo,
    p.manutencao_custo,
    p.outros_custos,
    p.tempo_transporte,
    p.proprio_terceirizado,
    p.qtd_caminhoes_proprios,
    p.qtd_caminhoes_terceirizados,
    p.volume_anual_toneladas,
    p.tipo_produto,
    p.classe_produto,
    p.produtos_especificos,
    p.principais_desafios,
    p.investimento_sustentavel,
    p.reducao_emissoes,
    p.tecnologias_interesse,
    p.uso_tecnologia,
    p.grau_automacao,
    p.rastreamento_carga,
    p.uso_dados,
    p.conhecimento_hidrovias,
    p.viabilidade_hidrovia,
    p.pontos_melhoria,
    p.interesse_parcerias,
    p.feedback_formulario,
    p.consentimento,
    p.transporta_carga

FROM formulario_embarcadores.pesquisas p

-- JOIN com empresa
LEFT JOIN formulario_embarcadores.empresas emp 
    ON p.id_empresa = emp.id_empresa

-- JOIN com entrevistado
LEFT JOIN formulario_embarcadores.entrevistados entrev 
    ON p.id_entrevistado = entrev.id_entrevistado

-- JOIN com funcao do entrevistado (usando CASE para evitar cast de texto)
LEFT JOIN formulario_embarcadores.funcoes_entrevistado func 
    ON func.id_funcao = CASE 
        WHEN entrev.funcao ~ '^[0-9]+$' THEN entrev.funcao::integer 
        ELSE NULL 
    END

-- JOIN com estado de naturalidade do entrevistado
LEFT JOIN formulario_embarcadores.estados_brasil est_nat 
    ON entrev.uf_naturalidade = est_nat.uf

-- JOIN com entrevistador (quando responsavel = entrevistador)
LEFT JOIN formulario_embarcadores.entrevistadores ent_resp 
    ON p.tipo_responsavel = 'entrevistador' AND p.id_responsavel = ent_resp.id_entrevistador

-- JOIN com instituicao do entrevistador
LEFT JOIN formulario_embarcadores.instituicoes inst 
    ON ent_resp.id_instituicao = inst.id_instituicao

-- JOIN com pais de origem (usando CASE para evitar cast de texto)
LEFT JOIN formulario_embarcadores.paises pais_orig 
    ON pais_orig.id_pais = CASE 
        WHEN p.origem_pais ~ '^[0-9]+$' THEN p.origem_pais::integer 
        ELSE NULL 
    END

-- JOIN com pais de destino (usando CASE para evitar cast de texto)
LEFT JOIN formulario_embarcadores.paises pais_dest 
    ON pais_dest.id_pais = CASE 
        WHEN p.destino_pais ~ '^[0-9]+$' THEN p.destino_pais::integer 
        ELSE NULL 
    END

-- JOIN com estado de origem
LEFT JOIN formulario_embarcadores.estados_brasil est_orig 
    ON p.origem_estado = est_orig.uf

-- JOIN com estado de destino
LEFT JOIN formulario_embarcadores.estados_brasil est_dest 
    ON p.destino_estado = est_dest.uf

-- JOIN com municipio de origem (quando for código IBGE)
LEFT JOIN formulario_embarcadores.municipios_sp mun_orig 
    ON p.origem_municipio ~ '^[0-9]+$' AND p.origem_municipio = mun_orig.codigo_ibge

-- JOIN com municipio de destino (quando for código IBGE)
LEFT JOIN formulario_embarcadores.municipios_sp mun_dest 
    ON p.destino_municipio ~ '^[0-9]+$' AND p.destino_municipio = mun_dest.codigo_ibge

ORDER BY p.id_pesquisa DESC;

-- Comentário sobre a view
COMMENT ON VIEW formulario_embarcadores.v_pesquisas_completa IS 
'View consolidada de todas as pesquisas com campos de lookup resolvidos para nomes legíveis.
Trata dados tanto em formato texto quanto código numérico.
Inclui 100+ campos organizados por categoria.';
