DROP VIEW IF EXISTS formulario_embarcadores.v_pesquisas_completa CASCADE;

CREATE VIEW formulario_embarcadores.v_pesquisas_completa AS
SELECT 
    -- 1. ID DA PESQUISA
    p.id_pesquisa,
    
    -- 2. NOME DO RESPONSAVEL (condicional baseado em tipo_responsavel)
    CASE 
        WHEN p.tipo_responsavel = 'entrevistador' THEN entv.nome_completo
        WHEN p.tipo_responsavel = 'entrevistado' THEN ent.nome
        ELSE NULL
    END AS responsavel_nome,
    
    -- 3. SE TIPO = ENTREVISTADOR: Todas colunas de ENTREVISTADORES + INSTITUICOES
    CASE WHEN p.tipo_responsavel = 'entrevistador' THEN entv.nome_completo ELSE NULL END AS entrevistador_nome_completo,
    CASE WHEN p.tipo_responsavel = 'entrevistador' THEN entv.email ELSE NULL END AS entrevistador_email,
    CASE WHEN p.tipo_responsavel = 'entrevistador' THEN inst.nome_instituicao ELSE NULL END AS instituicao_nome,
    CASE WHEN p.tipo_responsavel = 'entrevistador' THEN inst.tipo_instituicao ELSE NULL END AS instituicao_tipo,
    CASE WHEN p.tipo_responsavel = 'entrevistador' THEN inst.cnpj ELSE NULL END AS instituicao_cnpj,
    
    -- 4. DADOS DO ENTREVISTADO (todas as colunas)
    ent.nome AS entrevistado_nome,
    ent.funcao AS entrevistado_funcao,
    ent.telefone AS entrevistado_telefone,
    ent.email AS entrevistado_email,
    ent.principal AS entrevistado_principal,
    ent.data_cadastro AS entrevistado_data_cadastro,
    ent.data_atualizacao AS entrevistado_data_atualizacao,
    
    -- 5. DADOS DA EMPRESA (todas as colunas)
    e.tipo_empresa AS empresa_tipo,
    e.outro_tipo AS empresa_outro_tipo,
    e.razao_social AS empresa_razao_social,
    e.nome_fantasia AS empresa_nome_fantasia,
    e.cnpj AS empresa_cnpj,
    e.telefone AS empresa_telefone,
    e.email AS empresa_email,
    e.municipio AS empresa_municipio,
    e.estado AS empresa_estado,
    e.logradouro AS empresa_logradouro,
    e.numero AS empresa_numero,
    e.complemento AS empresa_complemento,
    e.bairro AS empresa_bairro,
    e.cep AS empresa_cep,
    e.data_cadastro AS empresa_data_cadastro,
    e.data_atualizacao AS empresa_data_atualizacao,
    
    -- 6. DEMAIS CAMPOS DA TABELA PESQUISAS
    p.tipo_responsavel,
    p.data_entrevista,
    p.data_atualizacao AS pesquisa_data_atualizacao,
    p.status,
    p.produto_principal,
    p.agrupamento_produto,
    p.outro_produto,
    p.tipo_transporte,
    p.origem_pais,
    p.origem_estado,
    p.origem_municipio,
    p.destino_pais,
    p.destino_estado,
    p.destino_municipio,
    p.distancia,
    p.tem_paradas,
    p.num_paradas,
    p.modos,
    p.config_veiculo,
    p.peso_carga,
    p.unidade_peso,
    p.custo_transporte,
    p.valor_carga,
    p.tipo_embalagem,
    p.carga_perigosa,
    p.tempo_dias,
    p.tempo_horas,
    p.tempo_minutos,
    p.frequencia,
    p.frequencia_outra,
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
    p.tipo_cadeia,
    p.modais_alternativos,
    p.fator_adicional,
    p.dificuldades,
    p.detalhe_dificuldade,
    p.observacoes
    
FROM formulario_embarcadores.pesquisas p
INNER JOIN formulario_embarcadores.empresas e 
    ON p.id_empresa = e.id_empresa
INNER JOIN formulario_embarcadores.entrevistados ent 
    ON p.id_entrevistado = ent.id_entrevistado
LEFT JOIN formulario_embarcadores.entrevistadores entv 
    ON (p.tipo_responsavel = 'entrevistador' AND p.id_responsavel = entv.id_entrevistador)
LEFT JOIN formulario_embarcadores.instituicoes inst 
    ON entv.id_instituicao = inst.id_instituicao;