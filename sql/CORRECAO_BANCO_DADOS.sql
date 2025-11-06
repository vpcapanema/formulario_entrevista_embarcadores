-- =====================================================
-- CORREÇÃO DO BANCO DE DADOS - ADICIONAR id_estado
-- =====================================================

-- A tabela de municípios precisa ter a coluna id_estado para
-- permitir filtrar municípios por estado selecionado

-- 1. VERIFICAR SE A COLUNA JÁ EXISTE
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'formulario_embarcadores' 
  AND table_name = 'municipios_sp';

-- 2. ADICIONAR A COLUNA id_estado (se não existir)
ALTER TABLE formulario_embarcadores.municipios_sp 
ADD COLUMN IF NOT EXISTS id_estado INTEGER;

-- 3. ATUALIZAR TODOS OS MUNICÍPIOS DE SÃO PAULO COM id_estado = 26
-- (26 é o ID de São Paulo na tabela estados_brasil)
UPDATE formulario_embarcadores.municipios_sp 
SET id_estado = (
    SELECT id_estado 
    FROM formulario_embarcadores.estados_brasil 
    WHERE uf = 'SP' 
    LIMIT 1
)
WHERE id_estado IS NULL;

-- 4. VERIFICAR A ATUALIZAÇÃO
SELECT 
    COUNT(*) as total_municipios,
    id_estado,
    (SELECT nome_estado FROM formulario_embarcadores.estados_brasil WHERE id_estado = m.id_estado) as nome_estado
FROM formulario_embarcadores.municipios_sp m
GROUP BY id_estado;

-- RESULTADO ESPERADO:
-- total_municipios | id_estado | nome_estado
-- -----------------|-----------|-------------
--      645         |    26     | São Paulo

-- 5. (OPCIONAL) CRIAR ÍNDICE PARA MELHORAR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_municipios_estado 
ON formulario_embarcadores.municipios_sp(id_estado);

-- 6. (OPCIONAL) ADICIONAR CONSTRAINT DE FOREIGN KEY
ALTER TABLE formulario_embarcadores.municipios_sp
ADD CONSTRAINT fk_municipio_estado
FOREIGN KEY (id_estado) 
REFERENCES formulario_embarcadores.estados_brasil(id_estado);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Listar alguns municípios com seus estados
SELECT 
    m.id_municipio,
    m.nome_municipio,
    m.id_estado,
    e.nome_estado,
    e.uf
FROM formulario_embarcadores.municipios_sp m
LEFT JOIN formulario_embarcadores.estados_brasil e ON m.id_estado = e.id_estado
LIMIT 10;

-- RESULTADO ESPERADO:
-- Todos os 645 municípios devem ter id_estado = 26 (São Paulo)
