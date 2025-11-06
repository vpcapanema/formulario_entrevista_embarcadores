# 🎨 Estrutura CSS Modular por Categorias Funcionais

## 📂 Nova Estrutura Proposta

```
frontend/css/
│
├── main.css                          # Arquivo principal de imports
│
├── 00-fundacao/                      # Base do sistema
│   ├── reset.css                     # Reset CSS
│   ├── variables.css                 # Design tokens (já criado)
│   ├── typography.css                # Fontes, tamanhos, line-heights
│   └── layout.css                    # Grid, containers, estrutura geral
│
├── 01-formulario/                    # 📝 TUDO sobre formulários
│   ├── form-structure.css            # .form-group, .form-row, labels
│   ├── form-inputs.css               # inputs text, email, tel, number
│   ├── form-selects.css              # selects e dropdowns
│   ├── form-textarea.css             # textareas
│   ├── form-checkbox.css             # checkboxes e grupos
│   ├── form-radio.css                # radio buttons
│   ├── form-states.css               # :focus, :disabled, :hover
│   └── form-special.css              # time-input, readonly-field
│
├── 02-validacao-visual/              # ✅❌ TUDO sobre validação
│   ├── field-error.css               # .field-error, bordas vermelhas
│   ├── field-success.css             # .field-success, bordas verdes
│   ├── validation-messages.css       # .validation-error-text, inline
│   ├── validation-summary.css        # Popup de resumo de erros
│   └── validation-animations.css     # shake, pulse-success
│
├── 03-botoes/                        # 🔘 TUDO sobre botões
│   ├── button-base.css               # .btn (base comum)
│   ├── button-variants.css           # primary, secondary, success, danger
│   ├── button-sizes.css              # sm, md, lg
│   ├── button-states.css             # hover, active, disabled, loading
│   ├── button-special.css            # nav-btn, btn-add, btn-remove
│   └── button-groups.css             # .btn-group, .form-actions
│
├── 04-cards/                         # 📇 TUDO sobre cards
│   ├── card-base.css                 # .card (estrutura base)
│   ├── card-header.css               # .card-header, títulos, intros
│   ├── card-body.css                 # .card-body, padding, zebrado
│   ├── card-variants.css             # resposta-card, kpi-card, chart-card
│   └── card-animations.css           # hover, transform, shadows
│
├── 05-tabelas/                       # 📊 TUDO sobre tabelas
│   ├── table-base.css                # table, thead, tbody, tr, td, th
│   ├── table-inputs.css              # .table-input (inputs dentro de tabela)
│   ├── table-produtos.css            # Tabela específica Q8 (produtos)
│   ├── table-responsive.css          # .table-container, overflow-x
│   └── table-variants.css            # resposta-table, example-table
│
├── 06-navegacao/                     # 🧭 TUDO sobre navegação
│   ├── navbar.css                    # .navbar, .nav-container
│   ├── nav-menu.css                  # .nav-menu, .nav-btn
│   ├── nav-brand.css                 # .nav-brand, logos, títulos
│   └── nav-responsive.css            # Media queries específicas do nav
│
├── 07-modal-feedback/                # 💬 TUDO sobre modais
│   ├── modal-overlay.css             # .modal-overlay, backdrop
│   ├── modal-structure.css           # Estrutura base dos modais
│   ├── modal-success.css             # .feedback-success (verde)
│   ├── modal-warning.css             # .feedback-warning (amarelo)
│   ├── modal-error.css               # .feedback-error (vermelho)
│   ├── modal-loading.css             # .feedback-loading, spinner
│   └── modal-animations.css          # fadeIn, slideIn, slideOut
│
├── 08-paginas/                       # 📄 Estilos específicos por página
│   ├── page-instructions.css         # Página de instruções
│   ├── page-analytics.css            # KPIs, charts, gráficos
│   ├── page-responses.css            # Visualizador de respostas
│   └── page-structure.css            # .page, .page-header, .page.active
│
├── 09-componentes-especiais/         # 🎯 Componentes únicos
│   ├── tags.css                      # .tag, .tags
│   ├── badges.css                    # .question-number, badges
│   ├── boxes.css                     # highlight-box, info-box, success-box
│   ├── grids.css                     # info-grid, factors-grid, kpi-grid
│   └── helpers.css                   # .help-text, .field-hint, .intro-list
│
├── 10-utilidades/                    # 🛠️ Classes utilitárias
│   ├── spacing.css                   # u-mt-*, u-mb-*, u-p-*, etc
│   ├── display.css                   # u-hidden, u-flex, u-grid, u-block
│   ├── text.css                      # u-text-center, u-text-bold, etc
│   ├── colors.css                    # u-text-primary, u-bg-light, etc
│   └── states.css                    # is-active, is-disabled, has-error
│
├── 11-animacoes/                     # 🎬 Todas as animações
│   ├── transitions.css               # Transições padrão
│   ├── keyframes.css                 # @keyframes centralizados
│   └── animations-utils.css          # Classes de animação (.fade-in, etc)
│
├── 12-responsive/                    # 📱 Media queries
│   ├── breakpoints.css               # Definição de breakpoints
│   ├── mobile.css                    # max-width: 480px
│   ├── tablet.css                    # max-width: 768px
│   ├── desktop.css                   # max-width: 992px
│   └── large-desktop.css             # min-width: 1200px
│
└── 13-print/                         # 🖨️ Estilos de impressão
    └── print.css                     # @media print
```

