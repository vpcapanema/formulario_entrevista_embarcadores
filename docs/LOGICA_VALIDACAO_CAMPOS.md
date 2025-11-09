# Lógica de Disparo de Validação - Sistema PLI 2050

## 📋 Visão Geral

O sistema utiliza o **FormValidator** (`frontend/js/form-validator.js`) com validação **100% INSTANTÂNEA** em todos os campos.

⚡ **MUDANÇA CRÍTICA (09/11/2025)**: Validação agora é **totalmente automática** - sem necessidade de sair do campo (onBlur removido).

---

## 🔧 Inicialização Automática

### Quando ocorre:
```javascript
// Linha 796-800 do form-validator.js
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        FormValidator.init();
    });
} else {
    FormValidator.init();
}
```

### O que acontece:
1. **Carrega mapeamento de 66 campos** (fieldValidators)
2. **Registra 3 grupos de checkboxes** (modos, dificuldades, modais_alternativos)
3. **Anexa listeners INSTANTÂNEOS em todos os campos** (attachBlurListeners)
4. **Pronto para validar!** ✅

---

## 🎯 5 Tipos de Disparo de Validação (TODOS INSTANTÂNEOS)

### 1️⃣ Validação **onChange** (SELECTs - IMEDIATA)

**Quando dispara:**
- Usuário seleciona uma opção no dropdown
- **Imediatamente** após a seleção (sem esperar blur)

**Função executada:**
```javascript
// Linha 200-204
if (field.tagName === 'SELECT') {
    field.addEventListener('change', (e) => {
        console.log(`⚡ Validação instantânea (onChange) do campo: ${fieldId}`);
        this.validateFieldFormat(fieldId);
    });
}
```

**O que valida:**
- ✅ **APENAS FORMATO** (estrutura do dado)
- ❌ **NÃO valida obrigatório**

**Comportamento:**
```javascript
// Linha 295-301
const value = field.value.trim();

// Campo VAZIO → Não valida (ignora)
if (!value) {
    this.clearValidation(fieldId);
    return true;
}

// Campo PREENCHIDO → Valida APENAS o formato
```

**Exemplos:**
- **Email vazio**: Não mostra erro ✅
- **Email "teste"**: Borda laranja + "Formato inválido" ⚠️
- **Email "teste@email.com"**: Borda verde + checkmark ✅

**Aplicado a:**
- ✅ Todos os campos `<input>` (text, email, tel, number)
- ✅ Todos os campos `<select>`
- ✅ Todos os campos `<textarea>`

---

### 2️⃣ Validação **onChange** (SELECTs - instantânea)

**Quando dispara:**
- Usuário seleciona uma opção no dropdown
- Imediatamente após a seleção

**Função executada:**
```javascript
// Linha 200-204
if (field.tagName === 'SELECT') {
    field.addEventListener('change', (e) => {
        console.log(`⚡ Validação instantânea do select: ${fieldId}`);
        this.validateFieldFormat(fieldId);
    });
}
```

**O que valida:**
- ✅ **APENAS FORMATO**
- ❌ **NÃO valida obrigatório**

**Comportamento:**
- Usuário seleciona opção → Validação imediata
- Feedback visual instantâneo (borda verde)

**Aplicado a:**
```
✅ id-entrevistador
✅ funcao
✅ tipo-empresa
✅ agrupamento-produto
✅ tipo-transporte
✅ origem-pais / destino-pais
✅ origem-estado / destino-estado
✅ origem-municipio / destino-municipio
✅ tem-paradas
✅ num-paradas
✅ config-veiculo
✅ unidade-peso / unidade-tempo
✅ tipo-cadeia
✅ importancia_custo / importancia_tempo / etc.
✅ variacao_custo / variacao_tempo / etc.
```

---

### 2️⃣ Validação **onInput** (INPUTs - após 3 caracteres)

**Quando dispara:**
- Após usuário digitar **3 ou mais caracteres**
- **A cada tecla pressionada** (depois de atingir 3 chars)
- **NÃO ESPERA BLUR** - validação acontece enquanto digita

