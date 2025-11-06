# 🔍 COMPARAÇÃO: ESTRUTURA DOCUMENTADA vs ESTRUTURA REAL DO BANCO

**Data:** 05/11/2025  
**Banco:** sigma_pli (RDS PostgreSQL AWS)  
**Schema:** formulario_embarcadores

---

## 📊 TABELA 1: `empresas`

### ❌ ESTRUTURA DOCUMENTADA (payload-manager.js)

```javascript
empresa: {
    cnpj: null,                    // Q6a - VARCHAR(14) - apenas números
    razao_social: null,            // Q6b - VARCHAR(255) - obrigatório
    nome_fantasia: null,           // Q6b - VARCHAR(255) (obtido da API)
    telefone: null,                // Q8  - VARCHAR(20) - apenas números
    email: null,                   // Q9  - VARCHAR(255) - validar formato
    id_municipio: null,            // Q7  - INTEGER - código IBGE 7 dígitos
    logradouro: null,              // Q10a - VARCHAR(255)
    numero: null,                  // Q10b - VARCHAR(20)
    complemento: null,             // Q10c - VARCHAR(100)
    bairro: null,                  // Q10d - VARCHAR(100)
    cep: null                      // Q11 - VARCHAR(8) - apenas números
}
```

**Total de campos documentados:** 11

---

### ✅ ESTRUTURA REAL DO BANCO (verificada)

```sql
CREATE TABLE formulario_embarcadores.empresas (
    id_empresa              INTEGER PRIMARY KEY,
    nome_empresa            VARCHAR(255) NOT NULL,    -- Nome da empresa
    tipo_empresa            VARCHAR(50) NOT NULL,     -- Tipo (Embarcador, Operador Logístico, etc)
    outro_tipo              VARCHAR(255) NULL,        -- Outro tipo (se não se encaixa)
    municipio               VARCHAR(255) NOT NULL,    -- NOME do município (não código)
    estado                  VARCHAR(100) NULL,        -- NOME do estado (não código)
    cnpj                    VARCHAR(18) NULL,         -- CNPJ COM formatação (XX.XXX.XXX/XXXX-XX)
    data_cadastro           TIMESTAMP WITH TIME ZONE,
    data_atualizacao        TIMESTAMP WITH TIME ZONE
);
```

**Total de campos reais:** 9

---

### 🔴 INCOMPATIBILIDADES CRÍTICAS

| Campo Documentado | Campo Real | Status | Impacto |
|---|---|---|---|
| `razao_social` | `nome_empresa` | ❌ **NOME DIFERENTE** | Alto - campo obrigatório |
| `nome_fantasia` | **NÃO EXISTE** | ❌ **AUSENTE** | Médio - dados da API CNPJ perdidos |
| `telefone` | **NÃO EXISTE** | ❌ **AUSENTE** | Alto - Q8 não pode ser salva |
| `email` | **NÃO EXISTE** | ❌ **AUSENTE** | Alto - Q9 não pode ser salva |
| `id_municipio` (INTEGER) | `municipio` (VARCHAR) | ❌ **TIPO DIFERENTE** | Alto - código vs nome |
| `logradouro` | **NÃO EXISTE** | ❌ **AUSENTE** | Alto - Q10a não pode ser salva |
| `numero` | **NÃO EXISTE** | ❌ **AUSENTE** | Alto - Q10b não pode ser salva |
| `complemento` | **NÃO EXISTE** | ❌ **AUSENTE** | Médio - Q10c não pode ser salva |
| `bairro` | **NÃO EXISTE** | ❌ **AUSENTE** | Médio - Q10d não pode ser salva |
| `cep` | **NÃO EXISTE** | ❌ **AUSENTE** | Alto - Q11 não pode ser salva |
| **NÃO DOCUMENTADO** | `tipo_empresa` | ❌ **AUSENTE NA DOC** | Alto - campo obrigatório |
| **NÃO DOCUMENTADO** | `outro_tipo` | ❌ **AUSENTE NA DOC** | Baixo - campo opcional |
| **NÃO DOCUMENTADO** | `estado` (VARCHAR) | ❌ **AUSENTE NA DOC** | Médio - armazena nome |

