# GitHub Copilot Instructions - PLI 2050 Sistema de Formulários

## Sistema Overview

**PLI 2050** é um sistema web full-stack para coleta de dados de entrevistas com empresas embarcadoras do Estado de São Paulo, desenvolvido para o Plano de Logística e Investimentos. O sistema utiliza uma arquitetura de 3 camadas:

1. **Frontend**: Single Page Application (SPA) com navegação estática entre 5 páginas (formulário, visualização, analytics, instruções, diagnóstico)
2. **Backend**: API REST em Node.js/Express servindo JSON (porta 3000)
3. **Database**: PostgreSQL 17 no AWS RDS com schema `formulario_embarcadores`

**Importante**: Backend NÃO serve HTML - apenas retorna JSON. Frontend é servido por Five Server (porta 5500) ou GitHub Pages.

## Arquitetura e Fluxo de Dados

### Estrutura de Diretórios
```
/                          # Frontend (SPA estática)
├── index.html             # Formulário de 43 perguntas em 8 blocos
├── respostas.html         # Visualizador de dados salvos
├── app.js                 # Lógica principal (2622 linhas)
├── api-client.js          # Cliente HTTP com retry e detecção de ambiente
├── validation.js          # Mapeamento de 43 perguntas + validações
├── analytics.js           # Chart.js - 12 gráficos + 5 KPIs
├── styles.css             # Design responsivo + modal de feedback
└── backend-api/
    ├── server.js          # API REST Express (1133 linhas, 25+ endpoints)
    ├── .env               # Credenciais AWS RDS (NÃO commitar)
    └── package.json       # Node deps: express, pg, cors, helmet
```

### Fluxo de Salvamento de Pesquisa

**Passo 1 - Frontend (`app.js`)**: 
- Usuário preenche formulário → clica "💾 Salvar Respostas"
- `handleFormSubmit()` → `validateAllFormFields()` → destaca campos inválidos em vermelho
- Se válido: `collectFormData()` coleta 47 campos + tabela de produtos
- `fetch('http://localhost:3000/api/submit-form', {method: 'POST', body: JSON.stringify(formData)})`

**Passo 2 - Backend (`server.js`)**:
- Endpoint `POST /api/submit-form` recebe payload
- Inicia transação PostgreSQL: `BEGIN`
- **4 INSERTs sequenciais** (ordem importa):
  1. `empresas` (ou UPDATE se CNPJ existe) → `id_empresa`
  2. `entrevistados` → `id_entrevistado`
  3. `pesquisas` (47 campos incluindo FKs) → `id_pesquisa`
  4. `produtos_transportados` (loop para cada produto) → múltiplos inserts
- `COMMIT` ou `ROLLBACK` em caso de erro

**Passo 3 - Frontend recebe resposta**:
- Sucesso: 
  - Gera Excel via `XLSX.writeFile()` com nome `PLI2050_Resposta_{empresa}_{data}.xlsx`
  - `mostrarFeedback(MENSAGENS_FEEDBACK.sucesso.salvamento)` → modal verde animado
  - Aguarda 3s → `form.reset()` + `fecharFeedback()`
- Erro:
  - `mostrarFeedback(MENSAGENS_FEEDBACK.erro.*)` com detalhes técnicos expansíveis
  - Mensagens amigáveis baseadas em códigos de erro PostgreSQL (23505 = duplicate key, etc.)

## Convenções de Código Cruciais

### 1. Validação Visual em Tempo Real
```javascript
// Campo inválido recebe classe CSS "invalid" que aplica borda vermelha
function highlightInvalidFields(invalidFields) {
    invalidFields.forEach(field => {
        const element = document.getElementById(field.field);
        element.classList.add('invalid'); // Remove após correção
    });
}
```

### 2. Sistema de Feedback Modal (NÃO usar alert())
```javascript
// SEMPRE use mostrarFeedback() ao invés de alert()
// Estrutura em app.js linha ~2389
const MENSAGENS_FEEDBACK = {
    sucesso: {
        salvamento: {
            titulo: "Resposta Salva com Sucesso!",
            corpo: (empresa, arquivo) => `...HTML com modal verde...`
        }
    },
    erro: {
        validacao: { titulo, corpo },
        conexao: { titulo, corpo },
        banco: { titulo, corpo }
    }
};

// Exemplo de uso
mostrarFeedback(MENSAGENS_FEEDBACK.sucesso.salvamento.corpo(nomeEmpresa, nomeArquivo));
```