**Função executada:**
```javascript
// Linha 221-232
if (field.tagName === 'INPUT' && 
    (field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number')) {
    field.addEventListener('input', (e) => {
        const value = field.value.trim();
        if (value.length >= 3) {
            console.log(`⚡ Validação instantânea (onInput 3+ chars) do campo: ${fieldId}`);
            this.validateFieldFormat(fieldId);
        } else if (value.length === 0) {
            // Limpa validação quando campo é esvaziado
            this.clearValidation(fieldId);
        }
    });
}
```

**O que valida:**
- ✅ **APENAS FORMATO**
- ❌ **NÃO valida obrigatório**

**Comportamento progressivo:**
| Chars Digitados | Ação                                    |
|-----------------|-----------------------------------------|
| 0               | Sem validação (limpo)                   |
| 1-2             | Sem validação (aguardando)              |
| 3+              | Valida formato a cada tecla             |
| Apagou tudo (0) | Limpa validação (remove classes/mensagens) |

**Exemplo (campo email):**
```
Digita: "t"        → Nada acontece
Digita: "te"       → Nada acontece
Digita: "tes"      → ⚡ Valida! → Borda laranja (formato inválido)
Digita: "teste"    → ⚡ Valida! → Borda laranja (formato inválido)
Digita: "teste@"   → ⚡ Valida! → Borda laranja (formato inválido)
Digita: "teste@e"  → ⚡ Valida! → Borda laranja (formato inválido)
Digita: "teste@email.com" → ⚡ Valida! → Borda verde ✅
Apaga tudo         → Limpa validação (sem borda)
```

**Aplicado a:**
```
✅ nome
✅ outra-funcao
✅ telefone
✅ email
✅ cnpj-empresa
✅ razao-social
✅ municipio-empresa
✅ produto-principal
✅ outro-produto
✅ distancia
✅ num-paradas-exato
✅ capacidade-utilizada
✅ peso-carga
✅ custo-transporte
✅ valor-carga
✅ tipo-embalagem
✅ tempo-dias / tempo-horas / tempo-minutos
✅ fator-adicional
✅ detalhe-dificuldade
✅ observacoes
```

---

### 3️⃣ Validação **onInput** (TEXTAREAs - após 3 caracteres)

**Quando dispara:**
- Após usuário digitar **3 ou mais caracteres**
- **A cada tecla pressionada** (depois de atingir 3 chars)
- **NÃO ESPERA BLUR** - validação acontece enquanto digita

**Função executada:**
```javascript
// Linha 246-256
else if (field.tagName === 'TEXTAREA') {
    field.addEventListener('input', (e) => {
        const value = field.value.trim();
        if (value.length >= 3) {
            console.log(`⚡ Validação instantânea (onInput 3+ chars) do textarea: ${fieldId}`);
            this.validateFieldFormat(fieldId);
        } else if (value.length === 0) {
            this.clearValidation(fieldId);
        }
    });
}
```

**O que valida:**
- ✅ **APENAS FORMATO**
- ❌ **NÃO valida obrigatório**

**Aplicado a:**
```
✅ observacoes
✅ detalhe-dificuldade
✅ fator-adicional
```

---

### 4️⃣ Validação **onChange** (RADIO BUTTONS - IMEDIATA)

**Quando dispara:**
- Usuário marca um botão de rádio
- **Imediatamente** ao marcar (sem esperar blur)

**Função executada:**
```javascript
// Linha 236-240
else if (field.tagName === 'INPUT' && field.type === 'radio') {
    field.addEventListener('change', (e) => {
        console.log(`⚡ Validação instantânea (onChange) do radio: ${field.name}`);
        this.validateFieldFormat(fieldId);
    });
}
```

**Aplicado a:**
```
✅ tem-paradas (sim/não)
✅ carga-perigosa (sim/não)
```

---

### 5️⃣ Validação **onChange** (CHECKBOXES - IMEDIATA)

