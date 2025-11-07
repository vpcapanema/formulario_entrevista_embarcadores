# Estrutura CSS - PLI 2050

## 📁 Arquitetura Simplificada (2 Arquivos)

Esta estrutura CSS foi projetada para ser **simples, manutenível e modular**.

### Arquivos CSS

#### 1. `index.css` (1.200+ linhas)
**Escopo**: Estilos globais compartilhados por **todas as 5 páginas**

**Páginas cobertas**:
- ✅ Formulário (`index.html`)
- ✅ Respostas (`respostas.html`)
- ✅ Analytics (`analytics.html`)
- ✅ Instruções (`instrucoes.html`)
- ✅ Visualizador de Dados (`visualizador_dados.html`)

**Conteúdo**:
- Reset CSS e variáveis globais (`:root`)
- Navegação (`.navbar`, `.nav-container`, `.nav-btn`)
- Sistema de layout (`.container`, `.page`, `.card`)
- Elementos de formulário (inputs, selects, textareas)
- Tabelas (`.table-container`, `.resposta-table`)
- Botões (`.btn-primary`, `.btn-secondary`, etc.)
- Cards de respostas (`.resposta-card`, `.resposta-header`)
- Analytics (`.kpi-grid`, `.charts-grid`)
- Sistema de feedback modal (`.modal-overlay`, `.feedback-success`)
- Estilos de instruções (`.instructions-container`, `.section-title`)
- Utilitários (`.text-center`, `.hidden-field`)
- Responsividade (Media queries para mobile/tablet/desktop)
- Impressão (`@media print`)

#### 2. `validacao-visual.css` (228 linhas)
**Escopo**: Estilos **exclusivos de validação** de formulário

**Conteúdo**:
- Estados de erro (`.field-error`, `.invalid`)
- Estados de sucesso (`.field-success`)
- Mensagens de validação (`.validation-error-text`, `.validation-error-inline`)
- Popup de resumo (`.validation-summary`)
- Animações de feedback (`@keyframes shake`, `@keyframes pulse-success`)
- Transições de entrada/saída (`slideInRight`, `slideOutRight`)
- Responsividade específica para validação

---

## 🎯 Como Usar

### Para páginas com formulário (ex: `index.html`):
```html
<head>
    <link rel="stylesheet" href="/css/index.css?v=20251106">
    <link rel="stylesheet" href="/css/validacao-visual.css?v=20251106">
</head>
```

### Para páginas sem validação (ex: `instrucoes.html`, `respostas.html`):
```html
<head>
    <link rel="stylesheet" href="/css/index.css?v=20251106">
    <!-- validacao-visual.css NÃO é necessário -->
</head>
```

---

## 🔧 Manutenção

### Quando modificar `index.css`:
- Estilos que afetam **layout geral**, **navegação**, **tipografia**
- Mudanças em **cores globais** (variáveis `:root`)
- Novos componentes **compartilhados** entre páginas
- Ajustes de **responsividade geral**

### Quando modificar `validacao-visual.css`:
- Alterações em **feedback visual** de validação
- Novas **animações de erro/sucesso**
- Mudanças em **popup de resumo** de erros
- Ajustes de **cores de validação** (vermelho/verde)

---

## 📊 Comparação com Estrutura Anterior

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Arquivos CSS** | 1 arquivo (`styles.css`) | 2 arquivos (`index.css` + `validacao-visual.css`) |
| **Linhas totais** | ~1.625 linhas | ~1.450 linhas (otimizado) |
| **Modularização** | Monolítico | Funcional (global + validação) |
| **Facilidade de manutenção** | Difícil (tudo misturado) | Fácil (separação clara) |
| **Performance** | Carrega tudo sempre | Carrega validação só quando necessário |
| **Duplicações** | 15+ ocorrências | 0 (removido na refatoração) |

---

## ✅ Vantagens da Nova Estrutura

1. **Clareza**: Separação clara entre estilos globais e validação
2. **Performance**: Páginas sem formulário carregam menos CSS
3. **Manutenibilidade**: Fácil localizar e modificar estilos
4. **Escalabilidade**: Adicionar novos arquivos CSS por página se necessário
5. **Cache**: Validação raramente muda, então aproveita melhor o cache

---

## 🗑️ Arquivos Obsoletos

Após a migração, estes arquivos **podem ser removidos**:

- ❌ `styles.css` (substituído por `index.css` + `validacao-visual.css`)
- ❌ Pasta `01-variables/` (variáveis agora em `index.css`)
- ❌ Pasta `02-validacao-visual/` (conteúdo em `validacao-visual.css`)
- ❌ Pastas vazias `03-botoes/`, `04-componentes/`, etc.
- ❌ Documentos de planejamento: `ESTRUTURA_CATEGORIZADA.md`, `PLANO_MODULARIZACAO_POR_PAGINA.md`

**Recomendação**: Manter por 1-2 semanas para rollback, depois excluir.

---

## 🚀 Próximos Passos (Opcional)

Se o sistema crescer, considere:

1. **CSS por página** (ex: `formulario.css`, `analytics.css`)
2. **CSS de componentes** (ex: `tabelas.css`, `graficos.css`)
3. **Pré-processadores** (SASS/LESS para variáveis avançadas)
4. **CSS-in-JS** (se migrar para React/Vue no futuro)

Mas por enquanto, **2 arquivos são suficientes e simples!**

---

**Última atualização**: 06/11/2025  
**Versão CSS**: v20251106  
**Autor**: Sistema PLI 2050
