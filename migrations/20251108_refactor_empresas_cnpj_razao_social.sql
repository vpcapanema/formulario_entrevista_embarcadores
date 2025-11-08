-- ============================================================
-- MIGRATION: Refatorar tabela empresas
-- Data: 2025-11-08
-- Descrição: 
--   1. Remover campo nome_empresa e substituir por razao_social
--   2. Remover campo cnpj (VARCHAR 18) e manter apenas cnpj_digits (VARCHAR 14)
-- ============================================================

BEGIN;

-- ============================================================
-- PASSO 1: BACKUP DE SEGURANÇA
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE 'Iniciando migration de refatoração da tabela empresas...';
    RAISE NOTICE 'Timestamp: %', NOW();
END $$;

-- ============================================================
-- PASSO 2: MIGRAR DADOS DE nome_empresa PARA razao_social
-- ============================================================
-- Se razao_social estiver NULL, copiar de nome_empresa
UPDATE formulario_embarcadores.empresas
SET razao_social = nome_empresa
WHERE razao_social IS NULL OR razao_social = '';

-- ============================================================
-- PASSO 3: MIGRAR DADOS DE cnpj PARA cnpj_digits
-- ============================================================
-- Se cnpj_digits estiver NULL mas cnpj tiver valor, limpar e copiar
UPDATE formulario_embarcadores.empresas
SET cnpj_digits = REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g')
WHERE (cnpj_digits IS NULL OR cnpj_digits = '')
  AND cnpj IS NOT NULL 
  AND cnpj != '';

-- ============================================================
-- PASSO 4: TORNAR razao_social NOT NULL
-- ============================================================
ALTER TABLE formulario_embarcadores.empresas
ALTER COLUMN razao_social SET NOT NULL;

COMMENT ON COLUMN formulario_embarcadores.empresas.razao_social 
IS 'Razão social da empresa (obtida da Receita Federal via CNPJ)';

-- ============================================================
-- PASSO 5: REMOVER CONSTRAINTS E ÍNDICES DO CAMPO cnpj
-- ============================================================
-- Remover constraint unique (que cria o índice automaticamente)
ALTER TABLE formulario_embarcadores.empresas
DROP CONSTRAINT IF EXISTS empresas_cnpj_key;

-- Remover índice de busca
DROP INDEX IF EXISTS formulario_embarcadores.idx_empresas_cnpj;

-- ============================================================
-- PASSO 6: REMOVER COLUNA cnpj (VARCHAR 18)
-- ============================================================
ALTER TABLE formulario_embarcadores.empresas
DROP COLUMN IF EXISTS cnpj CASCADE;

-- ============================================================
-- PASSO 7: RENOMEAR cnpj_digits PARA cnpj
-- ============================================================
ALTER TABLE formulario_embarcadores.empresas
RENAME COLUMN cnpj_digits TO cnpj;

-- ============================================================
-- PASSO 8: ADICIONAR CONSTRAINT NO NOVO CAMPO cnpj
-- ============================================================
-- Garantir que cnpj tenha exatamente 14 dígitos
ALTER TABLE formulario_embarcadores.empresas
ADD CONSTRAINT check_cnpj_14_digitos 
CHECK (cnpj IS NULL OR (cnpj ~ '^[0-9]{14}$'));

COMMENT ON COLUMN formulario_embarcadores.empresas.cnpj 
IS 'CNPJ da empresa com 14 dígitos (sem formatação)';

-- Recriar índice único no cnpj
CREATE UNIQUE INDEX idx_empresas_cnpj_unique 
ON formulario_embarcadores.empresas(cnpj) 
WHERE cnpj IS NOT NULL;

-- ============================================================
-- PASSO 9: REMOVER COLUNA nome_empresa
-- ============================================================
ALTER TABLE formulario_embarcadores.empresas
DROP COLUMN IF EXISTS nome_empresa CASCADE;

-- ============================================================
-- PASSO 10: RECRIAR ÍNDICES OTIMIZADOS
-- ============================================================
-- Índice para busca por razão social
CREATE INDEX idx_empresas_razao_social 
ON formulario_embarcadores.empresas(razao_social);

-- Índice para busca por CNPJ (já criado acima como unique)
-- CREATE INDEX idx_empresas_cnpj ON formulario_embarcadores.empresas(cnpj);

-- ============================================================
-- PASSO 11: ATUALIZAR COMENTÁRIOS DA TABELA
-- ============================================================
COMMENT ON TABLE formulario_embarcadores.empresas 
IS 'Cadastro de empresas entrevistadas no projeto PLI 2050. CNPJ armazenado como VARCHAR(14) apenas dígitos.';

-- ============================================================
-- PASSO 12: VERIFICAR RESULTADOS
-- ============================================================
DO $$
DECLARE
    total_empresas INTEGER;
    empresas_com_cnpj INTEGER;
    empresas_com_razao_social INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_empresas 
    FROM formulario_embarcadores.empresas;
    
    SELECT COUNT(*) INTO empresas_com_cnpj 
    FROM formulario_embarcadores.empresas 
    WHERE cnpj IS NOT NULL;
    
    SELECT COUNT(*) INTO empresas_com_razao_social 
    FROM formulario_embarcadores.empresas 
    WHERE razao_social IS NOT NULL;
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'MIGRATION CONCLUIDA COM SUCESSO!';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Total de empresas: %', total_empresas;
    RAISE NOTICE 'Empresas com CNPJ: %', empresas_com_cnpj;
    RAISE NOTICE 'Empresas com Razao Social: %', empresas_com_razao_social;
    RAISE NOTICE '============================================================';
    
    IF empresas_com_razao_social < total_empresas THEN
        RAISE WARNING 'ATENCAO: % empresas sem razao social!', (total_empresas - empresas_com_razao_social);
    END IF;
END $$;

COMMIT;

-- ============================================================
-- ROLLBACK (CASO NECESSÁRIO)
-- ============================================================
-- Para reverter esta migration, execute:
-- 
-- BEGIN;
-- ALTER TABLE formulario_embarcadores.empresas ADD COLUMN nome_empresa VARCHAR(255);
-- UPDATE formulario_embarcadores.empresas SET nome_empresa = razao_social;
-- ALTER TABLE formulario_embarcadores.empresas ALTER COLUMN nome_empresa SET NOT NULL;
-- 
-- ALTER TABLE formulario_embarcadores.empresas RENAME COLUMN cnpj TO cnpj_digits;
-- ALTER TABLE formulario_embarcadores.empresas ADD COLUMN cnpj VARCHAR(18);
-- COMMIT;
