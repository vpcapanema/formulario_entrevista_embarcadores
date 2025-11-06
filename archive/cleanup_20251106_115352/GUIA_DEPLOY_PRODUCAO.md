# 🚀 GUIA DE DEPLOY EM PRODUÇÃO - AMBIENTE GRATUITO

## 📖 Como Colocar a Aplicação PLI 2050 no Ar (100% Grátis)

**Versão:** 1.0  
**Data:** 05/11/2025  
**Objetivo:** Deploy completo em serviços gratuitos  

---

## 🎯 VISÃO GERAL DO DEPLOY

### Arquitetura em Produção

```
┌─────────────────────────────────────────────────────────────┐
│                  USUÁRIOS FINAIS                             │
│              (Entrevistadores PLI 2050)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      ↓
┌─────────────────────────────────────────────────────────────┐
│           FRONTEND - GitHub Pages (Gratuito)                 │
│  https://vpcapanema.github.io/formulario_entrevista/        │
│  • HTML, CSS, JavaScript                                     │
│  • Chart.js, jsPDF, XLSX                                     │
│  • CDN estático                                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (CORS configurado)
                      ↓
┌─────────────────────────────────────────────────────────────┐
│          BACKEND - Render.com ou Railway (Gratuito)          │
│  https://pli2050-api.onrender.com                           │
│  • Node.js + Express                                         │
│  • 512MB RAM, 0.1 CPU                                        │
│  • Sleep após 15min inatividade                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ PostgreSQL Connection
                      ↓
┌─────────────────────────────────────────────────────────────┐
│     BANCO DE DADOS - Neon.tech ou ElephantSQL (Gratuito)    │
│  PostgreSQL 15+                                              │
│  • 3GB armazenamento                                         │
│  • Conexões simultâneas limitadas                            │
│  • Backup automático diário                                  │
└─────────────────────────────────────────────────────────────┘
```

### Custos (100% Gratuito)

| Serviço | Plano Gratuito | Limitações | Custo |
|---------|---------------|------------|-------|
| **GitHub Pages** | Ilimitado | 100GB tráfego/mês | R$ 0,00 |
| **Render.com** | Free Tier | Sleep após 15min, 750h/mês | R$ 0,00 |
| **Neon.tech** | Free Tier | 3GB, 1 projeto | R$ 0,00 |
| **Total** | - | - | **R$ 0,00/mês** |

---

## 📦 PARTE 1: DEPLOY DO FRONTEND (GitHub Pages)

### Passo 1: Preparar Repositório GitHub

1. **Criar repositório (se não existe):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sistema PLI 2050"
   git branch -M main
   git remote add origin https://github.com/vpcapanema/formulario_entrevista_embarcadores.git
   git push -u origin main
   ```

2. **Estrutura de arquivos necessária:**
   ```
   formulario_entrevista_embarcadores/
   ├── index.html                    ✅ OBRIGATÓRIO
   ├── styles.css                    ✅ OBRIGATÓRIO
   ├── app.js                        ✅ OBRIGATÓRIO
   ├── payload-manager.js            ✅ OBRIGATÓRIO
   ├── form-payload-integrator.js    ✅ OBRIGATÓRIO
   ├── payload-init.js               ✅ OBRIGATÓRIO
   ├── cnpj-validator.js             ✅ OBRIGATÓRIO
   ├── validation.js                 ✅ OBRIGATÓRIO
   ├── database.js                   ✅ OBRIGATÓRIO
   ├── analytics.js                  ✅ OBRIGATÓRIO
   ├── api-client.js                 ✅ OBRIGATÓRIO
   ├── preencher_formulario_teste.js ✅ OBRIGATÓRIO
   ├── visualizador_dados.html       ⚠️ OPCIONAL
   ├── executar_teste.html           ⚠️ OPCIONAL
   └── README.md                     ✅ OBRIGATÓRIO
   ```

   ⚠️ **NÃO incluir no GitHub Pages:**
   - ❌ backend-api/ (será deployado separadamente)
   - ❌ .env (variáveis ambiente sensíveis)
   - ❌ node_modules/
   - ❌ *.sql (scripts banco de dados)

3. **Criar arquivo `.gitignore`:**
   ```gitignore
   # Node.js
   node_modules/
   npm-debug.log
   yarn-error.log
   
   # Ambiente
   .env
   .env.local
   .env.production
   
   # Backend (não vai para GitHub Pages)
   backend-api/node_modules/
   backend-api/.env
   
   # IDE
   .vscode/
   .idea/
   *.swp
   *.swo
   
   # OS
   .DS_Store
   Thumbs.db
   ```

### Passo 2: Configurar GitHub Pages

1. **Acessar configurações do repositório:**
   - GitHub.com → Seu repositório
   - Settings → Pages (menu lateral esquerdo)

2. **Configurar fonte:**
   - Source: "Deploy from a branch"
   - Branch: `main` → pasta `/ (root)`
   - Clicar "Save"

3. **Aguardar deploy (1-2 minutos):**
   - URL gerada: `https://vpcapanema.github.io/formulario_entrevista_embarcadores/`

