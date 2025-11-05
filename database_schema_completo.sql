-- =====================================================
-- SISTEMA PLI 2050 - FORMULÁRIO DE ENTREVISTAS
-- ESQUEMA DE BANCO DE DADOS POSTGRESQL
-- =====================================================
-- Versão: 2.0
-- Data: 05/11/2025
-- Descrição: Modelo normalizado com entidades separadas
-- Schema: formulario_embarcadores
-- =====================================================

-- =====================================================
-- 1. CRIAR SCHEMA
-- =====================================================
CREATE SCHEMA IF NOT EXISTS formulario_embarcadores;

-- Definir como schema padrão para esta sessão
SET search_path TO formulario_embarcadores, public;

-- =====================================================
-- 2. TABELAS AUXILIARES (LISTAS DE VALORES)
-- =====================================================

-- 2.1. Instituições (Concremat, consultorias, etc.)
CREATE TABLE formulario_embarcadores.instituicoes (
    id_instituicao SERIAL PRIMARY KEY,
    nome_instituicao VARCHAR(255) NOT NULL UNIQUE,
    tipo_instituicao VARCHAR(50),
    cnpj VARCHAR(18)
);

COMMENT ON TABLE formulario_embarcadores.instituicoes IS 'Instituições/empresas dos entrevistadores';
COMMENT ON COLUMN formulario_embarcadores.instituicoes.tipo_instituicao IS 'consultoria, governo, universidade, etc.';
COMMENT ON COLUMN formulario_embarcadores.instituicoes.cnpj IS 'CNPJ da instituição no formato XX.XXX.XXX/XXXX-XX';

-- Dados iniciais
INSERT INTO formulario_embarcadores.instituicoes (nome_instituicao, tipo_instituicao, cnpj) VALUES
('Concremat', 'consultoria', '00.000.000/0001-91'),
('PLI 2050 - SEMIL', 'governo', '00.394.460/0058-87'),
('Autopreenchimento', 'sistema', NULL);

-- 2.2. Estados do Brasil
CREATE TABLE formulario_embarcadores.estados_brasil (
    id_estado SERIAL PRIMARY KEY,
    uf CHAR(2) NOT NULL UNIQUE,
    nome_estado VARCHAR(50) NOT NULL,
    regiao VARCHAR(20) NOT NULL
);

COMMENT ON TABLE formulario_embarcadores.estados_brasil IS '27 Unidades Federativas do Brasil';

INSERT INTO formulario_embarcadores.estados_brasil (uf, nome_estado, regiao) VALUES
('AC', 'Acre', 'Norte'),
('AL', 'Alagoas', 'Nordeste'),
('AP', 'Amapá', 'Norte'),
('AM', 'Amazonas', 'Norte'),
('BA', 'Bahia', 'Nordeste'),
('CE', 'Ceará', 'Nordeste'),
('DF', 'Distrito Federal', 'Centro-Oeste'),
('ES', 'Espírito Santo', 'Sudeste'),
('GO', 'Goiás', 'Centro-Oeste'),
('MA', 'Maranhão', 'Nordeste'),
('MT', 'Mato Grosso', 'Centro-Oeste'),
('MS', 'Mato Grosso do Sul', 'Centro-Oeste'),
('MG', 'Minas Gerais', 'Sudeste'),
('PA', 'Pará', 'Norte'),
('PB', 'Paraíba', 'Nordeste'),
('PR', 'Paraná', 'Sul'),
('PE', 'Pernambuco', 'Nordeste'),
('PI', 'Piauí', 'Nordeste'),
('RJ', 'Rio de Janeiro', 'Sudeste'),
('RN', 'Rio Grande do Norte', 'Nordeste'),
('RS', 'Rio Grande do Sul', 'Sul'),
('RO', 'Rondônia', 'Norte'),
('RR', 'Roraima', 'Norte'),
('SC', 'Santa Catarina', 'Sul'),
('SP', 'São Paulo', 'Sudeste'),
('SE', 'Sergipe', 'Nordeste'),
('TO', 'Tocantins', 'Norte');

-- 2.3. Países
CREATE TABLE formulario_embarcadores.paises (
    id_pais SERIAL PRIMARY KEY,
    nome_pais VARCHAR(100) NOT NULL UNIQUE,
    codigo_iso2 CHAR(2),
    codigo_iso3 CHAR(3),
    relevancia INTEGER DEFAULT 0
);

