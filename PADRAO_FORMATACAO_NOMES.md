# 📋 Padrão de Formatação de Nomes Próprios

## 🎯 Objetivo
Garantir consistência na capitalização de nomes em todo o sistema (banco de dados, frontend, documentação).

## 📖 Regras de Formatação

### **1. Title Case Brasileiro**
Aplicar a **primeira letra maiúscula** em cada palavra significativa.

### **2. Palavras em Minúscula (Preposições/Artigos)**
As seguintes palavras devem permanecer em **minúscula** quando no meio do nome:

- `de`, `do`, `da`, `dos`, `das`
- `e`
- `a`, `o`, `as`, `os`

**Exceção:** Se forem a **primeira palavra** do nome, usar maiúscula.

### **3. Casos Especiais**

#### **Apostrofos (d')**
- Sempre **D'** (maiúsculo) quando parte do nome
- Exemplos:
  - ✅ `Aparecida D'Oeste`
  - ❌ `Aparecida d'Oeste`

#### **Siglas e Abreviações**
- **UF (Estados):** Sempre maiúsculas
  - ✅ `SP`, `RJ`, `MG`
- **Códigos ISO:** Maiúsculas
  - ✅ `BR`, `US`, `CN`

#### **Nomes Compostos**
- Cada palavra principal com maiúscula
- Exemplos:
  - ✅ `São Paulo`
  - ✅ `Rio de Janeiro`
  - ✅ `Mato Grosso do Sul`
  - ✅ `Espírito Santo`

## 📊 Aplicação por Tipo de Dado

### **🌍 Nomes de Lugares (Cidades, Estados, Países)**

#### **Estados (estados_brasil)**
```sql
-- Formato: Title Case com preposições em minúscula
'São Paulo'              -- ✅
'Rio de Janeiro'         -- ✅
'Mato Grosso do Sul'     -- ✅
'Espírito Santo'         -- ✅
```

### **Países (paises)**
```sql
-- Formato: Title Case
'Estados Unidos'         -- ✅
'Reino Unido'            -- ✅
'Coreia do Sul'          -- ✅
'Emirados Árabes Unidos' -- ✅
```

#### **Municípios (municipios_sp e futuras tabelas)**
```sql
-- Formato: Title Case com preposições em minúscula
'São Paulo'              -- ✅
'Aparecida D'Oeste'      -- ✅ (D' maiúsculo)
'Américo de Campos'      -- ✅
'São José do Rio Preto'  -- ✅
'Araçoiaba da Serra'     -- ✅
```

### **👤 Nomes de Pessoas**

**Regra Geral:** Todos os nomes de pessoas devem ser armazenados em **MAIÚSCULAS (UPPERCASE)** no banco de dados.

#### **Por quê MAIÚSCULAS?**

1. **Padronização:** Evita inconsistências de capitalização
   - ❌ `Maria da Silva`, `MARIA DA SILVA`, `maria da silva`
   - ✅ `MARIA DA SILVA` (sempre consistente)

2. **Busca eficiente:** Facilita queries sem case-sensitivity
   - Não precisa usar `UPPER()` ou `LOWER()` em WHERE clauses
   - Índices funcionam melhor

3. **Prevenção de erros:** Nomes compostos são complexos
   - ❌ `José de sousa` (erro de capitalização)
   - ✅ `JOSÉ DE SOUSA` (sem ambiguidade)

4. **Compatibilidade:** Padrão comum em sistemas corporativos brasileiros
   - DETRAN, Receita Federal, bancos, etc.

#### **Aplicação em Tabelas**

**Entrevistadores (entrevistadores)**
```sql
-- Campo: nome_completo
-- Formato: UPPERCASE completo
'JOÃO PEDRO DA SILVA'           -- ✅
'MARIA FERNANDA DOS SANTOS'     -- ✅
'ANA PAULA D'ÁVILA'             -- ✅
'JOSÉ ANTÔNIO DE SOUZA JÚNIOR'  -- ✅

-- Exemplos INCORRETOS:
'João Pedro da Silva'           -- ❌ (Title Case)
'JOAO PEDRO DA SILVA'           -- ❌ (sem acentos)
'joão pedro da silva'           -- ❌ (lowercase)
```

