DROP VIEW IF EXISTS formulario_embarcadores.v_pesquisas_completa CASCADE;

CREATE VIEW formulario_embarcadores.v_pesquisas_completa AS
SELECT 
    -- TABELA PESQUISAS (TODAS AS COLUNAS)
    p.*,
    
    -- TABELA EMPRESAS (TODAS AS COLUNAS COM PREFIXO emp_)
    e.id_empresa AS emp_id_empresa,
    e.tipo_empresa AS emp_tipo_empresa,
    e.outro_tipo AS emp_outro_tipo,
    e.municipio AS emp_municipio,
    e.estado AS emp_estado,
    e.data_cadastro AS emp_data_cadastro,
    e.data_atualizacao AS emp_data_atualizacao,
    e.razao_social AS emp_razao_social,
    e.nome_fantasia AS emp_nome_fantasia,
    e.telefone AS emp_telefone,
    e.email AS emp_email,
    e.id_municipio AS emp_id_municipio,
    e.logradouro AS emp_logradouro,
    e.numero AS emp_numero,
    e.complemento AS emp_complemento,
    e.bairro AS emp_bairro,
    e.cep AS emp_cep,
    e.cnpj AS emp_cnpj,
    
    -- TABELA ENTREVISTADOS (TODAS AS COLUNAS COM PREFIXO ent_)
    ent.id_entrevistado AS ent_id_entrevistado,
    ent.id_empresa AS ent_id_empresa,
    ent.nome AS ent_nome,
    ent.funcao AS ent_funcao,
    ent.telefone AS ent_telefone,
    ent.email AS ent_email,
    ent.principal AS ent_principal,
    ent.data_cadastro AS ent_data_cadastro,
    ent.data_atualizacao AS ent_data_atualizacao,
    ent.email_lower AS ent_email_lower,
    
    -- TABELA ENTREVISTADORES (TODAS AS COLUNAS COM PREFIXO entv_ - apenas se tipo_responsavel = 'entrevistador')
    entv.id_entrevistador AS entv_id_entrevistador,
    entv.nome_completo AS entv_nome_completo,
    entv.email AS entv_email,
    entv.id_instituicao AS entv_id_instituicao,
    
    -- TABELA INSTITUICOES (TODAS AS COLUNAS COM PREFIXO inst_ - apenas se tipo_responsavel = 'entrevistador')
    inst.id_instituicao AS inst_id_instituicao,
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