4. **Testar URL:**
   - Acessar URL gerada
   - Verificar se formulário carrega
   - ⚠️ API ainda não funciona (backend não deployado)

### Passo 3: Atualizar URLs no Frontend

**Arquivo: `api-client.js` ou `database.js`**

ANTES (desenvolvimento):
```javascript
const API_URL = 'http://localhost:3000';
```

DEPOIS (produção):
```javascript
const API_URL = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'  // Desenvolvimento
    : 'https://pli2050-api.onrender.com';  // Produção (atualizar após deploy backend)
```

**Arquivo: `cnpj-validator.js` (linha ~126)**

ANTES:
```javascript
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://sua-api-aqui.herokuapp.com';
```

DEPOIS:
```javascript
const API_URL = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://pli2050-api.onrender.com';  // ⬅️ Atualizar com URL real do Render
```

---

## 🖥️ PARTE 2: DEPLOY DO BACKEND (Render.com)

### Opção A: Render.com (Recomendado)

#### Passo 1: Criar Conta Render.com

1. Acessar: https://render.com
2. Sign Up → "Sign up with GitHub"
3. Autorizar acesso ao repositório

#### Passo 2: Preparar Backend para Deploy

1. **Criar arquivo `backend-api/package.json` completo:**
   ```json
   {
     "name": "pli2050-backend",
     "version": "3.0.0",
     "description": "API REST para Sistema PLI 2050",
     "main": "server.js",
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     },
     "engines": {
       "node": ">=18.0.0"
     },
     "dependencies": {
       "express": "^4.18.2",
       "pg": "^8.11.3",
       "dotenv": "^16.3.1",
       "cors": "^2.8.5",
       "helmet": "^7.1.0",
       "express-rate-limit": "^7.1.5",
       "node-fetch": "^3.3.2"
     },
     "devDependencies": {
       "nodemon": "^3.0.2"
     }
   }
   ```

2. **Atualizar `backend-api/server.js` - Porta dinâmica:**
   ```javascript
   const PORT = process.env.PORT || 3000;  // ✅ Render usa variável PORT
   ```

3. **Criar arquivo `backend-api/.env.example` (modelo):**
   ```env
   # PostgreSQL Connection
   PGHOST=seu-host.neon.tech
   PGPORT=5432
   PGDATABASE=sigma_pli
   PGUSER=seu_usuario
   PGPASSWORD=sua_senha
   
   # Server
   PORT=3000
   NODE_ENV=production
   
   # CORS
   ALLOWED_ORIGINS=https://vpcapanema.github.io,http://localhost:5500
   ```

#### Passo 3: Deploy no Render

1. **Dashboard Render → "New +" → "Web Service"**

2. **Conectar repositório:**
   - Selecionar: `formulario_entrevista_embarcadores`
   - Branch: `main`

3. **Configurações do serviço:**
   - Name: `pli2050-api`
   - Region: `Oregon (US West)` (gratuito)
   - Branch: `main`
   - Root Directory: `backend-api`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

4. **Variáveis de Ambiente (Environment Variables):**
   
   Adicionar uma por uma:
   ```
   PGHOST = seu-host.neon.tech
   PGPORT = 5432
   PGDATABASE = sigma_pli
   PGUSER = seu_usuario
   PGPASSWORD = sua_senha_aqui
   NODE_ENV = production
   ALLOWED_ORIGINS = https://vpcapanema.github.io,http://localhost:5500
   ```