**Quando dispara:**
- Usuário marca ou desmarca um checkbox
- **Imediatamente** ao clicar (sem esperar blur)

**Função executada:**
```javascript
// Linha 263-270
for (const groupName in this.checkboxGroups) {
    const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log(`⚡ Validação instantânea (onChange) do checkbox group: ${groupName}`);
            this.validateCheckboxGroupFormat(groupName);
        });
    });
}
```

**O que valida:**
```javascript
// Linha 398-405
validateCheckboxGroupFormat: function(groupName) {
    // No caso de checkboxes, formato é sempre válido
    // Apenas limpa validação anterior
    const container = document.querySelector(`input[name="${groupName}"]`)?.closest('.checkbox-group');
    if (container) {
        container.classList.remove('checkbox-group-error');
        this.removeCheckboxGroupMessage(groupName);
    }
    return true;
}
```

**Comportamento:**
- Marca checkbox → Remove erro visual (se existia)
- Desmarca checkbox → Remove erro visual (se existia)
- **NÃO valida quantidade mínima** (só no submit)

**Grupos configurados:**
```javascript
// Linha 145-156
checkboxGroups: {
    'modos': {
        required: true,
        min: 1,
        message: 'Selecione pelo menos um modo de transporte'
    },
    'dificuldades': {
        required: false,
        min: 0
    },
    'modais-alternativos': {
        required: false,
        min: 0
    }
}
```

---

### 6️⃣ Validação **onSubmit** (ao salvar formulário)

**Quando dispara:**
- Usuário clica no botão **"💾 Salvar Respostas"**
- Antes de enviar para o backend

**Função executada:**
```javascript
// Linha 277-290
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Bloqueia envio automático
    const isValid = this.validateAllFields();
    
    if (isValid) {
        console.log('✅ Formulário válido! Prosseguindo com envio...');
        if (typeof handleFormSubmit === 'function') {
            handleFormSubmit(e);
        }
    } else {
        console.log('❌ Formulário com erros. Corrija os campos destacados.');
        this.scrollToFirstError();
    }
});
```

**O que valida:**
- ✅ **FORMATO** (estrutura do dado)
- ✅ **OBRIGATÓRIO** (campo vazio quando required=true)

**Validação completa:**
```javascript
// Linha 587-620
validateAllFields: function() {
    let allValid = true;
    let invalidFields = [];

    // 1. Valida TODOS os 66 campos normais
    for (const fieldId in this.fieldValidators) {
        const isValid = this.validateField(fieldId); // validateField, não validateFieldFormat
        if (!isValid) {
            allValid = false;
            invalidFields.push(fieldId);
        }
    }

    // 2. Valida grupos de checkboxes (quantidade mínima)
    for (const groupName in this.checkboxGroups) {
        const isValid = this.validateCheckboxGroup(groupName);
        if (!isValid) {
            allValid = false;
            invalidFields.push(groupName);
        }
    }

    if (!allValid) {
        console.log(`❌ ${invalidFields.length} campo(s) inválido(s):`, invalidFields);
    }

    return allValid;
}
```

**Diferença crítica:**
```javascript
// onBlur/onChange/onInput → validateFieldFormat()
validateFieldFormat: function(fieldId) {
    const value = field.value.trim();
    
    // Se campo está VAZIO, NÃO valida (ignora obrigatório)
    if (!value) {
        this.clearValidation(fieldId);
        return true; // ✅ Considera válido mesmo vazio
    }
    
    // Campo TEM VALOR: valida APENAS o FORMATO
    // ...
}

// onSubmit → validateField()
validateField: function(fieldId) {
    const config = this.fieldValidators[fieldId];
    const value = field.value;
    
    // Chama validador COM verificação de obrigatório
    switch (config.validator) {
        case 'email':
            result = CoreValidators.email(value, config.required); // TRUE = verifica obrigatório
            break;
        // ...
    }
}
```

**Comportamento após validação:**

