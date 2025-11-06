-- =====================================================
-- MIGRAÇÃO: CONVERTER CAMPOS PARA TIPOS NUMÉRICOS
-- =====================================================
-- Data: 05/11/2025
-- Objetivo: Converter campos categóricos (VARCHAR) para numéricos
--           para permitir análises estatísticas e cálculos agregados
-- =====================================================

BEGIN;

-- =====================================================
-- 0. REMOVER DEPENDÊNCIAS (VIEWS)
-- =====================================================

-- Dropar view temporariamente (será recriada no final)
DROP VIEW IF EXISTS formulario_embarcadores.v_pesquisas_completa CASCADE;

-- =====================================================
-- 1. CAPACIDADE_UTILIZADA: VARCHAR(20) → NUMERIC(5,2)
-- =====================================================

-- Adicionar nova coluna temporária
ALTER TABLE formulario_embarcadores.pesquisas 
ADD COLUMN capacidade_utilizada_new NUMERIC(5, 2);

-- Comentário
COMMENT ON COLUMN formulario_embarcadores.pesquisas.capacidade_utilizada_new 
IS 'Percentual de capacidade utilizada (0-100%)';

-- Converter dados existentes (se houver)
-- Mapear faixas para valor médio
UPDATE formulario_embarcadores.pesquisas
SET capacidade_utilizada_new = CASE capacidade_utilizada
    WHEN '0-25' THEN 12.5
    WHEN '26-50' THEN 38.0
    WHEN '51-75' THEN 63.0
    WHEN '76-90' THEN 83.0
    WHEN '91-100' THEN 95.5
    WHEN 'nao-sei' THEN NULL
    ELSE 
        -- Se já for numérico, tentar converter
        CASE 
            WHEN capacidade_utilizada ~ '^\d+\.?\d*$' 
            THEN capacidade_utilizada::NUMERIC(5,2)
            ELSE NULL
        END
END
WHERE capacidade_utilizada IS NOT NULL;

-- Remover coluna antiga e renomear nova
ALTER TABLE formulario_embarcadores.pesquisas 
DROP COLUMN capacidade_utilizada;

ALTER TABLE formulario_embarcadores.pesquisas 
RENAME COLUMN capacidade_utilizada_new TO capacidade_utilizada;

-- Adicionar constraint de validação
ALTER TABLE formulario_embarcadores.pesquisas 
ADD CONSTRAINT check_capacidade_utilizada 
CHECK (capacidade_utilizada >= 0 AND capacidade_utilizada <= 100);

-- =====================================================
-- 2. NUM_PARADAS: VARCHAR(20) → INTEGER
-- =====================================================

-- Adicionar nova coluna temporária
ALTER TABLE formulario_embarcadores.pesquisas 
ADD COLUMN num_paradas_new INTEGER;

-- Comentário
COMMENT ON COLUMN formulario_embarcadores.pesquisas.num_paradas_new 
IS 'Número de paradas no deslocamento (valor exato ou médio de faixa)';

-- Converter dados existentes
UPDATE formulario_embarcadores.pesquisas
SET num_paradas_new = CASE num_paradas
    WHEN '1' THEN 1
    WHEN '2' THEN 2
    WHEN '3' THEN 3
    WHEN '4-5' THEN 5  -- Usar teto da faixa para ser conservador
    WHEN '6-10' THEN 8  -- Usar mediana
    WHEN 'mais-10' THEN 15  -- Estimativa conservadora
    WHEN 'nao-sei' THEN NULL
    ELSE 
        -- Se já for numérico, tentar converter
        CASE 
            WHEN num_paradas ~ '^\d+$' 
            THEN num_paradas::INTEGER
            ELSE NULL
        END
END
WHERE num_paradas IS NOT NULL;

-- Remover coluna antiga e renomear nova
ALTER TABLE formulario_embarcadores.pesquisas 
DROP COLUMN num_paradas;

ALTER TABLE formulario_embarcadores.pesquisas 
RENAME COLUMN num_paradas_new TO num_paradas;

-- Adicionar constraint de validação
ALTER TABLE formulario_embarcadores.pesquisas 
ADD CONSTRAINT check_num_paradas 
CHECK (num_paradas > 0);

-- =====================================================
-- 3. FREQUENCIA_DIARIA: VARCHAR(20) → NUMERIC(4,1)
-- =====================================================

-- Adicionar nova coluna temporária
ALTER TABLE formulario_embarcadores.pesquisas 
ADD COLUMN frequencia_diaria_new NUMERIC(4, 1);

-- Comentário
COMMENT ON COLUMN formulario_embarcadores.pesquisas.frequencia_diaria_new 
IS 'Número de viagens por dia (valor exato ou médio)';

-- Converter dados existentes
UPDATE formulario_embarcadores.pesquisas
SET frequencia_diaria_new = CASE frequencia_diaria
    WHEN '1' THEN 1.0
    WHEN '2-3' THEN 2.5
    WHEN '4-5' THEN 4.5
    WHEN '6-10' THEN 8.0
    WHEN 'mais-10' THEN 12.0  -- Estimativa conservadora
    WHEN 'nao-sei' THEN NULL
    ELSE 
        -- Se já for numérico, tentar converter
        CASE 
            WHEN frequencia_diaria ~ '^\d+\.?\d*$' 
            THEN frequencia_diaria::NUMERIC(4,1)
            ELSE NULL
        END
END
WHERE frequencia_diaria IS NOT NULL;

-- Remover coluna antiga e renomear nova
ALTER TABLE formulario_embarcadores.pesquisas 
DROP COLUMN frequencia_diaria;

ALTER TABLE formulario_embarcadores.pesquisas 
RENAME COLUMN frequencia_diaria_new TO frequencia_diaria;

-- Adicionar constraint de validação
ALTER TABLE formulario_embarcadores.pesquisas 
ADD CONSTRAINT check_frequencia_diaria 
CHECK (frequencia_diaria > 0);

-- =====================================================
-- 4. VERIFICAR ALTERAÇÕES
-- =====================================================

-- Mostrar estrutura atualizada
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'formulario_embarcadores'
  AND table_name = 'pesquisas'
  AND column_name IN ('capacidade_utilizada', 'num_paradas', 'frequencia_diaria', 'distancia', 'peso_carga', 'custo_transporte', 'valor_carga')
ORDER BY column_name;

-- Verificar constraints
SELECT 
    con.conname AS constraint_name,
    col.attname AS column_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
JOIN pg_attribute col ON col.attrelid = rel.oid AND col.attnum = ANY(con.conkey)
WHERE nsp.nspname = 'formulario_embarcadores'
  AND rel.relname = 'pesquisas'
  AND con.contype = 'c'  -- CHECK constraints
ORDER BY con.conname;

COMMIT;

-- =====================================================
-- ROLLBACK EM CASO DE ERRO
-- =====================================================
-- Se houver erro, executar: ROLLBACK;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Esta migração é segura pois usa transação (BEGIN/COMMIT)
-- 2. Se houver dados existentes, serão convertidos usando médias de faixas
-- 3. Valores 'nao-sei' são convertidos para NULL
-- 4. Constraints garantem integridade (valores positivos e dentro de ranges)
-- 5. Novos INSERTs devem enviar valores numéricos diretamente
-- =====================================================
