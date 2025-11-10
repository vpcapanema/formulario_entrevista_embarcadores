# Arquitetura e Deploy - Full-Stack Web Application

> **Documentação para Agentes de IA e Desenvolvedores**  
> Este documento explica a arquitetura de 3 camadas (Frontend + Backend + Database) usando GitHub Pages, Render.com e banco de dados remoto.
>
> **📌 Caso de Estudo**: Sistema PLI 2050 (Plano de Logística e Investimentos - SP)  
> **🔄 Template Genérico**: Pode ser adaptado para qualquer aplicação web full-stack

---

## 🌍 PARTE 1: ARQUITETURA GENÉRICA (Para Qualquer Aplicação)

### Visão Geral da Arquitetura de 3 Camadas

Esta arquitetura é aplicável a **qualquer aplicação web full-stack** que precise de:
- ✅ Frontend estático (HTML, CSS, JS)
- ✅ Backend API REST (Node.js, Python, Ruby, Go, etc.)
- ✅ Banco de dados remoto (PostgreSQL, MySQL, MongoDB, etc.)
- ✅ Deploy gratuito ou low-cost
- ✅ Escalabilidade e separação de responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA 1: FRONTEND                        │
│                   (GitHub Pages - GRÁTIS)                    │
│                                                              │
│  📱 Interface do Usuário:                                    │
│     • HTML5 (estrutura)                                      │
│     • CSS3 (estilos)                                         │
│     • JavaScript Vanilla ou Framework (React, Vue, etc.)     │
│     • Bibliotecas: Chart.js, jsPDF, etc.                    │
│                                                              │
│  🔒 Limitações:                                              │
│     • Apenas arquivos estáticos                              │
│     • Não executa código server-side                         │
│     • Não pode acessar banco diretamente                     │
│                                                              │
│  ✅ Vantagens:                                               │
│     • Gratuito e ilimitado                                   │
│     • CDN global automático                                  │
│     • HTTPS automático                                       │
│     • Deploy via git push                                    │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ HTTPS Requests (fetch API)
                   │ GET /api/users, POST /api/submit, etc.
                   │
┌──────────────────▼───────────────────────────────────────────┐
│                    CAMADA 2: BACKEND                         │
│                 (Render.com ou similar)                      │
│                                                              │
│  🔧 Servidor API REST:                                       │
│     • Node.js/Express, Python/FastAPI, Ruby/Rails, Go, etc.  │
│     • Endpoints JSON                                         │
│     • Autenticação (JWT, OAuth, etc.)                        │
│     • Validação server-side                                  │
│     • Business logic                                         │
│     • CORS configurado                                       │
│                                                              │
│  💰 Opções de Hosting:                                       │
│     • Render.com (750h/mês grátis)                           │
│     • Railway.app ($5 crédito inicial)                       │
│     • Fly.io (3 VMs grátis)                                  │
│     • Heroku (planos pagos)                                  │
│     • AWS Lambda (serverless)                                │
│                                                              │
│  ⚙️ Features Comuns:                                         │
│     • Auto-deploy via GitHub                                 │
│     • Variáveis de ambiente                                  │
│     • Logs e monitoring                                      │
│     • SSL/HTTPS automático                                   │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ SQL/NoSQL Queries
                   │ SELECT, INSERT, UPDATE, DELETE
                   │
┌──────────────────▼───────────────────────────────────────────┐
│                    CAMADA 3: DATABASE                        │
│              (AWS RDS, MongoDB Atlas, etc.)                  │
│                                                              │
│  🗄️ Banco de Dados Remoto:                                  │
│     • PostgreSQL (AWS RDS, Supabase, Neon)                   │
│     • MySQL (AWS RDS, PlanetScale)                           │
│     • MongoDB (MongoDB Atlas)                                │
│     • Redis (Upstash, Redis Cloud)                           │
│                                                              │
│  💾 Armazenamento:                                           │
│     • Dados persistentes                                     │
│     • Backups automáticos                                    │
│     • Replicação e failover                                  │
│                                                              │
│  💰 Opções Gratuitas:                                        │
│     • Supabase (500MB PostgreSQL)                            │
│     • MongoDB Atlas (512MB)                                  │
│     • Neon (3GB PostgreSQL)                                  │
│     • PlanetScale (5GB MySQL)                                │
└──────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados Universal