**Se VÁLIDO (allValid = true):**
1. Coleta dados com `FormCollector.collectFormData()`
2. Envia para backend via `CoreAPI.submitForm()`
3. Gera PDF com `PDFGenerator.generatePDF()`
4. Mostra modal de sucesso

**Se INVÁLIDO (allValid = false):**
1. Campos com erro recebem classes CSS:
   - `required-empty` (borda vermelha) → Campo obrigatório vazio
   - `invalid-format` (borda laranja) → Campo com formato inválido
2. Exibe mensagens abaixo dos campos
3. **Scroll automático** para o primeiro campo com erro
4. **Bloqueia envio** para backend

---

## 📊 Classes CSS de Validação

### Estados Visuais

| Classe CSS          | Cor Borda | Significado                   | Quando Aplicada       |
|---------------------|-----------|-------------------------------|-----------------------|
| `required-empty`    | 🔴 Vermelho | Campo obrigatório vazio      | onSubmit              |
| `invalid-format`    | 🟠 Laranja  | Campo com formato inválido   | onBlur/onChange/onInput/onSubmit |
| `valid-input`       | 🟢 Verde    | Campo válido                 | onBlur/onChange/onInput/onSubmit |

### Estrutura CSS (styles.css)
```css
/* Campo obrigatório vazio */
.required-empty {
    border: 2px solid #dc3545 !important; /* Vermelho */
    background-color: #fff5f5;
}

/* Campo com formato inválido */
.invalid-format {
    border: 2px solid #ff6b00 !important; /* Laranja */
    background-color: #fff8f0;
}

/* Campo válido */
.valid-input {
    border: 2px solid #28a745 !important; /* Verde */
    background-color: #f0fff4;
}
```

---

## 🔍 Fluxo de Validação Passo a Passo

### Exemplo: Campo Email

**1. Usuário entra no campo**
- Foco no campo → Sem validação

**2. Usuário digita "te"**
- onInput dispara → Menos de 3 chars → Nada acontece

**3. Usuário digita "tes"**
- onInput dispara → 3+ chars → `validateFieldFormat()`
- Resultado: ❌ Formato inválido
- Visual: Borda laranja + mensagem "Formato de e-mail inválido"

**4. Usuário continua: "teste@email.com"**
- onInput dispara → `validateFieldFormat()`
- Resultado: ✅ Formato válido
- Visual: Borda verde + ícone checkmark

**5. Usuário sai do campo (blur)**
- onBlur dispara → `validateFieldFormat()`
- Resultado: ✅ Formato válido (já validado)
- Visual: Mantém borda verde

**6. Usuário clica em "Salvar Respostas"**
- onSubmit dispara → `validateAllFields()` → `validateField('email')`
- Valida: FORMATO ✅ + OBRIGATÓRIO ✅
- Resultado: ✅ Válido
- Ação: Prossegue com envio

---

### Exemplo: Campo Obrigatório Vazio

**Cenário: Usuário não preencheu campo "Nome"**

**1. Durante preenchimento do formulário**
- onBlur dispara → Campo vazio → **Não mostra erro** ✅
- onInput não dispara (sem digitação)

**2. Usuário clica em "Salvar Respostas"**
- onSubmit dispara → `validateAllFields()` → `validateField('nome')`
- Valida: OBRIGATÓRIO ❌ (campo vazio)
- Resultado: ❌ Inválido
- Visual: Borda vermelha + mensagem "Campo obrigatório"
- Ação: **Bloqueia envio** + scroll para o campo

---

## 📋 Campos e Validadores

### Mapeamento Completo (66 campos)