---

## 📋 Exemplos de Arquivos por Categoria

### **01-formulario/form-structure.css**
```css
.form-group { }
.form-row { }
.form-group label { }
.question-number { }
```

### **02-validacao-visual/field-error.css**
```css
.field-error { }
.field-error:focus { }
@keyframes shake { }
```

### **03-botoes/button-variants.css**
```css
.btn-primary { }
.btn-secondary { }
.btn-success { }
.btn-danger { }
```

### **05-tabelas/table-produtos.css**
```css
.produto-origem-container { }
.produto-destino-container { }
.produto-pais-select { }
.produto-estado-select { }
.produto-municipio-select { }
```

---

## 🎯 Vantagens dessa Estrutura

✅ **Categorização Clara**: Cada pasta representa uma funcionalidade
✅ **Fácil Localização**: "Onde está o estilo de erro de campo?" → `02-validacao-visual/field-error.css`
✅ **Múltiplos Devs**: Cada um trabalha em pasta diferente sem conflitos
✅ **Lazy Loading**: Carregar apenas o necessário (ex: não carregar analytics na página de formulário)
✅ **Manutenção**: Alterar validação? Toda lógica está em `02-validacao-visual/`

---

## 📥 Arquivo main.css (Orquestrador)

```css
/* === FUNDAÇÃO === */
@import url('00-fundacao/reset.css');
@import url('00-fundacao/variables.css');
@import url('00-fundacao/typography.css');
@import url('00-fundacao/layout.css');

/* === FORMULÁRIO === */
@import url('01-formulario/form-structure.css');
@import url('01-formulario/form-inputs.css');
@import url('01-formulario/form-selects.css');
@import url('01-formulario/form-textarea.css');
@import url('01-formulario/form-checkbox.css');
@import url('01-formulario/form-radio.css');
@import url('01-formulario/form-states.css');
@import url('01-formulario/form-special.css');

/* === VALIDAÇÃO VISUAL === */
@import url('02-validacao-visual/field-error.css');
@import url('02-validacao-visual/field-success.css');
@import url('02-validacao-visual/validation-messages.css');
@import url('02-validacao-visual/validation-summary.css');
@import url('02-validacao-visual/validation-animations.css');

/* === BOTÕES === */
@import url('03-botoes/button-base.css');
@import url('03-botoes/button-variants.css');
@import url('03-botoes/button-sizes.css');
@import url('03-botoes/button-states.css');
@import url('03-botoes/button-special.css');
@import url('03-botoes/button-groups.css');

/* === CARDS === */
@import url('04-cards/card-base.css');
@import url('04-cards/card-header.css');
@import url('04-cards/card-body.css');
@import url('04-cards/card-variants.css');
@import url('04-cards/card-animations.css');

/* === TABELAS === */
@import url('05-tabelas/table-base.css');
@import url('05-tabelas/table-inputs.css');
@import url('05-tabelas/table-produtos.css');
@import url('05-tabelas/table-responsive.css');
@import url('05-tabelas/table-variants.css');

/* === NAVEGAÇÃO === */
@import url('06-navegacao/navbar.css');
@import url('06-navegacao/nav-menu.css');
@import url('06-navegacao/nav-brand.css');
@import url('06-navegacao/nav-responsive.css');

/* === MODAL E FEEDBACK === */
@import url('07-modal-feedback/modal-overlay.css');
@import url('07-modal-feedback/modal-structure.css');
@import url('07-modal-feedback/modal-success.css');
@import url('07-modal-feedback/modal-warning.css');
@import url('07-modal-feedback/modal-error.css');
@import url('07-modal-feedback/modal-loading.css');
@import url('07-modal-feedback/modal-animations.css');

/* === PÁGINAS === */
@import url('08-paginas/page-structure.css');
@import url('08-paginas/page-instructions.css');
@import url('08-paginas/page-analytics.css');
@import url('08-paginas/page-responses.css');

/* === COMPONENTES ESPECIAIS === */
@import url('09-componentes-especiais/tags.css');
@import url('09-componentes-especiais/badges.css');
@import url('09-componentes-especiais/boxes.css');
@import url('09-componentes-especiais/grids.css');
@import url('09-componentes-especiais/helpers.css');

/* === UTILIDADES === */
@import url('10-utilidades/spacing.css');
@import url('10-utilidades/display.css');
@import url('10-utilidades/text.css');
@import url('10-utilidades/colors.css');
@import url('10-utilidades/states.css');

/* === ANIMAÇÕES === */
@import url('11-animacoes/transitions.css');
@import url('11-animacoes/keyframes.css');
@import url('11-animacoes/animations-utils.css');

/* === RESPONSIVE === */
@import url('12-responsive/breakpoints.css');
@import url('12-responsive/mobile.css');
@import url('12-responsive/tablet.css');
@import url('12-responsive/desktop.css');
@import url('12-responsive/large-desktop.css');

/* === PRINT === */
@import url('13-print/print.css');
```

---

## 🚀 Roteiro de Implementação

### **FASE 1: Criar estrutura de pastas** (5 min)
```bash
cd frontend/css

mkdir -p 00-fundacao
mkdir -p 01-formulario
mkdir -p 02-validacao-visual
mkdir -p 03-botoes
mkdir -p 04-cards
mkdir -p 05-tabelas
mkdir -p 06-navegacao
mkdir -p 07-modal-feedback
mkdir -p 08-paginas
mkdir -p 09-componentes-especiais
mkdir -p 10-utilidades
mkdir -p 11-animacoes
mkdir -p 12-responsive
mkdir -p 13-print
```

### **FASE 2: Migrar categoria por categoria** (1h por categoria)

#### Exemplo: Migrar 02-validacao-visual/
1. Abrir `styles.css`
2. Buscar por `.field-error`, `.validation`, `.field-success`
3. Copiar estilos para arquivos da pasta
4. Testar no navegador
5. Repetir para próxima categoria

---

Deseja que eu comece a implementar essa estrutura agora? Qual categoria você quer que eu faça primeiro?

**Sugestão:** Começar por `02-validacao-visual/` pois é crítica e bem delimitada.
