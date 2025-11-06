-- ════════════════════════════════════════════════════════════
-- 🔧 MIGRATION: Adicionar Colunas Faltantes
-- ════════════════════════════════════════════════════════════
-- Data: 05/11/2025
-- Schema: formulario_embarcadores
-- Objetivo: Adicionar colunas documentadas que não existem no banco
-- ════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════
-- TABELA 1: formulario_embarcadores.empresas
-- ════════════════════════════════════════════════════════════
-- Colunas a adicionar: 10
-- Questões afetadas: Q6b, Q8, Q9, Q10a, Q10b, Q10c, Q10d, Q11
-- ════════════════════════════════════════════════════════════

ALTER TABLE formulario_embarcadores.empresas
ADD COLUMN IF NOT EXISTS razao_social VARCHAR(255),           -- Q6b - Razão Social
ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(255),          -- Q6b - Nome Fantasia (API CNPJ)
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),                -- Q8  - Telefone da empresa
ADD COLUMN IF NOT EXISTS email VARCHAR(255),                  -- Q9  - Email da empresa
ADD COLUMN IF NOT EXISTS id_municipio INTEGER,                -- Q7  - Código IBGE 7 dígitos
ADD COLUMN IF NOT EXISTS logradouro VARCHAR(255),             -- Q10a - Rua/Avenida
ADD COLUMN IF NOT EXISTS numero VARCHAR(20),                  -- Q10b - Número
ADD COLUMN IF NOT EXISTS complemento VARCHAR(100),            -- Q10c - Complemento
ADD COLUMN IF NOT EXISTS bairro VARCHAR(100),                 -- Q10d - Bairro
ADD COLUMN IF NOT EXISTS cep VARCHAR(8);                      -- Q11 - CEP (apenas números)


-- ════════════════════════════════════════════════════════════
-- TABELA 2: formulario_embarcadores.entrevistados
-- ════════════════════════════════════════════════════════════
-- Nenhuma coluna a adicionar (apenas renomear campos)
-- Campos existentes: funcao, telefone, email
-- Campos documentados: cargo, telefone_entrevistado, email_entrevistado
-- ════════════════════════════════════════════════════════════

-- NÃO HÁ NECESSIDADE DE ADICIONAR COLUNAS NESTA TABELA
-- Os campos já existem com nomes diferentes (funcao, telefone, email)
-- A interface já coleta esses campos corretamente


-- ════════════════════════════════════════════════════════════
-- TABELA 3: formulario_embarcadores.pesquisas
-- ════════════════════════════════════════════════════════════
-- Colunas a adicionar: 35 (campos documentados que não existem)
-- Questões afetadas: Q14-Q40
-- ════════════════════════════════════════════════════════════