```
1. Usuário acessa → github.io/seu-repo/
   ↓
2. HTML/CSS/JS carregam no navegador
   ↓
3. JavaScript faz fetch() para Backend API
   ↓
4. Backend valida, processa, consulta banco
   ↓
5. Banco retorna dados
   ↓
6. Backend retorna JSON para Frontend
   ↓
7. JavaScript renderiza dados na tela
```

---

## �️ GUIA GENÉRICO: Como Adaptar para Sua Aplicação

### Checklist de Adaptação

#### 1. Frontend (GitHub Pages)

**Estrutura Obrigatória:**
```
seu-repositorio/
├── index.html              ← DEVE estar na RAIZ (página inicial)
├── about.html              ← Outras páginas (opcional, na raiz ou subpasta)
├── css/
│   └── styles.css
├── js/
│   ├── api-client.js       ← Cliente HTTP (adaptar URLs)
│   └── app.js              ← Lógica da aplicação
└── assets/
    └── images/
```

**api-client.js Genérico (copiar e adaptar):**
```javascript
class APIClient {
    constructor() {
        // ALTERAR ESTAS URLs PARA SEU BACKEND
        this.PRODUCTION_URL = 'https://seu-backend.onrender.com';
        this.DEVELOPMENT_URL = 'http://localhost:3000'; // ou 8000, 5000, etc.
        
        // Auto-detecção (NÃO alterar)
        this.BASE_URL = this.detectEnvironment();
        console.log('🔗 API URL:', this.BASE_URL);
    }
    
    detectEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname.includes('github.io')) {
            return this.PRODUCTION_URL;
        }
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return this.DEVELOPMENT_URL;
        }
        
        return this.PRODUCTION_URL;
    }
    
    async get(endpoint) {
        const response = await fetch(`${this.BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }
    
    async post(endpoint, data) {
        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }
}

window.API = new APIClient();
```

**Uso no HTML:**
```html
<script src="js/api-client.js"></script>
<script>
    // Automaticamente usa URL correta (localhost ou produção)
    async function loadData() {
        const data = await window.API.get('/api/items');
        console.log(data);
    }
</script>
```

#### 2. Backend (Render.com)

**Estrutura Mínima (Node.js/Express):**
```
backend/
├── server.js              ← Entry point
├── package.json           ← Dependências
├── .env.example           ← Template de variáveis (commitar)
├── .env                   ← Valores reais (NÃO commitar)
└── routes/
    └── api.js
```

**server.js Genérico (Node.js/Express):**
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS - CRÍTICO PARA GITHUB PAGES
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Suas rotas aqui
app.get('/api/items', async (req, res) => {
    // Consultar banco, processar, retornar JSON
    res.json({ items: [] });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});
```

**package.json:**
```json
{
  "name": "seu-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "pg": "^8.11.0"
  }
}
```

**Estrutura Mínima (Python/FastAPI):**
```
backend/
├── main.py                ← Entry point
├── requirements.txt       ← Dependências
├── .env.example
└── app/
    └── routers/
```

**main.py Genérico (Python/FastAPI):**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS - CRÍTICO PARA GITHUB PAGES
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "OK"}

@app.get("/api/items")
def get_items():
    # Consultar banco, processar, retornar JSON
    return {"items": []}
```

**requirements.txt:**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
```

#### 3. Configuração no Render.com

**Passo a Passo Universal:**

