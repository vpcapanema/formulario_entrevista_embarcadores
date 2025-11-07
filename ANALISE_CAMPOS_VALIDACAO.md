# 📋 Análise Completa: Campos do Formulário vs Validação

**Data**: 06/11/2025  
**Status**: ⚠️ VALIDAÇÃO INCOMPLETA - Apenas 17 de 66 campos configurados

---

## ✅ CAMPOS COM VALIDAÇÃO CONFIGURADA (17 campos)

| # | ID do Campo | Tipo HTML | Obrigatório? | Validador | Status |
|---|------------|-----------|--------------|-----------|--------|
| 1 | `cnpj` | text | ✅ Sim | cnpj | ✅ OK |
| 2 | `razao_social` | text | ✅ Sim | varchar(200) | ✅ OK |
| 3 | `nome_fantasia` | text | ❌ Não | varchar(200) | ✅ OK |
| 4 | `email` | email | ❌ Não | email | ✅ OK |
| 5 | `telefone` | tel | ❌ Não | telefone | ✅ OK |
| 6 | `entrevistador` | select | ✅ Sim | select | ✅ OK |
| 7 | `nome_entrevistado` | text | ✅ Sim | varchar(100) | ✅ OK |
| 8 | `cargo_entrevistado` | text | ✅ Sim | varchar(100) | ✅ OK |
| 9 | `email_entrevistado` | email | ✅ Sim | email | ✅ OK |
| 10 | `telefone_entrevistado` | tel | ✅ Sim | telefone | ✅ OK |
| 11 | `num_funcionarios` | number | ❌ Não | integer(min:0) | ✅ OK |
| 12 | `num_veiculos` | number | ❌ Não | integer(min:0) | ✅ OK |
| 13 | `num_paradas` | number | ❌ Não | integer(min:0) | ✅ OK |
| 14 | `num_depositos` | number | ❌ Não | integer(min:0) | ✅ OK |
| 15 | `id_funcao` | select | ✅ Sim | select | ✅ OK |
| 16 | `setor_atuacao` | select | ✅ Sim | select | ✅ OK |
| 17 | `possui_frota` | select | ✅ Sim | select | ✅ OK |

---

## ❌ CAMPOS SEM VALIDAÇÃO (49 campos)

### 📌 **BLOCO 1: Dados do Entrevistado** (4 campos faltando)

| ID do Campo | Tipo | Obrigatório? | Problema |
|------------|------|--------------|----------|
| `id-entrevistador` | select | ✅ Sim | ❌ Não está no validation-engine.js |
| `nome` | text | ✅ Sim | ❌ ID errado (deveria ser `nome_entrevistado`) |
| `funcao-entrevistado` | select | ✅ Sim | ❌ ID errado (deveria ser `id_funcao`) |
| `outra-funcao` | text | ❌ Não | ❌ Não validado |

### 📌 **BLOCO 2: Dados da Empresa** (5 campos faltando)

| ID do Campo | Tipo | Obrigatório? | Problema |
|------------|------|--------------|----------|
| `tipo-empresa` | select | ✅ Sim | ❌ Não validado |
| `outro-tipo` | text | ❌ Não | ❌ Não validado (condicional) |
| `cnpj-empresa` | text | ✅ Sim | ❌ ID errado (deveria ser `cnpj`) |
| `nome-empresa` | text | ✅ Sim | ❌ ID errado (readonly, preenchido por API) |
| `municipio-empresa` | select | ✅ Sim | ❌ Não validado |

### 📌 **BLOCO 3: Produto Principal** (3 campos faltando)

| ID do Campo | Tipo | Obrigatório? | Problema |
|------------|------|--------------|----------|
| `produto-principal` | text | ✅ Sim | ❌ Não validado |
| `agrupamento-produto` | select | ✅ Sim | ❌ Não validado |
| `outro-produto` | text | ❌ Não | ❌ Não validado (condicional) |

### 📌 **BLOCO 4: Origem e Destino** (6 campos faltando)

| ID do Campo | Tipo | Obrigatório? | Problema |
|------------|------|--------------|----------|
| `tipo-transporte` | select | ✅ Sim | ❌ Não validado |
| `origem-pais` | select | ✅ Sim | ❌ Não validado |
| `origem-estado` | select | ⚠️ Condicional | ❌ Não validado |
| `origem-municipio` | select | ⚠️ Condicional | ❌ Não validado |
| `destino-pais` | select | ✅ Sim | ❌ Não validado |
| `destino-estado` | select | ⚠️ Condicional | ❌ Não validado |
| `destino-municipio` | select | ⚠️ Condicional | ❌ Não validado |

### 📌 **BLOCO 5: Detalhes do Transporte** (9 campos faltando)

| ID do Campo | Tipo | Obrigatório? | Problema |
|------------|------|--------------|----------|
| `distancia` | number | ✅ Sim | ❌ Não validado |
| `tem-paradas` | select | ✅ Sim | ❌ ID errado (deveria ser consistente) |
| `num-paradas` | select | ✅ Sim | ❌ Não validado (condicional) |
| `num-paradas-exato` | number | ⚠️ Condicional | ❌ Não validado |
| `modo` (checkboxes) | checkbox | ✅ Sim | ❌ Não validado |
| `config-veiculo` | select | ⚠️ Condicional | ❌ Não validado |
| `capacidade-utilizada` | number | ✅ Sim | ❌ Não validado |
| `peso-carga` | number | ✅ Sim | ❌ Não validado |
| `unidade-peso` | select | ✅ Sim | ❌ Não validado |

