# 🧪 Guia de Testes - Formulário PLI 2050

## 📋 Índice
1. [Teste Automatizado (Recomendado)](#teste-automatizado)
2. [Teste Manual](#teste-manual)
3. [Checklist de Funcionalidades](#checklist-de-funcionalidades)
4. [Cenários de Teste](#cenários-de-teste)

---

## 🤖 Teste Automatizado

### Como Executar

1. **Abra a aplicação**
   ```
   Abra o arquivo: index.html
   ```

2. **Abra o Console do navegador**
   - **Chrome/Edge**: Pressione `F12` → Aba "Console"
   - **Firefox**: Pressione `F12` → Aba "Console"
   - **Safari**: Menu Desenvolvedor → Mostrar Console JavaScript

3. **Execute o script de teste**
   - Abra o arquivo: `test_auto_fill.js`
   - Copie **TODO** o conteúdo
   - Cole no Console do navegador
   - Pressione `Enter`

4. **Aguarde o preenchimento**
   - O script levará aproximadamente 2 segundos
   - Acompanhe as mensagens no console
   - Todos os campos serão preenchidos automaticamente

5. **Teste o salvamento**
   - Role até o final da página
   - Clique em "💾 Salvar Respostas"
   - Verifique:
     - ✅ Popup de confirmação aparece
     - ✅ Arquivo Excel é baixado automaticamente
     - ✅ Nome do arquivo: `PLI2050_Respostas_[DATA].xlsx`

---

## ✋ Teste Manual

### Dados de Teste Sugeridos

#### Card 1️⃣: Dados do Entrevistado
| Campo | Valor de Teste |
|-------|---------------|
| Nome | João Silva Santos |
| Função | Gerente de Logística |
| Telefone | (11) 98765-4321 |
| E-mail | joao.silva@exemplo.com.br |

#### Card 2️⃣: Dados da Empresa
| Campo | Valor de Teste |
|-------|---------------|
| Tipo de empresa | Embarcador (dono da carga) |
| Nome da empresa | Transportes ABC Logística Ltda |
| Município | São Paulo-SP |

#### Card 3️⃣: Produtos Transportados
**Produto 1:**
- Carga: Soja em Grãos
- Movimentação: 50000 ton/ano
- Origem: Mato Grosso-MT
- Destino: Santos-SP
- Distância: 1850 km
- Modalidade: Rodoviário
- Acondicionamento: Granel

**Produto 2:**
- Carga: Milho
- Movimentação: 30000 ton/ano
- Origem: Goiás-GO
- Destino: Campinas-SP
- Distância: 920 km
- Modalidade: Ferroviário
- Acondicionamento: Container

**Produto 3:**
- Carga: Fertilizantes
- Movimentação: 15000 ton/ano
- Origem: Uberaba-MG
- Destino: Ribeirão Preto-SP
- Distância: 350 km
- Modalidade: Rodoviário
- Acondicionamento: Ensacado

#### Card 4️⃣: Produto Principal
| Campo | Valor de Teste |
|-------|---------------|
| Produto mais representativo | Soja em Grãos |
| Agrupamento | Cereais |

#### Card 5️⃣: Características do Transporte
| Campo | Valor de Teste |
|-------|---------------|
| Volume anual | 50000 toneladas |
| Origem | Brasil / Mato Grosso / Sorriso |
| Destino | Brasil / São Paulo / Santos |
| Distância | 1850 km |
| Modalidades | ☑ Rodoviário ☑ Ferroviário |
| Tempo de transporte | 3 dias 12 horas |
| Custo do transporte | R$ 125,50 por tonelada |
| Valor da carga | R$ 85.000 |
| Tipo de frete | CIF |
| Responsável | Própria empresa |
| Acondicionamento | Granel (caminhão graneleiro) |
| Embalagem | Sem embalagem - transporte a granel |
| Frequência anual | 120 viagens |
| Sazonalidade | Maior movimentação entre março e agosto |
| Armazenagem intermediária | Sim, 15 dias |

#### Card 6️⃣: Fatores de Decisão Modal
| Fator | Importância | Variação % |
|-------|------------|------------|
| Custo | Muito alta | 8% |
| Tempo | Alta | 15% |
| Confiabilidade | Muito alta | 5% |
| Segurança | Alta | 10% |
| Capacidade | Média | 20% |

#### Card 7️⃣: Análise Estratégica
| Campo | Valor de Teste |
|-------|---------------|
| Tipo de cadeia | Distribuição |
| Modais alternativos | ☑ Ferroviário ☑ Hidroviário |
| Fator adicional | Disponibilidade de infraestrutura portuária e questões ambientais |

#### Card 8️⃣: Dificuldades Logísticas
| Campo | Valor de Teste |
|-------|---------------|
| Dificuldades | ☑ Infraestrutura ☑ Custos ☑ Confiabilidade |
| Detalhamento | Estado precário das rodovias MT-SP, alto custo do frete, baixa disponibilidade de vagões ferroviários |

---

## ✅ Checklist de Funcionalidades

### Validação de Campos Obrigatórios
- [ ] Sistema identifica campos vazios antes de salvar
- [ ] Popup lista todas as perguntas não preenchidas
- [ ] Sistema foca automaticamente na primeira pergunta com erro
- [ ] Não permite salvar com campos obrigatórios vazios

### Download Automático de Excel
- [ ] Arquivo Excel é gerado ao salvar
- [ ] Download inicia automaticamente
- [ ] Popup de confirmação aparece com link
- [ ] Arquivo tem nome correto: `PLI2050_Respostas_YYYYMMDD_HHMMSS.xlsx`

### Estrutura do Excel
- [ ] **Aba 1 "Respostas"**: Empresa em linhas, perguntas 1-43 em colunas
- [ ] **Aba 2 "Produtos Transportados"**: Tabela com todos os produtos
- [ ] Cabeçalhos corretos em ambas as abas
- [ ] Dados formatados corretamente

### Armazenamento IndexedDB
- [ ] Dados salvos no navegador (IndexedDB)
- [ ] Dados persistem após recarregar página
- [ ] Múltiplas respostas podem ser salvas

### Navegação entre Abas
- [ ] **Formulário**: Exibe formulário completo
- [ ] **Respostas**: Lista todas as respostas salvas
- [ ] **Analytics**: Mostra 12 gráficos e 5 KPIs
- [ ] **Instruções**: Exibe guia completo de preenchimento
- [ ] **Visualizador**: Mostra detalhes do IndexedDB

### Tabela Dinâmica de Produtos
- [ ] Botão "Adicionar Produto" funciona
- [ ] Linhas são adicionadas dinamicamente
- [ ] Botão de remover (🗑️) funciona
- [ ] Pode adicionar quantos produtos forem necessários
- [ ] Produtos são exportados na aba separada do Excel

### Numeração Sequencial
- [ ] Perguntas numeradas de 1 a 43
- [ ] Numeração visível em todos os campos
- [ ] Ordem lógica mantida

---

## 🎯 Cenários de Teste

### Cenário 1: Teste Básico (Happy Path)
1. Preencha todos os campos obrigatórios
2. Clique em "Salvar Respostas"
3. **Resultado esperado:**
   - ✅ Popup de confirmação
   - ✅ Download do Excel
   - ✅ Dados salvos no IndexedDB

### Cenário 2: Validação de Campos Vazios
1. Deixe alguns campos obrigatórios vazios
2. Clique em "Salvar Respostas"
3. **Resultado esperado:**
   - ✅ Popup com lista de erros
   - ✅ Foco na primeira pergunta vazia
   - ❌ Não salva nem gera Excel

### Cenário 3: Múltiplos Produtos
1. Adicione 5+ produtos na tabela
2. Preencha todos os dados
3. Salve o formulário
4. Abra o Excel gerado
5. **Resultado esperado:**
   - ✅ Todos os produtos na Aba 2
   - ✅ Dados corretos e completos

### Cenário 4: Persistência de Dados
1. Preencha e salve o formulário
2. Feche o navegador completamente
3. Reabra a aplicação
4. Vá para aba "Respostas"
5. **Resultado esperado:**
   - ✅ Dados salvos ainda aparecem

### Cenário 5: Múltiplas Respostas
1. Preencha e salve resposta da Empresa A
2. Limpe o formulário (recarregue a página)
3. Preencha e salve resposta da Empresa B
4. Vá para aba "Respostas"
5. **Resultado esperado:**
   - ✅ Ambas as respostas listadas
   - ✅ Dados corretos para cada empresa

### Cenário 6: Analytics
1. Salve pelo menos 3 respostas diferentes
2. Vá para aba "Analytics"
3. **Resultado esperado:**
   - ✅ 12 gráficos exibidos
   - ✅ 5 KPIs com valores corretos
   - ✅ Gráficos interativos (hover mostra valores)

### Cenário 7: Visualizador IndexedDB
1. Salve algumas respostas
2. Vá para aba "Visualizador"
3. Clique em "Carregar Dados"
4. Clique em "Ver JSON Bruto"
5. Clique em "Calcular Tamanho"
6. **Resultado esperado:**
   - ✅ Lista de respostas exibida
   - ✅ JSON formatado corretamente
   - ✅ Tamanho calculado em bytes/KB/MB

---

## 🐛 Reporte de Bugs

Se encontrar algum problema durante os testes, anote:

1. **O que você estava fazendo** (passo a passo)
2. **O que esperava acontecer**
3. **O que realmente aconteceu**
4. **Mensagens de erro** (se houver, veja no Console F12)
5. **Navegador e versão** (Chrome 120, Firefox 121, etc.)

---

## 📊 Validação do Excel Gerado

Ao abrir o arquivo Excel, verifique:

### Aba 1: "Respostas"
- [ ] Coluna A: ID da resposta
- [ ] Coluna B: Data/hora
- [ ] Colunas C-AR: Perguntas 1-43 (cada pergunta = 1 coluna)
- [ ] Dados corretos em cada célula

### Aba 2: "Produtos Transportados"
- [ ] Colunas: Carga | Movimentação | Origem | Destino | Distância | Modalidade | Acondicionamento
- [ ] Uma linha por produto
- [ ] Valores numéricos formatados corretamente

---

## ✨ Funcionalidades Avançadas para Testar

### 1. Campo Condicional "Outro Tipo de Empresa"
- Selecione "Outro" no tipo de empresa
- Campo adicional deve aparecer
- Preencha e salve
- Verifique se aparece no Excel

### 2. Seleção Múltipla de Modalidades
- Marque múltiplas modalidades de transporte
- Salve e verifique no Excel
- Deve aparecer separado por vírgula

### 3. Conversão de Unidades
- Teste com "kg" e "toneladas"
- Verifique se a conversão está correta no Excel

### 4. Formatação de Valores Monetários
- Insira valores com vírgula (ex: 125,50)
- Verifique formatação no Excel

---

## 🎓 Dicas de Teste

1. **Use o script automatizado primeiro** para entender o comportamento esperado
2. **Teste no Chrome/Edge** (melhor compatibilidade)
3. **Abra o Console (F12)** para ver mensagens de debug
4. **Limpe o cache** se encontrar comportamento estranho
5. **Teste em modo anônimo** para simular primeiro acesso

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Verifique o arquivo `README.md`
- Consulte `DEPLOY_GITHUB_PAGES.md` para implantação
- Abra o Console (F12) para ver erros JavaScript
