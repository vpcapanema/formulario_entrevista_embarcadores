DROP VIEW IF EXISTS formulario_embarcadores.v_pesquisas_completa CASCADE;

CREATE VIEW formulario_embarcadores.v_pesquisas_completa AS
SELECT 
    -- APENAS ID_PESQUISA (ID unico visivel)
    p.id_pesquisa,
    
    -- DADOS DA PESQUISA (SEM os IDs de relacionamento)
    p.tipo_responsavel,
    p.data_entrevista,
    p.data_atualizacao,
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
    p.observacoes,
    
    -- DADOS DA EMPRESA (todos os campos, SEM IDs)
    e.tipo_empresa AS emp_tipo_empresa,
    e.outro_tipo AS emp_outro_tipo,
    e.razao_social AS emp_razao_social,
    e.nome_fantasia AS emp_nome_fantasia,
    e.cnpj AS emp_cnpj,
    e.telefone AS emp_telefone,
    e.email AS emp_email,
    e.municipio AS emp_municipio,
    e.estado AS emp_estado,
    e.logradouro AS emp_logradouro,
    e.numero AS emp_numero,
    e.complemento AS emp_complemento,
    e.bairro AS emp_bairro,
    e.cep AS emp_cep,
    e.data_cadastro AS emp_data_cadastro,
    e.data_atualizacao AS emp_data_atualizacao,
    
    -- DADOS DO ENTREVISTADO (todos os campos, SEM IDs)
    ent.nome AS ent_nome,
    ent.funcao AS ent_funcao,
    ent.telefone AS ent_telefone,
    ent.email AS ent_email,
    ent.principal AS ent_principal,
    ent.data_cadastro AS ent_data_cadastro,
    ent.data_atualizacao AS ent_data_atualizacao,
    
    -- DADOS DO ENTREVISTADOR (todos os campos, SEM IDs - NULL se tipo_responsavel != 'entrevistador')
    entv.nome_completo AS entv_nome_completo,
    entv.email AS entv_email,
    
    -- DADOS DA INSTITUICAO (todos os campos, SEM IDs - NULL se tipo_responsavel != 'entrevistador')
    inst.nome_instituicao AS inst_nome_instituicao,
    inst.tipo_instituicao AS inst_tipo_instituicao,
    inst.cnpj AS inst_cnpj
    
FROM formulario_embarcadores.pesquisas p
INNER JOIN formulario_embarcadores.empresas e 
    ON p.id_empresa = e.id_empresa
INNER JOIN formulario_embarcadores.entrevistados ent 
    ON p.id_entrevistado = ent.id_entrevistado
LEFT JOIN formulario_embarcadores.entrevistadores entv 
    ON (p.tipo_responsavel = 'entrevistador' AND p.id_responsavel = entv.id_entrevistador)
LEFT JOIN formulario_embarcadores.instituicoes inst 
    ON entv.id_instituicao = inst.id_instituicao;