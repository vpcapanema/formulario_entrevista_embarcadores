# 🔄 Sincronização Q8 → Q12/Q13 - Guia de Testes

## Resumo da Implementação

Os campos **Q12 (Origem) e Q13 (Destino)** agora são **preenchidos automaticamente** com base nas escolhas feitas na tabela de produtos (Q8).

## Arquivo Criado

- **`frontend/js/sync-produtos-q12-q13.js`** - Módulo de sincronização
- **`TEST_SINC_PRODUTOS_Q12Q13.html`** - Guia interativo de testes

## Como Funciona

### 1️⃣ Monitoramento Automático

O módulo `SincProdutosQ12Q13` monitora automaticamente:

- ✅ Adição/remoção de linhas na tabela de produtos
- ✅ Mudanças nos selects de origem/destino dos produtos
- ✅ Alteração de valores (país, estado, município)

### 2️⃣ Lógica de Sincronização

Quando uma mudança é detectada na tabela de produtos:

1. **Extrai dados** de todos os produtos (origem/destino)
2. **Verifica padrão**:
   - Se todos os produtos têm MESMA origem → usa essa origem comum
   - Se produtos têm origens DIFERENTES → usa a origem do **PRIMEIRO** produto
3. **Preenche Q12 e Q13** com os valores extraídos
4. **Dispara eventos** `change` para ativar as cascatas (país → estado → município)

### 3️⃣ Exemplo Prático

**Entrada (Tabela de Produtos):**
```
Produto 1:
  - Origem País: 31 (Brasil)
  - Origem Estado: 35 (São Paulo)
  - Destino País: 31 (Brasil)
  - Destino Estado: 33 (Rio de Janeiro)
```

**Resultado (Q12/Q13 - Automático):**
```
Q12 - Origem:
  - País: 31 ✅
  - Estado: 35 ✅
  - Município: [conforme selecionado no produto]

Q13 - Destino:
  - País: 31 ✅
  - Estado: 33 ✅
  - Município: [conforme selecionado no produto]
```

## 🧪 Como Testar

### Opção 1: Teste Visual (Recomendado)

1. Abra `TEST_SINC_PRODUTOS_Q12Q13.html` no navegador
2. Clique em um dos botões de "Caso de Teste"
3. Abra o console (F12) para ver os logs detalhados

### Opção 2: Teste Direto no Formulário

1. Acesse `frontend/html/index.html`
2. Vá até a seção "Card 3 - Produtos Transportados"
3. Clique em "+ Adicionar Produto"
4. Preencha:
   - Carga: "Soja em Grão"
   - Origem País: Brasil
   - Origem Estado: São Paulo
   - Origem Município: São Paulo
   - Destino País: Brasil
   - Destino Estado: Rio de Janeiro
5. **Resultado esperado**: Q12 e Q13 (seção abaixo) são preenchidas automaticamente com SP → RJ

### Opção 3: Verificar Console

1. Abra o formulário (index.html)
2. Pressione F12 para abrir o Developer Tools
3. Vá para a aba "Console"
4. Observe os logs de sincronização:

```
🔄 SincProdutosQ12Q13.init() iniciado
🔄 Sincronizando Q12/Q13 com tabela de produtos...
   📦 1 produto(s) com origem/destino preenchido(s)
   ✅ Todos os 1 produto(s) têm MESMA origem
   ✅ Todos os 1 produto(s) têm MESMO destino
   📍 Preenchendo Q12 (Origem):
       ✅ origem-pais = 31
       ✅ origem-estado = 35
   📍 Preenchendo Q13 (Destino):
       ✅ destino-pais = 31
       ✅ destino-estado = 33
```

## 📊 Casos de Teste Cobertos

### Caso 1: Um único produto
- **Setup**: 1 produto com origem=SP, destino=RJ
- **Esperado**: Q12 e Q13 preenchidas com SP → RJ

### Caso 2: Múltiplos produtos com mesma origem/destino
- **Setup**: 2 produtos, ambos com origem=SP, destino=RJ
- **Esperado**: Q12 e Q13 preenchidas com SP → RJ
- **Console**: "Todos os 2 produto(s) têm MESMA origem/destino"

### Caso 3: Múltiplos produtos com origens/destinos diferentes
- **Setup**: 
  - Produto 1: origem=SP, destino=RJ
  - Produto 2: origem=MG, destino=BA
- **Esperado**: Q12 e Q13 preenchidas com SP → RJ (do 1º produto)
- **Console**: "Produtos com origens DIFERENTES"

### Caso 4: Tabela vazia
- **Setup**: Sem produtos
- **Esperado**: Q12 e Q13 não são alteradas
- **Console**: "0 produto(s) com origem/destino preenchido(s)"

## ⚡ Comportamento em Diferentes Cenários

### Ao Adicionar Produto
```javascript
// MutationObserver detecta nova linha
// Aguarda 100ms para renderização
// Chama sincronizar()
// Se origem/destino preenchidos → Q12/Q13 são atualizadas
```

### Ao Alterar Origem/Destino em Produto
```javascript
// change event disparado no select
// Aguarda 100ms para outras atualizações
// Chama sincronizar()
// Q12/Q13 são atualizadas com novo valor
```

### Ao Remover Produto
```javascript
// MutationObserver detecta remoção
// Aguarda 100ms
// Chama sincronizar()
// Q12/Q13 usam dados dos produtos restantes
```

## 🔧 Configuração Técnica

### Delays Necessários

```javascript
// Cascata de preenchimento com delays
setTimeout(() => {
    // 150ms: permite DropdownManager carregar estados
    setTimeout(() => {
        // Outro 150ms: permite municípios carregar
    }, 150);
}, 150);
```

