-- Migration: Adicionar coluna observacoes_sazonalidade (Q28)
-- Data: 13/11/2025
-- Descrição: Nova pergunta optativa sobre observações de sazonalidade

ALTER TABLE formulario_embarcadores.pesquisas 
ADD COLUMN IF NOT EXISTS observacoes_sazonalidade TEXT;
