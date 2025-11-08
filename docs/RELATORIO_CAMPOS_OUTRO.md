# 📋 Relatório: Campos com Opção "Outro/Outra" no Formulário

**Data**: 06/11/2025  
**Sistema**: PLI 2050 - Sistema de Formulários de Entrevistas  
**Análise**: Varredura completa identificando campos com valores "outro", "outra" ou similares

---

## 🎯 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Total de campos identificados** | 4 |
| **Campos implementados** | 3 (75%) |
| **Campos pendentes** | 1 (25%) |
| **Campos principais do formulário** | 3 |
| **Campos na tabela dinâmica** | 1 |

---

## ✅ Campos Implementados (3/4)

### 1️⃣ **Questão 5: Tipo de Empresa**

**Localização**: Card 2 - Dados da Empresa  
**Campo ID**: `tipo-empresa`  
**Valor trigger**: `"outro"`  
**Campo condicional**: `outro-tipo` (input text)  
**Container**: `outro-tipo-container`

**Status**: ✅ **IMPLEMENTADO**

**Detalhes técnicos**:
- Linha HTML: 140-155 (`index.html`)
- Lógica JavaScript: Linha 123-124 (`form.js`)
- Comportamento: Exibe input text inline quando usuário seleciona "Outro"
- Campo obrigatório quando "Outro" é selecionado

**Opções do dropdown**:
- Embarcador (dono da carga)
- Transportador (prestador de serviços de transporte)
- Operador logístico (gestão e integração de serviços)
- **→ Outro** *(trigger)*

**Código JavaScript**:
```javascript
if (data.tipoEmpresa === 'outro') {
    data.outroTipo = this._getValue('outro-tipo');
}
```

---

### 2️⃣ **Questão 9: Agrupamento de Produto Principal**

**Localização**: Card 4 - Produto/Carga Principal  
**Campo ID**: `agrupamento-produto`  
**Valor trigger**: `"outro-produto"`  
**Campo condicional**: `outro-produto` (input text)  
**Container**: `outro-produto-container`

**Status**: ✅ **IMPLEMENTADO**

**Detalhes técnicos**:
- Linha HTML: 295-315 (`index.html`)
- Lógica JavaScript: Linha 143-144 (`form.js`)
- Comportamento: Exibe campo em nova linha quando usuário seleciona "Outro"
- Campo obrigatório quando "Outro" é selecionado

**Opções do dropdown** (31 categorias + "Outro"):
- Açúcar
- Adubos e fertilizantes
- Algodão
- Café
- Cimento e cal
- ... *(27 opções intermediárias)*
- **→ Outro** *(trigger)*

**Código JavaScript**:
```javascript
if (data.agrupamentoProduto === 'outro-produto') {
    data.outroProduto = this._getValue('outro-produto');
}
```

---

### 3️⃣ **Questão 27: Frequência de Deslocamento**

**Localização**: Card 6 - Operação de Transporte  
**Campo ID**: `frequencia`  
**Valor trigger**: `"outra"`  
**Campo condicional**: `frequencia-outra` (input text)  
**Container**: `frequencia-outra-container`

**Status**: ✅ **IMPLEMENTADO**

**Detalhes técnicos**:
- Linha HTML: 510-530 (`index.html`)
- Lógica JavaScript: Linha 185-186 (`form.js`)
- Comportamento: Exibe input text inline quando usuário seleciona "Outra"
- Campo obrigatório quando "Outra" é selecionada

**Opções do dropdown**:
- Diária
- Mais de 1x por semana
- 1x por semana
- 1x por mês
- Eventual
- **→ Outra** *(trigger)*

**Código JavaScript**:
```javascript
if (data.frequencia === 'outra') {
    data.frequenciaOutra = this._getValue('frequencia-outra');
}
```

---

## ❌ Campos Pendentes (1/4)

### 4️⃣ **Questão 8: Acondicionamento na Tabela de Produtos**

**Localização**: Tabela Dinâmica de Produtos Transportados  
**Campo ID**: `produto-acondicionamento-{N}` (N = número da linha)  
**Valor trigger**: `"outro"`  
**Campo condicional**: ⚠️ **NÃO EXISTE** (precisa ser criado)

**Status**: ❌ **NÃO IMPLEMENTADO**

**Detalhes técnicos**:
- Linha código: 479-491 (`form.js`)
- Comportamento atual: Permite selecionar "Outro" mas não há campo para especificar
- **PROBLEMA**: Usuário não consegue especificar qual tipo de acondicionamento

**Opções do dropdown**:
- Granel sólido
- Granel líquido
- Paletizado
- Container
- Big bag
- Caixas
- Sacaria
- **→ Outro** *(trigger SEM campo condicional)* ⚠️

**Código HTML atual** (linha 476-491 em `form.js`):
```javascript
<td>
    <select name="produto-acondicionamento-${currentCounter}" class="table-input">
        <option value="">Selecione...</option>
        <option value="granel-solido">Granel sólido</option>
        <option value="granel-liquido">Granel líquido</option>
        <option value="paletizado">Paletizado</option>
        <option value="container">Container</option>
        <option value="big-bag">Big bag</option>
        <option value="caixas">Caixas</option>
        <option value="sacaria">Sacaria</option>
        <option value="outro">Outro</option>  <!-- ⚠️ SEM CAMPO CONDICIONAL -->
    </select>
</td>
```

