-- Migration: 2025-11-06 - Aplicar constraints e índices (ordenado)
-- Nota: este script NÃO deve ser executado dentro de uma transação, pois usa CREATE INDEX CONCURRENTLY.
-- Ele fará algumas limpezas (remover duplicados) assumindo que o banco de desenvolvimento pode ser alterado.

-- 1) Normalizar CNPJ em coluna auxiliar e criar índice único
-- Adiciona a coluna cnpj_digits (apenas se não existir) e popula com dígitos do cnpj
ALTER TABLE IF EXISTS formulario_embarcadores.empresas
  ADD COLUMN IF NOT EXISTS cnpj_digits VARCHAR(14);

-- Use LEFT(...) to guarantee we never try to store more than 14 chars
UPDATE formulario_embarcadores.empresas
SET cnpj_digits = LEFT(regexp_replace(coalesce(cnpj, ''), '\\D', '', 'g'), 14)
WHERE cnpj IS NOT NULL;

-- Criar índice único na coluna de dígitos de CNPJ
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_empresas_cnpj_digits
  ON formulario_embarcadores.empresas (cnpj_digits);

-- 2) Garantir unicidade de entrevistados por empresa+email
-- Primeiro limpar duplicados mantendo o menor id_entrevistado
WITH duplicates AS (
  SELECT id_entrevistado
  FROM (
    SELECT id_entrevistado,
           ROW_NUMBER() OVER (PARTITION BY id_empresa, lower(email) ORDER BY id_entrevistado) as rn
    FROM formulario_embarcadores.entrevistados
    WHERE email IS NOT NULL AND trim(email) <> ''
  ) t WHERE rn > 1
)
DELETE FROM formulario_embarcadores.entrevistados
WHERE id_entrevistado IN (SELECT id_entrevistado FROM duplicates);

-- Depois criar índice único
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_entrevistados_empresa_email
  ON formulario_embarcadores.entrevistados (id_empresa, (lower(email)));

-- 3) Reafirmar índices/constraints existentes (opcional)
-- (a) entrevistadores.email já é UNIQUE no DDL, mas criamos índice se necessário
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_entrevistadores_email_lower
  ON formulario_embarcadores.entrevistadores ((lower(email)));

-- 4) Garantir FKs/NOT NULL nas colunas críticas de produtos_transportados
-- (No schema principal essas colunas já são NOT NULL e têm FK; aqui apenas verifica-se e aplica-se se necessário.)
-- Nota: ALTER COLUMN ... SET NOT NULL pode falhar se existirem linhas inválidas. O script abaixo assume tabela limpa.
ALTER TABLE formulario_embarcadores.produtos_transportados
  ALTER COLUMN id_pesquisa SET NOT NULL,
  ALTER COLUMN id_empresa SET NOT NULL;

-- Fim do script

-- Observação final: este script usa CREATE INDEX CONCURRENTLY — execute-o usando psql a partir do diretório raiz do projeto:
-- psql -v ON_ERROR_STOP=1 -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f migrations/20251106_apply_constraints_ordered.sql