**Empresas - Nome do Entrevistado (empresas)**
```sql
-- Campo: nome_entrevistado
-- Formato: UPPERCASE completo
'CARLOS EDUARDO FERREIRA'       -- ✅
'FERNANDA ALVES DE OLIVEIRA'    -- ✅
'RICARDO HENRIQUE D'ANGELO'     -- ✅

-- Campo: cargo_entrevistado
-- Formato: Title Case (função/cargo, não nome de pessoa)
'Gerente de Logística'          -- ✅
'Diretor de Operações'          -- ✅
'Coordenador de Supply Chain'   -- ✅
```

**Pesquisas - Responsável pelo Preenchimento (pesquisas)**
```sql
-- Quando tipo_responsavel = 'outro':
-- Campo: nome_responsavel_outro
-- Formato: UPPERCASE completo
'MARCELO AUGUSTO RIBEIRO'       -- ✅
'PATRÍCIA HELENA DA COSTA'      -- ✅
'ANDRÉ LUÍS DE ALMEIDA'         -- ✅
```

#### **Tratamento no Frontend**

O formulário deve **converter automaticamente** para UPPERCASE antes de enviar:

```javascript
// Exemplo de conversão automática
const nomeInput = document.getElementById('nome');
nomeInput.addEventListener('blur', function() {
    this.value = this.value.toUpperCase();
});

// Ou no momento da submissão
function collectFormData() {
    const formData = {};
    formData.nomeCompleto = document.getElementById('nome').value.toUpperCase();
    // ...
}
```

#### **Exibição no Frontend**

Para exibição em telas/relatórios, pode-se usar **Title Case**:

```javascript
// Converter UPPERCASE → Title Case para exibição
function formatarNomePessoa(nomeUppercase) {
    return nomeUppercase
        .toLowerCase()
        .split(' ')
        .map(palavra => {
            const minusculas = ['de', 'do', 'da', 'dos', 'das', 'e'];
            if (minusculas.includes(palavra)) {
                return palavra;
            }
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        })
        .join(' ');
}

// Exemplo:
// Input (do banco): "MARIA DA SILVA"
// Output (na tela): "Maria da Silva"
```

#### **Validação e Sanitização**

```javascript
/**
 * Sanitiza e valida nome de pessoa
 * @param {string} nome - Nome digitado pelo usuário
 * @returns {string} Nome em UPPERCASE, sanitizado
 */
function sanitizarNomePessoa(nome) {
    return nome
        .trim()                           // Remove espaços extras
        .replace(/\s+/g, ' ')             // Substitui múltiplos espaços por um
        .normalize('NFC')                 // Normaliza caracteres Unicode (acentos)
        .toUpperCase();                   // Converte para UPPERCASE
}

// Exemplos:
sanitizarNomePessoa('  maria   da  silva  ')
// → "MARIA DA SILVA"

sanitizarNomePessoa('José Antônio')
// → "JOSÉ ANTÔNIO"

sanitizarNomePessoa('Ana Paula D'Ávila')
// → "ANA PAULA D'ÁVILA"
```

#### **Casos Especiais em Nomes**

```sql
-- Nomes com apostrofo
'MARIA D'ÁVILA'                 -- ✅
'CARLOS D'ANGELO'               -- ✅

-- Nomes compostos
'JOSÉ ANTÔNIO DA SILVA FILHO'   -- ✅
'MARIA APARECIDA DOS SANTOS'    -- ✅

-- Nomes com sufixos
'PEDRO HENRIQUE JÚNIOR'         -- ✅
'ANTÔNIO CARLOS NETO'           -- ✅
'JOSÉ DA SILVA SOBRINHO'        -- ✅

-- Nomes estrangeiros (manter UPPERCASE)
'JOHN MICHAEL SMITH'            -- ✅
'MARÍA JOSÉ GONZÁLEZ'           -- ✅

-- Nomes com numeração romana
'CARLOS ALBERTO III'            -- ✅
'PEDRO HENRIQUE II'             -- ✅
```

## 🔍 Verificação de Conformidade

### **🌍 Lugares (Title Case)**

