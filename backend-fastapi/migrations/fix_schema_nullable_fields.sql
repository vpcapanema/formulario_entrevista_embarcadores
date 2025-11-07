-- ============================================================
-- MIGRAÇÃO: Corrigir campos origem/destino estado/municipio
-- ============================================================
-- PROBLEMA: Estado e município são NOT NULL, mas só deveriam 
-- ser obrigatórios quando país = 'Brasil'
-- 
-- SOLUÇÃO: Remover constraint NOT NULL desses campos
-- ============================================================

-- Remover constraint NOT NULL de origem_estado
ALTER TABLE formulario_embarcadores.pesquisas 
ALTER COLUMN origem_estado DROP NOT NULL;

-- Remover constraint NOT NULL de origem_municipio
ALTER TABLE formulario_embarcadores.pesquisas 
ALTER COLUMN origem_municipio DROP NOT NULL;

-- Remover constraint NOT NULL de destino_estado
ALTER TABLE formulario_embarcadores.pesquisas 
ALTER COLUMN destino_estado DROP NOT NULL;

-- Remover constraint NOT NULL de destino_municipio
ALTER TABLE formulario_embarcadores.pesquisas 
ALTER COLUMN destino_municipio DROP NOT NULL;

-- Adicionar comentários explicando a lógica
COMMENT ON COLUMN formulario_embarcadores.pesquisas.origem_estado IS 
'Estado de origem (obrigatório apenas se origem_pais = ''Brasil'')';

COMMENT ON COLUMN formulario_embarcadores.pesquisas.origem_municipio IS 
'Município de origem (obrigatório apenas se origem_pais = ''Brasil'')';

COMMENT ON COLUMN formulario_embarcadores.pesquisas.destino_estado IS 
'Estado de destino (obrigatório apenas se destino_pais = ''Brasil'')';

COMMENT ON COLUMN formulario_embarcadores.pesquisas.destino_municipio IS 
'Município de destino (obrigatório apenas se destino_pais = ''Brasil'')';

-- Verificar se a migração funcionou
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'formulario_embarcadores'
  AND table_name = 'pesquisas'
  AND column_name IN ('origem_estado', 'origem_municipio', 'destino_estado', 'destino_municipio')
ORDER BY ordinal_position;
