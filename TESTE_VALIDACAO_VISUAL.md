# ✅ Checklist - Validação Visual Ativa

## 🎯 Como testar a validação visual

### Teste 1: Campos obrigatórios vazios
1. Abra: http://127.0.0.1:5500/frontend/html/index.html
2. **Deixe todos os campos vazios**
3. Clique no botão **"💾 Salvar Respostas"** (final da página)
4. **O que deve acontecer**:
   - ✅ Campos obrigatórios ficam com **borda vermelha** (3px)
   - ✅ Fundo vermelho claro (`#ffebee`)
   - ✅ **Animação shake** (treme por 0.3s)
   - ✅ Modal de erro aparece no topo direito
   - ✅ Página rola automaticamente para o **primeiro campo com erro**
   - ✅ Primeiro campo recebe **foco**

### Teste 2: Correção de campo
1. Digite algo em um **campo com borda vermelha**
2. **O que deve acontecer**:
   - ✅ Borda vermelha **desaparece imediatamente**
   - ✅ Campo volta ao estado normal

### Teste 3: Validação em campos específicos
**Campos que devem ser validados** (marcados com `*`):

#### Card 1 - Dados do Entrevistado
- ✅ Q1: Nome do entrevistado
- ✅ Q2: Função do entrevistado
- ✅ Q3: Email
- ✅ Q4: Telefone

#### Card 2 - Dados da Empresa
- ✅ Q5: Tipo de empresa
- ✅ Q6: Nome da empresa
- ✅ Q7: CNPJ

#### Card 3 - Produtos
- ✅ Q8: Tabela de produtos (pelo menos 1 linha preenchida)

#### Card 4 - Produto Principal
- ✅ Q9: Produto principal
- ✅ Q10: Movimentação anual

E assim por diante...

---

## 🎨 Estilos CSS Aplicados

### Arquivo: `validacao-visual.css`

```css
/* Campo com erro */
.invalid {
    border: 3px solid #dc3545 !important;
    background-color: #ffebee !important;
    animation: shake 0.3s ease-in-out;
}

/* Animação shake */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
```

---

## 🔧 Código JavaScript Responsável

### Arquivo: `ui.js` (linhas 189-249)

```javascript
// 1. Destaca campos inválidos
highlightInvalidFields(fieldIds) {
    fieldIds.forEach(id => {
        const element = document.getElementById(id);
        element.classList.add('invalid'); // ← ADICIONA CLASSE
        
        // Remove ao corrigir
        element.addEventListener('input', function handler() {
            element.classList.remove('invalid');
        }, { once: true });
    });
}

// 2. Rola até primeiro erro
scrollToFirstError() {
    const firstInvalid = document.querySelector('.invalid');
    if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth' });
        firstInvalid.focus();
    }
}

// 3. Valida campos obrigatórios
validateRequiredFields() {
    const requiredFields = document.querySelectorAll('[required]');
    const invalidIds = [];
    
    requiredFields.forEach(field => {
        if (!field.value || field.value.trim() === '') {
            invalidIds.push(field.id);
        }
    });
    
    if (invalidIds.length > 0) {
        this.highlightInvalidFields(invalidIds);
        this.mostrarErroValidacao(invalidIds.length);
        return false;
    }
    return true;
}
```

---

## ✅ Status da Validação

| Componente | Status | Arquivo |
|------------|--------|---------|
| **CSS de validação** | ✅ Ativo | `validacao-visual.css` |
| **Classe `.invalid`** | ✅ Implementada | Linha 18 |
| **Animação `shake`** | ✅ Implementada | Linha 141 |
| **JS - highlightInvalidFields** | ✅ Ativo | `ui.js` linha 189 |
| **JS - scrollToFirstError** | ✅ Ativo | `ui.js` linha 211 |
| **JS - validateRequiredFields** | ✅ Ativo | `ui.js` linha 230 |
| **Modal de erro** | ✅ Ativo | `ui.js` linha 164 |

---

## 🚨 Se a validação NÃO estiver funcionando

### Verificar no DevTools (F12):

1. **Console** → Verificar erros JavaScript
2. **Network** → Verificar se `validacao-visual.css` foi carregado
3. **Elements** → Inspecionar campo e ver se classe `.invalid` foi adicionada

### Comandos para debug:

```javascript
// No console do navegador:

// 1. Verificar se CSS foi carregado
getComputedStyle(document.querySelector('input')).border

// 2. Forçar adicionar classe manualmente
document.querySelector('input').classList.add('invalid')

// 3. Verificar se animação existe
getComputedStyle(document.querySelector('input')).animation
```

---

**Data**: 06/11/2025  
**Versão CSS**: v20251106  
**Status**: ✅ **VALIDAÇÃO VISUAL ATIVA E FUNCIONANDO**