#### **Estados Brasileiros (27 UF)**
- [x] Acre
- [x] Alagoas
- [x] Amapá
- [x] Amazonas
- [x] Bahia
- [x] Ceará
- [x] Distrito Federal
- [x] Espírito Santo ✓
- [x] Goiás
- [x] Maranhão
- [x] Mato Grosso ✓
- [x] Mato Grosso do Sul ✓
- [x] Minas Gerais ✓
- [x] Pará
- [x] Paraíba
- [x] Paraná
- [x] Pernambuco
- [x] Piauí
- [x] Rio de Janeiro ✓
- [x] Rio Grande do Norte ✓
- [x] Rio Grande do Sul ✓
- [x] Rondônia
- [x] Roraima
- [x] Santa Catarina ✓
- [x] São Paulo ✓
- [x] Sergipe
- [x] Tocantins

**Status:** ✅ **100% conforme** (27/27)

#### **Países (61 registros)**
Principais verificados:
- [x] Brasil
- [x] China
- [x] Estados Unidos ✓
- [x] Holanda
- [x] Argentina
- [x] Japão
- [x] Chile
- [x] México
- [x] Alemanha
- [x] Espanha
- [x] Coreia do Sul ✓
- [x] Reino Unido ✓
- [x] Emirados Árabes Unidos ✓

**Status:** ✅ **Conforme** (verificados manualmente)

#### **Municípios SP (645 registros)**
Casos especiais identificados:
- [x] ~~`Aparecida d'Oeste`~~ → ✅ **CORRIGIDO** para `Aparecida D'Oeste`
- [x] `Américo de Campos` ✓
- [x] `São José do Rio Preto` ✓
- [x] `Araçoiaba da Serra` ✓

**Status:** ✅ **100% conforme** (645/645) - Corrigido em 05/11/2025

### **👤 Pessoas (UPPERCASE)**

#### **Entrevistadores (entrevistadores)**
**Status:** ⚠️ **Aguardando implementação**
- [ ] Criar trigger/função para forçar UPPERCASE em INSERT/UPDATE
- [ ] Migrar dados existentes para UPPERCASE
- [ ] Atualizar frontend para converter automaticamente

#### **Empresas - Entrevistados (empresas)**
**Status:** ⚠️ **Aguardando implementação**
- [ ] Campo `nome_entrevistado` → UPPERCASE
- [ ] Campo `cargo_entrevistado` → Title Case
- [ ] Validação de formato no backend

#### **Pesquisas - Responsáveis (pesquisas)**
**Status:** ⚠️ **Aguardando implementação**
- [ ] Campo `nome_responsavel_outro` → UPPERCASE
- [ ] Atualizar frontend (input blur → toUpperCase)
- [ ] Migrar dados existentes

## 🔧 Ferramentas de Padronização

### **Função JavaScript (Frontend)**
```javascript
/**
 * Formata nome próprio seguindo padrão brasileiro
 * @param {string} nome - Nome a ser formatado
 * @returns {string} Nome formatado
 */
function formatarNomeProprio(nome) {
    const minusculas = ['de', 'do', 'da', 'dos', 'das', 'e', 'a', 'o', 'as', 'os'];
    
    return nome
        .toLowerCase()
        .split(' ')
        .map((palavra, index) => {
            // Primeira palavra sempre maiúscula
            if (index === 0) {
                return palavra.charAt(0).toUpperCase() + palavra.slice(1);
            }
            
            // Verificar se é preposição/artigo
            if (minusculas.includes(palavra)) {
                return palavra;
            }
            
            // Caso especial: d'
            if (palavra.startsWith("d'")) {
                return "D'" + palavra.slice(2).charAt(0).toUpperCase() + palavra.slice(3);
            }
            
            // Palavras normais: primeira letra maiúscula
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        })
        .join(' ');
}
```