**Motivo**: O `DropdownManager` carrega dados dos selects assincronamente. Os delays garantem que os dados estejam disponíveis antes de tentar popular os selects.

### Eventos Disparados

```javascript
// IMPORTANTE: Dispara change event para ativar cascatas
paisSelect.dispatchEvent(new Event('change', { bubbles: true }));
// Isso ativa o DropdownManager para carregar estados
```

## 🎯 Fluxo de Dados

```
┌─────────────────────────────────────────────┐
│  Usuário preenche tabela de produtos (Q8)   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         ┌───────────────────┐
         │ MutationObserver  │
         │ ou change event   │
         └────────┬──────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │  Aguardar 100-150ms  │
        │  (renderização)      │
        └────────┬─────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ SincProdutosQ12Q13.sincronizar │
    └────────────┬───────────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ Extrair origem/destino de todos │
    │ os produtos (Q8)               │
    └────────────┬───────────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ Verificar padrão:              │
    │ - Mesma origem?               │
    │ - Mesmo destino?              │
    └────────────┬───────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────────┐
    │ Usar origem/destino do 1º produto   │
    │ ou valor comum (se todos iguais)    │
    └────────────┬──────────────────────────┘
                 │
                 ├──────────────────┬──────────────────┐
                 ▼                  ▼                  ▼
    ┌─────────────────┐ ┌────────────────┐ ┌──────────────────┐
    │ Preencher Q12   │ │ Disparar change│ │ Preencher Q13    │
    │ (origem-pais)   │ │ para cascata   │ │ (destino-pais)   │
    └─────────────────┘ └────────────────┘ └──────────────────┘
```

## 📝 Logs Esperados

### Sincronização Bem-Sucedida

```
🔄 Sincronizando Q12/Q13 com tabela de produtos...
   📦 3 produto(s) com origem/destino preenchido(s)
   ✅ Todos os 3 produto(s) têm MESMA origem
   ⚠️  Produtos com destinos DIFERENTES - usando destino do 1º produto
   📍 Preenchendo Q12 (Origem): {pais: 31, estado: 35, municipio: 3550308}
       ✅ origem-pais = 31
       ✅ origem-estado = 35
       ✅ origem-municipio = 3550308
   📍 Preenchendo Q13 (Destino): {pais: 31, estado: 33, municipio: 3304557}
       ✅ destino-pais = 31
       ✅ destino-estado = 33
       ✅ destino-municipio = 3304557
```

### Sem Produtos

```
🔄 Sincronizando Q12/Q13 com tabela de produtos...
   ℹ️  Nenhum produto preenchido
```

## ✅ Checklist de Validação

- [ ] Script `sync-produtos-q12-q13.js` foi adicionado ao `index.html`
- [ ] Arquivo está no caminho correto: `frontend/js/sync-produtos-q12-q13.js`
- [ ] Console mostra logs de inicialização quando página carrega
- [ ] Ao adicionar produto com origem/destino → Q12/Q13 são preenchidas
- [ ] Ao remover produto → Q12/Q13 usam dados dos produtos restantes
- [ ] Cascatas funcionam (país → estado → município)
- [ ] Teste HTML funciona: `TEST_SINC_PRODUTOS_Q12Q13.html`

## 🐛 Troubleshooting

### Q12/Q13 não estão sendo preenchidas

**Verificar**:
1. Console (F12) mostra logs de sincronização?
2. Produto tem origem/destino preenchido?
3. IDs dos campos estão corretos? (origem-pais, destino-pais, etc)

**Logs para verificar**:
```
❌ Campo origem-pais não encontrado
❌ Campo destino-pais não encontrado
```

### Cascatas não funcionam (estado/município vazios)

**Motivo**: Delays podem não ser suficientes para `DropdownManager` carregar dados

**Solução**: Aumentar delays em `_preencherOrigem()` e `_preencherDestino()`:
```javascript
// Aumentar de 150ms para 200ms
setTimeout(() => { ... }, 200);
```

### Múltiplos produtos com valores diferentes

**Comportamento correto**: Usa origem/destino do PRIMEIRO produto

**Verificar no console**:
```
⚠️  Produtos com origens DIFERENTES - usando origem do 1º produto
```

## 📚 Referências

- **Arquivo Principal**: `frontend/js/sync-produtos-q12-q13.js`
- **Integração**: `frontend/html/index.html` (linha ~882)
- **Módulos Relacionados**:
  - `dropdown-manager.js` - Carrega países, estados, municípios
  - `form-collector.js` - Coleta dados da tabela de produtos
  - `auto-save.js` - Restaura dados salvos

## 🎓 Conceitos Técnicos

### MutationObserver

Monitora mudanças no DOM (adição/remoção de elementos):
```javascript
observer.observe(tbody, {
    childList: true, // Detecta adição/remoção de tr
    subtree: true,   // Detecta mudanças em filhos
});
```

### Event Bubbling

Permite que o listener global capture eventos de elementos dinâmicos:
```javascript
document.addEventListener('change', (e) => {
    if (e.target.name.includes('produto-origem-pais')) {
        sincronizar();
    }
});
```

### Cascata de Select

Carrega dados sequencialmente:
1. País → dispara change
2. DropdownManager carrega estados
3. Usuário seleciona estado → dispara change
4. DropdownManager carrega municípios

---

**Última atualização**: 10 de dezembro de 2025  
**Commit**: 5bca539 - feat: Sincronização automática entre tabela de produtos (Q8) e campos Q12/Q13

