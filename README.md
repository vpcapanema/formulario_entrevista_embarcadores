# PLI 2050 - Sistema de Formulários de Entrevista com Embarcadores

Sistema web para coleta, visualização e análise de dados de entrevistas com embarcadores do Estado de São Paulo, parte do Plano de Logística e Investimentos (PLI 2050).

## 📋 Descrição

Aplicação web desenvolvida para facilitar a coleta de dados sobre transporte de mercadorias no Estado de São Paulo através de entrevistas estruturadas com empresas embarcadoras, transportadoras e operadores logísticos.

### Funcionalidades Principais

✅ **Formulário Inteligente**
- 43 perguntas organizadas em 8 blocos temáticos
- Interface intuitiva com cards informativos
- Validação de dados em tempo real
- Tratamento especial para tabela de produtos (questão 8)
- Campos condicionais que aparecem conforme necessário

✅ **Armazenamento Local**
- Banco de dados IndexedDB (não requer servidor)
- Dados persistentes no navegador
- Backup automático
- Funciona offline após carregamento inicial

✅ **Visualização de Respostas**
- Listagem detalhada de todas as entrevistas
- Organização por empresa
- Dados apresentados de forma didática
- Exclusão individual de respostas

✅ **Analytics Avançado**
- 5 KPIs principais
- 12 gráficos interativos (Chart.js)
- Análises de:
  - Distribuição modal
  - Produtos mais transportados
  - Fatores de decisão
  - Dificuldades logísticas
  - Sensibilidade a mudanças
  - Custo e eficiência por modalidade
  - E muito mais!

✅ **Exportação de Dados**
- Excel (.xlsx) - com múltiplas abas
- CSV (.csv) - compatível com qualquer software
- PDF (.pdf) - relatório executivo formatado

## 🚀 Como Usar

### Uso Local

1. **Clone ou baixe este repositório**
   ```bash
   git clone https://github.com/seu-usuario/pli2050-formularios.git
   cd pli2050-formularios
   ```

2. **Abra o arquivo `index.html` em um navegador moderno**
   - Google Chrome (recomendado)
   - Firefox
   - Microsoft Edge
   - Safari

3. **Comece a usar!**
   - Preencha o formulário
   - Visualize as respostas
   - Analise os dados
   - Exporte os resultados

### Implantação no GitHub Pages

1. **Faça fork ou crie um repositório no GitHub**

2. **Faça upload dos arquivos:**
   - index.html
   - styles.css
   - database.js
   - app.js
   - analytics.js
   - README.md

3. **Ative o GitHub Pages:**
   - Vá em Settings > Pages
   - Em "Source", selecione "main" branch
   - Clique em "Save"
   - Aguarde alguns minutos

4. **Acesse sua aplicação:**
   ```
   https://seu-usuario.github.io/nome-do-repositorio/
   ```

## 📁 Estrutura de Arquivos

```
pli2050-formularios/
│
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos e design responsivo
├── database.js         # Gerenciamento do IndexedDB
├── app.js              # Lógica principal da aplicação
├── analytics.js        # Gráficos e análises
└── README.md           # Este arquivo
```

## 🎯 Estrutura do Formulário

### 1. Dados do Entrevistado
- Nome, função, telefone e e-mail

### 2. Dados da Empresa
- Tipo de empresa
- Nome e localização
- Produtos transportados (tabela dinâmica)

### 3. Produto Principal
- Produto mais representativo
- Classificação em 64 categorias

### 4. Características do Transporte
- Origem e destino (país, estado, município)
- Distância e paradas
- Modalidades utilizadas
- Configuração de veículos
- Peso, custo e valor da carga
- Tipo de embalagem
- Tempo de deslocamento
- Frequência

### 5. Fatores de Decisão Modal
- Importância de 5 fatores:
  - Custo
  - Tempo
  - Confiabilidade
  - Segurança
  - Capacidade
- Sensibilidade a variações percentuais

### 6. Análise Estratégica
- Tipo de cadeia (suprimento/distribuição)
- Disposição para modais alternativos
- Fatores adicionais

### 7. Dificuldades Logísticas
- 9 categorias de dificuldades
- Campo aberto para detalhamento

## 📊 Analytics Disponíveis

### KPIs
- Total de empresas entrevistadas
- Volume total transportado (toneladas)
- Valor total movimentado (R$)
- Distância média percorrida (km)
- Taxa de multimodalidade (%)

### Gráficos
1. **Distribuição Modal** - Participação de cada modalidade
2. **Top 10 Produtos** - Produtos mais transportados
3. **Fatores de Decisão** - Importância média (radar)
4. **Tipo de Embalagem** - Distribuição
5. **Dificuldades Logísticas** - Ranking de problemas
6. **Sensibilidade a Mudanças** - Variação % que motiva mudança
7. **Custo por Modalidade** - R$/tonelada
8. **Taxa de Ocupação** - % média por modal
9. **Frequência de Transporte** - Distribuição
10. **Tipo de Cadeia** - Suprimento vs Distribuição
11. **Modais Alternativos** - Disposição para mudança
12. **Distância Média** - km por modalidade

## 💾 Armazenamento de Dados

### Sobre o IndexedDB
- Armazenamento local no navegador
- Não requer servidor ou banco de dados externo
- Dados permanecem salvos mesmo após fechar o navegador
- Capacidade de armazenamento: geralmente 50MB+ (varia por navegador)

### Gestão de Dados
- **Backup**: Exporte regularmente para Excel/CSV
- **Migração**: Use os arquivos exportados para transferir dados
- **Limpeza**: Botão para excluir todas as respostas (requer confirmação dupla)

### Compatibilidade
- ✅ Chrome/Edge: Suporte completo
- ✅ Firefox: Suporte completo
- ✅ Safari: Suporte completo (iOS 10+)
- ⚠️ Internet Explorer: Não suportado

## 🔧 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo e moderno
- **JavaScript (ES6+)** - Lógica da aplicação
- **IndexedDB** - Banco de dados local
- **Chart.js 4.4.0** - Gráficos interativos
- **SheetJS (xlsx) 0.18.5** - Exportação Excel
- **jsPDF 2.5.1** - Exportação PDF

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- 💻 Desktop (1920px+)
- 💼 Laptop (1366px - 1920px)
- 📱 Tablet (768px - 1366px)
- 📱 Mobile (320px - 768px)

## 🎨 Tratamento da Questão 8

A questão 8 (tabela de produtos transportados) possui tratamento especial:
- Tabela dinâmica com botão "Adicionar Produto"
- Cada linha contém: carga, movimentação, origem, destino, distância, modalidade, acondicionamento
- Possibilidade de adicionar múltiplas linhas
- Botão de exclusão para cada linha
- Dados exportados em aba separada no Excel

## 🔐 Segurança e Privacidade

- Todos os dados são armazenados **localmente** no navegador do usuário
- **Nenhum dado é enviado para servidores externos**
- A aplicação funciona 100% offline após carregamento
- Recomenda-se fazer backups regulares via exportação

## 📞 Suporte e Contribuições

Para reportar problemas ou sugerir melhorias, abra uma issue no GitHub.

## 📄 Licença

Este projeto foi desenvolvido para o Plano de Logística e Investimentos do Estado de São Paulo (PLI 2050).

---

**Desenvolvido para:** Secretaria de Meio Ambiente, Infraestrutura e Logística (SEMIL) - Governo do Estado de São Paulo

**Financiamento:** Banco Interamericano de Desenvolvimento (BID)

**Contrato:** Nº 22.607-5

**Produto:** D-4 - Obtenção de matrizes multimodais para o ano base
