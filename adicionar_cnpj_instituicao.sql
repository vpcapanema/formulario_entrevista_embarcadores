-- =====================================================
-- ADICIONAR CAMPO CNPJ NA TABELA INSTITUIÇÕES
-- =====================================================

-- Adicionar coluna CNPJ
ALTER TABLE formulario_embarcadores.instituicoes 
ADD COLUMN cnpj VARCHAR(18);

-- Adicionar comentário
COMMENT ON COLUMN formulario_embarcadores.instituicoes.cnpj IS 'CNPJ da instituição no formato XX.XXX.XXX/XXXX-XX';

-- Atualizar instituições existentes com CNPJs fictícios (opcional)
UPDATE formulario_embarcadores.instituicoes 
SET cnpj = '00.000.000/0001-91' 
WHERE nome_instituicao = 'Concremat';

UPDATE formulario_embarcadores.instituicoes 
SET cnpj = '00.394.460/0058-87' 
WHERE nome_instituicao = 'PLI 2050 - SEMIL';

-- Autopreenchimento não precisa de CNPJ (é sistema)

-- Verificar resultado
SELECT id_instituicao, nome_instituicao, tipo_instituicao, cnpj 
FROM formulario_embarcadores.instituicoes 
ORDER BY nome_instituicao;

COMMIT;