### 3. Cliente API com Auto-Detecção de Ambiente
```javascript
// api-client.js detecta automaticamente desenvolvimento vs produção
const API_CONFIG = {
    PRODUCTION_URL: 'https://sua-api.onrender.com', // Atualizar após deploy
    DEVELOPMENT_URL: 'http://localhost:3000',
    get BASE_URL() {
        return window.location.hostname.includes('github.io') 
            ? this.PRODUCTION_URL 
            : this.DEVELOPMENT_URL;
    }
};

// Uso: await api.get('/api/estados') - retry automático 3x
```

### 4. Campos Condicionais e Cascata
- **Q16 (num_paradas)**: Só aparece se Q15 (tem_paradas) === "sim"
- **Q18 (config_veiculo)**: Só aparece se Q17 (modos) inclui "rodoviario"
- **Q12/Q13 (origem/destino)**: 
  - País "Brasil" (id_pais=31) → habilita select de estados
  - Estado selecionado → filtra municípios: `municipios.filter(m => m.id_estado == estadoId)`

### 5. Tabela de Produtos Dinâmica (Q8)
```javascript
// Permite adicionar/remover linhas de produtos
function addProdutoRow() {
    produtoRowCounter++;
    const newRow = createProdutoRow(produtoRowCounter);
    document.getElementById('produtos-table-body').appendChild(newRow);
}

// Coleta: collectFormData() retorna array de objetos
produtos_transportados: [
    {produto: "Soja", movimentacao_anual: 50000, origem: "Ribeirão Preto", ...},
    {produto: "Açúcar", movimentacao_anual: 30000, ...}
]
```

## Schema do Banco de Dados

**Schema**: `formulario_embarcadores` (sempre usar qualified names)

**Tabelas Principais** (ordem de inserção importa devido a FKs):
1. `instituicoes` (id_instituicao PK) - 5 registros pré-populados
2. `funcoes_entrevistado` (id_funcao PK) - 20+ funções
3. `estados_brasil` (id_estado PK, uf UNIQUE) - 27 estados
4. `paises` (id_pais PK) - 61 países (Brasil = 31)
5. `municipios_sp` (codigo_municipio PK STRING, id_estado FK) - 645 municípios
6. `entrevistadores` (id_entrevistador PK, id_instituicao FK)
7. `empresas` (id_empresa PK, cnpj UNIQUE)
8. `entrevistados` (id_entrevistado PK, id_funcao FK)
9. `pesquisas` (id_pesquisa PK, 47 campos + 10 FKs)
10. `produtos_transportados` (id_produto PK, id_pesquisa FK)

**View Crítica**: `v_pesquisas_completa` (65 colunas) - JOINs todas as tabelas e retorna valores textuais ao invés de IDs

**Códigos IBGE são STRINGS**: `origem_municipio VARCHAR(10)`, `origem_estado VARCHAR(2)`

## Comandos de Desenvolvimento

### Iniciar Backend Local
```powershell
cd backend-api
npm install              # Primeira vez
node server.js           # Ou: npm start

# Verificar: http://localhost:3000/health
# Retorna: {"status":"OK","database":"Connected","timestamp":"..."}
```

### Testar API
```powershell
node testar_api.js       # Testa todos os 25 endpoints
node criar_banco.js      # Reconecta e verifica schema (NÃO recria)
```

### Frontend
- **Desenvolvimento**: Abrir `index.html` com Five Server (VS Code) na porta 5500
- **Produção**: GitHub Pages serve arquivos estáticos (sem backend local)

### Parar Processos Node
```powershell
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
```

## Padrões de Resposta da API

### Sucesso
```json
{
    "success": true,
    "message": "Pesquisa salva com sucesso",
    "data": {
        "id_pesquisa": 123,
        "id_empresa": 45,
        "id_entrevistado": 67,
        "produtos_inseridos": 3
    }
}
```

