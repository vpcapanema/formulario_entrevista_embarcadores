-- =====================================================
-- PAÍSES - Principais países para logística internacional
-- Foco: América do Sul + principais parceiros comerciais do Brasil
-- Relevância: quanto maior o número, mais importante para o Brasil
-- =====================================================

DELETE FROM formulario_embarcadores.paises;

INSERT INTO formulario_embarcadores.paises (nome_pais, codigo_iso2, relevancia) VALUES
-- Brasil e vizinhos (América do Sul) - Alta relevância
('Brasil', 'BR', 100),
('Argentina', 'AR', 95),
('Paraguai', 'PY', 90),
('Uruguai', 'UY', 85),
('Chile', 'CL', 80),
('Bolívia', 'BO', 75),
('Peru', 'PE', 70),
('Colômbia', 'CO', 65),
('Venezuela', 'VE', 60),
('Equador', 'EC', 55),
('Guiana', 'GY', 50),
('Suriname', 'SR', 50),
('Guiana Francesa', 'GF', 50),

-- América do Norte - Alta relevância comercial
('Estados Unidos', 'US', 98),
('China', 'CN', 97),
('México', 'MX', 75),
('Canadá', 'CA', 70),

-- Europa - Principais parceiros
('Alemanha', 'DE', 85),
('Holanda', 'NL', 80),
('Itália', 'IT', 75),
('França', 'FR', 75),
('Espanha', 'ES', 70),
('Portugal', 'PT', 70),
('Reino Unido', 'GB', 70),
('Bélgica', 'BE', 65),
('Suíça', 'CH', 60),
('Rússia', 'RU', 60),

-- Ásia - Principais parceiros
('Japão', 'JP', 80),
('Coreia do Sul', 'KR', 75),
('Índia', 'IN', 70),
('Singapura', 'SG', 65),
('Tailândia', 'TH', 60),
('Emirados Árabes Unidos', 'AE', 60),
('Indonésia', 'ID', 55),
('Malásia', 'MY', 55),
('Vietnã', 'VN', 55),

-- América Central e Caribe
('Panamá', 'PA', 65),
('Costa Rica', 'CR', 55),
('Cuba', 'CU', 50),

-- África
('África do Sul', 'ZA', 65),
('Angola', 'AO', 60),
('Nigéria', 'NG', 55),

-- Oceania
('Austrália', 'AU', 65),
('Nova Zelândia', 'NZ', 55),

-- Outros
('Outro país', 'XX', 0);

-- Verificar total inserido
SELECT COUNT(*) as total_paises FROM formulario_embarcadores.paises;
SELECT 'Top 10 países por relevância' as descricao;
SELECT nome_pais, codigo_iso2, relevancia 
FROM formulario_embarcadores.paises 
WHERE relevancia > 0
ORDER BY relevancia DESC 
LIMIT 10;
