-- =====================================================
-- CORREÇÃO DE FORMATAÇÃO DE NOMES PRÓPRIOS
-- Sistema: PLI 2050 - Formulários de Entrevista
-- Data: 05/11/2025
-- =====================================================

-- =====================================================
-- 1. CORRIGIR APOSTROFOS (d' → D')
-- =====================================================

-- Municípios com apostrofo (d'Oeste → D'Oeste)
UPDATE formulario_embarcadores.municipios_sp
SET nome_municipio = REPLACE(nome_municipio, ' d''', ' D''')
WHERE nome_municipio LIKE '%d''%';

-- Verificar resultado
SELECT nome_municipio 
FROM formulario_embarcadores.municipios_sp 
WHERE nome_municipio LIKE '%''%'
ORDER BY nome_municipio;

-- =====================================================
-- 2. VERIFICAÇÃO DE CONFORMIDADE
-- =====================================================

-- Contar registros por tabela
SELECT 
    'estados_brasil' as tabela, 
    COUNT(*) as total 
FROM formulario_embarcadores.estados_brasil

UNION ALL

SELECT 
    'paises' as tabela, 
    COUNT(*) as total 
FROM formulario_embarcadores.paises

UNION ALL

SELECT 
    'municipios_sp' as tabela, 
    COUNT(*) as total 
FROM formulario_embarcadores.municipios_sp;

-- =====================================================
-- 3. VERIFICAR NOMES COM POSSÍVEIS PROBLEMAS
-- =====================================================

-- Estados com preposições (verificar Title Case)
SELECT nome_estado, regiao 
FROM formulario_embarcadores.estados_brasil
WHERE nome_estado LIKE '% de %'
   OR nome_estado LIKE '% do %'
   OR nome_estado LIKE '% da %'
ORDER BY nome_estado;

-- Países com preposições
SELECT nome_pais, relevancia_mdic 
FROM formulario_embarcadores.paises
WHERE nome_pais LIKE '% de %'
   OR nome_pais LIKE '% do %'
   OR nome_pais LIKE '% da %'
ORDER BY relevancia_mdic DESC;

-- Municípios com preposições (amostra)
SELECT nome_municipio, regiao 
FROM formulario_embarcadores.municipios_sp
WHERE nome_municipio LIKE '% de %'
   OR nome_municipio LIKE '% do %'
   OR nome_municipio LIKE '% da %'
ORDER BY nome_municipio
LIMIT 20;

-- =====================================================
-- 4. VALIDAÇÃO FINAL
-- =====================================================

-- Verificar se há nomes em UPPERCASE (erro grave)
SELECT 'estados' as tabela, nome_estado as nome
FROM formulario_embarcadores.estados_brasil
WHERE nome_estado = UPPER(nome_estado)

UNION ALL

SELECT 'paises' as tabela, nome_pais as nome
FROM formulario_embarcadores.paises
WHERE nome_pais = UPPER(nome_pais)

UNION ALL

SELECT 'municipios' as tabela, nome_municipio as nome
FROM formulario_embarcadores.municipios_sp
WHERE nome_municipio = UPPER(nome_municipio)
LIMIT 10;

-- Verificar se há nomes em lowercase (erro grave)
SELECT 'estados' as tabela, nome_estado as nome
FROM formulario_embarcadores.estados_brasil
WHERE nome_estado = LOWER(nome_estado)

UNION ALL

SELECT 'paises' as tabela, nome_pais as nome
FROM formulario_embarcadores.paises
WHERE nome_pais = LOWER(nome_pais)

UNION ALL

SELECT 'municipios' as tabela, nome_municipio as nome
FROM formulario_embarcadores.municipios_sp
WHERE nome_municipio = LOWER(nome_municipio)
LIMIT 10;

-- =====================================================
-- 5. ESTATÍSTICAS DE FORMATAÇÃO
-- =====================================================

-- Contar nomes com características específicas
SELECT 
    'Nomes com apostrofo' as tipo,
    COUNT(*) as quantidade
FROM formulario_embarcadores.municipios_sp
WHERE nome_municipio LIKE '%''%'

UNION ALL

SELECT 
    'Nomes com "de"' as tipo,
    COUNT(*) as quantidade
FROM formulario_embarcadores.municipios_sp
WHERE nome_municipio LIKE '% de %'

UNION ALL

SELECT 
    'Nomes com "do"' as tipo,
    COUNT(*) as quantidade
FROM formulario_embarcadores.municipios_sp
WHERE nome_municipio LIKE '% do %'

UNION ALL

SELECT 
    'Nomes com "da"' as tipo,
    COUNT(*) as quantidade
FROM formulario_embarcadores.municipios_sp
WHERE nome_municipio LIKE '% da %';

-- =====================================================
-- FIM DAS CORREÇÕES
-- =====================================================

-- Resultado esperado:
-- ✅ Apostrofos corrigidos: d' → D'
-- ✅ Estados: 27 registros com Title Case
-- ✅ Países: 61 registros com Title Case
-- ✅ Municípios: 645 registros com Title Case