1. **Criar conta**: https://dashboard.render.com/
2. **New → Web Service**
3. **Conectar repositório GitHub**
4. **Configurações (adaptar para sua app):**
   ```
   Name: seu-backend
   Region: Oregon (ou mais próximo)
   Branch: main
   Root Directory: backend/        ← Se backend em subpasta
   Runtime: Node / Python 3
   Build Command:
     - Node: npm install
     - Python: pip install -r requirements.txt
   Start Command:
     - Node: npm start (ou node server.js)
     - Python: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

5. **Environment Variables (CRÍTICO):**
   ```
   ALLOWED_ORIGINS=https://seu-usuario.github.io,http://localhost:3000
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   JWT_SECRET=seu-secret-aqui
   NODE_ENV=production
   ```

6. **Deploy → Aguardar 5-10 minutos**

7. **Testar:**
   ```
   https://seu-backend.onrender.com/health
   → Deve retornar: {"status": "OK"}
   ```

#### 4. Banco de Dados (Opções)

**PostgreSQL (Supabase - GRÁTIS):**
```
1. Criar conta: https://supabase.com
2. New Project → Escolher região
3. Copiar connection string
4. Adicionar no Render como DATABASE_URL
```

**PostgreSQL (Neon - GRÁTIS):**
```
1. Criar conta: https://neon.tech
2. Create Project
3. Copiar connection string
4. Adicionar no Render
```

**MongoDB (Atlas - GRÁTIS):**
```
1. Criar conta: https://www.mongodb.com/cloud/atlas
2. Create Free Cluster
3. Database Access → Add User
4. Network Access → Add IP (0.0.0.0/0 para aceitar de qualquer lugar)
5. Copiar connection string
6. Adicionar no Render como MONGODB_URI
```

---

## 📱 PARTE 2: CASO DE ESTUDO - Sistema PLI 2050

### Visão Geral do Sistema PLI 2050

O sistema PLI 2050 é uma aplicação **web full-stack** com arquitetura de **3 camadas**:

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB PAGES                              │
│              (Frontend - Arquivos Estáticos)                 │
│         https://vpcapanema.github.io/                        │
│         formulario_entrevista_embarcadores/                  │
│                                                              │
│  • HTML, CSS, JavaScript                                     │
│  • Validação client-side                                     │
│  • PDF Generator (jsPDF)                                     │
│  • SPA Router (navegação)                                    │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ HTTPS Requests
                   │ (fetch API)
                   │
┌──────────────────▼───────────────────────────────────────────┐
│                      RENDER.COM                              │
│                 (Backend - API REST)                         │
│   https://formulario-entrevista-embarcadores.onrender.com   │
│                                                              │
│  • FastAPI (Python 3.11)                                     │
│  • CORS configurado                                          │
│  • Endpoints REST (JSON)                                     │
│  • Rate Limiting                                             │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ SQL Queries
                   │ (psycopg2)
                   │
┌──────────────────▼───────────────────────────────────────────┐
│                      AWS RDS                                 │
│              (Database - PostgreSQL 17)                      │
│   sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds...     │
│                                                              │
│  • Database: sigma_pli                                       │
│  • Schema: formulario_embarcadores                           │
│  • View: v_pesquisas_completa (65 campos)                    │
│  • 10 tabelas relacionadas                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Estrutura de Diretórios Atual

### Estrutura Completa no Repositório

```
formulario_entrevista_embarcadores/
│
├── frontend/                          # Frontend (GitHub Pages)
│   ├── html/                          # Páginas HTML
│   │   ├── index.html                 # ❌ NÃO USAR (desatualizado)
│   │   ├── respostas.html             # Tabela de pesquisas
│   │   ├── analytics.html             # Gráficos e KPIs
│   │   ├── instrucoes.html            # Instruções de uso
│   │   ├── diagnostico_api.html       # Teste de endpoints
│   │   └── visualizador_dados.html    # Visualizador RDS
│   │
│   ├── css/                           # Estilos
│   │   ├── index.css                  # Estilos principais
│   │   └── pages.css                  # Estilos das páginas
│   │
│   ├── js/                            # JavaScript modules
│   │   ├── core-api.js                # ⭐ Cliente HTTP (auto-detecta ambiente)
│   │   ├── form-validator.js          # ⭐ Validação instantânea (66 campos)
│   │   ├── form-collector.js          # Coleta dados do formulário
│   │   ├── pdf-generator.js           # Gera PDF com jsPDF
│   │   ├── integration-cnpj.js        # API Receita Federal
│   │   ├── ui-feedback.js             # Modais e mensagens
│   │   ├── spa-router.js              # Navegação SPA
│   │   ├── navbar.js                  # Menu de navegação
│   │   ├── auth-simple.js             # Autenticação (localStorage)
│   │   └── analytics.js               # Chart.js (gráficos)
│   │
│   ├── assets/                        # Recursos estáticos
│   │   ├── favicon.svg
│   │   └── logo.png
│   │
│   └── vendor/                        # Bibliotecas externas
│       ├── jspdf.umd.min.js          # Geração de PDF
│       ├── jspdf.plugin.autotable.min.js
│       ├── xlsx.full.min.js          # Exportação Excel
│       └── chart.min.js              # Gráficos
│
├── backend-fastapi/                   # Backend (Render.com)
│   ├── main.py                        # ⭐ Entry point FastAPI
│   ├── requirements.txt               # Dependências Python
│   ├── Dockerfile                     # Container Docker
│   ├── render.yaml                    # Configuração Render
│   │
│   └── app/                           # Código da aplicação
│       ├── config/
│       │   ├── database.py            # Conexão PostgreSQL
│       │   └── settings.py            # Variáveis de ambiente
│       │
│       ├── routers/                   # Endpoints REST
│       │   ├── pesquisas/
│       │   │   └── routes.py          # GET/POST/DELETE pesquisas
│       │   ├── empresas/
│       │   ├── entrevistados/
│       │   └── listas/                # Estados, municípios, etc.
│       │
│       └── models/                    # Schemas Pydantic
│           └── schemas.py
│
├── index.html                         # ⭐ PÁGINA PRINCIPAL (raiz)
├── docs/                              # Documentação
├── sql/                               # Scripts SQL
├── migrations/                        # Migrações do banco
└── scripts/                           # Scripts utilitários
```

---

## 🎯 Arquivo HTML Principal - LOCALIZAÇÃO CRÍTICA

### ⚠️ ATENÇÃO: Estrutura de URLs do GitHub Pages

```
Repositório: vpcapanema/formulario_entrevista_embarcadores