### 📋 CAMPOS QUE PRECISAM SER ADICIONADOS NO BANCO

```sql
ALTER TABLE formulario_embarcadores.empresas
ADD COLUMN razao_social VARCHAR(255),           -- ou renomear nome_empresa para razao_social
ADD COLUMN nome_fantasia VARCHAR(255),
ADD COLUMN telefone VARCHAR(20),
ADD COLUMN email VARCHAR(255),
ADD COLUMN id_municipio INTEGER,                -- código IBGE 7 dígitos
ADD COLUMN logradouro VARCHAR(255),
ADD COLUMN numero VARCHAR(20),
ADD COLUMN complemento VARCHAR(100),
ADD COLUMN bairro VARCHAR(100),
ADD COLUMN cep VARCHAR(8);                      -- apenas números
```

**Total de colunas a adicionar:** 10

---

## 📊 TABELA 2: `entrevistados`

### ❌ ESTRUTURA DOCUMENTADA (payload-manager.js)

```javascript
entrevistado: {
    nome: null,                    // Q1 - VARCHAR(255) - obrigatório
    cargo: null,                   // Q2 - VARCHAR(100)
    telefone_entrevistado: null,   // Q3 - VARCHAR(20) - apenas números
    email_entrevistado: null       // Q4 - VARCHAR(255) - validar formato
}
```

**Total de campos documentados:** 4

---

### ✅ ESTRUTURA REAL DO BANCO (verificada)

```sql
CREATE TABLE formulario_embarcadores.entrevistados (
    id_entrevistado         INTEGER PRIMARY KEY,
    id_empresa              INTEGER NOT NULL,         -- FK para empresas
    nome                    VARCHAR(255) NOT NULL,
    funcao                  VARCHAR(255) NOT NULL,    -- NOME DIFERENTE: 'funcao' vs 'cargo'
    telefone                VARCHAR(20) NOT NULL,     -- NOME DIFERENTE: 'telefone' vs 'telefone_entrevistado'
    email                   VARCHAR(255) NOT NULL,    -- NOME DIFERENTE: 'email' vs 'email_entrevistado'
    principal               BOOLEAN NULL,
    data_cadastro           TIMESTAMP WITH TIME ZONE,
    data_atualizacao        TIMESTAMP WITH TIME ZONE
);
```

**Total de campos reais:** 9

---

### 🟡 INCOMPATIBILIDADES PARCIAIS

| Campo Documentado | Campo Real | Status | Impacto |
|---|---|---|---|
| `cargo` | `funcao` | 🟡 **NOME DIFERENTE** | Médio - funciona mas nomes divergem |
| `telefone_entrevistado` | `telefone` | 🟡 **NOME DIFERENTE** | Médio - funciona mas nomes divergem |
| `email_entrevistado` | `email` | 🟡 **NOME DIFERENTE** | Médio - funciona mas nomes divergem |
| **NÃO DOCUMENTADO** | `id_empresa` | ❌ **AUSENTE NA DOC** | Alto - FK obrigatória |
| **NÃO DOCUMENTADO** | `principal` | ❌ **AUSENTE NA DOC** | Baixo - indica entrevistado principal |

### 📋 OPÇÕES DE CORREÇÃO

**Opção A: Renomear colunas no banco**
```sql
ALTER TABLE formulario_embarcadores.entrevistados
RENAME COLUMN funcao TO cargo;

ALTER TABLE formulario_embarcadores.entrevistados
RENAME COLUMN telefone TO telefone_entrevistado;

ALTER TABLE formulario_embarcadores.entrevistados
RENAME COLUMN email TO email_entrevistado;
```

**Opção B: Atualizar documentação (mais simples)**
- Mudar `cargo` → `funcao` no payload-manager.js
- Mudar `telefone_entrevistado` → `telefone` no payload-manager.js
- Mudar `email_entrevistado` → `email` no payload-manager.js
- Adicionar campo `id_empresa` na documentação

---

## 📊 TABELA 3: `pesquisas`

