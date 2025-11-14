-- ============================================================
-- MIGRAÇÃO: Adicionar campos de naturalidade e estado civil
-- Data: 14/11/2025
-- ============================================================

-- Adicionar campos à tabela entrevistados
ALTER TABLE formulario_embarcadores.entrevistados
ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(20),
ADD COLUMN IF NOT EXISTS nacionalidade VARCHAR(20),
ADD COLUMN IF NOT EXISTS uf_naturalidade VARCHAR(2),
ADD COLUMN IF NOT EXISTS municipio_naturalidade VARCHAR(7);

-- Comentários nas colunas
COMMENT ON COLUMN formulario_embarcadores.entrevistados.estado_civil 
IS 'Estado civil do entrevistado (solteiro, casado, divorciado, viuvo, uniao-estavel)';

COMMENT ON COLUMN formulario_embarcadores.entrevistados.nacionalidade 
IS 'Nacionalidade do entrevistado (brasileira, estrangeira)';

COMMENT ON COLUMN formulario_embarcadores.entrevistados.uf_naturalidade 
IS 'UF onde o entrevistado nasceu (sigla - ex: SP, RJ)';

COMMENT ON COLUMN formulario_embarcadores.entrevistados.municipio_naturalidade 
IS 'Código IBGE do município onde o entrevistado nasceu (7 dígitos)';

-- Verificar resultado
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_schema = 'formulario_embarcadores'
AND table_name = 'entrevistados'
AND column_name IN ('estado_civil', 'nacionalidade', 'uf_naturalidade', 'municipio_naturalidade')
ORDER BY column_name;