URL Base GitHub Pages:
https://vpcapanema.github.io/formulario_entrevista_embarcadores/

Arquivo Principal (index.html):
DEVE estar na RAIZ do repositório para ser acessado em:
https://vpcapanema.github.io/formulario_entrevista_embarcadores/

Arquivos em frontend/html/:
https://vpcapanema.github.io/formulario_entrevista_embarcadores/frontend/html/respostas.html
https://vpcapanema.github.io/formulario_entrevista_embarcadores/frontend/html/analytics.html
```

### 📁 Localização CORRETA dos Arquivos

```
✅ CORRETO (atual):
/
├── index.html                         ← Formulário principal (página inicial)
└── frontend/
    ├── html/
    │   ├── respostas.html             ← Tabela de respostas
    │   ├── analytics.html             ← Gráficos
    │   ├── instrucoes.html            ← Instruções
    │   ├── diagnostico_api.html       ← Diagnóstico
    │   └── visualizador_dados.html    ← Visualizador RDS
    ├── css/
    │   ├── index.css
    │   └── pages.css
    └── js/
        ├── core-api.js                ← Auto-detecta localhost vs Render
        ├── form-validator.js
        └── [outros módulos...]

❌ ERRADO (não fazer):
frontend/
└── html/
    └── index.html                     ← Não funcionaria como página inicial
```

---

## 🔗 Sistema de Navegação SPA

### Navegação Entre Páginas

O sistema usa `spa-router.js` para navegação sem reload:

```javascript
// frontend/js/spa-router.js
const ROUTES = {
    'formulario': '/index.html',                          // Raiz
    'respostas': '/frontend/html/respostas.html',         // Subpasta
    'analytics': '/frontend/html/analytics.html',
    'instrucoes': '/frontend/html/instrucoes.html',
    'visualizador': '/frontend/html/visualizador_dados.html',
    'diagnostico': '/frontend/html/diagnostico_api.html'
};

function navegarPara(pagina) {
    const url = ROUTES[pagina];
    if (url) {
        window.location.href = url;
    }
}
```

### Navbar em Todas as Páginas

Todas as páginas HTML incluem:

```html
<!-- Navbar comum em TODOS os arquivos HTML -->
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-brand">
            <h1>PLI 2050 - SP</h1>
            <p>Plano de Logística e Investimentos</p>
        </div>
        <div class="nav-menu">
            <button class="nav-btn" onclick="navegarPara('formulario')">
                <span>📝</span> Formulário
            </button>
            <button class="nav-btn" onclick="navegarPara('respostas')">
                <span>📊</span> Respostas
            </button>
            <button class="nav-btn" onclick="navegarPara('analytics')">
                <span>📈</span> Analytics
            </button>
            <button class="nav-btn" onclick="navegarPara('instrucoes')">
                <span>📖</span> Instruções
            </button>
            <button class="nav-btn" onclick="navegarPara('visualizador')">
                <span>🔍</span> Visualizador
            </button>
        </div>
    </div>