### 📌 **BLOCO 6: Custos e Valores** (3 campos faltando)

| ID do Campo | Tipo | Obrigatório? | Problema |
|------------|------|--------------|----------|
| `custo-transporte` | number | ✅ Sim | ❌ Não validado |
| `valor-carga` | number | ✅ Sim | ❌ Não validado |
| `tipo-embalagem` | select | ✅ Sim | ❌ Não validado |
| `carga-perigosa` | select | ✅ Sim | ❌ Não validado |

### 📌 **BLOCO 7: Tempo e Frequência** (6 campos faltando)

| ID do Campo | Tipo | Obrigatório? | Problema |
|------------|------|--------------|----------|
| `tempo-dias` | number | ✅ Sim | ❌ Não validado |
| `tempo-horas` | number | ✅ Sim | ❌ Não validado |
| `tempo-minutos` | number | ✅ Sim | ❌ Não validado |
| `frequencia` | select | ✅ Sim | ❌ Não validado |
| `frequencia-diaria` | number | ⚠️ Condicional | ❌ Não validado |
| `frequencia-outra` | text | ⚠️ Condicional | ❌ Não validado |

### 📌 **BLOCO 8: Importância dos Fatores** (10 campos faltando)

| ID do Campo | Tipo | Obrigatório? | Problema |
|------------|------|--------------|----------|
| `importancia-custo` | select | ✅ Sim | ❌ Não validado |
| `variacao-custo` | number(%) | ✅ Sim | ❌ Não validado |
| `importancia-tempo` | select | ✅ Sim | ❌ Não validado |
| `variacao-tempo` | number(%) | ✅ Sim | ❌ Não validado |
| `importancia-confiabilidade` | select | ✅ Sim | ❌ Não validado |
| `variacao-confiabilidade` | number(%) | ✅ Sim | ❌ Não validado |
| `importancia-seguranca` | select | ✅ Sim | ❌ Não validado |
| `variacao-seguranca` | number(%) | ✅ Sim | ❌ Não validado |
| `importancia-capacidade` | select | ✅ Sim | ❌ Não validado |
| `variacao-capacidade` | number(%) | ✅ Sim | ❌ Não validado |

### 📌 **BLOCO 9: Cadeia Logística** (3 campos faltando)

| ID do Campo | Tipo | Obrigatório? | Problema |
|------------|------|--------------|----------|
| `tipo-cadeia` | select | ✅ Sim | ❌ Não validado |
| `modal-alternativo` (checkboxes) | checkbox | ❌ Não | ❌ Não validado |
| `fator-adicional` | textarea | ❌ Não | ❌ Não validado |

### 📌 **BLOCO 10: Dificuldades** (2 campos faltando)

| ID do Campo | Tipo | Obrigatório? | Problema |
|------------|------|--------------|----------|
| `dificuldade` (checkboxes) | checkbox | ❌ Não | ❌ Não validado |
| `detalhe-dificuldade` | textarea | ❌ Não | ❌ Não validado |

---

## 📊 RESUMO ESTATÍSTICO

| Métrica | Valor | Percentual |
|---------|-------|------------|
| **Total de Campos** | 66 | 100% |
| **Com Validação** | 17 | 25.8% |
| **Sem Validação** | 49 | 74.2% |
| **Campos Obrigatórios Total** | ~45 | - |
| **Obrigatórios Validados** | 10 | 22% |
| **Obrigatórios NÃO Validados** | 35 | 78% |

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **IDs Inconsistentes entre HTML e Validator**
- HTML usa: `cnpj-empresa`, `nome`, `funcao-entrevistado`
- Validator espera: `cnpj`, `nome_entrevistado`, `id_funcao`
- **Solução**: Padronizar IDs (usar kebab-case no HTML e converter no JS)

### 2. **Campos Obrigatórios Não Validados**
- 35 campos marcados como `required` no HTML **NÃO** têm validação visual
- Usuário não recebe feedback antes de tentar salvar

### 3. **Campos Condicionais Ignorados**
- `outro-tipo`, `outro-produto`, `num-paradas-exato` aparecem condicionalmente
- Validação não leva em conta quando são obrigatórios

### 4. **Checkboxes Não Validados**
- `modo` (modos de transporte) é obrigatório mas não valida
- `modal-alternativo` e `dificuldade` também não validados

---

## ✅ AÇÕES NECESSÁRIAS

1. **Mapear TODOS os 66 campos** no `validation-engine.js`
2. **Padronizar IDs** (converter kebab-case para snake_case internamente)
3. **Validar checkboxes** (pelo menos 1 selecionado para obrigatórios)
4. **Adicionar validação condicional** (campos que aparecem dinamicamente)
5. **Validar percentuais** (0-100% para campos de variação)
6. **Validar time inputs** (dias + horas + minutos)

---

**Gerado em**: 06/11/2025  
**Ferramenta**: Validation Engine Analyzer