5. **Clicar "Create Web Service"**

6. **Aguardar deploy (3-5 minutos):**
   - Logs aparecem em tempo real
   - Status: "Live" quando concluído
   - URL gerada: `https://pli2050-api.onrender.com`

7. **Testar API:**
   ```bash
   # Health check
   curl https://pli2050-api.onrender.com/health
   
   # Resposta esperada:
   {
     "status": "ok",
     "timestamp": "2025-11-05T21:00:00.000Z",
     "database": "connected"
   }
   ```

#### ⚠️ Limitações Render.com Free Tier:

- ✅ **750 horas/mês gratuitas** (suficiente para 1 serviço 24/7)
- ⚠️ **Sleep após 15 minutos de inatividade**
  - Primeira requisição após sleep: ~30 segundos para "acordar"
  - Solução: Ping automático a cada 10 minutos (ver Passo 4)
- ⚠️ **512MB RAM, 0.1 CPU**
- ⚠️ **Logs mantidos por 7 dias**

#### Passo 4: Manter Render Sempre Ativo (Opcional)

**Usar UptimeRobot (gratuito) para ping automático:**

1. Acessar: https://uptimerobot.com
2. Sign Up (gratuito, até 50 monitores)
3. Add New Monitor:
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `PLI 2050 API`
   - URL: `https://pli2050-api.onrender.com/health`
   - Monitoring Interval: `5 minutes` (mínimo gratuito)
4. Save Monitor

⚠️ **Atenção:** Isso mantém a API ativa 24/7, mas consome suas 750h/mês. Para economizar horas, configure interval maior (10-15 min).

---

### Opção B: Railway.app (Alternativa)

**Vantagens:**
- Não dorme após inatividade (plano gratuito)
- 500 horas/mês gratuitas
- Deploy mais rápido
- Melhor para desenvolvimento

**Desvantagens:**
- Limite de horas menor (500h vs 750h Render)
- Menos recursos no plano gratuito

**Passos similares ao Render:**
1. Railway.app → Sign up with GitHub
2. New Project → Deploy from GitHub
3. Selecionar repositório + branch
4. Configurar variáveis ambiente
5. Deploy automático

---

## 💾 PARTE 3: BANCO DE DADOS (Neon.tech)

### Opção A: Neon.tech (Recomendado)

#### Por que Neon.tech?

✅ **3GB armazenamento gratuito** (vs 1GB ElephantSQL)  
✅ **PostgreSQL 15+** (mais moderno)  
✅ **Conexões autoscale**  
✅ **Backup automático** (1 dia retenção)  
✅ **Interface moderna**  

#### Passo 1: Criar Conta Neon

1. Acessar: https://neon.tech
2. Sign Up → "Continue with GitHub"
3. Autorizar acesso

#### Passo 2: Criar Projeto

1. **Dashboard → "Create Project"**
2. **Configurações:**
   - Project Name: `pli-2050-production`
   - PostgreSQL Version: `15`
   - Region: `US East (Ohio)` (mais próximo BR)
   - Database Name: `sigma_pli`

3. **Clicar "Create Project"**

4. **Copiar String de Conexão:**
   ```
   postgresql://usuario:senha@ep-xyz.us-east-2.aws.neon.tech/sigma_pli?sslmode=require
   ```

5. **Extrair variáveis:**
   ```
   PGHOST=ep-xyz.us-east-2.aws.neon.tech
   PGPORT=5432
   PGDATABASE=sigma_pli
   PGUSER=usuario
   PGPASSWORD=senha_gerada
   ```

#### Passo 3: Criar Schema e Tabelas

**Opção 1: Interface SQL Editor (Neon Web)**

1. Neon Dashboard → SQL Editor
2. Copiar conteúdo de `database_schema_completo.sql`
3. Executar script completo
4. Verificar: 9 tabelas criadas

**Opção 2: Via pgAdmin ou DBeaver**

