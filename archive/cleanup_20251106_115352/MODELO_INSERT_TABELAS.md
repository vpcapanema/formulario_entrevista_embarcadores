# 📊 MODELO DE DADOS - INSERT NAS TABELAS

Documentação completa para inserção de dados no schema `formulario_embarcadores`.

---

## 📍 ORDEM DE INSERÇÃO

```
1. EMPRESAS (tabela pai)
   ↓
2. ENTREVISTADOS (independente)
   ↓
3. PESQUISAS (tabela filha - depende de empresas e entrevistados)
   ↓
4. PRODUTOS_TRANSPORTADOS (opcional - depende de pesquisas)
```

---

## 🏢 TABELA 1: `empresas`

### 📝 Estrutura da Tabela

```sql
CREATE TABLE formulario_embarcadores.empresas (
    id_empresa SERIAL PRIMARY KEY,
    cnpj VARCHAR(14) UNIQUE,           -- Opcional, mas se informado deve ser único
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    telefone VARCHAR(20),
    email VARCHAR(255),
    id_municipio INTEGER,              -- FK para dados_brasil.municipios (código IBGE 7 dígitos)
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cep VARCHAR(8),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🔑 Campos Obrigatórios
- `razao_social` ✅

### 📤 Modelo INSERT

```sql
INSERT INTO formulario_embarcadores.empresas (
    cnpj,
    razao_social,
    nome_fantasia,
    telefone,
    email,
    id_municipio,
    logradouro,
    numero,
    complemento,
    bairro,
    cep
) VALUES (
    '12345678000190',              -- CNPJ (14 dígitos sem formatação)
    'Transportadora ABC Ltda',     -- Razão Social
    'ABC Transportes',             -- Nome Fantasia
    '11999887766',                 -- Telefone
    'contato@abc.com.br',          -- Email
    3550308,                       -- ID Município (código IBGE - São Paulo/SP)
    'Rua das Flores',              -- Logradouro
    '123',                         -- Número
    'Sala 45',                     -- Complemento
    'Centro',                      -- Bairro
    '01234567'                     -- CEP (8 dígitos)
)
RETURNING id_empresa;
```

### 📋 Exemplo JSON (Frontend → Backend)

```json
{
  "cnpj": "12345678000190",
  "razaoSocial": "Transportadora ABC Ltda",
  "nomeFantasia": "ABC Transportes",
  "telefone": "11999887766",
  "email": "contato@abc.com.br",
  "municipio": "3550308",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Sala 45",
  "bairro": "Centro",
  "cep": "01234567"
}
```

### ⚙️ Regras de Negócio

1. **UPSERT por CNPJ**: Se CNPJ já existe → UPDATE, senão → INSERT
2. **Sem CNPJ**: Permitido inserir empresas sem CNPJ (micro empreendedores)
3. **Município**: Código IBGE de 7 dígitos (STRING convertido para INTEGER)

---

## 👤 TABELA 2: `entrevistados`

### 📝 Estrutura da Tabela

```sql
CREATE TABLE formulario_embarcadores.entrevistados (
    id_entrevistado SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    telefone_entrevistado VARCHAR(20),
    email_entrevistado VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 🔑 Campos Obrigatórios
- `nome` ✅

### 📤 Modelo INSERT

```sql
INSERT INTO formulario_embarcadores.entrevistados (
    nome,
    cargo,
    telefone_entrevistado,
    email_entrevistado
) VALUES (
    'João da Silva',               -- Nome do entrevistado
    'Gerente de Logística',        -- Cargo
    '11988776655',                 -- Telefone
    'joao.silva@abc.com.br'        -- Email
)
RETURNING id_entrevistado;
```

### 📋 Exemplo JSON (Frontend → Backend)

```json
{
  "nomeEntrevistado": "João da Silva",
  "cargoEntrevistado": "Gerente de Logística",
  "telefoneEntrevistado": "11988776655",
  "emailEntrevistado": "joao.silva@abc.com.br"
}
```

### ⚙️ Regras de Negócio

1. **Sempre INSERT**: Não há UPSERT (cada entrevista = novo registro)
2. **Nome obrigatório**: Outros campos opcionais
3. **Sem validação de duplicados**: Mesmo nome pode ter múltiplos registros

---

## 📋 TABELA 3: `pesquisas`

### 📝 Estrutura da Tabela

```sql
CREATE TABLE formulario_embarcadores.pesquisas (
    id_pesquisa SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL REFERENCES formulario_embarcadores.empresas(id_empresa),
    id_entrevistado INTEGER NOT NULL REFERENCES formulario_embarcadores.entrevistados(id_entrevistado),
    id_responsavel INTEGER NOT NULL,       -- Q0: id_entrevistador OU id_entrevistado (quem preenche)
    data_entrevista DATE DEFAULT CURRENT_DATE,
    horario_entrevista TIME DEFAULT CURRENT_TIME,
    
    -- Q5: Tipo de empresa
    tipo_empresa VARCHAR(100),
    
    -- Q14: Consentimento
    consentimento BOOLEAN DEFAULT FALSE,
    
    -- Q15: Transporta carga?
    transporta_carga BOOLEAN DEFAULT FALSE,
    
    -- Q12: Origem (CÓDIGOS IBGE)
    origem_pais VARCHAR(100),
    origem_estado VARCHAR(2),              -- Código UF (ex: '35' = São Paulo)
    origem_municipio VARCHAR(7),           -- Código IBGE (ex: '3550308' = São Paulo/SP)
    origem_instalacao VARCHAR(255),
    
    -- Q13: Destino (CÓDIGOS IBGE)
    destino_pais VARCHAR(100),
    destino_estado VARCHAR(2),             -- Código UF (ex: '52' = Goiás)
    destino_municipio VARCHAR(7),          -- Código IBGE (ex: '5208707' = Goiânia/GO)
    destino_instalacao VARCHAR(255),
    
    -- Q14-Q16: Produto/Volume
    distancia_km DECIMAL(10,2),
    volume_anual_toneladas DECIMAL(15,2),
    tipo_produto VARCHAR(100),
    classe_produto VARCHAR(100),
    produtos_especificos TEXT,
    
    -- Q17-Q21: Modal
    modal_predominante VARCHAR(50),
    modal_secundario VARCHAR(50),
    modal_terciario VARCHAR(50),
    proprio_terceirizado VARCHAR(50),
    qtd_caminhoes_proprios INTEGER,
    qtd_caminhoes_terceirizados INTEGER,
    
    -- Q22-Q26: Frequência/Custo
    frequencia_envio VARCHAR(50),
    tempo_transporte VARCHAR(100),
    custo_medio_tonelada DECIMAL(15,2),
    pedagio_custo DECIMAL(15,2),
    frete_custo DECIMAL(15,2),
    manutencao_custo DECIMAL(15,2),
    outros_custos DECIMAL(15,2),
    
    -- Q27-Q29: Desafios/Sustentabilidade
    principais_desafios TEXT,
    investimento_sustentavel TEXT,
    reducao_emissoes TEXT,
    
    -- Q30-Q34: Tecnologia
    tecnologias_interesse TEXT,
    uso_tecnologia TEXT,
    grau_automacao VARCHAR(50),
    rastreamento_carga VARCHAR(50),
    uso_dados TEXT,
    
    -- Q35-Q37: Hidrovias
    conhecimento_hidrovias VARCHAR(50),
    viabilidade_hidrovia TEXT,
    pontos_melhoria TEXT,
    
    -- Q38: Observações
    observacoes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 🔑 Campos Obrigatórios
- `id_empresa` ✅
- `id_entrevistado` ✅
- `id_responsavel` ✅ (quem preencheu: entrevistador ou entrevistado)

### 📤 Modelo INSERT

```sql
INSERT INTO formulario_embarcadores.pesquisas (
    id_empresa,
    id_entrevistado,
    id_responsavel,
    data_entrevista,
    horario_entrevista,
    tipo_empresa,
    consentimento,
    transporta_carga,
    origem_pais,
    origem_estado,
    origem_municipio,
    origem_instalacao,
    destino_pais,
    destino_estado,
    destino_municipio,
    destino_instalacao,
    distancia_km,
    volume_anual_toneladas,
    tipo_produto,
    classe_produto,
    produtos_especificos,
    modal_predominante,
    modal_secundario,
    modal_terciario,
    proprio_terceirizado,
    qtd_caminhoes_proprios,
    qtd_caminhoes_terceirizados,
    frequencia_envio,
    tempo_transporte,
    custo_medio_tonelada,
    pedagio_custo,
    frete_custo,
    manutencao_custo,
    outros_custos,
    principais_desafios,
    investimento_sustentavel,
    reducao_emissoes,
    tecnologias_interesse,
    uso_tecnologia,
    grau_automacao,
    rastreamento_carga,
    uso_dados,
    conhecimento_hidrovias,
    viabilidade_hidrovia,
    pontos_melhoria,
    observacoes
) VALUES (
    1,                              -- id_empresa (retornado do INSERT anterior)
    1,                              -- id_entrevistado (retornado do INSERT anterior)
    5,                              -- id_responsavel (id_entrevistador OU id_entrevistado - quem preencheu)
    '2025-11-05',                   -- data_entrevista
    '14:30:00',                     -- horario_entrevista
    'Embarcador',                   -- tipo_empresa (Q5)
    TRUE,                           -- consentimento
    TRUE,                           -- transporta_carga
    'Brasil',                       -- origem_pais
    '35',                           -- origem_estado (SÃO PAULO - CÓDIGO UF)
    '3550308',                      -- origem_municipio (SÃO PAULO/SP - CÓDIGO IBGE)
    'Terminal ABC',                 -- origem_instalacao
    'Brasil',                       -- destino_pais
    '52',                           -- destino_estado (GOIÁS - CÓDIGO UF)
    '5208707',                      -- destino_municipio (GOIÂNIA/GO - CÓDIGO IBGE)
    'Centro de Distribuição XYZ',   -- destino_instalacao
    850.50,                         -- distancia_km
    12000.00,                       -- volume_anual_toneladas
    'Grãos',                        -- tipo_produto
    'Granel Sólido',                -- classe_produto
    'Soja, Milho, Trigo',           -- produtos_especificos
    'Rodoviário',                   -- modal_predominante
    'Ferroviário',                  -- modal_secundario
    NULL,                           -- modal_terciario
    'Terceirizado',                 -- proprio_terceirizado
    0,                              -- qtd_caminhoes_proprios
    15,                             -- qtd_caminhoes_terceirizados
    'Semanal',                      -- frequencia_envio
    '2 dias',                       -- tempo_transporte
    85.50,                          -- custo_medio_tonelada
    15.00,                          -- pedagio_custo
    50.00,                          -- frete_custo
    10.50,                          -- manutencao_custo
    10.00,                          -- outros_custos
    'Estradas ruins, pedágios caros', -- principais_desafios
    'Sim, reduzir emissões',        -- investimento_sustentavel
    'Interesse em biocombustíveis', -- reducao_emissoes
    'Rastreamento, IoT',            -- tecnologias_interesse
    'Sistema de gestão de frota',   -- uso_tecnologia
    'Médio',                        -- grau_automacao
    'Sim, GPS e telemetria',        -- rastreamento_carga
    'Análise de rotas e custos',    -- uso_dados
    'Alto',                         -- conhecimento_hidrovias
    'Muito viável, reduziria custos', -- viabilidade_hidrovia
    'Infraestrutura portuária',     -- pontos_melhoria
    'Empresa interessada em mudanças' -- observacoes
)
RETURNING id_pesquisa;
```

### 📋 Exemplo JSON COMPLETO (Frontend → Backend)

```json
{
  "cnpj": "12345678000190",
  "razaoSocial": "Transportadora ABC Ltda",
  "nomeFantasia": "ABC Transportes",
  "telefone": "11999887766",
  "email": "contato@abc.com.br",
  "municipio": "3550308",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Sala 45",
  "bairro": "Centro",
  "cep": "01234567",
  
  "nomeEntrevistado": "João da Silva",
  "cargoEntrevistado": "Gerente de Logística",
  "telefoneEntrevistado": "11988776655",
  "emailEntrevistado": "joao.silva@abc.com.br",
  
  "entrevistador": 1,
  "dataEntrevista": "2025-11-05",
  "horarioEntrevista": "14:30:00",
  "instituicao": 1,
  "consentimento": "sim",
  "transportaCarga": "sim",
  
  "origemPais": "Brasil",
  "origemEstado": "35",
  "origemMunicipio": "3550308",
  "origemInstalacao": "Terminal ABC",
  
  "destinoPais": "Brasil",
  "destinoEstado": "52",
  "destinoMunicipio": "5208707",
  "destinoInstalacao": "Centro de Distribuição XYZ",
  
  "distanciaKm": "850.50",
  "volumeAnual": "12000.00",
  "tipoProduto": "Grãos",
  "classeProduto": "Granel Sólido",
  "produtosEspecificos": "Soja, Milho, Trigo",
  
  "modalPredominante": "Rodoviário",
  "modalSecundario": "Ferroviário",
  "modalTerciario": null,
  "proprioTerceirizado": "Terceirizado",
  "qtdCaminhoesProprios": "0",
  "qtdCaminhoesTerceirizados": "15",
  
  "frequenciaEnvio": "Semanal",
  "tempoTransporte": "2 dias",
  "custoMedioTonelada": "85.50",
  "pedagioCusto": "15.00",
  "freteCusto": "50.00",
  "manutencaoCusto": "10.50",
  "outrosCustos": "10.00",
  
  "principaisDesafios": "Estradas ruins, pedágios caros",
  "investimentoSustentavel": "Sim, reduzir emissões",
  "reducaoEmissoes": "Interesse em biocombustíveis",
  
  "tecnologiasInteresse": "Rastreamento, IoT",
  "usoTecnologia": "Sistema de gestão de frota",
  "grauAutomacao": "Médio",
  "rastreamentoCarga": "Sim, GPS e telemetria",
  "usoDados": "Análise de rotas e custos",
  
  "conhecimentoHidrovias": "Alto",
  "viabilidadeHidrovia": "Muito viável, reduziria custos",
  "pontosMelhoria": "Infraestrutura portuária",
  
  "observacoes": "Empresa interessada em mudanças"
}
```

### ⚙️ Regras de Negócio

1. **Dependência**: Precisa de `id_empresa` e `id_entrevistado` válidos
2. **Estados/Municípios**: SEMPRE usar códigos IBGE (STRING)
   - `origem_estado`: Código UF 2 dígitos (ex: '35')
   - `origem_municipio`: Código IBGE 7 dígitos (ex: '3550308')
3. **Valores numéricos**: Converter STRING → NUMBER no backend
   - `distanciaKm`: parseFloat()
   - `volumeAnual`: parseFloat()
   - `qtdCaminhoes`: parseInt()
4. **Booleanos**: Aceitar 'sim'/true, 'não'/false

---

## 🔗 TABELA 4 (OPCIONAL): `produtos_transportados`

### 📝 Estrutura da Tabela

```sql
CREATE TABLE formulario_embarcadores.produtos_transportados (
    id_produto_transportado SERIAL PRIMARY KEY,
    id_pesquisa INTEGER NOT NULL REFERENCES formulario_embarcadores.pesquisas(id_pesquisa) ON DELETE CASCADE,
    produto VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 📤 Modelo INSERT

```sql
INSERT INTO formulario_embarcadores.produtos_transportados (
    id_pesquisa,
    produto
) VALUES 
    (1, 'Soja'),
    (1, 'Milho'),
    (1, 'Trigo');
```

### 📋 Exemplo JSON (Array)

```json
{
  "produtos_transportados": [
    "Soja",
    "Milho",
    "Trigo"
  ]
}
```

---

## 🔄 FLUXO COMPLETO DE TRANSAÇÃO

```javascript
const client = await pool.connect();

try {
    await client.query('BEGIN');
    
    // 1. INSERIR/ATUALIZAR EMPRESA
    const resultEmpresa = await client.query(`
        INSERT INTO formulario_embarcadores.empresas (...)
        VALUES (...)
        RETURNING id_empresa
    `);
    const id_empresa = resultEmpresa.rows[0].id_empresa;
    
    // 2. INSERIR ENTREVISTADO
    const resultEntrevistado = await client.query(`
        INSERT INTO formulario_embarcadores.entrevistados (...)
        VALUES (...)
        RETURNING id_entrevistado
    `);
    const id_entrevistado = resultEntrevistado.rows[0].id_entrevistado;
    
    // 3. INSERIR PESQUISA (com id_empresa e id_entrevistado)
    const resultPesquisa = await client.query(`
        INSERT INTO formulario_embarcadores.pesquisas (...)
        VALUES ($1, $2, ...)
        RETURNING id_pesquisa
    `, [id_empresa, id_entrevistado, ...]);
    const id_pesquisa = resultPesquisa.rows[0].id_pesquisa;
    
    // 4. INSERIR PRODUTOS (opcional)
    if (dados.produtos_transportados) {
        for (const produto of dados.produtos_transportados) {
            await client.query(`
                INSERT INTO formulario_embarcadores.produtos_transportados (...)
                VALUES ($1, $2)
            `, [id_pesquisa, produto]);
        }
    }
    
    await client.query('COMMIT');
    
    return { success: true, id_pesquisa };
    
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    client.release();
}
```

---

## 📊 CÓDIGOS IBGE - REFERÊNCIA RÁPIDA

### Estados (UF)

| Código | Estado        | Sigla |
|--------|---------------|-------|
| 11     | Rondônia      | RO    |
| 12     | Acre          | AC    |
| 13     | Amazonas      | AM    |
| 14     | Roraima       | RR    |
| 15     | Pará          | PA    |
| 16     | Amapá         | AP    |
| 17     | Tocantins     | TO    |
| 21     | Maranhão      | MA    |
| 22     | Piauí         | PI    |
| 23     | Ceará         | CE    |
| 24     | Rio Grande do Norte | RN |
| 25     | Paraíba       | PB    |
| 26     | Pernambuco    | PE    |
| 27     | Alagoas       | AL    |
| 28     | Sergipe       | SE    |
| 29     | Bahia         | BA    |
| 31     | Minas Gerais  | MG    |
| 32     | Espírito Santo| ES    |
| 33     | Rio de Janeiro| RJ    |
| 35     | São Paulo     | SP    |
| 41     | Paraná        | PR    |
| 42     | Santa Catarina| SC    |
| 43     | Rio Grande do Sul | RS |
| 50     | Mato Grosso do Sul | MS |
| 51     | Mato Grosso   | MT    |
| 52     | Goiás         | GO    |
| 53     | Distrito Federal | DF |

### Municípios (Exemplos)

| Código  | Município      | UF | Código UF |
|---------|----------------|----|----|
| 3550308 | São Paulo      | SP | 35 |
| 3304557 | Rio de Janeiro | RJ | 33 |
| 3106200 | Belo Horizonte | MG | 31 |
| 5208707 | Goiânia        | GO | 52 |
| 4106902 | Curitiba       | PR | 41 |
| 2927408 | Salvador       | BA | 29 |

---

## 🔍 QUERY PARA VISUALIZAÇÃO COM NOMES

```sql
SELECT 
    p.id_pesquisa,
    e.razao_social AS empresa,
    ent.nome AS entrevistado,
    
    -- Origem com nomes
    p.origem_pais,
    vo."Nome da Unidade Federativa" AS origem_estado_nome,
    vo."Nome do Município" AS origem_municipio_nome,
    p.origem_instalacao,
    
    -- Destino com nomes
    p.destino_pais,
    vd."Nome da Unidade Federativa" AS destino_estado_nome,
    vd."Nome do Município" AS destino_municipio_nome,
    p.destino_instalacao,
    
    -- Dados logísticos
    p.distancia_km,
    p.volume_anual_toneladas,
    p.tipo_produto,
    p.modal_predominante,
    p.conhecimento_hidrovias,
    p.viabilidade_hidrovia
    
FROM formulario_embarcadores.pesquisas p
INNER JOIN formulario_embarcadores.empresas e 
    ON p.id_empresa = e.id_empresa
INNER JOIN formulario_embarcadores.entrevistados ent 
    ON p.id_entrevistado = ent.id_entrevistado
LEFT JOIN dados_brasil.vw_dim_municipio_alias vo 
    ON p.origem_municipio = vo."Código do Município"::text
LEFT JOIN dados_brasil.vw_dim_municipio_alias vd 
    ON p.destino_municipio = vd."Código do Município"::text
ORDER BY p.created_at DESC;
```

---

## ✅ VALIDAÇÕES IMPORTANTES

### Frontend (JavaScript)

```javascript
// Validar CNPJ
function validarCNPJ(cnpj) {
    return /^\d{14}$/.test(cnpj.replace(/\D/g, ''));
}

// Validar CEP
function validarCEP(cep) {
    return /^\d{8}$/.test(cep.replace(/\D/g, ''));
}

// Validar Email
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Converter para número
function converterNumero(valor) {
    return parseFloat(valor.replace(',', '.')) || null;
}
```

### Backend (Node.js)

```javascript
// Limpar CNPJ
const cnpjLimpo = dados.cnpj ? dados.cnpj.replace(/\D/g, '') : null;

// Converter booleano
const consentimento = dados.consentimento === 'sim' || dados.consentimento === true;

// Converter números
const distanciaKm = dados.distanciaKm ? parseFloat(dados.distanciaKm) : null;
const qtdCaminhoes = dados.qtdCaminhoesProprios ? parseInt(dados.qtdCaminhoesProprios) : null;

// Validar código IBGE
const codigoUF = dados.origemEstado && /^\d{2}$/.test(dados.origemEstado) 
    ? dados.origemEstado 
    : null;
    
const codigoMunicipio = dados.origemMunicipio && /^\d{7}$/.test(dados.origemMunicipio)
    ? dados.origemMunicipio 
    : null;
```

---

## 📝 OBSERVAÇÕES FINAIS

1. **Códigos IBGE são STRING**: Mesmo sendo números, armazenar como VARCHAR para preservar zeros à esquerda
2. **UPSERT em empresas**: Verificar CNPJ antes de inserir para evitar duplicatas
3. **Transação obrigatória**: Usar BEGIN/COMMIT para garantir integridade
4. **NULL values**: Aceitar campos opcionais como NULL (não enviar string vazia)
5. **Timezone**: PostgreSQL usa timezone configurado (verificar UTC/America/Sao_Paulo)

---

## 🚀 ENDPOINT BACKEND

```
POST /api/submit-form
Content-Type: application/json

Body: {JSON completo com todos os campos}

Response: {
    "success": true,
    "id_pesquisa": 123,
    "id_empresa": 45,
    "id_entrevistado": 67
}
```

---

📅 **Última atualização**: 05/11/2025  
🔗 **View oficial**: `dados_brasil.vw_dim_municipio_alias`  
🏗️ **Schema**: `formulario_embarcadores`