### ❌ ESTRUTURA DOCUMENTADA (payload-manager.js)

```javascript
pesquisa: {
    // Referências
    id_empresa: null,
    id_entrevistado: null,
    id_responsavel: null,          // Q0 - quem preencheu
    
    // Metadados
    data_entrevista: null,
    horario_entrevista: null,
    tipo_empresa: null,            // Q5
    
    // Filtros
    consentimento: false,          // Q14
    transporta_carga: false,       // Q15
    
    // Origem (Q12)
    origem_pais: null,
    origem_estado: null,           // Código UF (ex: '35')
    origem_municipio: null,        // Código IBGE (ex: '3550308')
    origem_instalacao: null,
    
    // Destino (Q13)
    destino_pais: null,
    destino_estado: null,
    destino_municipio: null,
    destino_instalacao: null,
    
    // Produto/Volume (Q16-Q18)
    distancia_km: null,
    volume_anual_toneladas: null,
    tipo_produto: null,
    classe_produto: null,
    produtos_especificos: null,
    
    // Modal (Q19-Q23)
    modal_predominante: null,
    modal_secundario: null,
    modal_terciario: null,
    proprio_terceirizado: null,
    qtd_caminhoes_proprios: null,
    qtd_caminhoes_terceirizados: null,
    
    // Frequência/Custo (Q24-Q28)
    frequencia_envio: null,
    tempo_transporte: null,
    custo_medio_tonelada: null,
    pedagio_custo: null,
    frete_custo: null,
    manutencao_custo: null,
    outros_custos: null,
    
    // Desafios/Sustentabilidade (Q29-Q31)
    principais_desafios: null,
    investimento_sustentavel: null,
    reducao_emissoes: null,
    
    // Tecnologia (Q32-Q36)
    tecnologias_interesse: null,
    uso_tecnologia: null,
    grau_automacao: null,
    rastreamento_carga: null,
    uso_dados: null,
    
    // Hidrovias (Q37-Q39)
    conhecimento_hidrovias: null,
    viabilidade_hidrovia: null,
    pontos_melhoria: null,
    
    // Observações (Q40)
    observacoes: null
}
```

**Total de campos documentados:** 50

---

### ✅ ESTRUTURA REAL DO BANCO (verificada)

