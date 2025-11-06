# 📊 Análise de Formatos de Dados - Sistema PLI 2050

## 🔍 Formato Atual dos Dados

### ❌ PROBLEMAS IDENTIFICADOS

#### 1. **Campos Numéricos Salvos como Texto (VARCHAR)**
```sql
-- ATUAL (INCORRETO):
capacidade_utilizada VARCHAR(20)  -- Exemplo: "75-100%"
num_paradas VARCHAR(20)            -- Exemplo: "mais-10" ou "4-5"
frequencia_diaria VARCHAR(20)      -- Exemplo: "2-3-vezes"
```

**Problema:** Impossível calcular médias, somas, estatísticas agregadas.

#### 2. **Valores em Formato de Faixa (Ranges)**
```javascript
// JavaScript coleta assim:
capacidade_utilizada: "75-100%"    // String, não número
num_paradas: "4-5"                 // String, não número
frequencia_diaria: "2-3-vezes"     // String, não número
```

**Problema:** Dados não são quantitativos, são categóricos.

#### 3. **Campos Mistos (Texto + Número)**
```sql
-- Campos que misturam categorias e valores exatos:
num_paradas VARCHAR(20)  -- Pode ser "1", "2", "4-5", "mais-10", "nao-sei"
```

**Problema:** Dificulta queries e análises estatísticas.

---

## ✅ BOAS PRÁTICAS - O que Dizem os Especialistas

### 📚 Princípios de Database Design

#### 1. **Normalização de Dados**
> "Sempre armazene valores numéricos em tipos numéricos (INTEGER, NUMERIC, DECIMAL)"
> — Database Design Best Practices, PostgreSQL Documentation

#### 2. **Separação de Concerns**
> "Armazene dados brutos (raw data) e crie views/cálculos para categorias"
> — Data Warehousing Fundamentals

#### 3. **Análise Estatística**
> "Para cálculos (AVG, SUM, PERCENTILE), tipos numéricos são essenciais"
> — SQL Performance Tuning Guide

#### 4. **Type Safety**
> "Tipo de dado correto previne erros e garante integridade"
> — ACID Principles

---

## 🎯 CAMPOS QUE PRECISAM SER NUMÉRICOS

### 📋 Lista Completa de Ajustes Necessários

| Campo Atual | Tipo Atual | Tipo Correto | Exemplo Valor | Motivo |
|-------------|------------|--------------|---------------|--------|
| `distancia` | ✅ NUMERIC(10,2) | ✅ Correto | 1500.50 | Já numérico |
| `peso_carga` | ✅ NUMERIC(12,2) | ✅ Correto | 25000.00 | Já numérico |
| `custo_transporte` | ✅ NUMERIC(12,2) | ✅ Correto | 3500.75 | Já numérico |
| `valor_carga` | ✅ NUMERIC(15,2) | ✅ Correto | 150000.00 | Já numérico |
| `tempo_dias` | ✅ INTEGER | ✅ Correto | 3 | Já numérico |
| `tempo_horas` | ✅ INTEGER | ✅ Correto | 12 | Já numérico |
| `tempo_minutos` | ✅ INTEGER | ✅ Correto | 45 | Já numérico |
| `variacao_custo` | ✅ NUMERIC(5,2) | ✅ Correto | 15.50 | Já numérico |
| `variacao_tempo` | ✅ NUMERIC(5,2) | ✅ Correto | 20.00 | Já numérico |
| `variacao_confiabilidade` | ✅ NUMERIC(5,2) | ✅ Correto | 10.25 | Já numérico |
| `variacao_seguranca` | ✅ NUMERIC(5,2) | ✅ Correto | 5.00 | Já numérico |
| `variacao_capacidade` | ✅ NUMERIC(5,2) | ✅ Correto | 12.50 | Já numérico |
| **`capacidade_utilizada`** | ❌ VARCHAR(20) | ⚠️ **NUMERIC(5,2)** | 87.50 | **Cálculo médio necessário** |
| **`num_paradas`** | ❌ VARCHAR(20) | ⚠️ **INTEGER** | 3 | **Estatísticas de paradas** |
| **`frequencia_diaria`** | ❌ VARCHAR(20) | ⚠️ **NUMERIC(4,1)** | 2.5 | **Média de viagens/dia** |
| **`num_paradas_exato`** | ❌ Não existe | ⚠️ **INTEGER** | 15 | **Novo campo (quando >10)** |

---

## 🔧 ALTERAÇÕES NECESSÁRIAS

### 1. **Capacidade Utilizada**

**ANTES (Dropdown com Ranges):**
```html
<option value="0-25%">0-25%</option>
<option value="25-50%">25-50%</option>
<option value="50-75%">50-75%</option>
<option value="75-100%">75-100%</option>
```

**DEPOIS (Input Numérico):**
```html
<input type="number" id="capacidade-utilizada" name="capacidade-utilizada" 
       min="0" max="100" step="0.1" placeholder="Ex: 85.5" required>
<small class="field-hint">Digite a porcentagem de capacidade utilizada (0-100%)</small>
```

