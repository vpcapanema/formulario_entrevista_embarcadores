# 📊 INVENTÁRIO COMPLETO DAS TABELAS - SISTEMA PLI 2050

**Data:** 05/11/2025  
**Objetivo:** Documentar EXATAMENTE quais campos o banco aceita e seus constraints

---

## 🏢 TABELA 1: `formulario_embarcadores.empresas`

### ✅ Campos Obrigatórios (NOT NULL):
1. `nome_empresa` VARCHAR(255) - Q6b - Nome da empresa
2. `tipo_empresa` VARCHAR(50) - Q5 - Tipo (embarcador/transportador/operador/outro)
3. `municipio` VARCHAR(255) - Q7 - Município (NOME, ex: "São Paulo")

### ✅ Campos Opcionais:
4. `outro_tipo` VARCHAR(255) - Q5 - Se tipo="outro"
5. `estado` VARCHAR(100) - Q7 - Estado (NOME ou SIGLA)
6. `cnpj` VARCHAR(18) - Q6a - CNPJ formatado (XX.XXX.XXX/XXXX-XX) - UNIQUE
7. `razao_social` VARCHAR(255) - Q6b - Razão Social (API CNPJ)
8. `nome_fantasia` VARCHAR(255) - Q6b - Nome Fantasia (API CNPJ)
9. `telefone` VARCHAR(20) - Q8 - Telefone
10. `email` VARCHAR(255) - Q9 - Email
11. `id_municipio` INTEGER - Q7 - Código IBGE 7 dígitos
12. `logradouro` VARCHAR(255) - Q10a - Rua/Avenida
13. `numero` VARCHAR(20) - Q10b - Número
14. `complemento` VARCHAR(100) - Q10c - Complemento
15. `bairro` VARCHAR(100) - Q10d - Bairro
16. `cep` VARCHAR(8) - Q11 - CEP (apenas números)

### 🔒 Constraints:
- `tipo_empresa` IN ('embarcador', 'transportador', 'operador', 'outro') ✅ MINÚSCULAS
- `cnpj` UNIQUE (apenas 1 CNPJ por empresa)

### 📝 PAYLOAD CORRETO:
```javascript
{
  nome_empresa: "PETROBRAS S.A.",           // OBRIGATÓRIO
  tipo_empresa: "embarcador",               // OBRIGATÓRIO (minúsculas)
  municipio: "São Paulo",                   // OBRIGATÓRIO (nome completo)
  outro_tipo: null,                         // Opcional
  estado: "SP",                             // Opcional
  cnpj: "33.000.167/0001-01",              // Opcional (formatado)
  razao_social: "PETRÓLEO BRASILEIRO S.A.", // Opcional
  nome_fantasia: "PETROBRAS",              // Opcional
  telefone: "(21) 3224-1234",              // Opcional
  email: "contato@petrobras.com.br",       // Opcional
  id_municipio: 3550308,                   // Opcional (código IBGE)
  logradouro: "Av. República do Chile",    // Opcional
  numero: "65",                            // Opcional
  complemento: "Torre A",                  // Opcional
  bairro: "Centro",                        // Opcional
  cep: "20031170"                          // Opcional (sem formatação)
}
```

---

## 👤 TABELA 2: `formulario_embarcadores.entrevistados`

### ✅ Campos Obrigatórios (NOT NULL):
1. `id_empresa` INTEGER - FK para empresas (CASCADE DELETE)
2. `nome` VARCHAR(255) - Q1 - Nome do entrevistado
3. `funcao` VARCHAR(255) - Q2 - Função/Cargo
4. `telefone` VARCHAR(20) - Q3 - Telefone
5. `email` VARCHAR(255) - Q4 - Email

### ✅ Campos Opcionais:
6. `principal` BOOLEAN DEFAULT FALSE - Contato principal?

### 🔒 Constraints:
- `email` ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' (validação regex)
- `id_empresa` REFERENCES empresas(id_empresa) ON DELETE CASCADE