```sql
CREATE TABLE formulario_embarcadores.pesquisas (
    id_pesquisa                   INTEGER PRIMARY KEY,
    id_empresa                    INTEGER NOT NULL,
    id_entrevistado               INTEGER NOT NULL,
    tipo_responsavel              VARCHAR(20) NOT NULL,    -- 'entrevistador' ou 'entrevistado'
    id_responsavel                INTEGER NOT NULL,
    data_entrevista               TIMESTAMP WITH TIME ZONE,
    data_atualizacao              TIMESTAMP WITH TIME ZONE,
    status                        VARCHAR(20),
    
    -- Produto
    produto_principal             VARCHAR(255) NOT NULL,   -- ❌ AUSENTE NA DOC
    agrupamento_produto           VARCHAR(100) NOT NULL,   -- ❌ AUSENTE NA DOC
    outro_produto                 VARCHAR(255),            -- ❌ AUSENTE NA DOC
    
    -- Transporte
    tipo_transporte               VARCHAR(50) NOT NULL,    -- ❌ AUSENTE NA DOC
    
    -- Origem
    origem_pais                   VARCHAR(100) NOT NULL,
    origem_estado                 VARCHAR(100) NOT NULL,   -- 🟡 VARCHAR vs código
    origem_municipio              VARCHAR(255) NOT NULL,   -- 🟡 VARCHAR vs código
    
    -- Destino
    destino_pais                  VARCHAR(100) NOT NULL,
    destino_estado                VARCHAR(100) NOT NULL,   -- 🟡 VARCHAR vs código
    destino_municipio             VARCHAR(255) NOT NULL,   -- 🟡 VARCHAR vs código
    
    -- Logística
    distancia                     NUMERIC NOT NULL,        -- 🟡 'distancia' vs 'distancia_km'
    tem_paradas                   VARCHAR(3) NOT NULL,     -- ❌ AUSENTE NA DOC
    num_paradas                   INTEGER,                 -- ❌ AUSENTE NA DOC
    modos                         ARRAY NOT NULL,          -- ❌ AUSENTE NA DOC (substitui modal_predominante/secundario/terciario)
    config_veiculo                VARCHAR(100),            -- ❌ AUSENTE NA DOC
    
    -- Carga
    peso_carga                    NUMERIC NOT NULL,        -- ❌ AUSENTE NA DOC
    unidade_peso                  VARCHAR(20) NOT NULL,    -- ❌ AUSENTE NA DOC
    custo_transporte              NUMERIC NOT NULL,        -- ❌ AUSENTE NA DOC
    valor_carga                   NUMERIC NOT NULL,        -- ❌ AUSENTE NA DOC
    tipo_embalagem                VARCHAR(100) NOT NULL,   -- ❌ AUSENTE NA DOC
    carga_perigosa                VARCHAR(3) NOT NULL,     -- ❌ AUSENTE NA DOC
    capacidade_utilizada          NUMERIC,                 -- ❌ AUSENTE NA DOC
    
    -- Tempo
    tempo_dias                    INTEGER NOT NULL,        -- ❌ AUSENTE NA DOC
    tempo_horas                   INTEGER NOT NULL,        -- ❌ AUSENTE NA DOC
    tempo_minutos                 INTEGER NOT NULL,        -- ❌ AUSENTE NA DOC
    
    -- Frequência
    frequencia                    VARCHAR(50) NOT NULL,    -- 🟡 'frequencia' vs 'frequencia_envio'
    frequencia_outra              VARCHAR(255),            -- ❌ AUSENTE NA DOC
    frequencia_diaria             NUMERIC,                 -- ❌ AUSENTE NA DOC
    
    -- Importâncias e Variações
    importancia_custo             VARCHAR(20) NOT NULL,    -- ❌ AUSENTE NA DOC
    variacao_custo                NUMERIC NOT NULL,        -- ❌ AUSENTE NA DOC
    importancia_tempo             VARCHAR(20) NOT NULL,    -- ❌ AUSENTE NA DOC
    variacao_tempo                NUMERIC NOT NULL,        -- ❌ AUSENTE NA DOC
    importancia_confiabilidade    VARCHAR(20) NOT NULL,    -- ❌ AUSENTE NA DOC
    variacao_confiabilidade       NUMERIC NOT NULL,        -- ❌ AUSENTE NA DOC
    importancia_seguranca         VARCHAR(20) NOT NULL,    -- ❌ AUSENTE NA DOC
    variacao_seguranca            NUMERIC NOT NULL,        -- ❌ AUSENTE NA DOC
    importancia_capacidade        VARCHAR(20) NOT NULL,    -- ❌ AUSENTE NA DOC
    variacao_capacidade           NUMERIC NOT NULL,        -- ❌ AUSENTE NA DOC
    
    -- Cadeia
    tipo_cadeia                   VARCHAR(50) NOT NULL,    -- ❌ AUSENTE NA DOC
    modais_alternativos           ARRAY,                   -- ❌ AUSENTE NA DOC
    
    -- Observações
    fator_adicional               TEXT,                    -- ❌ AUSENTE NA DOC
    dificuldades                  ARRAY,                   -- ❌ AUSENTE NA DOC
    detalhe_dificuldade           TEXT,                    -- ❌ AUSENTE NA DOC
    observacoes                   TEXT                     -- ✅ PRESENTE
);
```

**Total de campos reais:** 54

---

### 🔴 INCOMPATIBILIDADES MASSIVAS

| Categoria | Campos Documentados | Campos Reais | Incompatíveis | Taxa de Erro |
|---|---|---|---|---|
| **TOTAL** | 50 | 54 | 42 | **84%** |
| ✅ Compatíveis | - | - | 8 | 16% |
| 🟡 Nomes diferentes | - | - | 5 | 10% |
| ❌ Ausentes no banco | 35 | - | 35 | 70% |
| ❌ Ausentes na doc | - | 37 | 37 | 74% |