COMMENT ON TABLE formulario_embarcadores.paises IS 'Principais países para transporte de mercadorias';
COMMENT ON COLUMN formulario_embarcadores.paises.relevancia IS 'Maior número = mais relevante (ordenação)';

INSERT INTO formulario_embarcadores.paises (nome_pais, codigo_iso2, codigo_iso3, relevancia) VALUES
('Brasil', 'BR', 'BRA', 100),
('Argentina', 'AR', 'ARG', 90),
('China', 'CN', 'CHN', 85),
('Estados Unidos', 'US', 'USA', 85),
('Paraguai', 'PY', 'PRY', 80),
('Uruguai', 'UY', 'URY', 75),
('Chile', 'CL', 'CHL', 70),
('Bolívia', 'BO', 'BOL', 65),
('México', 'MX', 'MEX', 60),
('Alemanha', 'DE', 'DEU', 55),
('Japão', 'JP', 'JPN', 55),
('Holanda', 'NL', 'NLD', 50),
('Itália', 'IT', 'ITA', 45),
('França', 'FR', 'FRA', 45),
('Índia', 'IN', 'IND', 40),
('Canadá', 'CA', 'CAN', 40),
('Colômbia', 'CO', 'COL', 35),
('Peru', 'PE', 'PER', 35),
('Venezuela', 'VE', 'VEN', 30),
('Espanha', 'ES', 'ESP', 30),
('Outro', NULL, NULL, 0),
('Não sei / Não se aplica', NULL, NULL, 0);

-- 2.4. Municípios de São Paulo (exemplo com principais - completar com todos os 645)
CREATE TABLE formulario_embarcadores.municipios_sp (
    id_municipio SERIAL PRIMARY KEY,
    nome_municipio VARCHAR(100) NOT NULL UNIQUE,
    codigo_ibge VARCHAR(7) UNIQUE,
    regiao VARCHAR(50)
);

COMMENT ON TABLE formulario_embarcadores.municipios_sp IS '645 municípios do Estado de São Paulo';

-- Inserir principais municípios (exemplo - completar com todos os 645)
INSERT INTO formulario_embarcadores.municipios_sp (nome_municipio, codigo_ibge, regiao) VALUES
('São Paulo', '3550308', 'Metropolitana de São Paulo'),
('Campinas', '3509502', 'Metropolitana de Campinas'),
('Santos', '3548500', 'Metropolitana da Baixada Santista'),
('São Bernardo do Campo', '3548708', 'Metropolitana de São Paulo'),
('Santo André', '3547809', 'Metropolitana de São Paulo'),
('Osasco', '3534401', 'Metropolitana de São Paulo'),
('Ribeirão Preto', '3543402', 'Ribeirão Preto'),
('Sorocaba', '3552205', 'Sorocaba'),
('São José dos Campos', '3549904', 'Metropolitana do Vale do Paraíba e Litoral Norte'),
('Guarulhos', '3518800', 'Metropolitana de São Paulo'),
('Outro (fora de SP)', NULL, NULL);
-- TODO: Completar com os 645 municípios

-- 2.5. Funções/Cargos de Entrevistados
CREATE TABLE formulario_embarcadores.funcoes_entrevistado (
    id_funcao SERIAL PRIMARY KEY,
    nome_funcao VARCHAR(100) NOT NULL UNIQUE
);

COMMENT ON TABLE formulario_embarcadores.funcoes_entrevistado IS 'Funções/cargos comuns de entrevistados';

INSERT INTO formulario_embarcadores.funcoes_entrevistado (nome_funcao) VALUES
('Gerente de Logística'),
('Coordenador de Transportes'),
('Diretor de Operações'),
('Analista de Logística'),
('Supervisor de Transporte'),
('Gerente de Supply Chain'),
('Proprietário'),
('Sócio-Diretor'),
('Gerente Geral'),
('Diretor Comercial'),
('Outro'),
('Não sei / Não se aplica');

-- =====================================================
-- 3. TABELAS PRINCIPAIS
-- =====================================================

