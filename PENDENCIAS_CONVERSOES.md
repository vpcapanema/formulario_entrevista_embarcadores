# 📋 LISTA DE PENDÊNCIAS - CONVERSÕES TEXT → SELECT

## ❌ CAMPOS QUE AINDA SÃO TEXT (mas deveriam ser SELECT com dropdown)

### 1. **Q2 - Função do Entrevistado** ❌
- **Status**: Campo TEXT livre
- **Deve ser**: SELECT com lista de funções
- **Tabela BD**: `funcoes_entrevistado` (12 funções cadastradas)
- **API**: `/api/funcoes`
- **Local**: Card 1 - index.html linha ~59
- **Opções**: Gerente de Logística, Coordenador de Transportes, Diretor de Operações, etc.

---

### 2. **Q7 - Município da Empresa** ❌
- **Status**: Campo TEXT livre
- **Deve ser**: SELECT com 645 municípios de SP
- **Tabela BD**: `municipios_sp` (11 cadastrados, faltam 634)
- **API**: `/api/municipios`
- **Local**: Card 2 - index.html linha ~143
- **Ação necessária**: 
  1. Completar tabela com 645 municípios
  2. Converter campo para SELECT

---

### 3. **Q12 - Origem (País/Estado/Município)** ❌
- **Status**: 3 campos TEXT livres
- **Deve ser**: 3 SELECTs cascateados
- **Tabelas BD**: `paises`, `estados_brasil`, `municipios_sp`
- **API**: `/api/paises`, `/api/estados`, `/api/municipios`
- **Local**: Card 5 - index.html linha ~287-299
- **Lógica**: 
  - Seleciona País → habilita Estado
  - Seleciona Estado → filtra Municípios

---

### 4. **Q13 - Destino (País/Estado/Município)** ❌
- **Status**: 3 campos TEXT livres
- **Deve ser**: 3 SELECTs cascateados
- **Tabelas BD**: `paises`, `estados_brasil`, `municipios_sp`
- **API**: `/api/paises`, `/api/estados`, `/api/municipios`
- **Local**: Card 5 - index.html linha ~302-314
- **Lógica**: Mesma que Origem

---

### 5. **Q16 - Número de Paradas** ❌
- **Status**: Campo NUMBER livre
- **Deve ser**: SELECT com opções fixas
- **Local**: Card 5 - index.html linha ~328
- **Opções sugeridas**:
  - 1 parada
  - 2 paradas
  - 3 paradas
  - 4-5 paradas
  - 6-10 paradas
  - Mais de 10 paradas
  - Não sei / Não se aplica

---

### 6. **Q8 - Acondicionamento (na tabela de produtos)** ❌
- **Status**: Campo TEXT livre (dentro da tabela)
- **Deve ser**: SELECT com tipos de acondicionamento
- **Local**: Card 3 - tabela produtos - index.html linha ~165
- **Opções sugeridas**:
  - Granel sólido
  - Granel líquido
  - Paletizado
  - Conteinerizado
  - Big Bag
  - Sacaria
  - Caixas/Embalagens
  - Outro
  - Não sei / Não se aplica

---

### 7. **Q19 - Capacidade Utilizada** ❌
- **Status**: Campo NUMBER livre (%)
- **Deve ser**: SELECT com faixas
- **Local**: Card 5 - index.html linha ~361
- **Opções sugeridas**:
  - 0-25% (Muito baixa)
  - 26-50% (Baixa)
  - 51-75% (Média)
  - 76-90% (Alta)
  - 91-100% (Muito alta)
  - Não sei / Não se aplica

---

### 8. **Q28 - Frequência Diária** ❌
- **Status**: Campo NUMBER livre
- **Deve ser**: SELECT com opções
- **Local**: Card 5 - index.html (campo condicional)
- **Opções sugeridas**:
  - 1 vez ao dia
  - 2-3 vezes ao dia
  - 4-5 vezes ao dia
  - 6-10 vezes ao dia
  - Mais de 10 vezes ao dia
  - Não sei / Não se aplica

---

## ✅ CAMPOS QUE JÁ SÃO SELECT (implementados corretamente)