### 🔥 CAMPOS CRÍTICOS AUSENTES NA DOCUMENTAÇÃO

```javascript
// Campos que EXISTEM NO BANCO mas NÃO estão documentados:
produto_principal: null,           // OBRIGATÓRIO
agrupamento_produto: null,         // OBRIGATÓRIO
outro_produto: null,
tipo_transporte: null,             // OBRIGATÓRIO
tem_paradas: null,                 // OBRIGATÓRIO
num_paradas: null,
modos: [],                         // ARRAY - OBRIGATÓRIO
config_veiculo: null,
peso_carga: null,                  // OBRIGATÓRIO
unidade_peso: null,                // OBRIGATÓRIO
custo_transporte: null,            // OBRIGATÓRIO
valor_carga: null,                 // OBRIGATÓRIO
tipo_embalagem: null,              // OBRIGATÓRIO
carga_perigosa: null,              // OBRIGATÓRIO
capacidade_utilizada: null,
tempo_dias: null,                  // OBRIGATÓRIO
tempo_horas: null,                 // OBRIGATÓRIO
tempo_minutos: null,               // OBRIGATÓRIO
frequencia_outra: null,
frequencia_diaria: null,
importancia_custo: null,           // OBRIGATÓRIO
variacao_custo: null,              // OBRIGATÓRIO
importancia_tempo: null,           // OBRIGATÓRIO
variacao_tempo: null,              // OBRIGATÓRIO
importancia_confiabilidade: null,  // OBRIGATÓRIO
variacao_confiabilidade: null,     // OBRIGATÓRIO
importancia_seguranca: null,       // OBRIGATÓRIO
variacao_seguranca: null,          // OBRIGATÓRIO
importancia_capacidade: null,      // OBRIGATÓRIO
variacao_capacidade: null,         // OBRIGATÓRIO
tipo_cadeia: null,                 // OBRIGATÓRIO
modais_alternativos: [],           // ARRAY
fator_adicional: null,
dificuldades: [],                  // ARRAY
detalhe_dificuldade: null
```

### 🔥 CAMPOS DOCUMENTADOS MAS AUSENTES NO BANCO

```javascript
// Campos que estão DOCUMENTADOS mas NÃO existem no banco:
consentimento: false,              // ❌ NÃO EXISTE
transporta_carga: false,           // ❌ NÃO EXISTE
origem_instalacao: null,           // ❌ NÃO EXISTE
destino_instalacao: null,          // ❌ NÃO EXISTE
volume_anual_toneladas: null,      // ❌ NÃO EXISTE
tipo_produto: null,                // ❌ NÃO EXISTE (existe 'produto_principal')
classe_produto: null,              // ❌ NÃO EXISTE (existe 'agrupamento_produto')
produtos_especificos: null,        // ❌ NÃO EXISTE
modal_predominante: null,          // ❌ NÃO EXISTE (existe 'modos' ARRAY)
modal_secundario: null,            // ❌ NÃO EXISTE (existe 'modos' ARRAY)
modal_terciario: null,             // ❌ NÃO EXISTE (existe 'modos' ARRAY)
proprio_terceirizado: null,        // ❌ NÃO EXISTE
qtd_caminhoes_proprios: null,      // ❌ NÃO EXISTE
qtd_caminhoes_terceirizados: null, // ❌ NÃO EXISTE
tempo_transporte: null,            // ❌ NÃO EXISTE (existe tempo_dias/horas/minutos)
custo_medio_tonelada: null,        // ❌ NÃO EXISTE
pedagio_custo: null,               // ❌ NÃO EXISTE
frete_custo: null,                 // ❌ NÃO EXISTE
manutencao_custo: null,            // ❌ NÃO EXISTE
outros_custos: null,               // ❌ NÃO EXISTE
principais_desafios: null,         // ❌ NÃO EXISTE
investimento_sustentavel: null,    // ❌ NÃO EXISTE
reducao_emissoes: null,            // ❌ NÃO EXISTE
tecnologias_interesse: null,       // ❌ NÃO EXISTE
uso_tecnologia: null,              // ❌ NÃO EXISTE
grau_automacao: null,              // ❌ NÃO EXISTE
rastreamento_carga: null,          // ❌ NÃO EXISTE
uso_dados: null,                   // ❌ NÃO EXISTE
conhecimento_hidrovias: null,      // ❌ NÃO EXISTE
viabilidade_hidrovia: null,        // ❌ NÃO EXISTE
pontos_melhoria: null              // ❌ NÃO EXISTE
```