1. Instalar pgAdmin: https://www.pgadmin.org/download/
2. Add New Server:
   - Host: `ep-xyz.us-east-2.aws.neon.tech`
   - Port: `5432`
   - Database: `sigma_pli`
   - Username: `usuario`
   - Password: `senha_gerada`
   - SSL Mode: `Require`

3. Executar scripts SQL:
   ```sql
   -- 1. Schema
   \i database_schema_completo.sql
   
   -- 2. Estados
   \i estados_brasil.sql
   
   -- 3. Municípios
   \i municipios_sp_completo.sql
   
   -- 4. Países
   \i paises.sql
   ```

**Opção 3: Via Linha de Comando**

```bash
# Windows (PowerShell)
cd D:\SISTEMA_FORMULARIOS_ENTREVISTA

# Conectar ao Neon
$env:PGPASSWORD="sua_senha"
psql -h ep-xyz.us-east-2.aws.neon.tech -U usuario -d sigma_pli -f database_schema_completo.sql
psql -h ep-xyz.us-east-2.aws.neon.tech -U usuario -d sigma_pli -f estados_brasil.sql
psql -h ep-xyz.us-east-2.aws.neon.tech -U usuario -d sigma_pli -f municipios_sp_completo.sql
psql -h ep-xyz.us-east-2.aws.neon.tech -U usuario -d sigma_pli -f paises.sql
```

#### Passo 4: Validar Tabelas Criadas

```sql
-- Conectar ao banco e executar:

-- Verificar schema
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name = 'formulario_embarcadores';

-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'formulario_embarcadores'
ORDER BY table_name;

-- Resultado esperado:
-- empresas
-- entrevistados
-- entrevistadores
-- estados_brasil
-- funcoes_entrevistado
-- instituicoes
-- municipios_sp
-- paises
-- pesquisas
-- produtos_transportados

-- Verificar dados carregados
SELECT COUNT(*) FROM dados_auxiliares.estados;     -- 27
SELECT COUNT(*) FROM dados_brasil.vw_dim_municipio_alias;  -- 5573
SELECT COUNT(*) FROM dados_auxiliares.paises;      -- 61
SELECT COUNT(*) FROM formulario_embarcadores.funcoes_entrevistado;  -- 12
```

#### ⚠️ Limitações Neon.tech Free Tier:

- ✅ **3GB armazenamento**
- ✅ **1 projeto**
- ⚠️ **Conexões simultâneas limitadas** (~20)
- ⚠️ **Inatividade > 7 dias → suspensão** (reativa automático ao acessar)
- ⚠️ **Backup 1 dia retenção** (plano pago: 7 dias)

---

### Opção B: ElephantSQL (Alternativa)

**Vantagens:**
- Mais simples de configurar
- Interface user-friendly

**Desvantagens:**
- Apenas 1GB armazenamento (vs 3GB Neon)
- PostgreSQL 12 (vs 15 Neon)

**Passos:**
1. elephantsql.com → Sign up
2. Create New Instance → "Tiny Turtle" (Free)
3. Copiar URL de conexão
4. Executar scripts SQL via interface web

---

## 🔗 PARTE 4: INTEGRAÇÃO COMPLETA

### Passo 1: Atualizar URLs no Frontend

**Arquivo: `api-client.js` ou `database.js`**

```javascript
const API_URL = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'                          // Local
    : 'https://pli2050-api.onrender.com';              // Produção
```

**Commit e push:**
```bash
git add .
git commit -m "Update: API URL para produção (Render)"
git push origin main
```

GitHub Pages atualiza automaticamente em ~1 minuto.

### Passo 2: Atualizar CORS no Backend

