-- =====================================================
-- PAÍSES - Principais parceiros comerciais do Brasil
-- Baseado em dados reais de exportação/importação (2019-2024)
-- Relevância: quanto maior o número, mais importante para o Brasil
-- Fonte: MDIC, Wikipédia Economia do Brasil
-- =====================================================

DELETE FROM formulario_embarcadores.paises;

INSERT INTO formulario_embarcadores.paises (nome_pais, codigo_iso2, relevancia) VALUES
-- Brasil
('Brasil', 'BR', 100),

-- TOP 10 Parceiros Comerciais (dados MDIC 2019)
('China', 'CN', 98),              -- US$ 63,4 bi - MAIOR parceiro comercial
('Estados Unidos', 'US', 95),     -- US$ 29,7 bi
('Holanda', 'NL', 85),            -- US$ 10,1 bi - Principal porta Europa
('Argentina', 'AR', 92),          -- US$ 9,8 bi - Maior parceiro Mercosul
('Japão', 'JP', 75),              -- US$ 5,4 bi
('Chile', 'CL', 73),              -- US$ 5,2 bi
('México', 'MX', 70),             -- US$ 4,9 bi
('Alemanha', 'DE', 80),           -- US$ 4,7 bi
('Espanha', 'ES', 68),            -- US$ 4,0 bi
('Coreia do Sul', 'KR', 72),     -- US$ 3,4 bi

-- Outros parceiros América do Sul (Mercosul e vizinhos)
('Paraguai', 'PY', 88),          -- Mercosul + Itaipu
('Uruguai', 'UY', 82),           -- Mercosul
('Bolívia', 'BO', 70),           -- Gás natural
('Peru', 'PE', 65),
('Colômbia', 'CO', 63),
('Venezuela', 'VE', 55),         -- Reduzido por crise
('Equador', 'EC', 52),
('Guiana', 'GY', 45),
('Suriname', 'SR', 45),
('Guiana Francesa', 'GF', 45),

-- América do Norte
('Canadá', 'CA', 67),

-- Europa - Principais parceiros
('Itália', 'IT', 72),
('França', 'FR', 70),
('Portugal', 'PT', 68),
('Reino Unido', 'GB', 67),
('Bélgica', 'BE', 63),
('Suíça', 'CH', 58),
('Rússia', 'RU', 60),           -- Fertilizantes
('Polônia', 'PL', 48),
('Suécia', 'SE', 48),

-- Ásia - Principais parceiros
('Índia', 'IN', 68),             -- Mercado crescente
('Singapura', 'SG', 63),         -- Hub asiático
('Taiwan', 'TW', 62),            -- Eletrônicos
('Tailândia', 'TH', 58),
('Emirados Árabes Unidos', 'AE', 60),
('Indonésia', 'ID', 55),
('Malásia', 'MY', 55),
('Vietnã', 'VN', 55),
('Hong Kong', 'HK', 58),         -- Hub financeiro
('Arábia Saudita', 'SA', 52),

-- América Central e Caribe
('Panamá', 'PA', 63),            -- Canal do Panamá
('Costa Rica', 'CR', 52),
('Cuba', 'CU', 48),
('República Dominicana', 'DO', 48),

-- África
('África do Sul', 'ZA', 63),     -- BRICS
('Angola', 'AO', 58),            -- Petróleo
('Nigéria', 'NG', 52),
('Egito', 'EG', 50),
('Marrocos', 'MA', 48),

-- Oceania
('Austrália', 'AU', 63),         -- Minérios
('Nova Zelândia', 'NZ', 52),

-- Europa Oriental
('Turquia', 'TR', 55),
('Ucrânia', 'UA', 48),

-- Outros relevantes
('Israel', 'IL', 55),            -- Tecnologia
('Noruega', 'NO', 50),
('Irlanda', 'IE', 48),
('Dinamarca', 'DK', 48),
('Finlândia', 'FI', 48),
('Áustria', 'AT', 48),

-- Opção genérica
('Outro país', 'XX', 0);

-- Verificar total inserido
SELECT COUNT(*) as total_paises FROM formulario_embarcadores.paises;
SELECT '=== TOP 15 PAÍSES POR RELEVÂNCIA ===' as titulo;
SELECT nome_pais, codigo_iso2, relevancia,
    CASE 
        WHEN relevancia = 100 THEN '🇧🇷 País de origem'
        WHEN relevancia >= 90 THEN '⭐⭐⭐ Parceiro estratégico'
        WHEN relevancia >= 70 THEN '⭐⭐ Parceiro importante'
        WHEN relevancia >= 50 THEN '⭐ Parceiro relevante'
        ELSE 'Comércio menor'
    END as classificacao
FROM formulario_embarcadores.paises 
WHERE relevancia > 0
ORDER BY relevancia DESC, nome_pais
LIMIT 15;
