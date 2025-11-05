-- View simplificada para respostas consolidadas
-- Versão sem conversões de IDs para valores (será feita na interface)
-- Data: 05/11/2025

DROP VIEW IF EXISTS formulario_embarcadores.v_pesquisas_completa CASCADE;

CREATE VIEW formulario_embarcadores.v_pesquisas_completa AS
SELECT 
    p.id_pesquisa,
    
    -- CARTÃO 0: ENTREVISTADOR
    CASE 
        WHEN p.tipo_responsavel = 'entrevistador' THEN entv.nome_completo
        ELSE NULL
    END AS entrevistador_nome,
    CASE 
        WHEN p.tipo_responsavel = 'entrevistador' THEN entv.email
        ELSE NULL
    END AS entrevistador_email,
    CASE 
        WHEN p.tipo_responsavel = 'entrevistador' THEN inst.nome_instituicao
        ELSE NULL
    END AS entrevistador_instituicao,
    CASE 
        WHEN p.tipo_responsavel = 'entrevistador' THEN inst.cnpj
        ELSE NULL
    END AS entrevistador_cnpj,
    TO_CHAR(p.data_entrevista, 'DD/MM/YYYY') AS data_entrevista,
    TO_CHAR(p.data_atualizacao, 'DD/MM/YYYY HH24:MI:SS') AS data_atualizacao,
    CASE 
        WHEN p.status = 'rascunho' THEN 'Rascunho'
        WHEN p.status = 'concluida' THEN 'Concluída'
        WHEN p.status = 'revisao' THEN 'Em Revisão'
        ELSE p.status
    END AS status_pesquisa,
    
    -- Q1: ENTREVISTADO
    ent.nome AS entrevistado_nome,
    ent.funcao AS entrevistado_funcao,
    ent.telefone AS entrevistado_telefone,
    ent.email AS entrevistado_email,
    CASE WHEN ent.principal = true THEN 'Sim' ELSE 'Não' END AS responsavel_principal,
    
    -- Q2-Q6: EMPRESA
    e.nome_empresa,
    CASE 
        WHEN e.tipo_empresa = 'embarcador' THEN 'Embarcador'
        WHEN e.tipo_empresa = 'transportador' THEN 'Transportador'
        WHEN e.tipo_empresa = 'operador-logistico' THEN 'Operador Logístico'
        WHEN e.tipo_empresa = 'outro' THEN 'Outro'
        ELSE e.tipo_empresa
    END AS tipo_empresa,
    e.outro_tipo AS outro_tipo_empresa,
    e.cnpj AS cnpj_empresa,
    e.municipio AS municipio_empresa,
    e.estado AS estado_empresa,
    
    -- Q7: PRODUTO
    CASE 
        WHEN p.agrupamento_produto = 'soja' THEN 'Soja'
        WHEN p.agrupamento_produto = 'milho' THEN 'Milho'
        WHEN p.agrupamento_produto = 'acucar' THEN 'Açúcar'
        WHEN p.agrupamento_produto = 'cafe' THEN 'Café'
        WHEN p.agrupamento_produto = 'carne-bovina' THEN 'Carne Bovina'
        WHEN p.agrupamento_produto = 'carne-frango' THEN 'Carne de Frango'
        WHEN p.agrupamento_produto = 'celulose' THEN 'Celulose'
        WHEN p.agrupamento_produto = 'minerio-ferro' THEN 'Minério de Ferro'
        WHEN p.agrupamento_produto = 'combustiveis' THEN 'Combustíveis'
        WHEN p.agrupamento_produto = 'produtos-quimicos' THEN 'Produtos Químicos'
        WHEN p.agrupamento_produto = 'fertilizantes' THEN 'Fertilizantes'
        WHEN p.agrupamento_produto = 'eletronicos' THEN 'Eletrônicos'
        WHEN p.agrupamento_produto = 'veiculos' THEN 'Veículos'
        WHEN p.agrupamento_produto = 'outro' THEN 'Outro'
        ELSE p.agrupamento_produto
    END AS agrupamento_produto,
    p.produto_principal,
    p.outro_produto,
    
    -- Q8: TIPO TRANSPORTE
    CASE 
        WHEN p.tipo_transporte = 'proprio' THEN 'Próprio'
        WHEN p.tipo_transporte = 'terceirizado' THEN 'Terceirizado'
        WHEN p.tipo_transporte = 'misto' THEN 'Misto'
        ELSE p.tipo_transporte
    END AS tipo_transporte,
    
    -- Q9-Q14: ORIGEM E DESTINO
    p.origem_pais,
    p.origem_estado,
    p.origem_municipio,
    CONCAT(
        COALESCE(p.origem_municipio, 'N/I'),
        CASE WHEN p.origem_estado IS NOT NULL THEN ' - ' || p.origem_estado ELSE '' END,
        ', ',
        COALESCE(p.origem_pais, 'N/I')
    ) AS origem_completa,
    p.destino_pais,
    p.destino_estado,
    p.destino_municipio,
    CONCAT(
        COALESCE(p.destino_municipio, 'N/I'),
        CASE WHEN p.destino_estado IS NOT NULL THEN ' - ' || p.destino_estado ELSE '' END,
        ', ',
        COALESCE(p.destino_pais, 'N/I')
    ) AS destino_completa,
    
    -- Q15: DISTÂNCIA
    CONCAT(ROUND(p.distancia, 0), ' km') AS distancia,
    
    -- Q16: PARADAS
    CASE 
        WHEN p.tem_paradas = 'nenhuma' THEN 'Nenhuma'
        WHEN p.tem_paradas = '1-2' THEN '1 a 2 paradas'
        WHEN p.tem_paradas = '3-5' THEN '3 a 5 paradas'
        WHEN p.tem_paradas = '6-10' THEN '6 a 10 paradas'
        WHEN p.tem_paradas = 'mais-10' THEN 'Mais de 10 paradas'
        ELSE p.tem_paradas
    END AS num_paradas,
    p.num_paradas AS num_paradas_exato,
    
    -- Q17: MODAIS
    p.modos AS modais,
    
    -- Q18: CONFIGURAÇÃO VEÍCULO
    CASE 
        WHEN p.config_veiculo = 'caminhao-toco' THEN 'Caminhão Toco'
        WHEN p.config_veiculo = 'caminhao-truck' THEN 'Caminhão Truck'
        WHEN p.config_veiculo = 'carreta-simples' THEN 'Carreta Simples'
        WHEN p.config_veiculo = 'bi-trem' THEN 'Bi-trem'
        WHEN p.config_veiculo = 'rodotrem' THEN 'Rodotrem'
        WHEN p.config_veiculo = 'nao-se-aplica' THEN 'Não se aplica'
        ELSE p.config_veiculo
    END AS configuracao_veiculo,
    
    -- Q19: CAPACIDADE
    CONCAT(ROUND(p.capacidade_utilizada, 1), '%') AS capacidade_utilizada,
    
    -- Q20: PESO
    CONCAT(
        CASE 
            WHEN p.unidade_peso = 'ton' THEN ROUND(p.peso_carga, 2)
            WHEN p.unidade_peso = 'kg' THEN ROUND(p.peso_carga / 1000, 2)
            ELSE p.peso_carga
        END,
        ' ton'
    ) AS peso_carga,
    
    -- Q21-Q22: CUSTOS
    CONCAT('R$ ', TO_CHAR(p.custo_transporte, 'FM999G999G999D00')) AS custo_transporte,
    CONCAT('R$ ', TO_CHAR(p.valor_carga, 'FM999G999G999D00')) AS valor_carga,
    CONCAT(
        'R$ ',
        TO_CHAR(
            ROUND(
                p.custo_transporte / NULLIF(
                    CASE WHEN p.unidade_peso = 'kg' THEN p.peso_carga/1000 ELSE p.peso_carga END, 
                    0
                ), 
                2
            ),
            'FM999G999G999D00'
        ),
        '/ton'
    ) AS custo_por_tonelada,
    
    -- Q23: EMBALAGEM
    CASE 
        WHEN p.tipo_embalagem = 'granel' THEN 'Granel'
        WHEN p.tipo_embalagem = 'paletizado' THEN 'Paletizado'
        WHEN p.tipo_embalagem = 'container' THEN 'Container'
        WHEN p.tipo_embalagem = 'big-bag' THEN 'Big Bag'
        WHEN p.tipo_embalagem = 'sacos' THEN 'Sacos'
        WHEN p.tipo_embalagem = 'caixas' THEN 'Caixas'
        WHEN p.tipo_embalagem = 'outro' THEN 'Outro'
        ELSE p.tipo_embalagem
    END AS tipo_embalagem,
    
    -- Q24: CARGA PERIGOSA
    CASE WHEN p.carga_perigosa = 'sim' THEN 'Sim' WHEN p.carga_perigosa = 'nao' THEN 'Não' ELSE p.carga_perigosa END AS carga_perigosa,
    
    -- Q25: TEMPO
    CONCAT(
        CASE WHEN p.tempo_dias > 0 THEN p.tempo_dias || 'd ' ELSE '' END,
        CASE WHEN p.tempo_horas > 0 THEN p.tempo_horas || 'h ' ELSE '' END,
        CASE WHEN p.tempo_minutos > 0 THEN p.tempo_minutos || 'min' ELSE '' END
    ) AS tempo_viagem,
    (p.tempo_dias * 24 * 60) + (p.tempo_horas * 60) + p.tempo_minutos AS tempo_total_minutos,
    
    -- Q26: FREQUÊNCIA
    CASE 
        WHEN p.frequencia = 'diaria' THEN 'Diária'
        WHEN p.frequencia = 'semanal' THEN 'Semanal'
        WHEN p.frequencia = 'quinzenal' THEN 'Quinzenal'
        WHEN p.frequencia = 'mensal' THEN 'Mensal'
        WHEN p.frequencia = 'eventual' THEN 'Eventual'
        WHEN p.frequencia = 'outra' THEN 'Outra'
        ELSE p.frequencia
    END AS frequencia,
    CASE WHEN p.frequencia = 'diaria' THEN CONCAT(ROUND(p.frequencia_diaria, 1), ' viagens/dia') ELSE NULL END AS frequencia_diaria,
    p.frequencia_outra,
    
    -- Q27-Q31: FATORES DE DECISÃO
    CASE p.importancia_custo 
        WHEN '1' THEN 'Muito Baixa' 
        WHEN '2' THEN 'Baixa' 
        WHEN '3' THEN 'Média' 
        WHEN '4' THEN 'Alta' 
        WHEN '5' THEN 'Muito Alta' 
        ELSE p.importancia_custo 
    END AS importancia_custo,
    CONCAT(ROUND(p.variacao_custo, 0), '%') AS variacao_custo,
    CASE p.importancia_tempo 
        WHEN '1' THEN 'Muito Baixa' 
        WHEN '2' THEN 'Baixa' 
        WHEN '3' THEN 'Média' 
        WHEN '4' THEN 'Alta' 
        WHEN '5' THEN 'Muito Alta' 
        ELSE p.importancia_tempo 
    END AS importancia_tempo,
    CONCAT(ROUND(p.variacao_tempo, 0), '%') AS variacao_tempo,
    CASE p.importancia_confiabilidade 
        WHEN '1' THEN 'Muito Baixa' 
        WHEN '2' THEN 'Baixa' 
        WHEN '3' THEN 'Média' 
        WHEN '4' THEN 'Alta' 
        WHEN '5' THEN 'Muito Alta' 
        ELSE p.importancia_confiabilidade 
    END AS importancia_confiabilidade,
    CONCAT(ROUND(p.variacao_confiabilidade, 0), '%') AS variacao_confiabilidade,
    CASE p.importancia_seguranca 
        WHEN '1' THEN 'Muito Baixa' 
        WHEN '2' THEN 'Baixa' 
        WHEN '3' THEN 'Média' 
        WHEN '4' THEN 'Alta' 
        WHEN '5' THEN 'Muito Alta' 
        ELSE p.importancia_seguranca 
    END AS importancia_seguranca,
    CONCAT(ROUND(p.variacao_seguranca, 0), '%') AS variacao_seguranca,
    CASE p.importancia_capacidade 
        WHEN '1' THEN 'Muito Baixa' 
        WHEN '2' THEN 'Baixa' 
        WHEN '3' THEN 'Média' 
        WHEN '4' THEN 'Alta' 
        WHEN '5' THEN 'Muito Alta' 
        ELSE p.importancia_capacidade 
    END AS importancia_capacidade,
    CONCAT(ROUND(p.variacao_capacidade, 0), '%') AS variacao_capacidade,
    
    -- Q32: TIPO CADEIA
    CASE 
        WHEN p.tipo_cadeia = 'ponto-ponto' THEN 'Ponto a Ponto'
        WHEN p.tipo_cadeia = 'distribuicao' THEN 'Distribuição'
        WHEN p.tipo_cadeia = 'coleta' THEN 'Coleta'
        WHEN p.tipo_cadeia = 'milk-run' THEN 'Milk Run'
        ELSE p.tipo_cadeia
    END AS tipo_cadeia,
    
    -- Q33: MODAIS ALTERNATIVOS
    p.modais_alternativos,
    
    -- Q34: FATOR ADICIONAL
    p.fator_adicional,
    
    -- Q35-Q36: DIFICULDADES
    array_to_string(p.dificuldades, ', ') AS dificuldades,
    p.detalhe_dificuldade,
    
    -- Q37: OBSERVAÇÕES
    p.observacoes,
    
    -- ESTATÍSTICAS
    (SELECT COUNT(*) FROM formulario_embarcadores.produtos_transportados pt WHERE pt.id_pesquisa = p.id_pesquisa) AS qtd_produtos
    
FROM formulario_embarcadores.pesquisas p
INNER JOIN formulario_embarcadores.empresas e ON p.id_empresa = e.id_empresa
INNER JOIN formulario_embarcadores.entrevistados ent ON p.id_entrevistado = ent.id_entrevistado
LEFT JOIN formulario_embarcadores.entrevistadores entv ON (p.tipo_responsavel = 'entrevistador' AND p.id_responsavel = entv.id_entrevistador)
LEFT JOIN formulario_embarcadores.instituicoes inst ON entv.id_instituicao = inst.id_instituicao;

COMMENT ON VIEW formulario_embarcadores.v_pesquisas_completa IS 
'View consolidada com todas as respostas do formulário PLI 2050. 
Mostra valores descritivos em vez de IDs.
Atualizada em 05/11/2025.';

GRANT SELECT ON formulario_embarcadores.v_pesquisas_completa TO PUBLIC;