### 📝 PAYLOAD CORRETO:
```javascript
{
  id_empresa: 123,                          // OBRIGATÓRIO (vem do INSERT anterior)
  nome: "João da Silva Santos",             // OBRIGATÓRIO
  funcao: "Gerente de Logística",           // OBRIGATÓRIO
  telefone: "(11) 98765-4321",              // OBRIGATÓRIO
  email: "joao.silva@petrobras.com.br",     // OBRIGATÓRIO (formato válido)
  principal: true                           // Opcional (default: false)
}
```

---

## 📋 TABELA 3: `formulario_embarcadores.pesquisas`

### ✅ Campos Obrigatórios (NOT NULL):
1. `id_empresa` INTEGER - FK para empresas
2. `id_entrevistado` INTEGER - FK para entrevistados
3. `tipo_responsavel` VARCHAR(20) - "entrevistador" ou "entrevistado"
4. `id_responsavel` INTEGER - ID do responsável
5. `produto_principal` VARCHAR(255) - Q9 - Produto principal
6. `agrupamento_produto` VARCHAR(100) - Q10 - Agrupamento
7. `tipo_transporte` VARCHAR(50) - Q11 - Tipo (importacao/exportacao/local/nao-sei)
8. `origem_pais` VARCHAR(100) - Q12a - País origem
9. `origem_estado` VARCHAR(100) - Q12b - Estado origem
10. `origem_municipio` VARCHAR(255) - Q12c - Município origem
11. `destino_pais` VARCHAR(100) - Q13a - País destino
12. `destino_estado` VARCHAR(100) - Q13b - Estado destino
13. `destino_municipio` VARCHAR(255) - Q13c - Município destino
14. `distancia` NUMERIC(10,2) - Q14 - Distância (km)
15. `tem_paradas` VARCHAR(3) - Q15 - "sim", "nao" ou "nao-sei"
16. `modos` TEXT[] - Q19 - Array de modos ["rodoviario", "ferroviario"]
17. `capacidade_utilizada` VARCHAR(20) - Q20 - Capacidade utilizada
18. `peso_carga` NUMERIC(12,2) - Q21 - Peso da carga
19. `unidade_peso` VARCHAR(20) - Q21 - Unidade (kg/toneladas)
20. `custo_transporte` NUMERIC(12,2) - Q25 - Custo transporte
21. `valor_carga` NUMERIC(15,2) - Q22 - Valor da carga
22. `tipo_embalagem` VARCHAR(100) - Q23 - Tipo embalagem
23. `carga_perigosa` VARCHAR(3) - Q24 - "sim", "nao" ou "nao-sei"
24. `tempo_dias` INTEGER - Q26 - Tempo (dias)
25. `tempo_horas` INTEGER - Q26 - Tempo (horas)
26. `tempo_minutos` INTEGER - Q26 - Tempo (minutos)
27. `frequencia` VARCHAR(50) - Q27 - Frequência
28. `importancia_custo` VARCHAR(20) - Q29 - Importância custo
29. `variacao_custo` NUMERIC(5,2) - Q29 - Variação custo (%)
30. `importancia_tempo` VARCHAR(20) - Q30 - Importância tempo
31. `variacao_tempo` NUMERIC(5,2) - Q30 - Variação tempo (%)
32. `importancia_confiabilidade` VARCHAR(20) - Q31
33. `variacao_confiabilidade` NUMERIC(5,2) - Q31
34. `importancia_seguranca` VARCHAR(20) - Q32
35. `variacao_seguranca` NUMERIC(5,2) - Q32
36. `importancia_capacidade` VARCHAR(20) - Q33
37. `variacao_capacidade` NUMERIC(5,2) - Q33
38. `tipo_cadeia` VARCHAR(50) - Q39 - Tipo cadeia
39. `modos` TEXT[] - Array modos

### ✅ Campos Opcionais:
40. `outro_produto` VARCHAR(255) - Q10 - Se agrupamento="outro"
41. `num_paradas` VARCHAR(20) - Q15 - Número de paradas (se tem_paradas="sim")
42. `config_veiculo` VARCHAR(100) - Q19 - Configuração veículo
43. `frequencia_diaria` VARCHAR(20) - Q27 - Frequência diária
44. `frequencia_outra` VARCHAR(255) - Q27 - Outra frequência
45. `modais_alternativos` TEXT[] - Q40 - Modais alternativos
46. `fator_adicional` TEXT - Q41 - Fator adicional
47. `dificuldades` TEXT[] - Q42 - Dificuldades
48. `detalhe_dificuldade` TEXT - Q42 - Detalhes dificuldades
49. `observacoes` TEXT - Q43 - Observações gerais
50. `data_entrevista` TIMESTAMP - Data/hora (default: NOW())
51. `status` VARCHAR(20) - Status (default: "finalizada")