**Arquivo: `backend-api/server.js`**

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
// .env deve ter:
// ALLOWED_ORIGINS=https://vpcapanema.github.io,http://localhost:5500
```

**Atualizar variáveis no Render:**
1. Render Dashboard → Seu serviço → Environment
2. Editar `ALLOWED_ORIGINS`:
   ```
   https://vpcapanema.github.io,http://localhost:5500,http://127.0.0.1:5500
   ```
3. Save Changes → Auto redeploy

### Passo 3: Testar Integração Completa

1. **Abrir aplicação em produção:**
   ```
   https://vpcapanema.github.io/formulario_entrevista_embarcadores/
   ```

2. **Abrir Console (F12):**
   ```javascript
   // Verificar logs:
   ✅ API online e funcionando!
   ✅ 5573 municípios carregados
   ✅ PostgreSQL conectado
   ```

3. **Preencher formulário de teste:**
   - Clicar: "🧪 Preencher Formulário Completo de Teste"
   - Aguardar 4 segundos
   - Clicar: "💾 Enviar Formulário"

4. **Verificar sucesso:**
   ```
   ✅ Dados enviados com sucesso!
   ID da Empresa: 123
   ```

5. **Validar no banco (Neon SQL Editor):**
   ```sql
   SELECT * FROM formulario_embarcadores.empresas 
   ORDER BY id_empresa DESC LIMIT 1;
   
   SELECT * FROM formulario_embarcadores.entrevistados 
   ORDER BY id_entrevistado DESC LIMIT 1;
   
   SELECT * FROM formulario_embarcadores.pesquisas 
   ORDER BY id_pesquisa DESC LIMIT 1;
   ```

---

## 📊 PARTE 5: MONITORAMENTO E MANUTENÇÃO

### 5.1. Monitoramento Gratuito

**UptimeRobot (https://uptimerobot.com)**

Configure 2 monitores:

1. **Monitor 1: Backend Health**
   - URL: `https://pli2050-api.onrender.com/health`
   - Interval: 5 minutos
   - Alert: Email quando cair

2. **Monitor 2: Frontend**
   - URL: `https://vpcapanema.github.io/formulario_entrevista_embarcadores/`
   - Interval: 10 minutos
   - Alert: Email quando indisponível

**Configurar Alertas:**
- Email: seu-email@exemplo.com
- Notificar quando: Down
- Notificar quando: Up novamente

### 5.2. Logs e Debugging

**Render Logs:**
1. Dashboard Render → Seu serviço → Logs
2. Ver últimas 24h (plano gratuito)
3. Filtrar por erro: `/error/i`

**Neon Logs:**
1. Neon Dashboard → Monitoring → Query Stats
2. Ver queries lentas
3. Ver uso de armazenamento

**GitHub Pages:**
- Sem logs nativos
- Usar Google Analytics (gratuito) para tracking

### 5.3. Backup do Banco de Dados

**Backup Manual (Neon):**
```bash
# Dump completo
pg_dump -h ep-xyz.us-east-2.aws.neon.tech \
        -U usuario \
        -d sigma_pli \
        -F c \
        -f backup_pli2050_$(date +%Y%m%d).dump

# Restaurar backup
pg_restore -h ep-xyz.us-east-2.aws.neon.tech \
           -U usuario \
           -d sigma_pli \
           backup_pli2050_20251105.dump
```

**Backup Automático (Plano Pago):**
- Neon Pro: 7 dias retenção
- ~$19/mês (se necessário no futuro)

### 5.4. Atualizações de Código

**Fluxo de Atualização:**

```bash
# 1. Fazer alterações localmente
# 2. Testar em localhost:3000
# 3. Commit e push
git add .
git commit -m "Feature: Nova funcionalidade X"
git push origin main

# 4. GitHub Pages atualiza automaticamente (1-2 min)
# 5. Render redeploy automático (2-3 min) se backend mudou
```

---

## ✅ CHECKLIST DE DEPLOY

### Antes do Deploy

- [ ] Testes locais completos
- [ ] Validar todos os 43 campos do formulário
- [ ] Testar script automático de preenchimento
- [ ] Verificar CORS configurado corretamente
- [ ] Atualizar URLs (localhost → produção)
- [ ] Criar `.gitignore` (excluir .env, node_modules)
- [ ] Documentação atualizada

### Deploy Frontend (GitHub Pages)

- [ ] Repositório GitHub criado
- [ ] Código commitado e pushed
- [ ] GitHub Pages habilitado
- [ ] URL funcionando: `https://vpcapanema.github.io/...`
- [ ] Console sem erros (exceto API ainda não deployada)

### Deploy Backend (Render.com)

- [ ] Conta Render criada
- [ ] Repositório conectado
- [ ] Variáveis ambiente configuradas
- [ ] Deploy concluído (status: Live)
- [ ] Health check OK: `/health`
- [ ] Logs sem erros críticos