</nav>

<!-- Scripts de navegação ao final -->
<script src="../js/spa-router.js?v=20251109"></script>
<script src="../js/navbar.js?v=20251109"></script>
```

**Importante**: `index.html` (raiz) usa caminhos relativos diferentes:

```html
<!-- index.html (raiz) -->
<script src="frontend/js/spa-router.js?v=20251109"></script>

<!-- Outros HTMLs (frontend/html/) -->
<script src="../js/spa-router.js?v=20251109"></script>
```

---

## 🌐 Detecção Automática de Ambiente

### core-api.js - Auto-detecção

O arquivo `frontend/js/core-api.js` detecta automaticamente se está rodando em:
- **Desenvolvimento**: `localhost` ou `127.0.0.1`
- **Produção**: `github.io`

```javascript
// frontend/js/core-api.js (linhas 15-40)

class CoreAPI {
    constructor() {
        // URLs de ambiente
        this.PRODUCTION_URL = 'https://formulario-entrevista-embarcadores.onrender.com';
        this.DEVELOPMENT_URL = 'http://localhost:8000';
        
        // Auto-detecção de ambiente
        this.BASE_URL = this.detectEnvironment();
        
        console.log('🌐 Ambiente detectado:', this.isProduction() ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
        console.log('🔗 API Base URL:', this.BASE_URL);
    }
    
    detectEnvironment() {
        const hostname = window.location.hostname;
        
        // GitHub Pages
        if (hostname.includes('github.io')) {
            return this.PRODUCTION_URL;
        }
        
        // Localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return this.DEVELOPMENT_URL;
        }
        
        // Fallback para produção
        return this.PRODUCTION_URL;
    }
    
    isProduction() {
        return this.BASE_URL === this.PRODUCTION_URL;
    }
    
    async get(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        // ... retry logic com 3 tentativas
    }
    
    async post(endpoint, data, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        // ... retry logic com 3 tentativas
    }
}

// Instância global
window.CoreAPI = new CoreAPI();
```

### Uso em Outras Páginas

```javascript
// Qualquer página HTML pode usar:
const response = await window.CoreAPI.get('/api/pesquisas/listar');
const result = await window.CoreAPI.post('/api/submit-form', formData);

// Automaticamente usa:
// - http://localhost:8000 em dev
// - https://formulario-entrevista-embarcadores.onrender.com em prod
```

---

## 🚀 Deploy no GitHub Pages

### Passo 1: Estrutura no Repositório

```bash
# Estrutura OBRIGATÓRIA:
/
├── index.html                    # ⭐ DEVE estar na raiz
├── frontend/
│   ├── html/
│   │   ├── respostas.html
│   │   └── [outras páginas]
│   ├── css/
│   ├── js/
│   └── assets/
└── [outros arquivos não servidos]
```

### Passo 2: Configuração no GitHub

1. **Ir para Settings do repositório**
   - URL: `https://github.com/vpcapanema/formulario_entrevista_embarcadores/settings`

2. **Pages (menu lateral esquerdo)**
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/ (root)`
   - Clicar em **Save**

3. **Aguardar Deploy**
   - GitHub Actions executará automaticamente
   - Deploy leva ~2-3 minutos
   - URL final: `https://vpcapanema.github.io/formulario_entrevista_embarcadores/`

### Passo 3: Verificar Deploy

```bash
# Acessar URLs:
✅ https://vpcapanema.github.io/formulario_entrevista_embarcadores/
   → Deve carregar index.html (formulário)

✅ https://vpcapanema.github.io/formulario_entrevista_embarcadores/frontend/html/respostas.html
   → Deve carregar página de respostas

✅ Console do navegador (F12) deve mostrar:
   🌐 Ambiente detectado: PRODUÇÃO
   🔗 API Base URL: https://formulario-entrevista-embarcadores.onrender.com
```

### Passo 4: Cache Busting

Sempre usar query strings versionadas para forçar atualização:

```html
<!-- BOM ✅ -->
<link rel="stylesheet" href="frontend/css/index.css?v=20251109">
<script src="frontend/js/core-api.js?v=20251109"></script>

<!-- RUIM ❌ -->
<link rel="stylesheet" href="frontend/css/index.css">
<script src="frontend/js/core-api.js"></script>
```

