-- Script para atualizar a view de respostas consolidadas
-- Mostra valores em vez de IDs para melhor compreensão
-- Data: 05/11/2025

DROP VIEW IF EXISTS formulario_embarcadores.v_pesquisas_completa CASCADE;

CREATE VIEW formulario_embarcadores.v_pesquisas_completa AS
SELECT 
    -- IDs (mantidos para referência interna, mas não serão mostrados na interface)
    p.id_pesquisa,
    p.id_empresa,
    p.id_entrevistado,
    p.tipo_responsavel,
    p.id_responsavel,
    
    -- =========================================
    -- CARTÃO 0: IDENTIFICAÇÃO DO ENTREVISTADOR
    -- =========================================
    
    -- Entrevistador (se aplicável)
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
    
    -- Data da Entrevista
    TO_CHAR(p.data_entrevista, 'DD/MM/YYYY') AS data_entrevista,
    TO_CHAR(p.data_atualizacao, 'DD/MM/YYYY HH24:MI:SS') AS data_atualizacao,
    
    CASE 
        WHEN p.status = 'rascunho' THEN 'Rascunho'
        WHEN p.status = 'concluida' THEN 'Concluída'
        WHEN p.status = 'revisao' THEN 'Em Revisão'
        ELSE p.status
    END AS status_pesquisa,
    
    -- =========================================
    -- Q1: DADOS DO ENTREVISTADO
    -- =========================================
    
    ent.nome AS entrevistado_nome,
    ent.funcao AS entrevistado_funcao,
    ent.telefone AS entrevistado_telefone,
    ent.email AS entrevistado_email,
    
    CASE 
        WHEN ent.principal = true THEN 'Sim'
        ELSE 'Não'
    END AS entrevistado_responsavel_principal,
    
    -- =========================================
    -- Q2-Q6: DADOS DA EMPRESA
    -- =========================================
    
    e.razao_social AS nome_empresa,
    e.nome_fantasia AS empresa_nome_fantasia,
    
    CASE 
        WHEN e.tipo_empresa = 'embarcador' THEN 'Embarcador'
        WHEN e.tipo_empresa = 'transportador' THEN 'Transportador'
        WHEN e.tipo_empresa = 'operador-logistico' THEN 'Operador Logístico'
        WHEN e.tipo_empresa = 'outro' THEN 'Outro'
        ELSE e.tipo_empresa
    END AS empresa_tipo,
    
    e.outro_tipo AS empresa_outro_tipo_descricao,
    
    e.cnpj AS empresa_cnpj,
    e.razao_social AS empresa_razao_social,
    e.municipio AS empresa_municipio,
    e.estado AS empresa_estado,
    'Brasil' AS empresa_pais,
    
    -- =========================================
    -- Q7: PRODUTO PRINCIPAL
    -- =========================================
    
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
    END AS produto_agrupamento,
    
    p.produto_principal,
    p.outro_produto AS produto_outro_descricao,
    
    -- =========================================
    -- Q8: TIPO DE TRANSPORTE
    -- =========================================
    
    CASE 
        WHEN p.tipo_transporte = 'proprio' THEN 'Próprio'
        WHEN p.tipo_transporte = 'terceirizado' THEN 'Terceirizado'
        WHEN p.tipo_transporte = 'misto' THEN 'Misto'
        ELSE p.tipo_transporte
    END AS tipo_transporte,
    
    -- =========================================
    -- Q9-Q11: ORIGEM
    -- =========================================
    
    p.origem_pais,
    p.origem_estado,
    p.origem_municipio,
    
    -- Origem completa formatada
    CONCAT(
        COALESCE(p.origem_municipio, 'N/I'),
        CASE 
            WHEN p.origem_estado IS NOT NULL 
            THEN ' - ' || p.origem_estado
            ELSE ''
        END,
        ', ',
        COALESCE(p.origem_pais, 'N/I')
    ) AS origem_completa,
    
    -- =========================================
    -- Q12-Q14: DESTINO
    -- =========================================
    
    p.destino_pais,
    p.destino_estado,
    p.destino_municipio,
    
    -- Destino completo formatado
    CONCAT(
        COALESCE(p.destino_municipio, 'N/I'),
        CASE 
            WHEN p.destino_estado IS NOT NULL 
            THEN ' - ' || p.destino_estado
            ELSE ''
        END,
        ', ',
        COALESCE(p.destino_pais, 'N/I')
    ) AS destino_completa,
    
    -- =========================================
    -- Q15: DISTÂNCIA
    -- =========================================
    
    CONCAT(ROUND(p.distancia::NUMERIC, 0), ' km') AS distancia,
    
    -- =========================================
    -- Q16: PARADAS INTERMEDIÁRIAS
    -- =========================================
    
    CASE 
        WHEN p.tem_paradas = 'nenhuma' THEN 'Nenhuma'
        WHEN p.tem_paradas = '1-2' THEN '1 a 2 paradas'
        WHEN p.tem_paradas = '3-5' THEN '3 a 5 paradas'
        WHEN p.tem_paradas = '6-10' THEN '6 a 10 paradas'
        WHEN p.tem_paradas = 'mais-10' THEN 'Mais de 10 paradas'
        ELSE p.tem_paradas
    END AS paradas_intervalo,
    
    p.num_paradas AS paradas_numero_exato,
    
    -- =========================================
    -- Q17: MODAIS UTILIZADOS
    -- =========================================
    
    p.modos AS modais_utilizados,
    
    -- =========================================
    -- Q18: CONFIGURAÇÃO DE VEÍCULO
    -- =========================================
    
    CASE 
        WHEN p.config_veiculo = 'caminhao-toco' THEN 'Caminhão Toco'
        WHEN p.config_veiculo = 'caminhao-truck' THEN 'Caminhão Truck'
        WHEN p.config_veiculo = 'carreta-simples' THEN 'Carreta Simples'
        WHEN p.config_veiculo = 'bi-trem' THEN 'Bi-trem'
        WHEN p.config_veiculo = 'rodotrem' THEN 'Rodotrem'
        WHEN p.config_veiculo = 'nao-se-aplica' THEN 'Não se aplica'
        ELSE p.config_veiculo
    END AS configuracao_veiculo,
    
    -- =========================================
    -- Q19: CAPACIDADE UTILIZADA
    -- =========================================
    
    CONCAT(ROUND(p.capacidade_utilizada::NUMERIC, 1), '%') AS capacidade_utilizada,
    
    -- =========================================
    -- Q20: PESO DA CARGA
    -- =========================================
    
    CONCAT(
        CASE 
            WHEN p.unidade_peso = 'ton' THEN ROUND(p.peso_carga::NUMERIC, 2)
            WHEN p.unidade_peso = 'kg' THEN ROUND((p.peso_carga / 1000)::NUMERIC, 2)
            ELSE p.peso_carga
        END,
        ' ton'
    ) AS peso_carga,
    
    -- =========================================
    -- Q21-Q22: CUSTOS E VALORES
    -- =========================================
    
    CONCAT('R$ ', TO_CHAR(p.custo_transporte, 'FM999G999G999D00')) AS custo_transporte,
    CONCAT('R$ ', TO_CHAR(p.valor_carga, 'FM999G999G999D00')) AS valor_carga,
    
    -- Custo por tonelada (calculado)
    CONCAT(
        'R$ ',
        TO_CHAR(
            ROUND(
                p.custo_transporte / NULLIF(
                    CASE 
                        WHEN p.unidade_peso = 'kg' THEN p.peso_carga/1000 
                        ELSE p.peso_carga 
                    END, 
                    0
                ), 
                2
            ),
            'FM999G999G999D00'
        ),
        '/ton'
    ) AS custo_por_tonelada,
    
    -- =========================================
    -- Q23: TIPO DE EMBALAGEM
    -- =========================================
    
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
    
    -- =========================================
    -- Q24: CARGA PERIGOSA
    -- =========================================
    
    CASE 
        WHEN p.carga_perigosa = 'sim' THEN 'Sim'
        WHEN p.carga_perigosa = 'nao' THEN 'Não'
        ELSE p.carga_perigosa
    END AS carga_perigosa,
    
    -- =========================================
    -- Q25: TEMPO DE VIAGEM
    -- =========================================
    
    CONCAT(
        CASE WHEN p.tempo_dias > 0 THEN p.tempo_dias || 'd ' ELSE '' END,
        CASE WHEN p.tempo_horas > 0 THEN p.tempo_horas || 'h ' ELSE '' END,
        CASE WHEN p.tempo_minutos > 0 THEN p.tempo_minutos || 'min' ELSE '' END
    ) AS tempo_viagem,
    
    (p.tempo_dias * 24 * 60) + (p.tempo_horas * 60) + p.tempo_minutos AS tempo_total_minutos,
    
    -- =========================================
    -- Q26: FREQUÊNCIA
    -- =========================================
    
    CASE 
        WHEN p.frequencia = 'diaria' THEN 'Diária'
        WHEN p.frequencia = 'semanal' THEN 'Semanal'
        WHEN p.frequencia = 'quinzenal' THEN 'Quinzenal'
        WHEN p.frequencia = 'mensal' THEN 'Mensal'
        WHEN p.frequencia = 'eventual' THEN 'Eventual'
        WHEN p.frequencia = 'outra' THEN 'Outra'
        ELSE p.frequencia
    END AS frequencia,
    
    CASE 
        WHEN p.frequencia = 'diaria' THEN CONCAT(ROUND(p.frequencia_diaria::NUMERIC, 1), ' viagens/dia')
        ELSE NULL
    END AS frequencia_diaria_descricao,
    
    p.frequencia_outra AS frequencia_outra_descricao,
    
    -- =========================================
    -- Q27-Q31: FATORES DE DECISÃO
    -- =========================================
    
    CASE 
        WHEN p.importancia_custo = 1 THEN 'Muito Baixa'
        WHEN p.importancia_custo = 2 THEN 'Baixa'
        WHEN p.importancia_custo = 3 THEN 'Média'
        WHEN p.importancia_custo = 4 THEN 'Alta'
        WHEN p.importancia_custo = 5 THEN 'Muito Alta'
        ELSE NULL
    END AS importancia_custo,
    
    CONCAT(ROUND(p.variacao_custo::NUMERIC, 0), '%') AS variacao_custo,
    
    CASE 
        WHEN p.importancia_tempo = 1 THEN 'Muito Baixa'
        WHEN p.importancia_tempo = 2 THEN 'Baixa'
        WHEN p.importancia_tempo = 3 THEN 'Média'
        WHEN p.importancia_tempo = 4 THEN 'Alta'
        WHEN p.importancia_tempo = 5 THEN 'Muito Alta'
        ELSE NULL
    END AS importancia_tempo,
    
    CONCAT(ROUND(p.variacao_tempo::NUMERIC, 0), '%') AS variacao_tempo,
    
    CASE 
        WHEN p.importancia_confiabilidade = 1 THEN 'Muito Baixa'
        WHEN p.importancia_confiabilidade = 2 THEN 'Baixa'
        WHEN p.importancia_confiabilidade = 3 THEN 'Média'
        WHEN p.importancia_confiabilidade = 4 THEN 'Alta'
        WHEN p.importancia_confiabilidade = 5 THEN 'Muito Alta'
        ELSE NULL
    END AS importancia_confiabilidade,
    
    CONCAT(ROUND(p.variacao_confiabilidade::NUMERIC, 0), '%') AS variacao_confiabilidade,
    
    CASE 
        WHEN p.importancia_seguranca = 1 THEN 'Muito Baixa'
        WHEN p.importancia_seguranca = 2 THEN 'Baixa'
        WHEN p.importancia_seguranca = 3 THEN 'Média'
        WHEN p.importancia_seguranca = 4 THEN 'Alta'
        WHEN p.importancia_seguranca = 5 THEN 'Muito Alta'
        ELSE NULL
    END AS importancia_seguranca,
    
    CONCAT(ROUND(p.variacao_seguranca::NUMERIC, 0), '%') AS variacao_seguranca,
    
    CASE 
        WHEN p.importancia_capacidade = 1 THEN 'Muito Baixa'
        WHEN p.importancia_capacidade = 2 THEN 'Baixa'
        WHEN p.importancia_capacidade = 3 THEN 'Média'
        WHEN p.importancia_capacidade = 4 THEN 'Alta'
        WHEN p.importancia_capacidade = 5 THEN 'Muito Alta'
        ELSE NULL
    END AS importancia_capacidade,
    
    CONCAT(ROUND(p.variacao_capacidade::NUMERIC, 0), '%') AS variacao_capacidade,
    
    -- =========================================
    -- Q32: TIPO DE CADEIA
    -- =========================================
    
    CASE 
        WHEN p.tipo_cadeia = 'ponto-ponto' THEN 'Ponto a Ponto'
        WHEN p.tipo_cadeia = 'distribuicao' THEN 'Distribuição'
        WHEN p.tipo_cadeia = 'coleta' THEN 'Coleta'
        WHEN p.tipo_cadeia = 'milk-run' THEN 'Milk Run'
        ELSE p.tipo_cadeia
    END AS tipo_cadeia,
    
    -- =========================================
    -- Q33: MODAIS ALTERNATIVOS
    -- =========================================
    
    p.modais_alternativos,
    
    -- =========================================
    -- Q34: FATOR ADICIONAL
    -- =========================================
    
    p.fator_adicional,
    
    -- =========================================
    -- Q35-Q36: DIFICULDADES
    -- =========================================
    
    CASE 
        WHEN p.dificuldades = 'sim' THEN 'Sim'
        WHEN p.dificuldades = 'nao' THEN 'Não'
        ELSE p.dificuldades
    END AS encontrou_dificuldades,
    
    p.detalhe_dificuldade,
    
    -- =========================================
    -- Q37: OBSERVAÇÕES
    -- =========================================
    
    p.observacoes,
    
    -- =========================================
    -- ESTATÍSTICAS
    -- =========================================
    
    (SELECT COUNT(*) FROM formulario_embarcadores.produtos_transportados pt 
     WHERE pt.id_pesquisa = p.id_pesquisa) AS qtd_produtos_informados
    
FROM formulario_embarcadores.pesquisas p
INNER JOIN formulario_embarcadores.empresas e 
    ON p.id_empresa = e.id_empresa
INNER JOIN formulario_embarcadores.entrevistados ent 
    ON p.id_entrevistado = ent.id_entrevistado
LEFT JOIN formulario_embarcadores.entrevistadores entv 
    ON (p.tipo_responsavel = 'entrevistador' AND p.id_responsavel = entv.id_entrevistador)
LEFT JOIN formulario_embarcadores.instituicoes inst 
    ON entv.id_instituicao = inst.id_instituicao;