```javascript
// form-validator.js linha 46-145
fieldValidators: {
    // BLOCO 1: DADOS DO ENTREVISTADO (6 campos)
    'id-entrevistador': { validator: 'select', required: true },
    'nome': { validator: 'varchar', required: true, maxLength: 100 },
    'funcao': { validator: 'select', required: true },
    'outra-funcao': { validator: 'varchar', required: false, maxLength: 100 },
    'telefone': { validator: 'telefone', required: true },
    'email': { validator: 'email', required: true },
    
    // BLOCO 2: DADOS DA EMPRESA (5 campos)
    'tipo-empresa': { validator: 'select', required: true },
    'outro-tipo': { validator: 'varchar', required: false, maxLength: 100 },
    'cnpj-empresa': { validator: 'cnpj', required: true },
    'razao-social': { validator: 'varchar', required: true, maxLength: 200 },
    'municipio-empresa': { validator: 'varchar', required: true, maxLength: 100 },
    
    // BLOCO 3: PRODUTO PRINCIPAL (3 campos)
    'produto-principal': { validator: 'varchar', required: true, maxLength: 200 },
    'agrupamento-produto': { validator: 'select', required: true },
    'outro-produto': { validator: 'varchar', required: false, maxLength: 100 },
    
    // ... (continua para todos os 66 campos)
}
```

### 10 Tipos de Validadores

| Validador  | Formato Esperado                | Exemplos                          |
|------------|---------------------------------|-----------------------------------|
| `cnpj`     | XX.XXX.XXX/XXXX-XX             | 12.345.678/0001-90                |
| `email`    | user@domain.com                | teste@email.com                   |
| `telefone` | (XX) XXXXX-XXXX                | (11) 98765-4321                   |
| `integer`  | Número inteiro                 | 10, 250, 1500                     |
| `numeric`  | Número decimal (10,2)          | 150.50, 1200.00                   |
| `varchar`  | Texto até X caracteres         | "Empresa ABC" (max: 200)          |
| `date`     | YYYY-MM-DD                     | 2025-11-09                        |
| `select`   | Valor != "" e != placeholder   | "embarcador", "123"               |
| `url`      | http(s)://...                  | https://example.com               |
| `checkbox` | Array com pelo menos X valores | ["rodoviario", "ferroviario"]     |

---

## 🚀 Performance e Otimizações

### Throttling/Debouncing

**Pergunta**: Por que não usa debounce no `onInput`?

**Resposta**: Validação só inicia após **3 caracteres**, reduzindo chamadas desnecessárias.

```javascript
// Linha 210-218
if (value.length >= 3) {
    // Valida a cada tecla (sem debounce)
    this.validateFieldFormat(fieldId);
}
```

**Impacto**:
- ✅ Feedback visual imediato (UX responsiva)
- ✅ Reduz validações (só 3+ chars)
- ✅ CPU baixa (validações leves)

---

## 🧪 Testando a Validação

### Abrir Console do Navegador (F12)

**Logs de Validação:**
```javascript
// onBlur
🔍 Validando formato do campo: email

// onChange (SELECT)
⚡ Validação instantânea do select: tipo-empresa

// onInput (3+ chars)
⚡ Validação instantânea (3+ chars) do campo: nome

// onChange (RADIO)
⚡ Validação instantânea do radio: tem-paradas

// onChange (CHECKBOX)
⚡ Validação instantânea do checkbox group: modos

// onSubmit
❌ 5 campo(s) inválido(s): ["nome", "email", "telefone", "cnpj-empresa", "modos"]
```

### Forçar Validação Manual (Console)

```javascript
// Validar campo específico
FormValidator.validateField('email');

// Validar todos os campos
FormValidator.validateAllFields();

// Validar grupo de checkboxes
FormValidator.validateCheckboxGroup('modos');
```

---

## 📁 Arquivos Relacionados

| Arquivo                               | Responsabilidade                          |
|---------------------------------------|-------------------------------------------|
| `frontend/js/form-validator.js`       | Motor de validação (811 linhas)           |
| `frontend/js/core-validators.js`      | Validadores individuais (cnpj, email, etc)|
| `frontend/js/ui-feedback.js`          | Feedback visual (mensagens, modais)       |
| `frontend/js/form-collector.js`       | Coleta dados validados                    |
| `frontend/css/index.css`              | Classes CSS de validação                  |

---

## 🔄 Resumo Executivo