-- 3.1. Entrevistadores
CREATE TABLE formulario_embarcadores.entrevistadores (
    id_entrevistador SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    id_instituicao INTEGER REFERENCES formulario_embarcadores.instituicoes(id_instituicao),
    
    CONSTRAINT email_entrevistador_valido CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE formulario_embarcadores.entrevistadores IS 'Cadastro de entrevistadores do projeto PLI 2050';
COMMENT ON COLUMN formulario_embarcadores.entrevistadores.id_entrevistador IS 'ID único do entrevistador';

CREATE INDEX idx_entrevistadores_email ON formulario_embarcadores.entrevistadores(email);
CREATE INDEX idx_entrevistadores_instituicao ON formulario_embarcadores.entrevistadores(id_instituicao);

-- 3.2. Empresas
CREATE TABLE formulario_embarcadores.empresas (
    id_empresa SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(255) NOT NULL,
    tipo_empresa VARCHAR(50) NOT NULL,
    outro_tipo VARCHAR(255),
    municipio VARCHAR(255) NOT NULL,
    estado VARCHAR(100),
    cnpj VARCHAR(18) UNIQUE,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT check_tipo_empresa CHECK (
        tipo_empresa IN ('embarcador', 'transportador', 'operador', 'outro')
    )
);

COMMENT ON TABLE formulario_embarcadores.empresas IS 'Cadastro de empresas entrevistadas no projeto PLI 2050';
COMMENT ON COLUMN formulario_embarcadores.empresas.id_empresa IS 'ID único da empresa';
COMMENT ON COLUMN formulario_embarcadores.empresas.cnpj IS 'CNPJ da empresa (opcional)';

CREATE INDEX idx_empresas_nome ON formulario_embarcadores.empresas(nome_empresa);
CREATE INDEX idx_empresas_tipo ON formulario_embarcadores.empresas(tipo_empresa);
CREATE INDEX idx_empresas_municipio ON formulario_embarcadores.empresas(municipio);
CREATE INDEX idx_empresas_cnpj ON formulario_embarcadores.empresas(cnpj);

-- 3.3. Entrevistados
CREATE TABLE formulario_embarcadores.entrevistados (
    id_entrevistado SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL REFERENCES formulario_embarcadores.empresas(id_empresa) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    funcao VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    principal BOOLEAN DEFAULT FALSE,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT email_entrevistado_valido CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE formulario_embarcadores.entrevistados IS 'Pessoas responsáveis pelas informações nas empresas';
COMMENT ON COLUMN formulario_embarcadores.entrevistados.id_entrevistado IS 'ID único do entrevistado';
COMMENT ON COLUMN formulario_embarcadores.entrevistados.principal IS 'Indica se é o contato principal da empresa';

CREATE INDEX idx_entrevistados_empresa ON formulario_embarcadores.entrevistados(id_empresa);
CREATE INDEX idx_entrevistados_email ON formulario_embarcadores.entrevistados(email);
CREATE INDEX idx_entrevistados_principal ON formulario_embarcadores.entrevistados(principal);

-- 3.4. Pesquisas (Tabela Principal)
CREATE TABLE formulario_embarcadores.pesquisas (
    -- Identificadores
    id_pesquisa SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL REFERENCES formulario_embarcadores.empresas(id_empresa),
    id_entrevistado INTEGER NOT NULL REFERENCES formulario_embarcadores.entrevistados(id_entrevistado),
    tipo_responsavel VARCHAR(20) NOT NULL,
    id_responsavel INTEGER NOT NULL,
    
    -- Metadados
    data_entrevista TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'finalizada',
    
    -- Card 4: Produto Principal (Q9-Q10)
    produto_principal VARCHAR(255) NOT NULL,
    agrupamento_produto VARCHAR(100) NOT NULL,
    outro_produto VARCHAR(255),
    
    -- Card 5: Características do Transporte (Q11-Q28)
    tipo_transporte VARCHAR(50) NOT NULL,
    
    -- Origem (Q12)
    origem_pais VARCHAR(100) NOT NULL,
    origem_estado VARCHAR(100) NOT NULL,
    origem_municipio VARCHAR(255) NOT NULL,
    
    -- Destino (Q13)
    destino_pais VARCHAR(100) NOT NULL,
    destino_estado VARCHAR(100) NOT NULL,
    destino_municipio VARCHAR(255) NOT NULL,
    
    distancia NUMERIC(10, 2) NOT NULL,
    tem_paradas VARCHAR(3) NOT NULL,
    num_paradas VARCHAR(20),
    
    -- Modalidades (array)
    modos TEXT[] NOT NULL,
    config_veiculo VARCHAR(100),
    
    capacidade_utilizada VARCHAR(20) NOT NULL,
    peso_carga NUMERIC(12, 2) NOT NULL,
    unidade_peso VARCHAR(20) NOT NULL,
    custo_transporte NUMERIC(12, 2) NOT NULL,
    valor_carga NUMERIC(15, 2) NOT NULL,
    tipo_embalagem VARCHAR(100) NOT NULL,
    carga_perigosa VARCHAR(3) NOT NULL,
    
    -- Tempo de deslocamento (Q26)
    tempo_dias INTEGER NOT NULL,
    tempo_horas INTEGER NOT NULL,
    tempo_minutos INTEGER NOT NULL,
    
    frequencia VARCHAR(50) NOT NULL,
    frequencia_diaria VARCHAR(20),
    frequencia_outra VARCHAR(255),
    
    -- Card 6: Fatores de Decisão Modal (Q29-Q38)
    importancia_custo VARCHAR(20) NOT NULL,
    variacao_custo NUMERIC(5, 2) NOT NULL,
    importancia_tempo VARCHAR(20) NOT NULL,
    variacao_tempo NUMERIC(5, 2) NOT NULL,
    importancia_confiabilidade VARCHAR(20) NOT NULL,
    variacao_confiabilidade NUMERIC(5, 2) NOT NULL,
    importancia_seguranca VARCHAR(20) NOT NULL,
    variacao_seguranca NUMERIC(5, 2) NOT NULL,
    importancia_capacidade VARCHAR(20) NOT NULL,
    variacao_capacidade NUMERIC(5, 2) NOT NULL,
    
    -- Card 7: Análise Estratégica (Q39-Q41)
    tipo_cadeia VARCHAR(50) NOT NULL,
    modais_alternativos TEXT[],
    fator_adicional TEXT,
    
    -- Card 8: Dificuldades Logísticas (Q42-Q43)
    dificuldades TEXT[],
    detalhe_dificuldade TEXT,
    
    -- Observações gerais
    observacoes TEXT,
    
    -- Constraints
    CONSTRAINT check_tipo_responsavel CHECK (tipo_responsavel IN ('entrevistador', 'entrevistado')),
    CONSTRAINT check_tem_paradas CHECK (tem_paradas IN ('sim', 'nao', 'nao-sei')),
    CONSTRAINT check_carga_perigosa CHECK (carga_perigosa IN ('sim', 'nao', 'nao-sei')),
    CONSTRAINT check_status CHECK (status IN ('rascunho', 'finalizada', 'validada')),
    CONSTRAINT check_tipo_transporte CHECK (tipo_transporte IN ('importacao', 'exportacao', 'local', 'nao-sei'))
);

COMMENT ON TABLE formulario_embarcadores.pesquisas IS 'Pesquisas/Entrevistas realizadas - PLI 2050';
COMMENT ON COLUMN formulario_embarcadores.pesquisas.id_pesquisa IS 'ID único da pesquisa';
COMMENT ON COLUMN formulario_embarcadores.pesquisas.tipo_responsavel IS 'Quem preencheu: entrevistador ou entrevistado';
COMMENT ON COLUMN formulario_embarcadores.pesquisas.id_responsavel IS 'ID do responsável (entrevistador ou entrevistado)';
COMMENT ON COLUMN formulario_embarcadores.pesquisas.status IS 'Status da pesquisa: rascunho, finalizada ou validada';

CREATE INDEX idx_pesquisas_empresa ON formulario_embarcadores.pesquisas(id_empresa);
CREATE INDEX idx_pesquisas_entrevistado ON formulario_embarcadores.pesquisas(id_entrevistado);
CREATE INDEX idx_pesquisas_responsavel ON formulario_embarcadores.pesquisas(id_responsavel);
CREATE INDEX idx_pesquisas_data ON formulario_embarcadores.pesquisas(data_entrevista);
CREATE INDEX idx_pesquisas_produto ON formulario_embarcadores.pesquisas(produto_principal);
CREATE INDEX idx_pesquisas_agrupamento ON formulario_embarcadores.pesquisas(agrupamento_produto);
CREATE INDEX idx_pesquisas_status ON formulario_embarcadores.pesquisas(status);
CREATE INDEX idx_pesquisas_modos ON formulario_embarcadores.pesquisas USING GIN(modos);

-- 3.5. Produtos Transportados (Q8)
CREATE TABLE formulario_embarcadores.produtos_transportados (
    id_produto SERIAL PRIMARY KEY,
    id_pesquisa INTEGER NOT NULL REFERENCES formulario_embarcadores.pesquisas(id_pesquisa) ON DELETE CASCADE,
    id_empresa INTEGER NOT NULL REFERENCES formulario_embarcadores.empresas(id_empresa),
    
    carga VARCHAR(255) NOT NULL,
    movimentacao NUMERIC(12, 2),
    origem VARCHAR(255),
    destino VARCHAR(255),
    distancia NUMERIC(10, 2),
    modalidade VARCHAR(50),
    acondicionamento VARCHAR(100),
    ordem INTEGER DEFAULT 1
);

COMMENT ON TABLE formulario_embarcadores.produtos_transportados IS 'Produtos transportados pelas empresas (Questão 8)';
COMMENT ON COLUMN formulario_embarcadores.produtos_transportados.ordem IS 'Ordem de importância/relevância do produto';

CREATE INDEX idx_produtos_pesquisa ON formulario_embarcadores.produtos_transportados(id_pesquisa);
CREATE INDEX idx_produtos_empresa ON formulario_embarcadores.produtos_transportados(id_empresa);
CREATE INDEX idx_produtos_carga ON formulario_embarcadores.produtos_transportados(carga);

-- =====================================================
-- 4. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION formulario_embarcadores.atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para empresas
CREATE TRIGGER trigger_atualizar_empresas
    BEFORE UPDATE ON formulario_embarcadores.empresas
    FOR EACH ROW
    EXECUTE FUNCTION formulario_embarcadores.atualizar_timestamp();

-- Trigger para entrevistados
CREATE TRIGGER trigger_atualizar_entrevistados
    BEFORE UPDATE ON formulario_embarcadores.entrevistados
    FOR EACH ROW
    EXECUTE FUNCTION formulario_embarcadores.atualizar_timestamp();

-- Trigger para pesquisas
CREATE TRIGGER trigger_atualizar_pesquisas
    BEFORE UPDATE ON formulario_embarcadores.pesquisas
    FOR EACH ROW
    EXECUTE FUNCTION formulario_embarcadores.atualizar_timestamp();

-- =====================================================
-- 5. VIEWS CONSOLIDADAS
-- =====================================================

-- 5.1. View Completa - Junta TODAS as tabelas
CREATE VIEW formulario_embarcadores.v_pesquisas_completa AS
SELECT 
    -- IDs
    p.id_pesquisa,
    p.id_empresa,
    p.id_entrevistado,
    p.tipo_responsavel,
    p.id_responsavel,
    
    -- Empresa
    e.nome_empresa,
    e.tipo_empresa,
    e.outro_tipo AS empresa_outro_tipo,
    e.municipio AS empresa_municipio,
    e.estado AS empresa_estado,
    e.cnpj AS empresa_cnpj,
    
    -- Entrevistado
    ent.nome AS entrevistado_nome,
    ent.funcao AS entrevistado_funcao,
    ent.telefone AS entrevistado_telefone,
    ent.email AS entrevistado_email,
    ent.principal AS entrevistado_principal,
    
    -- Entrevistador (se aplicável)
    CASE 
        WHEN p.tipo_responsavel = 'entrevistador' THEN entv.nome_completo
        ELSE NULL
    END AS entrevistador_nome,
    CASE 
        WHEN p.tipo_responsavel = 'entrevistador' THEN entv.email
        ELSE NULL
    END AS entrevistador_email,
    CASE 
        WHEN p.tipo_responsavel = 'entrevistador' THEN inst.nome_instituicao
        ELSE NULL
    END AS entrevistador_instituicao,
    
    -- Metadados da pesquisa
    p.data_entrevista,
    p.data_atualizacao,
    p.status,
    
    -- Produto Principal
    p.produto_principal,
    p.agrupamento_produto,
    p.outro_produto,
    
    -- Transporte - Origem e Destino
    p.tipo_transporte,
    p.origem_pais,
    p.origem_estado,
    p.origem_municipio,
    p.origem_municipio || ' - ' || p.origem_estado || ', ' || p.origem_pais AS origem_completa,
    p.destino_pais,
    p.destino_estado,
    p.destino_municipio,
    p.destino_municipio || ' - ' || p.destino_estado || ', ' || p.destino_pais AS destino_completa,
    
    -- Transporte - Características
    p.distancia,
    p.tem_paradas,
    p.num_paradas,
    p.modos,
    p.config_veiculo,
    
    -- Peso e Valores
    p.capacidade_utilizada,
    p.peso_carga,
    p.unidade_peso,
    CASE 
        WHEN p.unidade_peso = 'kg' THEN p.peso_carga / 1000
        ELSE p.peso_carga 
    END AS peso_toneladas,
    p.custo_transporte,
    p.valor_carga,
    ROUND(
        p.custo_transporte / NULLIF(
            CASE WHEN p.unidade_peso = 'kg' THEN p.peso_carga/1000 ELSE p.peso_carga END, 
            0
        ), 
        2
    ) AS custo_por_tonelada,
    
    p.tipo_embalagem,
    p.carga_perigosa,
    
    -- Tempo
    p.tempo_dias,
    p.tempo_horas,
    p.tempo_minutos,
    (p.tempo_dias * 24 * 60) + (p.tempo_horas * 60) + p.tempo_minutos AS tempo_total_minutos,
    
    p.frequencia,
    p.frequencia_diaria,
    p.frequencia_outra,
    
    -- Fatores de Decisão
    p.importancia_custo,
    p.variacao_custo,
    p.importancia_tempo,
    p.variacao_tempo,
    p.importancia_confiabilidade,
    p.variacao_confiabilidade,
    p.importancia_seguranca,
    p.variacao_seguranca,
    p.importancia_capacidade,
    p.variacao_capacidade,
    
    -- Análise Estratégica
    p.tipo_cadeia,
    p.modais_alternativos,
    p.fator_adicional,
    
    -- Dificuldades
    p.dificuldades,
    p.detalhe_dificuldade,
    
    -- Observações
    p.observacoes,
    
    -- Estatísticas
    (SELECT COUNT(*) FROM formulario_embarcadores.produtos_transportados pt 
     WHERE pt.id_pesquisa = p.id_pesquisa) AS qtd_produtos_informados
    
FROM formulario_embarcadores.pesquisas p
INNER JOIN formulario_embarcadores.empresas e ON p.id_empresa = e.id_empresa
INNER JOIN formulario_embarcadores.entrevistados ent ON p.id_entrevistado = ent.id_entrevistado
LEFT JOIN formulario_embarcadores.entrevistadores entv ON (p.tipo_responsavel = 'entrevistador' AND p.id_responsavel = entv.id_entrevistador)
LEFT JOIN formulario_embarcadores.instituicoes inst ON entv.id_instituicao = inst.id_instituicao;

COMMENT ON VIEW formulario_embarcadores.v_pesquisas_completa IS 'View consolidada com todas as informações de pesquisas, empresas, entrevistados e entrevistadores';

-- 5.2. View de KPIs Gerais
CREATE VIEW formulario_embarcadores.v_kpis_gerais AS
SELECT 
    COUNT(DISTINCT p.id_empresa) AS total_empresas,
    COUNT(p.id_pesquisa) AS total_pesquisas,
    COUNT(DISTINCT p.id_entrevistado) AS total_entrevistados,
    COUNT(DISTINCT CASE WHEN p.tipo_responsavel = 'entrevistador' THEN p.id_responsavel END) AS total_entrevistadores_ativos,
    
    SUM(CASE WHEN p.unidade_peso = 'kg' THEN p.peso_carga/1000 ELSE p.peso_carga END) AS volume_total_toneladas,
    SUM(p.valor_carga) AS valor_total_movimentado,
    AVG(p.distancia) AS distancia_media_km,
    
    COUNT(*) FILTER (WHERE array_length(p.modos, 1) > 1) * 100.0 / NULLIF(COUNT(*), 0) AS taxa_multimodal_percentual,
    
    COUNT(*) FILTER (WHERE p.status = 'finalizada') AS pesquisas_finalizadas,
    COUNT(*) FILTER (WHERE p.status = 'validada') AS pesquisas_validadas,
    COUNT(*) FILTER (WHERE p.status = 'rascunho') AS pesquisas_rascunho
    
FROM formulario_embarcadores.pesquisas p;

COMMENT ON VIEW formulario_embarcadores.v_kpis_gerais IS 'KPIs principais do sistema';

-- 5.3. View de Distribuição Modal
CREATE VIEW formulario_embarcadores.v_distribuicao_modal AS
SELECT 
    unnest(modos) AS modalidade,
    COUNT(*) AS quantidade_pesquisas,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM formulario_embarcadores.pesquisas), 2) AS percentual,
    AVG(distancia) AS distancia_media_km,
    AVG(custo_transporte) AS custo_medio_reais,
    AVG(CASE WHEN unidade_peso = 'kg' THEN peso_carga/1000 ELSE peso_carga END) AS peso_medio_toneladas