### 🔒 Constraints:
- `tipo_responsavel` IN ('entrevistador', 'entrevistado')
- `tem_paradas` IN ('sim', 'nao', 'nao-sei')
- `carga_perigosa` IN ('sim', 'nao', 'nao-sei')
- `status` IN ('rascunho', 'finalizada', 'validada')
- `tipo_transporte` IN ('importacao', 'exportacao', 'local', 'nao-sei')

### 📝 PAYLOAD CORRETO:
```javascript
{
  // Identificadores (OBRIGATÓRIOS)
  id_empresa: 123,
  id_entrevistado: 456,
  tipo_responsavel: "entrevistador",        // minúsculas
  id_responsavel: 1,
  
  // Produto (OBRIGATÓRIOS)
  produto_principal: "Petróleo Bruto",
  agrupamento_produto: "Combustíveis",
  outro_produto: null,                      // Se agrupamento != "outro"
  
  // Transporte (OBRIGATÓRIOS)
  tipo_transporte: "local",                 // minúsculas
  origem_pais: "Brasil",
  origem_estado: "Rio de Janeiro",
  origem_municipio: "Rio de Janeiro",
  destino_pais: "Brasil",
  destino_estado: "São Paulo",
  destino_municipio: "São Paulo",
  distancia: 430.50,                        // NUMERIC
  tem_paradas: "sim",                       // minúsculas
  num_paradas: "2",                         // Se tem_paradas="sim"
  
  // Modalidades (OBRIGATÓRIO)
  modos: ["rodoviario", "dutoviario"],      // ARRAY TEXT
  config_veiculo: "Caminhão tanque",
  
  // Características (OBRIGATÓRIOS)
  capacidade_utilizada: "85%",
  peso_carga: 25000.00,                     // NUMERIC
  unidade_peso: "toneladas",
  custo_transporte: 12500000.00,            // NUMERIC (em R$)
  valor_carga: 85000000.00,                 // NUMERIC (em R$)
  tipo_embalagem: "Granel líquido",
  carga_perigosa: "sim",                    // minúsculas
  
  // Tempo (OBRIGATÓRIOS)
  tempo_dias: 0,                            // INTEGER
  tempo_horas: 8,                           // INTEGER
  tempo_minutos: 30,                        // INTEGER
  
  // Frequência (OBRIGATÓRIOS)
  frequencia: "diaria",
  frequencia_diaria: "5-10 viagens",
  frequencia_outra: null,
  
  // Fatores Decisão (OBRIGATÓRIOS)
  importancia_custo: "muito-importante",
  variacao_custo: 15.50,                    // NUMERIC (%)
  importancia_tempo: "importante",
  variacao_tempo: 10.00,
  importancia_confiabilidade: "muito-importante",
  variacao_confiabilidade: 5.00,
  importancia_seguranca: "muito-importante",
  variacao_seguranca: 0.00,
  importancia_capacidade: "importante",
  variacao_capacidade: 20.00,
  
  // Estratégia (OBRIGATÓRIO)
  tipo_cadeia: "integrada",
  modais_alternativos: ["ferrovia", "cabotagem"],  // ARRAY TEXT
  fator_adicional: "Proximidade com porto de Santos",
  
  // Dificuldades (OPCIONAIS)
  dificuldades: ["infra-rodoviaria", "custo-pedagio"],  // ARRAY TEXT
  detalhe_dificuldade: "Rodovias em mau estado na região",
  
  // Observações (OPCIONAL)
  observacoes: "Empresa em processo de certificação ISO 14001"
}
```

---

## 📦 TABELA 4: `formulario_embarcadores.produtos_transportados`

### ✅ Campos Obrigatórios (NOT NULL):
1. `id_pesquisa` INTEGER - FK para pesquisas (CASCADE DELETE)
2. `id_empresa` INTEGER - FK para empresas
3. `carga` VARCHAR(255) - Nome da carga