---

## 📊 RESUMO EXECUTIVO

### 🔴 SITUAÇÃO CRÍTICA

| Tabela | Compatibilidade | Ação Necessária |
|---|---|---|
| **empresas** | **10%** (1/11 campos) | 🔥 CRÍTICA - Adicionar 10 colunas |
| **entrevistados** | **75%** (3/4 campos) | 🟡 MÉDIA - Renomear 3 colunas OU atualizar doc |
| **pesquisas** | **16%** (8/50 campos) | 🔥 CRÍTICA - 84% de incompatibilidade |

### ⚠️ IMPACTO NO SISTEMA

1. **Formulário index.html**: 
   - 70% das questões (Q6-Q11, Q14-Q40) **NÃO PODEM SER SALVAS**
   - Dados preenchidos pelo usuário serão **PERDIDOS**

2. **Payload Manager**:
   - Estrutura completamente **DESATUALIZADA**
   - Validações em campos **INEXISTENTES**

3. **Backend server.js**:
   - Queries INSERT com colunas **INEXISTENTES**
   - Sistema **NÃO FUNCIONAL** no estado atual

---

## 🎯 DECISÃO NECESSÁRIA

### Opção A: **ATUALIZAR BANCO DE DADOS** (Migration SQL)

**Vantagens:**
- ✅ Mantém documentação e código frontend
- ✅ Adiciona recursos planejados (CNPJ API, validações)
- ✅ Estrutura mais completa e normalizada

**Desvantagens:**
- ❌ Modificação em banco RDS de produção (RISCO ALTO)
- ❌ Pode afetar dados existentes
- ❌ Requer backup e rollback plan
- ❌ Tempo: ~4-6 horas

**SQL Migration:**
```sql
-- Adicionar ~50 colunas em 3 tabelas
-- Ver detalhes acima em cada tabela
```

---

### Opção B: **ATUALIZAR DOCUMENTAÇÃO** (Reescrever código)

**Vantagens:**
- ✅ Sem risco de perda de dados
- ✅ Trabalha com estrutura existente
- ✅ Sem alteração no banco de produção

**Desvantagens:**
- ❌ Reescrever payload-manager.js (100%)
- ❌ Reescrever form-payload-integrator.js (100%)
- ❌ Reescrever MODELO_INSERT_TABELAS.md (100%)
- ❌ Modificar app.js (busca CNPJ, validações)
- ❌ Tempo: ~6-8 horas

**Arquivos a modificar:**
1. `payload-manager.js` (566 linhas)
2. `form-payload-integrator.js` (400+ linhas)
3. `MODELO_INSERT_TABELAS.md` (700 linhas)
4. `app.js` (funções de validação)
5. `backend-api/server.js` (queries INSERT)

---

## ⚡ RECOMENDAÇÃO

**OPÇÃO B - ATUALIZAR DOCUMENTAÇÃO**

**Motivo:** Banco RDS já está em produção com dados. Migration pode causar perda de dados ou downtime.

**Plano de Ação:**
1. ✅ Verificar estrutura real (FEITO)
2. 🔄 Reescrever payload-manager.js
3. 🔄 Reescrever form-payload-integrator.js
4. 🔄 Atualizar MODELO_INSERT_TABELAS.md
5. 🔄 Ajustar backend server.js
6. 🔄 Testar INSERT completo
7. ✅ Validar com dados reais

**Tempo estimado:** 1 dia de trabalho

---

## 📞 PRÓXIMO PASSO

**Aguardando decisão do usuário:**
- [ ] Opção A: Migration SQL (atualizar banco)
- [ ] Opção B: Reescrever código (atualizar documentação)