- Q5 - Tipo de Empresa ✅
- Q10 - Agrupamento do Produto ✅
- Q11 - Tipo de Transporte ✅
- Q15 - Tem Paradas ✅
- Q18 - Configuração do Veículo ✅
- Q22 - Tipo de Embalagem ✅
- Q23 - Carga Perigosa ✅
- Q25 - Frequência ✅
- Q29-38 - Importância dos Fatores ✅
- Q39 - Tipo de Cadeia ✅

---

## 🔧 OUTRAS PENDÊNCIAS

### 9. **Completar 645 Municípios de SP** ❌
- **Status**: Apenas 11 municípios cadastrados
- **Necessário**: Adicionar os 634 restantes
- **Arquivo**: `database_schema_completo.sql` ou criar script separado
- **Fonte**: Lista IBGE completa

---

### 10. **Integração OpenRouteService API** ❌
- **Status**: NÃO implementado
- **Finalidade**: Calcular automaticamente Q14 (Distância)
- **Quando**: Após selecionar Origem e Destino
- **API**: https://api.openrouteservice.org
- **Limite**: 2000 requests/dia (grátis)

---

### 11. **Validação de CNPJ** ❌
- **Status**: Campo opcional sem validação
- **Necessário**: Função para validar formato e dígitos verificadores
- **Local**: Backend (server.js) ou Frontend (app.js)

---

### 12. **Carregar Dropdowns da API ao iniciar** ❌
- **Status**: Função `carregarEntrevistadores()` criada apenas para Q0.2
- **Necessário**: Criar funções para carregar TODAS as listas:
  - `carregarFuncoes()` → Q2
  - `carregarMunicipios()` → Q7, Q12, Q13
  - `carregarPaises()` → Q12, Q13
  - `carregarEstados()` → Q12, Q13

---

## 📊 RESUMO

| Item | Status | Prioridade |
|------|--------|------------|
| Q2 - Função | ❌ Pendente | 🔴 Alta |
| Q7 - Município Empresa | ❌ Pendente | 🔴 Alta |
| Q12 - Origem (cascata) | ❌ Pendente | 🔴 Alta |
| Q13 - Destino (cascata) | ❌ Pendente | 🔴 Alta |
| Q16 - Nº Paradas | ❌ Pendente | 🟡 Média |
| Q8 - Acondicionamento | ❌ Pendente | 🟡 Média |
| Q19 - Capacidade % | ❌ Pendente | 🟡 Média |
| Q28 - Freq. Diária | ❌ Pendente | 🟢 Baixa |
| 645 Municípios | ❌ Pendente | 🔴 Alta |
| OpenRouteService | ❌ Pendente | 🟡 Média |
| Validação CNPJ | ❌ Pendente | 🟢 Baixa |
| Carregar Dropdowns | ❌ Pendente | 🔴 Alta |

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO SUGERIDA

1. **Completar 645 municípios** (banco de dados)
2. **Criar função para carregar listas da API** (app.js)
3. **Q2 - Converter Função para SELECT**
4. **Q7 - Converter Município para SELECT**
5. **Q12/Q13 - Converter Origem/Destino para SELECTs cascateados**
6. **Q16 - Converter Nº Paradas para SELECT**
7. **Q8 - Converter Acondicionamento para SELECT**
8. **Q19 - Converter Capacidade para SELECT**
9. **Q28 - Converter Freq. Diária para SELECT**
10. **Integrar OpenRouteService** (opcional)
11. **Validação CNPJ** (opcional)

---

## ⚠️ IMPACTO NO DEPLOY

**CRITICAL:** Essas conversões devem ser feitas ANTES do deploy em produção, pois:

1. Melhora significativamente a qualidade dos dados
2. Facilita análise e agregação
3. Evita erros de digitação
4. Padroniza respostas
5. Permite queries SQL eficientes

---

## 💬 PRÓXIMA AÇÃO

**Deseja que eu implemente essas conversões AGORA ou seguimos com o deploy e fazemos depois?**

Opção A: **Implementar TUDO agora** (2-3 horas de trabalho)
Opção B: **Deploy primeiro, conversões depois** (sistema funcional rapidamente)
Opção C: **Implementar só as CRÍTICAS** (Q2, Q7, Q12, Q13) e deploy

**Qual você prefere?**