FROM formulario_embarcadores.pesquisas
GROUP BY modalidade
ORDER BY quantidade_pesquisas DESC;

COMMENT ON VIEW formulario_embarcadores.v_distribuicao_modal IS 'Distribuição e estatísticas por modalidade de transporte';

-- 5.4. View de Produtos Mais Transportados
CREATE VIEW formulario_embarcadores.v_produtos_ranking AS
SELECT 
    agrupamento_produto,
    COUNT(DISTINCT id_empresa) AS qtd_empresas,
    COUNT(*) AS qtd_pesquisas,
    SUM(CASE WHEN unidade_peso = 'kg' THEN peso_carga/1000 ELSE peso_carga END) AS volume_total_toneladas,
    AVG(distancia) AS distancia_media_km,
    AVG(custo_transporte) AS custo_medio_reais
FROM formulario_embarcadores.pesquisas
GROUP BY agrupamento_produto
ORDER BY qtd_empresas DESC, volume_total_toneladas DESC;

COMMENT ON VIEW formulario_embarcadores.v_produtos_ranking IS 'Ranking de produtos mais transportados';

-- 5.5. View de Produtos Detalhados (Q8)
CREATE VIEW formulario_embarcadores.v_produtos_detalhados AS
SELECT 
    pt.id_produto,
    pt.id_pesquisa,
    pt.id_empresa,
    e.nome_empresa,
    p.data_entrevista,
    pt.carga,
    pt.movimentacao AS movimentacao_ton_ano,
    pt.origem,
    pt.destino,
    pt.distancia AS distancia_km,
    pt.modalidade,
    pt.acondicionamento,
    pt.ordem
