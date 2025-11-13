-- ============================================================
-- Migration: Adicionar coluna observacoes_produto_principal
-- Data: 13/11/2025
-- Descrição: Permite observações sobre o transporte do produto principal (Q18)
-- ============================================================

-- Adicionar coluna na tabela pesquisas
ALTER TABLE formulario_embarcadores.pesquisas
ADD COLUMN IF NOT EXISTS observacoes_produto_principal TEXT;

-- Comentário da coluna
COMMENT ON COLUMN formulario_embarcadores.pesquisas.observacoes_produto_principal 
IS 'Q18 - Observações sobre o transporte do produto principal';

-- Verificação
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'formulario_embarcadores'
  AND table_name = 'pesquisas'
  AND column_name = 'observacoes_produto_principal';