ALTER TABLE formulario_embarcadores.pesquisas
ADD COLUMN IF NOT EXISTS consentimento BOOLEAN DEFAULT FALSE,                     -- Q14 - Consentimento
ADD COLUMN IF NOT EXISTS transporta_carga BOOLEAN DEFAULT FALSE,                  -- Q15 - Transporta carga?
ADD COLUMN IF NOT EXISTS origem_instalacao VARCHAR(255),                          -- Q12d - Instalação de origem
ADD COLUMN IF NOT EXISTS destino_instalacao VARCHAR(255),                         -- Q13d - Instalação de destino
ADD COLUMN IF NOT EXISTS volume_anual_toneladas DECIMAL(15,2),                    -- Q17 - Volume anual (toneladas)
ADD COLUMN IF NOT EXISTS tipo_produto VARCHAR(100),                               -- Q18a - Tipo de produto
ADD COLUMN IF NOT EXISTS classe_produto VARCHAR(100),                             -- Q18b - Classe do produto
ADD COLUMN IF NOT EXISTS produtos_especificos TEXT,                               -- Q18c - Produtos específicos
ADD COLUMN IF NOT EXISTS modal_predominante VARCHAR(50),                          -- Q19 - Modal predominante
ADD COLUMN IF NOT EXISTS modal_secundario VARCHAR(50),                            -- Q20 - Modal secundário
ADD COLUMN IF NOT EXISTS modal_terciario VARCHAR(50),                             -- Q21 - Modal terciário
ADD COLUMN IF NOT EXISTS proprio_terceirizado VARCHAR(50),                        -- Q22 - Próprio ou terceirizado
ADD COLUMN IF NOT EXISTS qtd_caminhoes_proprios INTEGER,                          -- Q23a - Qtd caminhões próprios
ADD COLUMN IF NOT EXISTS qtd_caminhoes_terceirizados INTEGER,                     -- Q23b - Qtd caminhões terceirizados
ADD COLUMN IF NOT EXISTS tempo_transporte VARCHAR(50),                            -- Q24 - Tempo de transporte
ADD COLUMN IF NOT EXISTS custo_medio_tonelada DECIMAL(15,2),                      -- Q25 - Custo médio/tonelada
ADD COLUMN IF NOT EXISTS pedagio_custo DECIMAL(15,2),                             -- Q26a - Custo pedágio
ADD COLUMN IF NOT EXISTS frete_custo DECIMAL(15,2),                               -- Q26b - Custo frete
ADD COLUMN IF NOT EXISTS manutencao_custo DECIMAL(15,2),                          -- Q26c - Custo manutenção
ADD COLUMN IF NOT EXISTS outros_custos DECIMAL(15,2),                             -- Q26d - Outros custos
ADD COLUMN IF NOT EXISTS principais_desafios TEXT,                                -- Q27 - Principais desafios
ADD COLUMN IF NOT EXISTS investimento_sustentavel VARCHAR(10),                    -- Q28 - Investimento sustentável (Sim/Não)
ADD COLUMN IF NOT EXISTS reducao_emissoes TEXT,                                   -- Q29 - Redução de emissões
ADD COLUMN IF NOT EXISTS tecnologias_interesse TEXT,                              -- Q30 - Tecnologias de interesse
ADD COLUMN IF NOT EXISTS uso_tecnologia VARCHAR(50),                              -- Q31 - Uso de tecnologia
ADD COLUMN IF NOT EXISTS grau_automacao VARCHAR(50),                              -- Q32 - Grau de automação
ADD COLUMN IF NOT EXISTS rastreamento_carga BOOLEAN DEFAULT FALSE,                -- Q33 - Rastreamento de carga
ADD COLUMN IF NOT EXISTS uso_dados TEXT,                                          -- Q34 - Uso de dados
ADD COLUMN IF NOT EXISTS conhecimento_hidrovias VARCHAR(50),                      -- Q35 - Conhecimento hidrovias
ADD COLUMN IF NOT EXISTS viabilidade_hidrovia VARCHAR(50),                        -- Q36 - Viabilidade hidrovia
ADD COLUMN IF NOT EXISTS pontos_melhoria TEXT,                                    -- Q37 - Pontos de melhoria
ADD COLUMN IF NOT EXISTS interesse_parcerias BOOLEAN DEFAULT FALSE,               -- Q38 - Interesse em parcerias
ADD COLUMN IF NOT EXISTS observacoes TEXT,                                        -- Q39 - Observações
ADD COLUMN IF NOT EXISTS feedback_formulario TEXT,                                -- Q40 - Feedback do formulário
ADD COLUMN IF NOT EXISTS id_instalacao_origem INTEGER;                            -- FK para instalações


-- ════════════════════════════════════════════════════════════
-- ✅ VERIFICAÇÃO FINAL
-- ════════════════════════════════════════════════════════════

-- Verificar colunas adicionadas na tabela empresas
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'formulario_embarcadores'
AND table_name = 'empresas'
AND column_name IN (
    'razao_social', 'nome_fantasia', 'telefone', 'email', 
    'id_municipio', 'logradouro', 'numero', 'complemento', 
    'bairro', 'cep'
)
ORDER BY column_name;

-- Verificar colunas adicionadas na tabela pesquisas
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'formulario_embarcadores'
AND table_name = 'pesquisas'
AND column_name IN (
    'consentimento', 'transporta_carga', 'origem_instalacao', 
    'destino_instalacao', 'volume_anual_toneladas', 'tipo_produto',
    'classe_produto', 'produtos_especificos', 'modal_predominante',
    'modal_secundario', 'modal_terciario'
)
ORDER BY column_name;

-- ════════════════════════════════════════════════════════════
-- 📊 RESUMO DA MIGRATION
-- ════════════════════════════════════════════════════════════
-- 
-- ✅ Tabela empresas: 10 colunas adicionadas
-- ✅ Tabela entrevistados: 0 colunas (campos já existem)
-- ✅ Tabela pesquisas: 35 colunas adicionadas
-- 
-- TOTAL: 45 novas colunas adicionadas
-- 
-- ⚠️ IMPORTANTE: A INTERFACE NÃO SERÁ ALTERADA
-- A interface continuará coletando apenas os campos existentes
-- As novas colunas estão disponíveis para uso futuro
-- ════════════════════════════════════════════════════════════