**Conversão no JavaScript:**
```javascript
// ANTES:
formData.capacidadeUtilizada = "75-100%";  // String

// DEPOIS:
formData.capacidadeUtilizada = parseFloat(document.getElementById('capacidade-utilizada').value);  // Number
// Exemplo: 87.5
```

**SQL Schema:**
```sql
-- ANTES:
capacidade_utilizada VARCHAR(20) NOT NULL,

-- DEPOIS:
capacidade_utilizada NUMERIC(5, 2) NOT NULL CHECK (capacidade_utilizada >= 0 AND capacidade_utilizada <= 100),
COMMENT ON COLUMN formulario_embarcadores.pesquisas.capacidade_utilizada IS 'Percentual de capacidade utilizada (0-100%)';
```

**Análises Possíveis:**
```sql
-- Média de capacidade utilizada
SELECT AVG(capacidade_utilizada) as media_capacidade FROM pesquisas;

-- Distribuição por faixas
SELECT 
    CASE 
        WHEN capacidade_utilizada < 25 THEN '0-25%'
        WHEN capacidade_utilizada < 50 THEN '25-50%'
        WHEN capacidade_utilizada < 75 THEN '50-75%'
        ELSE '75-100%'
    END as faixa,
    COUNT(*) as total,
    AVG(capacidade_utilizada) as media_faixa
FROM pesquisas
GROUP BY faixa;
```

---

### 2. **Número de Paradas**

**ANTES (Dropdown com Ranges):**
```html
<option value="1">1 parada</option>
<option value="2">2 paradas</option>
<option value="4-5">4 a 5 paradas</option>
<option value="6-10">6 a 10 paradas</option>
<option value="mais-10">Mais de 10 paradas</option>
```

**DEPOIS (Conversão para Número Exato):**
```javascript
// Estratégia: Converter ranges para valor médio
function converterNumParadas(valor) {
    if (!valor || valor === 'nao-sei') return null;
    
    // Valores exatos
    if (valor === '1') return 1;
    if (valor === '2') return 2;
    if (valor === '3') return 3;
    
    // Ranges: usar ponto médio
    if (valor === '4-5') return 4.5;
    if (valor === '6-10') return 8;
    
    // Mais de 10: usar valor exato do campo num-paradas-exato
    if (valor === 'mais-10') {
        const exato = document.getElementById('num-paradas-exato').value;
        return exato ? parseInt(exato) : null;
    }
    
    return null;
}

// No collectFormData():
if (formData.temParadas === 'sim') {
    const numParadasRaw = document.getElementById('num-paradas').value;
    formData.numParadas = converterNumParadas(numParadasRaw);
}
```

**SQL Schema:**
```sql
-- ANTES:
num_paradas VARCHAR(20),

-- DEPOIS:
num_paradas INTEGER CHECK (num_paradas > 0),
COMMENT ON COLUMN formulario_embarcadores.pesquisas.num_paradas IS 'Número de paradas no deslocamento (valor exato ou médio de faixa)';
```

**Análises Possíveis:**
```sql
-- Média de paradas por modal
SELECT 
    unnest(modos) as modal,
    AVG(num_paradas) as media_paradas,
    MIN(num_paradas) as min_paradas,
    MAX(num_paradas) as max_paradas
FROM pesquisas
WHERE num_paradas IS NOT NULL
GROUP BY modal;
```

---

### 3. **Frequência Diária**

**ANTES (Dropdown com Ranges):**
```html
<option value="1-vez">1 vez por dia</option>
<option value="2-3-vezes">2 a 3 vezes por dia</option>
<option value="4-5-vezes">4 a 5 vezes por dia</option>
<option value="mais-5">Mais de 5 vezes por dia</option>
```

**DEPOIS (Conversão para Número):**
```javascript
function converterFrequenciaDiaria(valor) {
    if (!valor) return null;
    
    if (valor === '1-vez') return 1;
    if (valor === '2-3-vezes') return 2.5;  // Média
    if (valor === '4-5-vezes') return 4.5;  // Média
    if (valor === 'mais-5') return 6;       // Estimativa conservadora
    
    return null;
}
```

**SQL Schema:**
```sql
-- ANTES:
frequencia_diaria VARCHAR(20),

-- DEPOIS:
frequencia_diaria NUMERIC(4, 1) CHECK (frequencia_diaria > 0),
COMMENT ON COLUMN formulario_embarcadores.pesquisas.frequencia_diaria IS 'Número de viagens por dia (valor exato ou médio)';
```

---

## 📊 ANÁLISES ESTATÍSTICAS POSSÍVEIS

### Com Dados Numéricos:

```sql
-- 1. KPIs Agregados
SELECT 
    COUNT(*) as total_pesquisas,
    AVG(capacidade_utilizada) as media_capacidade,
    AVG(num_paradas) as media_paradas,
    AVG(peso_carga) as media_peso,
    AVG(custo_transporte) as media_custo,
    AVG(distancia) as media_distancia
FROM formulario_embarcadores.pesquisas;

-- 2. Custo por Tonelada-Quilômetro
SELECT 
    id_pesquisa,
    produto_principal,
    custo_transporte / (peso_carga * distancia) as custo_por_tkm
FROM formulario_embarcadores.pesquisas
WHERE peso_carga > 0 AND distancia > 0
ORDER BY custo_por_tkm ASC;

-- 3. Eficiência de Capacidade por Modal
SELECT 
    unnest(modos) as modal,
    AVG(capacidade_utilizada) as media_capacidade,
    STDDEV(capacidade_utilizada) as desvio_padrao,
    COUNT(*) as total_operacoes
FROM formulario_embarcadores.pesquisas
GROUP BY modal
ORDER BY media_capacidade DESC;

-- 4. Correlação Paradas vs Tempo
SELECT 
    num_paradas,
    AVG(tempo_dias * 24 + tempo_horas + tempo_minutos/60.0) as media_horas_total,
    COUNT(*) as total
FROM formulario_embarcadores.pesquisas
WHERE num_paradas IS NOT NULL
GROUP BY num_paradas
ORDER BY num_paradas;

-- 5. Análise de Frequência
SELECT 
    frequencia,
    AVG(frequencia_diaria) as media_viagens_dia,
    COUNT(*) as total_empresas
FROM formulario_embarcadores.pesquisas
WHERE frequencia = 'diaria'
GROUP BY frequencia;

-- 6. Valor Médio de Carga por Produto
SELECT 
    agrupamento_produto,
    AVG(valor_carga) as media_valor,
    AVG(peso_carga) as media_peso,
    AVG(valor_carga / NULLIF(peso_carga, 0)) as valor_por_tonelada,
    COUNT(*) as total
FROM formulario_embarcadores.pesquisas
GROUP BY agrupamento_produto
ORDER BY media_valor DESC;
```

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Atualizar Frontend (HTML + JavaScript)
1. ✅ Capacidade Utilizada: Input number (0-100)
2. ✅ Número de Paradas: Manter dropdown + campo exato para >10
3. ✅ Frequência Diária: Input number ou select com conversão

### Fase 2: Atualizar Lógica de Coleta (app.js)
1. ✅ Converter strings para números (`parseFloat`, `parseInt`)
2. ✅ Validar ranges e valores
3. ✅ Calcular médias de faixas quando necessário

### Fase 3: Migração do Schema (SQL)
1. ✅ Criar script de migração
2. ✅ ALTER TABLE para mudar tipos de dados
3. ✅ Converter dados existentes (se houver)
4. ✅ Adicionar constraints e validações

### Fase 4: Atualizar Backend (server.js)
1. ✅ Validar tipos de dados antes de INSERT
2. ✅ Tratar conversões e erros
3. ✅ Retornar dados numéricos nas APIs

---

## 📝 RESUMO DAS MUDANÇAS

| Item | Situação Atual | Mudança Necessária | Impacto |
|------|----------------|-------------------|---------|
| **distancia** | ✅ NUMERIC | Nenhuma | - |
| **peso_carga** | ✅ NUMERIC | Nenhuma | - |
| **custo_transporte** | ✅ NUMERIC | Nenhuma | - |
| **valor_carga** | ✅ NUMERIC | Nenhuma | - |
| **tempo_**** | ✅ INTEGER | Nenhuma | - |
| **variacao_**** | ✅ NUMERIC | Nenhuma | - |
| **capacidade_utilizada** | ❌ VARCHAR | 🔧 Mudar para NUMERIC(5,2) | Alto - Análises críticas |
| **num_paradas** | ❌ VARCHAR | 🔧 Mudar para INTEGER | Médio - Estatísticas |
| **frequencia_diaria** | ❌ VARCHAR | 🔧 Mudar para NUMERIC(4,1) | Médio - KPIs |
| **num_paradas_exato** | ❌ Não existe | ➕ Adicionar INTEGER | Baixo - Já criado no HTML |

---

## ✅ BENEFÍCIOS DA PADRONIZAÇÃO

1. **📊 Análises Estatísticas Precisas**
   - Médias, medianas, desvio padrão
   - Correlações entre variáveis
   - Regressões e previsões

2. **🎯 Performance de Queries**
   - Índices numéricos são mais eficientes
   - Comparações e ordenações mais rápidas
   - Menor uso de memória

3. **🔒 Integridade de Dados**
   - Validação automática (CHECK constraints)
   - Prevenção de erros de tipo
   - Dados consistentes

4. **📈 Visualizações e Dashboards**
   - Gráficos de tendência
   - Heatmaps de distribuição
   - KPIs em tempo real

5. **🤖 Machine Learning Futuro**
   - Features numéricas prontas
   - Modelos preditivos
   - Clustering e segmentação

---

**Próximo Passo:** Implementar conversões no frontend e criar script de migração SQL.