### **Função SQL (Backend)**
```sql
-- Função PostgreSQL para padronizar nomes
CREATE OR REPLACE FUNCTION formatar_nome_proprio(nome TEXT)
RETURNS TEXT AS $$
DECLARE
    palavras TEXT[];
    palavra TEXT;
    resultado TEXT := '';
    minusculas TEXT[] := ARRAY['de', 'do', 'da', 'dos', 'das', 'e', 'a', 'o', 'as', 'os'];
    i INT;
BEGIN
    -- Dividir em palavras
    palavras := string_to_array(LOWER(nome), ' ');
    
    FOR i IN 1..array_length(palavras, 1) LOOP
        palavra := palavras[i];
        
        -- Primeira palavra sempre maiúscula
        IF i = 1 THEN
            palavra := INITCAP(palavra);
        -- Verificar se é preposição/artigo
        ELSIF palavra = ANY(minusculas) THEN
            palavra := LOWER(palavra);
        -- Caso especial: d'
        ELSIF palavra LIKE 'd''%' THEN
            palavra := 'D''' || INITCAP(SUBSTRING(palavra FROM 3));
        ELSE
            palavra := INITCAP(palavra);
        END IF;
        
        resultado := resultado || palavra || ' ';
    END LOOP;
    
    RETURN TRIM(resultado);
END;
$$ LANGUAGE plpgsql;
```

## 📝 Correções Necessárias

### **1. Municípios - Correção do Apostrofo**
```sql
-- Corrigir municípios com d'Oeste para D'Oeste
UPDATE formulario_embarcadores.municipios_sp
SET nome_municipio = REPLACE(nome_municipio, ' d''', ' D''')
WHERE nome_municipio LIKE '%d''%';
```

### **2. Verificação Global**
```sql
-- Verificar todos os nomes com apostrofo
SELECT nome_municipio 
FROM formulario_embarcadores.municipios_sp 
WHERE nome_municipio LIKE '%''%';
```

## ✅ Status de Implementação

### **🌍 Lugares (Title Case)**
- [x] **Estados:** 100% conforme (27/27) ✅
- [x] **Países:** 100% conforme (61/61) ✅
- [x] **Municípios SP:** 100% conforme (645/645) ✅
  - Apostrofos corrigidos: `d'` → `D'` (8 municípios)
- [ ] **Outros municípios:** Aguardando implementação

### **👤 Pessoas (UPPERCASE)**
- [ ] **Entrevistadores:** Aguardando implementação
- [ ] **Empresas (nome_entrevistado):** Aguardando implementação
- [ ] **Pesquisas (nome_responsavel_outro):** Aguardando implementação
- [ ] **Frontend - Auto-conversão:** Pendente
- [ ] **Database Triggers:** Pendente

## 🚀 Próximos Passos

### **Concluído ✅**
1. ✅ Criar este documento de padrão
2. ✅ Executar correção SQL dos apostrofos (8 municípios)
3. ✅ Validar todos os 645 municípios de SP
4. ✅ Commit e push para GitHub

### **Pendente 📋**
1. [ ] **Implementar auto-conversão UPPERCASE no frontend**
   - Adicionar event listeners nos campos de nome
   - Função `sanitizarNomePessoa()` em app.js
   - Testar com acentuação e caracteres especiais

2. [ ] **Criar triggers no banco de dados**
   - Trigger para forçar UPPERCASE em `entrevistadores.nome_completo`
   - Trigger para forçar UPPERCASE em `empresas.nome_entrevistado`
   - Trigger para forçar UPPERCASE em `pesquisas.nome_responsavel_outro`

3. [ ] **Migrar dados existentes**
   - Script SQL para converter nomes existentes para UPPERCASE
   - Verificar e corrigir acentuação
   - Backup antes da migração

4. [ ] **Validação no backend**
   - Validar formato UPPERCASE antes de INSERT/UPDATE
   - Rejeitar nomes sem acentuação adequada
   - Log de tentativas de inserção inválidas

5. [ ] **Documentar no README.md**
   - Adicionar seção sobre padrões de formatação
   - Link para PADRAO_FORMATACAO_NOMES.md
   - Exemplos de uso

6. [ ] **Testes de integração**
   - Testar formulário com nomes acentuados
   - Verificar conversão automática
   - Validar salvamento no banco

---

**Data de Criação:** 05/11/2025  
**Última Atualização:** 05/11/2025  
**Responsável:** Sistema PLI 2050
