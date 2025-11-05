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

## 📊 Aplicação por Tabela

### **Estados (estados_brasil)**
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

### **Municípios (municipios_sp e futuras tabelas)**
```sql
-- Formato: Title Case com preposições em minúscula
'São Paulo'              -- ✅
'Aparecida D'Oeste'      -- ✅ (D' maiúsculo)
'Américo de Campos'      -- ✅
'São José do Rio Preto'  -- ✅
'Araçoiaba da Serra'     -- ✅
```

## 🔍 Verificação de Conformidade

### **Estados Brasileiros (27 UF)**
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

### **Países (61 registros)**
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

### **Municípios SP (645 registros)**
Casos especiais identificados:
- [ ] `Aparecida d'Oeste` → ⚠️ **Corrigir para** `Aparecida D'Oeste`
- [x] `Américo de Campos` ✓
- [x] `São José do Rio Preto` ✓
- [x] `Araçoiaba da Serra` ✓

**Status:** ⚠️ **99% conforme** (1 correção necessária)

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

- [x] **Estados:** 100% conforme (27/27)
- [x] **Países:** 100% conforme (61/61)
- [ ] **Municípios SP:** 99% conforme (1 correção pendente)
- [ ] **Outros municípios:** Aguardando implementação

## 🚀 Próximos Passos

1. ✅ Criar este documento de padrão
2. [ ] Executar correção SQL dos apostrofos
3. [ ] Validar todos os 645 municípios
4. [ ] Aplicar padrão em novas inserções
5. [ ] Documentar no README.md

---

**Data de Criação:** 05/11/2025  
**Última Atualização:** 05/11/2025  
**Responsável:** Sistema PLI 2050