Para limpar cache após deploy:
1. Pressionar **Ctrl + Shift + R** (hard reload)
2. Ou abrir DevTools (F12) → **Network** → ativar **Disable cache**

---

## 🔧 Deploy no Render.com

### Passo 1: Estrutura Backend

```bash
backend-fastapi/
├── main.py                    # Entry point
├── requirements.txt           # Dependências
├── Dockerfile                 # Container (opcional)
├── render.yaml               # Configuração Render
└── app/
    ├── config/
    │   ├── database.py       # Conexão PostgreSQL
    │   └── settings.py       # Env vars
    └── routers/
        └── [endpoints...]
```

### Passo 2: requirements.txt

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
```

### Passo 3: Criar Web Service no Render

1. **Acessar**: https://dashboard.render.com/

2. **New → Web Service**

3. **Conectar Repositório GitHub**
   - Repository: `vpcapanema/formulario_entrevista_embarcadores`

4. **Configurações**:
   ```
   Name: formulario-entrevista-embarcadores
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend-fastapi
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

5. **Plano**: Free (ou pago se precisar de sempre ativo)

6. **Variáveis de Ambiente** (Environment Variables):
   ```
   PGHOST=sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
   PGPORT=5432
   PGDATABASE=sigma_pli
   PGUSER=postgres
   PGPASSWORD=[senha-aws-rds]
   PGSCHEMA=formulario_embarcadores
   
   ALLOWED_ORIGINS=https://vpcapanema.github.io,http://localhost:5500,http://127.0.0.1:5500
   
   PYTHONUNBUFFERED=1
   ```

7. **Deploy**: Clicar em **Create Web Service**

### Passo 4: Verificar Deploy

```bash
# Após ~5-10 minutos, testar:
✅ https://formulario-entrevista-embarcadores.onrender.com/
   → Retorna JSON: {"message": "PLI 2050 API"}

✅ https://formulario-entrevista-embarcadores.onrender.com/health
   → Retorna: {"status": "OK", "database": "Connected"}

✅ https://formulario-entrevista-embarcadores.onrender.com/api/pesquisas/listar
   → Retorna: {"success": true, "pesquisas": [...]}
```

### Passo 5: CORS - Configuração Crítica

No arquivo `backend-fastapi/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS - Permitir GitHub Pages + Localhost
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # ["https://vpcapanema.github.io", "http://localhost:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**IMPORTANTE**: Adicionar origem do GitHub Pages nas variáveis de ambiente do Render:
```
ALLOWED_ORIGINS=https://vpcapanema.github.io,http://localhost:5500,http://127.0.0.1:5500
```

---

## 🗄️ Database AWS RDS

### Conexão PostgreSQL

```python
# backend-fastapi/app/config/database.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("PGHOST"),
        port=os.getenv("PGPORT", 5432),
        database=os.getenv("PGDATABASE"),
        user=os.getenv("PGUSER"),
        password=os.getenv("PGPASSWORD"),
        cursor_factory=RealDictCursor,
        options=f"-c search_path={os.getenv('PGSCHEMA', 'public')}"
    )
```

### Schema Completo

```
sigma_pli (database)
└── formulario_embarcadores (schema)
    ├── instituicoes (5 registros)
    ├── funcoes_entrevistado (20+ funções)
    ├── estados_brasil (27 UFs)
    ├── paises (61 países)
    ├── municipios_sp (645 municípios)
    ├── entrevistadores
    ├── empresas (CNPJ UNIQUE)
    ├── entrevistados
    ├── pesquisas (47 campos + 10 FKs)
    ├── produtos_transportados
    └── v_pesquisas_completa (VIEW - 65 campos)
```

---

## 🔄 Fluxo de Dados Completo

### 1. Usuário Preenche Formulário

```
GitHub Pages (index.html)
↓
JavaScript valida (form-validator.js - 66 campos)
↓
Coleta dados (form-collector.js)
↓
Envia POST request (core-api.js)
```

### 2. Backend Processa

```
Render.com (FastAPI)
↓
POST /api/submit-form
↓
Valida payload (Pydantic schemas)
↓
Inicia transação PostgreSQL (BEGIN)
↓
4 INSERTs sequenciais:
  1. empresas (ou UPDATE se CNPJ existe)
  2. entrevistados
  3. pesquisas
  4. produtos_transportados (loop)