### Banco de Dados (Neon.tech)

- [ ] Conta Neon criada
- [ ] Projeto PostgreSQL criado
- [ ] Schema `formulario_embarcadores` criado
- [ ] 9 tabelas criadas
- [ ] Dados auxiliares carregados (estados, municípios, países)
- [ ] Conexão validada via pgAdmin ou psql
- [ ] String de conexão copiada para Render

### Integração Completa

- [ ] URLs atualizadas no frontend
- [ ] CORS configurado no backend
- [ ] Teste de formulário completo
- [ ] Envio ao banco funcionando
- [ ] Validação de dados no PostgreSQL
- [ ] Dashboard analytics funcionando
- [ ] Exportação Excel/PDF funcionando

### Monitoramento

- [ ] UptimeRobot configurado
- [ ] Alertas de email configurados
- [ ] Logs sendo monitorados
- [ ] Backup manual realizado

---

## 🆘 TROUBLESHOOTING

### Problema 1: GitHub Pages não atualiza

**Sintomas:** Alterações no código não aparecem

**Soluções:**
```bash
# 1. Forçar rebuild
git commit --allow-empty -m "Trigger rebuild"
git push origin main

# 2. Limpar cache do navegador
Ctrl + Shift + Delete → Limpar cache

# 3. Verificar status do deploy
GitHub → Actions → Ver último workflow
```

### Problema 2: Render "Service Unavailable"

**Sintomas:** API retorna erro 503

**Soluções:**
```
1. Verificar logs: Dashboard → Logs
2. Verificar variáveis ambiente: Environment → Check all vars
3. Redeploy manual: Manual Deploy → Deploy latest commit
4. Verificar plano gratuito não expirou: Account → Billing
```

### Problema 3: Neon "Connection Timeout"

**Sintomas:** Backend não conecta ao banco

**Soluções:**
```javascript
// 1. Verificar string de conexão
console.log('PGHOST:', process.env.PGHOST);

// 2. Verificar SSL mode
const pool = new Pool({
    ssl: { rejectUnauthorized: false }  // ✅ Necessário para Neon
});

// 3. Verificar projeto Neon não suspendeu
Neon Dashboard → Reativar se suspenso

// 4. Verificar IP whitelisting (Neon não tem, mas ElephantSQL sim)
```

### Problema 4: CORS Error

**Sintomas:** Frontend não consegue chamar API

**Erro:**
```
Access to fetch at 'https://pli2050-api.onrender.com/api/empresas' 
from origin 'https://vpcapanema.github.io' 
has been blocked by CORS policy
```

**Solução:**
```javascript
// backend-api/server.js
const allowedOrigins = [
    'https://vpcapanema.github.io',  // ✅ Adicionar domínio GitHub Pages
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];
```

---

## 📞 RECURSOS E SUPORTE

**Documentação Oficial:**
- GitHub Pages: https://docs.github.com/pages
- Render.com: https://render.com/docs
- Neon.tech: https://neon.tech/docs
- UptimeRobot: https://uptimerobot.com/kb/

**Comunidades:**
- Stack Overflow: tag `github-pages`, `render`, `neon-database`
- Reddit: r/webdev, r/node, r/PostgreSQL

**Status Pages:**
- GitHub: https://www.githubstatus.com
- Render: https://status.render.com
- Neon: https://neon.tech/status

---

## 🎉 CONCLUSÃO

Após seguir este guia, você terá:

✅ **Frontend** funcionando em GitHub Pages (HTTPS)  
✅ **Backend** Node.js rodando no Render.com  
✅ **Banco PostgreSQL** na Neon.tech  
✅ **Monitoramento** com UptimeRobot  
✅ **Custo total:** R$ 0,00/mês  

**Próximos passos (opcional):**
- [ ] Domínio personalizado (pli2050.com.br) - ~R$40/ano
- [ ] Google Analytics para tracking
- [ ] PWA (Progressive Web App) para modo offline
- [ ] CI/CD com GitHub Actions

---

**Última Atualização:** 05/11/2025 às 21:30  
**Versão:** 1.0  
**Autor:** Vinicius Capanema + GitHub Copilot