### ✅ Campos Opcionais:
4. `movimentacao` NUMERIC(12,2) - Movimentação (toneladas/ano)
5. `origem` VARCHAR(255) - Local origem
6. `destino` VARCHAR(255) - Local destino
7. `distancia` NUMERIC(10,2) - Distância (km)
8. `modalidade` VARCHAR(50) - Modalidade
9. `acondicionamento` VARCHAR(100) - Tipo acondicionamento
10. `ordem` INTEGER DEFAULT 1 - Ordem importância

### 📝 PAYLOAD CORRETO:
```javascript
{
  id_pesquisa: 789,                         // OBRIGATÓRIO (vem do INSERT anterior)
  id_empresa: 123,                          // OBRIGATÓRIO
  carga: "Petróleo Bruto",                  // OBRIGATÓRIO
  movimentacao: 50000.00,                   // Opcional (NUMERIC)
  origem: "Rio de Janeiro/RJ",              // Opcional
  destino: "São Paulo/SP",                  // Opcional
  distancia: 430.50,                        // Opcional (NUMERIC)
  modalidade: "dutoviario",                 // Opcional (minúsculas)
  acondicionamento: "granel-liquido",       // Opcional (minúsculas)
  ordem: 1                                  // Opcional (default: 1)
}
```

---

## ⚠️ REGRAS CRÍTICAS:

### 1. **TIPO_EMPRESA - SEMPRE MINÚSCULAS:**
```javascript
✅ "embarcador"
✅ "transportador"
✅ "operador"
✅ "outro"
❌ "Embarcador"  // ERRO!
❌ "EMBARCADOR"  // ERRO!
```

### 2. **VALORES BOOLEANOS - SIM/NAO (minúsculas):**
```javascript
✅ tem_paradas: "sim"
✅ tem_paradas: "nao"
✅ tem_paradas: "nao-sei"
❌ tem_paradas: "Sim"      // ERRO!
❌ tem_paradas: true       // ERRO! (não é boolean, é string)
```

### 3. **ARRAYS - FORMATO TEXT[]:**
```javascript
✅ modos: ["rodoviario", "ferroviario"]
✅ dificuldades: ["infra-rodoviaria", "custo-pedagio"]
❌ modos: "rodoviario"                    // ERRO! (deve ser array)
❌ modos: '["rodoviario"]'                // ERRO! (não é string, é array)
```

### 4. **NUMERIC - SEM FORMATAÇÃO:**
```javascript
✅ distancia: 430.50
✅ custo_transporte: 12500000.00
❌ distancia: "430.50"                    // ERRO! (não é string)
❌ custo_transporte: "12.500.000,00"      // ERRO! (formatação brasileira)
```

### 5. **CNPJ - COM FORMATAÇÃO:**
```javascript
✅ cnpj: "33.000.167/0001-01"
❌ cnpj: "33000167000101"                 // Pode funcionar mas não é padrão
```

### 6. **CEP - SEM FORMATAÇÃO:**
```javascript
✅ cep: "20031170"
❌ cep: "20.031-170"                      // ERRO!
```

---

## 🎯 PAYLOAD MASTER COMPLETO (TODAS AS 3 TABELAS):