| Momento                     | Função Executada              | Valida Obrigatório? | Valida Formato? | onBlur? |
|-----------------------------|-------------------------------|---------------------|-----------------|---------|
| **onChange** (SELECT)       | `validateFieldFormat()`       | ❌ Não               | ✅ Sim           | ❌ Não  |
| **onInput** (3+ chars)      | `validateFieldFormat()`       | ❌ Não               | ✅ Sim           | ❌ Não  |
| **onChange** (RADIO)        | `validateFieldFormat()`       | ❌ Não               | ✅ Sim           | ❌ Não  |
| **onChange** (CHECKBOX)     | `validateCheckboxGroupFormat()`| ❌ Não              | ✅ Sim (limpa)   | ❌ Não  |
| **onSubmit** (salvar)       | `validateField()`             | ✅ Sim               | ✅ Sim           | N/A     |

⚡ **IMPORTANTE**: Listener `onBlur` foi **removido** em 09/11/2025. Validação agora é **100% instantânea**.

---

## 📊 Comparação Visual: ANTES vs AGORA

### ❌ ANTES (até 08/11/2025)

```
Usuário digita em INPUT:
┌─────────────────────────────────────┐
│ Email: teste@email                  │  ← Digitando...
└─────────────────────────────────────┘
         ↓ (sem feedback)
         
Usuário sai do campo (blur):
┌─────────────────────────────────────┐
│ Email: teste@email                  │  ← ⚠️ Formato inválido
└─────────────────────────────────────┘
         ↓ Feedback TARDIO
```

**Problema**: Usuário só via erro **depois** de sair do campo.

---

### ✅ AGORA (a partir de 09/11/2025)

```
Usuário digita 3+ caracteres:
┌─────────────────────────────────────┐
│ Email: tes                          │  ← ⚠️ Formato inválido (INSTANTÂNEO)
└─────────────────────────────────────┘
         ↓ Feedback IMEDIATO
         
Usuário completa:
┌─────────────────────────────────────┐
│ Email: teste@email.com              │  ← ✅ Válido (INSTANTÂNEO)
└─────────────────────────────────────┘
         ↓ Ainda digitando, sem sair do campo!
```

**Benefício**: Feedback **durante digitação**, sem esperar blur.

---

## 🎓 Principais Conceitos (ATUALIZADO)

### 1. Validação 100% Instantânea ⚡
- **Nenhum campo** espera onBlur
- Feedback visual **imediato** em todos os tipos de campo
- UX mais responsiva e intuitiva

### 2. Regra dos 3 Caracteres
- INPUTs/TEXTAREAs só validam após **3 caracteres**
- Evita validações excessivas e mensagens prematuras
- Equilíbrio entre performance e UX
### 3. UX Não Intrusiva
- Campo vazio não mostra erro durante digitação
- Erro só aparece se usuário digitar algo inválido
- Validação **não bloqueia** o fluxo de digitação

### 4. Feedback Imediato
- SELECTs validam ao selecionar
- INPUTs validam após 3 caracteres **enquanto digita**
- Checkboxes limpam erro ao marcar
- **Sem esperar onBlur** em nenhum caso

### 5. Validação de Última Instância
- onSubmit valida TUDO
- Bloqueia envio se houver erros
- Scroll para primeiro erro

---

## 📝 Changelog

### [09/11/2025] - Validação 100% Instantânea
**BREAKING CHANGE**: Removido listener `onBlur`

- ✅ **Adicionado**: Validação instantânea em TEXTAREAs (onInput após 3 chars)
- ✅ **Modificado**: SELECTs, INPUTs, RADIO, CHECKBOXes agora validam sem esperar blur
- ❌ **Removido**: Listener `onBlur` de todos os campos
- 📝 **Motivo**: Melhorar UX com feedback em tempo real durante digitação

**Impacto**: Usuário não precisa mais sair do campo para ver validação.

---

**Última atualização**: 09/11/2025  
**Arquivo**: `frontend/js/form-validator.js`  
**Linhas**: 811  
**Campos validados**: 66  
**Grupos de checkboxes**: 3  
**Validação**: 100% Instantânea ⚡