↓
COMMIT (ou ROLLBACK em erro)
↓
Retorna JSON: {success: true, id_pesquisa: 123}
```

### 3. Frontend Recebe Resposta

```
core-api.js recebe resposta
↓
SE sucesso:
  - Gera PDF (pdf-generator.js)
  - Mostra modal verde (ui-feedback.js)
  - Download automático do Excel
↓
SE erro:
  - Mostra modal vermelho com detalhes
  - Scroll para primeiro campo inválido
```

---

## 🧪 Testando Localmente

### Backend Local (Porta 8000)

```bash
cd backend-fastapi

# Criar .env
echo "PGHOST=sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com" > .env
echo "PGPORT=5432" >> .env
echo "PGDATABASE=sigma_pli" >> .env
echo "PGUSER=postgres" >> .env
echo "PGPASSWORD=[senha]" >> .env
echo "PGSCHEMA=formulario_embarcadores" >> .env
echo "ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500" >> .env

# Instalar dependências
pip install -r requirements.txt

# Rodar servidor
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Verificar
# http://localhost:8000/health
# http://localhost:8000/api/pesquisas/listar
```

### Frontend Local (Porta 5500)

```bash
# Opção 1: Five Server (VS Code Extension)
1. Instalar extensão "Five Server"
2. Abrir index.html
3. Clicar direito → "Open with Five Server"
4. Abre em http://localhost:5500

# Opção 2: Python HTTP Server
cd /
python -m http.server 5500

# Opção 3: Node.js http-server
npx http-server -p 5500
```

### Verificar Auto-Detecção

```
Abrir console (F12):

Localhost:
  🌐 Ambiente detectado: DESENVOLVIMENTO
  🔗 API Base URL: http://localhost:8000

GitHub Pages:
  🌐 Ambiente detectado: PRODUÇÃO
  🔗 API Base URL: https://formulario-entrevista-embarcadores.onrender.com
```

---

## 🐛 Troubleshooting Comum

### Erro 404 na API

**Problema**: Frontend não encontra backend

**Soluções**:
1. Verificar `core-api.js` tem URL correta do Render
2. Verificar backend está rodando (acessar `/health`)
3. Limpar cache do navegador (Ctrl + Shift + R)

### Erro CORS

**Problema**: `Access-Control-Allow-Origin` bloqueado

**Soluções**:
1. Verificar `ALLOWED_ORIGINS` no Render inclui `https://vpcapanema.github.io`
2. Verificar `main.py` configura CORS corretamente
3. Reiniciar backend no Render

### GitHub Pages Não Atualiza

**Problema**: Alterações não aparecem no site

**Soluções**:
1. Aguardar 2-3 minutos (GitHub Actions)
2. Hard reload: Ctrl + Shift + R
3. Verificar Actions no GitHub (tab Actions)
4. Limpar cache: DevTools → Application → Clear storage

### index.html Não Carrega

**Problema**: 404 ao acessar `github.io/repo/`

**Soluções**:
1. **Verificar index.html está na RAIZ** (não em subpasta)
2. Verificar Settings → Pages → Branch = `main`, Folder = `/ (root)`
3. Verificar commit tem index.html na raiz: `git ls-files | grep index.html`

### Campos Não Validam

**Problema**: Validação não dispara ao digitar

**Soluções**:
1. Verificar `form-validator.js` carregou (console sem erros)
2. Verificar versão do arquivo: `?v=20251109`
3. Limpar cache e recarregar

---

## 📝 Checklist de Deploy Completo

### GitHub Pages

- [ ] `index.html` está na **raiz** do repositório
- [ ] `frontend/` contém `html/`, `css/`, `js/`, `assets/`
- [ ] Todos os HTMLs usam caminhos relativos corretos
- [ ] `core-api.js` detecta `github.io` e usa URL do Render
- [ ] Query strings de versão atualizadas (`?v=20251109`)
- [ ] Settings → Pages → Branch = `main`, Folder = `/ (root)`
- [ ] GitHub Actions concluiu com sucesso (tab Actions)
- [ ] Site acessível em `https://vpcapanema.github.io/formulario_entrevista_embarcadores/`

### Render.com