```javascript
{
  // ═══════════════════════════════════════════════════════
  // 1. EMPRESA
  // ═══════════════════════════════════════════════════════
  empresa: {
    nome_empresa: "PETRÓLEO BRASILEIRO S.A.",
    tipo_empresa: "embarcador",              // MINÚSCULAS!
    municipio: "São Paulo",                  // Nome completo
    outro_tipo: null,
    estado: "SP",
    cnpj: "33.000.167/0001-01",
    razao_social: "PETRÓLEO BRASILEIRO S.A.",
    nome_fantasia: "PETROBRAS",
    telefone: "(21) 3224-1234",
    email: "contato@petrobras.com.br",
    id_municipio: 3550308,
    logradouro: "Av. República do Chile",
    numero: "65",
    complemento: "Torre A",
    bairro: "Centro",
    cep: "20031170"                          // SEM formatação
  },
  
  // ═══════════════════════════════════════════════════════
  // 2. ENTREVISTADO
  // ═══════════════════════════════════════════════════════
  entrevistado: {
    nome: "João da Silva Santos",
    funcao: "Gerente de Logística",
    telefone: "(11) 98765-4321",
    email: "joao.silva@petrobras.com.br",    // Email válido
    principal: true
  },
  
  // ═══════════════════════════════════════════════════════
  // 3. PESQUISA
  // ═══════════════════════════════════════════════════════
  pesquisa: {
    tipo_responsavel: "entrevistador",       // MINÚSCULAS!
    id_responsavel: 1,
    produto_principal: "Petróleo Bruto",
    agrupamento_produto: "Combustíveis",
    outro_produto: null,
    tipo_transporte: "local",                // MINÚSCULAS!
    origem_pais: "Brasil",
    origem_estado: "Rio de Janeiro",
    origem_municipio: "Rio de Janeiro",
    destino_pais: "Brasil",
    destino_estado: "São Paulo",
    destino_municipio: "São Paulo",
    distancia: 430.50,                       // NUMERIC puro
    tem_paradas: "sim",                      // MINÚSCULAS!
    num_paradas: "2",
    modos: ["rodoviario", "dutoviario"],     // ARRAY!
    config_veiculo: "Caminhão tanque",
    capacidade_utilizada: "85%",
    peso_carga: 25000.00,                    // NUMERIC puro
    unidade_peso: "toneladas",
    custo_transporte: 12500000.00,           // NUMERIC puro
    valor_carga: 85000000.00,                // NUMERIC puro
    tipo_embalagem: "Granel líquido",
    carga_perigosa: "sim",                   // MINÚSCULAS!
    tempo_dias: 0,                           // INTEGER
    tempo_horas: 8,                          // INTEGER
    tempo_minutos: 30,                       // INTEGER
    frequencia: "diaria",
    frequencia_diaria: "5-10 viagens",
    frequencia_outra: null,
    importancia_custo: "muito-importante",
    variacao_custo: 15.50,                   // NUMERIC puro
    importancia_tempo: "importante",
    variacao_tempo: 10.00,
    importancia_confiabilidade: "muito-importante",
    variacao_confiabilidade: 5.00,
    importancia_seguranca: "muito-importante",
    variacao_seguranca: 0.00,
    importancia_capacidade: "importante",
    variacao_capacidade: 20.00,
    tipo_cadeia: "integrada",
    modais_alternativos: ["ferrovia", "cabotagem"],  // ARRAY!
    fator_adicional: "Proximidade porto Santos",
    dificuldades: ["infra-rodoviaria", "custo-pedagio"],  // ARRAY!
    detalhe_dificuldade: "Rodovias ruins",
    observacoes: "Empresa em certificação ISO 14001"
  },
  
  // ═══════════════════════════════════════════════════════
  // 4. PRODUTOS (ARRAY)
  // ═══════════════════════════════════════════════════════
  produtos_transportados: [
    {
      carga: "Petróleo Bruto",
      movimentacao: 50000.00,                // NUMERIC puro
      origem: "Rio de Janeiro/RJ",
      destino: "São Paulo/SP",
      distancia: 430.50,                     // NUMERIC puro
      modalidade: "dutoviario",              // MINÚSCULAS!
      acondicionamento: "granel-liquido",    // MINÚSCULAS!
      ordem: 1
    }
  ]
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO:

- [ ] `tipo_empresa` em minúsculas?
- [ ] `tem_paradas` em minúsculas (sim/nao/nao-sei)?
- [ ] `carga_perigosa` em minúsculas?
- [ ] `tipo_responsavel` em minúsculas?
- [ ] `tipo_transporte` em minúsculas?
- [ ] `modos` é ARRAY?
- [ ] `modais_alternativos` é ARRAY?
- [ ] `dificuldades` é ARRAY?
- [ ] Todos os NUMERICs sem formatação?
- [ ] CEP sem formatação (apenas números)?
- [ ] CNPJ com formatação (XX.XXX.XXX/XXXX-XX)?
- [ ] Email válido (regex)?
- [ ] Todos os campos obrigatórios preenchidos?
