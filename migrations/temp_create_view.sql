DROP VIEW IF EXISTS formulario_embarcadores.v_pesquisas_completa CASCADE;

CREATE VIEW formulario_embarcadores.v_pesquisas_completa AS
SELECT 
    p.id_pesquisa,
    p.id_empresa,
    p.id_entrevistado,
    e.razao_social AS nome_empresa,
    e.cnpj AS empresa_cnpj,
    e.municipio AS empresa_municipio,
    ent.nome AS entrevistado_nome,
    ent.email AS entrevistado_email,
    entv.nome_completo AS entrevistador_nome,
    inst.nome_instituicao AS instituicao_nome
FROM formulario_embarcadores.pesquisas p
INNER JOIN formulario_embarcadores.empresas e ON p.id_empresa = e.id_empresa
INNER JOIN formulario_embarcadores.entrevistados ent ON p.id_entrevistado = ent.id_entrevistado
LEFT JOIN formulario_embarcadores.entrevistadores entv ON (p.tipo_responsavel = 'entrevistador' AND p.id_responsavel = entv.id_entrevistador)
LEFT JOIN formulario_embarcadores.instituicoes inst ON entv.id_instituicao = inst.id_instituicao;