FROM formulario_embarcadores.produtos_transportados pt
INNER JOIN formulario_embarcadores.empresas e ON pt.id_empresa = e.id_empresa
INNER JOIN formulario_embarcadores.pesquisas p ON pt.id_pesquisa = p.id_pesquisa
ORDER BY pt.id_empresa, p.data_entrevista DESC, pt.ordem;

COMMENT ON VIEW formulario_embarcadores.v_produtos_detalhados IS 'Detalhamento dos produtos transportados (Questão 8)';

-- =====================================================
-- 6. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para calcular tempo total em minutos
CREATE OR REPLACE FUNCTION formulario_embarcadores.calcular_tempo_minutos(dias INT, horas INT, minutos INT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (dias * 24 * 60) + (horas * 60) + minutos;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION formulario_embarcadores.calcular_tempo_minutos IS 'Converte tempo (dias, horas, minutos) para total em minutos';

-- Função para converter peso em toneladas
CREATE OR REPLACE FUNCTION formulario_embarcadores.converter_para_toneladas(peso NUMERIC, unidade VARCHAR)
RETURNS NUMERIC AS $$
BEGIN
    IF unidade = 'kg' THEN
        RETURN peso / 1000;
    ELSE
        RETURN peso;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION formulario_embarcadores.converter_para_toneladas IS 'Converte peso para toneladas independente da unidade original';

-- =====================================================
-- 7. GRANTS (PERMISSÕES) - AJUSTAR CONFORME NECESSÁRIO
-- =====================================================

-- Exemplo: Conceder permissões para um usuário específico
-- GRANT USAGE ON SCHEMA formulario_embarcadores TO usuario_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA formulario_embarcadores TO usuario_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA formulario_embarcadores TO usuario_app;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Para verificar todas as tabelas criadas:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'formulario_embarcadores' ORDER BY table_name;

-- Para verificar todas as views criadas:
-- SELECT table_name FROM information_schema.views WHERE table_schema = 'formulario_embarcadores' ORDER BY table_name;