### Erro
```json
{
    "success": false,
    "message": "Mensagem amigável para usuário",
    "details": "Erro técnico completo do PostgreSQL",
    "code": "23505"  // Código de erro PostgreSQL
}
```

**Frontend trata códigos específicos**: 
- `23505` (duplicate key) → "Registro já existe"
- `23503` (FK violation) → "Dados de referência inválidos"
- `23502` (NOT NULL) → "Campo obrigatório não preenchido"

## Tratamento de Erros Específicos

### Erro de Conexão API
```javascript
// Frontend detecta fetch() falhou
catch (error) {
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
        mostrarFeedback(MENSAGENS_FEEDBACK.erro.conexao.corpo(error.message));
        // Modal com checklist:
        // - Backend está rodando? (node server.js)
        // - URL correta em api-client.js?
        // - CORS configurado? (ALLOWED_ORIGINS no .env)
    }
}
```

### Validação Frontend vs Backend
- **Frontend**: Validação imediata visual + scroll to error
- **Backend**: Validação de constraints SQL + transações atômicas
- **Nunca confie apenas no frontend** - backend sempre re-valida

## Deploy (Ordem Crítica)

1. **Backend primeiro**: Deploy no Render/Railway/Heroku
   - Configurar vars: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `ALLOWED_ORIGINS`
   - Obter URL: `https://pli2050-api.onrender.com`

2. **Atualizar frontend**: Editar `api-client.js`
   ```javascript
   PRODUCTION_URL: 'https://pli2050-api.onrender.com', // URL real do passo 1
   ```

3. **Deploy frontend**: Push para GitHub → GitHub Pages

4. **Testar**: `diagnostico_api.html` testa todos os endpoints em produção

## Segurança e CORS

```javascript
// Backend: server.js linha ~80
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
// Exemplo: "https://vpcapanema.github.io,http://localhost:5500,http://127.0.0.1:5500"

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Permite Postman/curl
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS: Origem não permitida'));
        }
    }
}));
```

**Rate Limiting**: 100 requests/minuto por IP (configurável em `server.js`)

## Geração de Excel

```javascript
// Usa SheetJS (biblioteca incluída via CDN no index.html)
function generateExcelFromSingleResponse(formData) {
    const wb = XLSX.utils.book_new();
    
    // Aba 1: Dados principais (47 campos em colunas)
    const ws1 = XLSX.utils.json_to_sheet([formData]);
    XLSX.utils.book_append_sheet(wb, ws1, "Resposta");
    
    // Aba 2: Produtos transportados (tabela Q8)
    const ws2 = XLSX.utils.json_to_sheet(formData.produtos_transportados);
    XLSX.utils.book_append_sheet(wb, ws2, "Produtos");
    
    // Download automático
    XLSX.writeFile(wb, `PLI2050_Resposta_${empresa}_${timestamp}.xlsx`);
}
```

## Debugging Comum

### "Backend não está acessível"
- ✅ CORRETO: `http://localhost:3000/health` retorna JSON
- ❌ ERRADO: Tentar acessar `http://localhost:3000/index.html` → 404

### "CORS Error"
- Verificar `ALLOWED_ORIGINS` no `.env` do backend
- Reiniciar backend após alterar `.env`

### "Município não aparece no dropdown"
- Cascata: Primeiro selecionar país "Brasil" → depois estado → depois município
- Municípios filtrados por: `municipios.filter(m => m.id_estado == estadoSelecionado)`

### "Formulário não valida campo X"
- Checar `validation.js` - campo pode ser `required: false` ou `conditional: true`
- Q16, Q18, Q28 só aparecem condicionalmente

## Referências Rápidas

- **Documentação completa**: `DOCUMENTACAO_COMPLETA.md`
- **Arquitetura**: `ARQUITETURA_SISTEMA.md`
- **Deploy**: `GUIA_DEPLOY.md`
- **Início rápido**: `COMECE_AQUI.md`
- **Testes**: `GUIA_TESTES.md`
- **Fluxo de dados**: `FLUXO_PAYLOAD_SISTEMA.md`
- **Schema SQL**: `database_schema_completo.sql`

---

**Última atualização**: 05/11/2025  
**Contato**: Sistema desenvolvido para SEMIL-SP / BID