**Sugestão de implementação**:
1. Adicionar `<div>` condicional dentro do `<td>`
2. Criar input text `produto-acondicionamento-outro-{N}`
3. Adicionar função JavaScript `handleProdutoAcondicionamentoChange(rowId)`
4. Controlar visibilidade do campo com `style.display`

**Exemplo de código sugerido**:
```javascript
<td>
    <select name="produto-acondicionamento-${currentCounter}" 
            class="table-input" 
            onchange="handleProdutoAcondicionamentoChange(${currentCounter})">
        <!-- opções -->
    </select>
    <input type="text" 
           name="produto-acondicionamento-outro-${currentCounter}" 
           class="table-input produto-acondicionamento-outro" 
           placeholder="Especifique o tipo de acondicionamento"
           style="display:none; margin-top:4px;">
</td>
```

---

## 📊 Análise de Padrões

### Padrão de Implementação Atual

Todos os 3 campos implementados seguem o mesmo padrão:

```javascript
// 1. HTML: Campo condicional oculto por padrão
<div class="hidden-field hidden-field-spaced" id="CAMPO-container">
    <label for="CAMPO">Especifique:</label>
    <input type="text" id="CAMPO" name="CAMPO">
</div>

// 2. JavaScript: Coleta condicional de dados
if (data.campoOriginal === 'outro' || data.campoOriginal === 'outra') {
    data.campoCondicional = this._getValue('CAMPO');
}

// 3. CSS: Classe .hidden-field controla visibilidade
.hidden-field {
    display: none;
}
```

### Inconsistências Identificadas

| Campo | Container CSS | Visibilidade | Integrado ao Payload |
|-------|---------------|--------------|----------------------|
| Q5 - Tipo Empresa | ✅ Usa `.hidden-field` | ✅ Inline | ✅ Sim |
| Q9 - Produto | ✅ Usa `.hidden-field` | ✅ Nova linha | ✅ Sim |
| Q27 - Frequência | ✅ Usa `.hidden-field` | ✅ Inline | ✅ Sim |
| Q8 - Acondicionamento | ❌ Não existe | ❌ N/A | ❌ Não |

---

## 🚨 Falsos Positivos Identificados

Durante a varredura, os seguintes termos foram encontrados mas **NÃO são campos "outro/outra"**:

| Termo | Contexto | Tipo |
|-------|----------|------|
| `outras-cgc` | "Outras CGC" | Nome de categoria de produto |
| `outros-gl` | "Outros GL" | Nome de categoria de produto |
| `outras-cgnc` | "Outras CGNC" | Nome de categoria de produto |
| `outros-gsm` | "Outros GSM" | Nome de categoria de produto |
| "outros alimentos" | "Laticínios e outros alimentos" | Parte do nome da opção |
| "outras dificuldades" | Campo de texto livre Q43 | Texto informativo no label |

Estes NÃO geram campos condicionais e são apenas nomes descritivos de categorias.

---

## 📝 Recomendações

### Prioridade ALTA ⚠️

1. **Implementar campo condicional para Q8 - Acondicionamento**
   - Criar input text condicional na tabela dinâmica
   - Adicionar função JavaScript de controle
   - Testar coleta de dados no payload

### Prioridade MÉDIA

2. **Padronizar nomenclatura**
   - Campos usam `"outro"` (Q5, Q8-tabela)
   - Campos usam `"outra"` (Q27)
   - Considerar padronizar para sempre `"outro"` independente do gênero

3. **Documentar padrão de implementação**
   - Criar guia para futuros campos condicionais
   - Especificar convenções de nomenclatura
   - Exemplo de código reutilizável

### Prioridade BAIXA

4. **Validação de campos condicionais**
   - Garantir que campo "especifique" seja obrigatório quando "outro/outra" selecionado
   - Adicionar validação visual (borda vermelha)
   - Mensagem de erro clara

---

## 🧪 Checklist de Testes

### Campos Implementados (3)

- [ ] **Q5 - Tipo de Empresa**
  - [ ] Selecionar "Outro" mostra campo de texto
  - [ ] Campo aceita texto livre
  - [ ] Valor é coletado no payload corretamente
  - [ ] Campo desaparece ao mudar seleção

- [ ] **Q9 - Agrupamento de Produto**
  - [ ] Selecionar "Outro" mostra campo de texto
  - [ ] Campo aceita texto livre
  - [ ] Valor é coletado no payload corretamente
  - [ ] Campo desaparece ao mudar seleção

- [ ] **Q27 - Frequência**
  - [ ] Selecionar "Outra" mostra campo de texto
  - [ ] Campo aceita texto livre
  - [ ] Valor é coletado no payload corretamente
  - [ ] Campo desaparece ao mudar seleção

### Campos Pendentes (1)

- [ ] **Q8 - Acondicionamento (Tabela)**
  - [ ] Implementar campo condicional
  - [ ] Testar em múltiplas linhas da tabela
  - [ ] Verificar coleta no array de produtos
  - [ ] Garantir ID único por linha

---

## 📌 Notas Adicionais

- Todos os campos condicionais devem ser **opcionais** a menos que explicitamente requeridos
- Campos condicionais não aparecem se opção "outro/outra" não for selecionada
- JavaScript controla visibilidade via `style.display = 'block'/'none'`
- CSS `.hidden-field` define `display: none` como padrão

---

**Relatório gerado por**: GitHub Copilot  
**Última atualização**: 06/11/2025 18:15
