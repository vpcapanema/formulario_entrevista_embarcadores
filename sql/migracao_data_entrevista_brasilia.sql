-- =====================================================
-- MIGRAÇÃO: Adicionar data_entrevista com timezone de Brasília
-- Sistema PLI 2050 - Formulário de Entrevistas
-- Data: 26/01/2026
-- =====================================================

-- Conectar ao schema correto
SET search_path TO formulario_embarcadores, public;

-- =====================================================
-- 1. ALTERAR COLUNA data_entrevista PARA USAR TIMEZONE DE BRASÍLIA
-- =====================================================

-- Remover o default atual (NOW())
ALTER TABLE formulario_embarcadores.pesquisas
ALTER COLUMN data_entrevista DROP DEFAULT;

-- Adicionar novo default usando timezone de Brasília (UTC-3)
-- PostgreSQL: NOW() AT TIME ZONE 'UTC-3'
ALTER TABLE formulario_embarcadores.pesquisas
ALTER COLUMN data_entrevista SET DEFAULT (NOW() AT TIME ZONE 'UTC-3');

-- =====================================================
-- 2. ATUALIZAR REGISTROS EXISTENTES (se houver)
-- =====================================================

-- Para registros que ainda não têm data_entrevista, definir como NOW() em Brasília
UPDATE formulario_embarcadores.pesquisas
SET data_entrevista = (NOW() AT TIME ZONE 'UTC-3')
WHERE data_entrevista IS NULL;

-- =====================================================
-- 3. VERIFICAÇÃO
-- =====================================================

-- Verificar se a migração foi aplicada corretamente
SELECT
    'Migração aplicada com sucesso' as status,
    COUNT(*) as total_pesquisas,
    COUNT(data_entrevista) as pesquisas_com_data,
    MIN(data_entrevista) as data_mais_antiga,
    MAX(data_entrevista) as data_mais_recente
FROM formulario_embarcadores.pesquisas;

-- Verificar timezone da coluna
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_schema = 'formulario_embarcadores'
  AND table_name = 'pesquisas'
  AND column_name = 'data_entrevista';

COMMIT;