- [ ] Repositório conectado
- [ ] Root Directory = `backend-fastapi`
- [ ] Build Command = `pip install -r requirements.txt`
- [ ] Start Command = `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Variáveis de ambiente configuradas:
  - [ ] `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSCHEMA`
  - [ ] `ALLOWED_ORIGINS` inclui `https://vpcapanema.github.io`
- [ ] Deploy concluído (status verde)
- [ ] `/health` retorna `{"status": "OK", "database": "Connected"}`
- [ ] `/api/pesquisas/listar` retorna dados (ou array vazio)

### Integração

- [ ] Frontend (GitHub Pages) consegue chamar backend (Render)
- [ ] CORS não bloqueando requisições
- [ ] Console mostra ambiente correto (F12)
- [ ] Formulário salva pesquisa com sucesso
- [ ] PDF é gerado e baixado
- [ ] Página de respostas carrega dados do RDS

---

## 📊 URLs de Referência

### Produção

| Componente | URL |
|------------|-----|
| **Frontend** | https://vpcapanema.github.io/formulario_entrevista_embarcadores/ |
| **Backend API** | https://formulario-entrevista-embarcadores.onrender.com |
| **Health Check** | https://formulario-entrevista-embarcadores.onrender.com/health |
| **Listar Pesquisas** | https://formulario-entrevista-embarcadores.onrender.com/api/pesquisas/listar |
| **Documentação API** | https://formulario-entrevista-embarcadores.onrender.com/docs |

### Desenvolvimento

| Componente | URL |
|------------|-----|
| **Frontend** | http://localhost:5500 |
| **Backend API** | http://localhost:8000 |
| **Health Check** | http://localhost:8000/health |
| **Listar Pesquisas** | http://localhost:8000/api/pesquisas/listar |
| **Documentação API** | http://localhost:8000/docs |

---

## 🔐 Segurança

### Variáveis Sensíveis

**NUNCA commitar**:
- `backend-fastapi/.env` (credenciais AWS RDS)
- Senhas de banco
- Tokens de API

**Adicionar ao .gitignore**:
```
.env
.env.*
*.env
__pycache__/
*.pyc
node_modules/
```

### CORS Restritivo

```python
# Produção: Apenas origens específicas
ALLOWED_ORIGINS = [
    "https://vpcapanema.github.io",
]

# Desenvolvimento: Adicionar localhost
ALLOWED_ORIGINS = [
    "https://vpcapanema.github.io",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
]
```

---

## 📚 Documentação Relacionada

| Documento | Descrição |
|-----------|-----------|
| `COMECE_AQUI.md` | Guia de início rápido |
| `DOCUMENTACAO_COMPLETA.md` | Documentação completa do sistema |
| `LOGICA_VALIDACAO_CAMPOS.md` | Validação instantânea (66 campos) |
| `FORMATADORES_VALORES.md` | Mapeamentos de valores (países, estados, etc) |
| `GUIA_DEPLOY.md` | Deploy passo a passo |
| `FLUXO_SALVAMENTO_BANCO.md` | Fluxo de dados completo |

---

## 🎓 Resumo para Agente de IA

### Estrutura Crítica

```
✅ OBRIGATÓRIO:
/index.html                              ← Página principal (RAIZ)
/frontend/html/[outras_paginas].html     ← Demais páginas (SUBPASTA)
/frontend/js/core-api.js                 ← Auto-detecta ambiente
/backend-fastapi/main.py                 ← Entry point API

❌ NÃO FAZER:
/frontend/html/index.html                ← Não seria página inicial do GitHub Pages
```

### Auto-Detecção de Ambiente

O sistema **NÃO REQUER** configuração manual de URLs:

```javascript
// core-api.js automaticamente usa:
github.io → https://formulario-entrevista-embarcadores.onrender.com
localhost → http://localhost:8000
```

### Deploy Mínimo

```bash
# 1. GitHub Pages (Frontend)
git add .
git commit -m "Deploy frontend"
git push origin main
# Settings → Pages → Branch: main, Folder: / (root)

# 2. Render.com (Backend)
# Dashboard → New Web Service → Connect GitHub repo
# Root Directory: backend-fastapi
# Environment Variables: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, ALLOWED_ORIGINS

# 3. Testar
# https://vpcapanema.github.io/formulario_entrevista_embarcadores/
```

---

**Última atualização**: 09/11/2025  
**Versão da documentação**: 2.0  
**Mantido por**: GitHub Copilot + vpcapanema
