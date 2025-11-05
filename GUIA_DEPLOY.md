# 🚀 GUIA DE DEPLOY - SISTEMA PLI 2050

## Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                         │
│  (Frontend - HTML/CSS/JS - GRATUITO)                   │
│  https://vpcapanema.github.io/formulario_...           │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTP/HTTPS Requests
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API REST                           │
│  (Node.js + Express - Deploy em Heroku/Render/Railway) │
│  https://pli2050-api.herokuapp.com                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ PostgreSQL Connection (SSL)
                 ▼
┌─────────────────────────────────────────────────────────┐
│              AWS RDS PostgreSQL                         │
│  (Banco de Dados - JÁ CRIADO E CONFIGURADO)           │
│  sigma-pli-postgresql-db.cwlmgwc4igdh...               │
└─────────────────────────────────────────────────────────┘
```

## 📋 Checklist de Deploy

- [x] ✅ Banco de dados PostgreSQL criado no AWS RDS
- [x] ✅ Schema `formulario_embarcadores` criado
- [x] ✅ 11 tabelas criadas e populadas
- [x] ✅ Views de analytics criadas
- [x] ✅ Backend API desenvolvido
- [x] ✅ Cliente API JavaScript criado
- [ ] ⏳ Deploy do backend em servidor
- [ ] ⏳ Configurar URL da API no frontend
- [ ] ⏳ Deploy do frontend no GitHub Pages

---

## PASSO 1: Deploy do Backend (ESCOLHA UMA OPÇÃO)

### 🔷 OPÇÃO A: Heroku (Recomendado - Simples)

**Vantagens:** Simples, tem plano gratuito limitado, fácil configuração

1. **Crie conta no Heroku:** https://heroku.com
2. **Instale Heroku CLI:**
   ```bash
   # Windows (usando winget)
   winget install Heroku.HerokuCLI
   ```
3. **Faça login:**
   ```bash
   heroku login
   ```
4. **Crie o app:**
   ```bash
   cd backend-api
   heroku create pli2050-api
   ```
5. **Configure as variáveis de ambiente:**
   ```bash
   heroku config:set PGHOST=sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
   heroku config:set PGPORT=5432
   heroku config:set PGDATABASE=sigma_pli
   heroku config:set PGUSER=sigma_admin
   heroku config:set PGPASSWORD=Malditas131533*
   heroku config:set PORT=3000
   heroku config:set NODE_ENV=production
   heroku config:set ALLOWED_ORIGINS=https://vpcapanema.github.io,http://localhost:5500
   ```
6. **Adicione Procfile:**
   Crie arquivo `backend-api/Procfile`:
   ```
   web: node server.js
   ```
7. **Deploy:**
   ```bash
   # Dentro da pasta backend-api
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```
8. **Teste a API:**
   ```bash
   heroku open /health
   ```
9. **Copie a URL:** Algo como `https://pli2050-api.herokuapp.com`

---

### 🔷 OPÇÃO B: Render (Mais Fácil - 100% Grátis)

**Vantagens:** Totalmente gratuito, não precisa cartão, deploy via GitHub

1. **Acesse:** https://render.com
2. **Crie conta** (pode usar GitHub)
3. **Clique em "New +" → "Web Service"**
4. **Conecte seu repositório GitHub**
5. **Configure:**
   - **Name:** `pli2050-api`
   - **Region:** Oregon (US West) - mais próximo
   - **Branch:** `main`
   - **Root Directory:** `backend-api`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. **Adicione Environment Variables:**
   ```
   PGHOST=sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
   PGPORT=5432
   PGDATABASE=sigma_pli
   PGUSER=sigma_admin
   PGPASSWORD=Malditas131533*
   PORT=3000
   NODE_ENV=production
   ALLOWED_ORIGINS=https://vpcapanema.github.io,http://localhost:5500
   ```
7. **Clique em "Create Web Service"**
8. **Aguarde deploy (3-5 minutos)**
9. **Copie a URL:** Algo como `https://pli2050-api.onrender.com`

---

### 🔷 OPÇÃO C: Railway (Grátis e Rápido)

**Vantagens:** $5 grátis/mês, muito rápido, deploy automático

1. **Acesse:** https://railway.app
2. **Crie conta** com GitHub
3. **"New Project" → "Deploy from GitHub repo"**
4. **Selecione o repositório**
5. **Configure:**
   - Root Directory: `/backend-api`
6. **Adicione variáveis de ambiente** (igual aos exemplos acima)
7. **Deploy automático!**
8. **Copie a URL gerada**

---

### 🔷 OPÇÃO D: Vercel (Serverless - Avançado)

**Vantagens:** Muito rápido, escala automaticamente, grátis

1. **Acesse:** https://vercel.com
2. **Conecte GitHub**
3. **Importe o repositório**
4. **Configure:**
   - Root Directory: `backend-api`
5. **Adicione variáveis de ambiente**
6. **Deploy!**

---

## PASSO 2: Configurar URL da API no Frontend

Depois de fazer deploy do backend e obter a URL, atualize o arquivo `api-client.js`:

```javascript
// Editar linha 9 do arquivo api-client.js
const API_CONFIG = {
    // COLE AQUI A URL DO SEU BACKEND (sem barra no final)
    PRODUCTION_URL: 'https://pli2050-api.herokuapp.com',  // ← EXEMPLO
    // ou
    PRODUCTION_URL: 'https://pli2050-api.onrender.com',   // ← EXEMPLO
    
    DEVELOPMENT_URL: 'http://localhost:3000',
    // ...
```

Salve o arquivo!

---

## PASSO 3: Deploy do Frontend no GitHub Pages

### 3.1. Fazer Commit e Push

```bash
# Na raiz do projeto
git add .
git commit -m "Integração com backend PostgreSQL RDS"
git push origin main
```

### 3.2. Habilitar GitHub Pages

1. **Acesse:** https://github.com/vpcapanema/formulario_entrevista_embarcadores
2. **Clique em "Settings"** (Configurações)
3. **No menu lateral, clique em "Pages"**
4. **Em "Source", selecione:**
   - Branch: `main`
   - Folder: `/ (root)`
5. **Clique em "Save"**
6. **Aguarde 1-2 minutos**
7. **A URL estará disponível:**
   ```
   https://vpcapanema.github.io/formulario_entrevista_embarcadores/
   ```

---

## PASSO 4: Testar Tudo Funcionando

### 4.1. Teste o Backend

Abra no navegador:
```
https://sua-api-aqui.herokuapp.com/health
```

Deve retornar:
```json
{
  "status": "OK",
  "timestamp": "2025-11-05T...",
  "database": "Connected"
}
```

### 4.2. Teste o Frontend

1. Abra: `https://vpcapanema.github.io/formulario_entrevista_embarcadores/`
2. **Abra o Console do navegador** (F12)
3. Procure por:
   ```
   ✅ API online e funcionando!
   ```
4. Preencha o formulário e teste enviar
5. Verifique se os dados aparecem na página "Respostas"

---

## 🔧 Resolução de Problemas

### Problema: CORS Error

**Sintoma:** Erro "Access to fetch has been blocked by CORS policy"

**Solução:**
1. Verifique se a URL do GitHub Pages está em `ALLOWED_ORIGINS` no backend
2. Adicione a variável de ambiente no serviço de hospedagem:
   ```
   ALLOWED_ORIGINS=https://vpcapanema.github.io
   ```

### Problema: API não conecta ao RDS

**Sintoma:** Erro "Connection timeout" ou "ECONNREFUSED"

**Solução:**
1. Verifique se as credenciais do RDS estão corretas
2. Verifique se o Security Group do RDS permite conexões de fora (0.0.0.0/0)
3. Verifique se "Publicly Accessible" está como "Yes"

### Problema: Frontend não carrega dados

**Sintoma:** Formulário funciona mas não salva

**Solução:**
1. Abra Console do navegador (F12)
2. Veja se há erros de rede
3. Verifique se `API_CONFIG.PRODUCTION_URL` está correto em `api-client.js`
4. Teste manualmente a URL da API: `https://sua-api.com/health`

---

## 📊 Monitoramento

### Logs do Backend

**Heroku:**
```bash
heroku logs --tail
```

**Render:**
- Acesse o dashboard → sua app → aba "Logs"

**Railway:**
- Acesse o dashboard → sua app → aba "Deployments" → "View Logs"

### Métricas

Todos os serviços fornecem dashboards com:
- Requests por minuto
- Tempo de resposta
- Taxa de erro
- Uso de CPU/memória

---

## 💰 Custos Estimados

| Serviço | Custo | Limites |
|---------|-------|---------|
| **AWS RDS PostgreSQL** | GRATUITO (12 meses) | 20GB, db.t3.micro |
| **Heroku** | GRATUITO* | 550h/mês, dorme após inatividade |
| **Render** | 100% GRATUITO | Sem cartão, 750h/mês |
| **Railway** | $5 GRÁTIS/mês | Uso por hora |
| **Vercel** | 100% GRATUITO | Serverless, sem limites práticos |
| **GitHub Pages** | 100% GRATUITO | 1GB storage, 100GB bandwidth/mês |

**Total: ZERO (usando Render/Railway/Vercel + RDS Free Tier)**

---

## 🎯 Próximos Passos Opcionais

1. **Custom Domain:**
   - Configurar domínio próprio (ex: `pli2050.com.br`)
   - GitHub Pages suporta custom domains

2. **Autenticação:**
   - Adicionar login de usuários
   - Restringir acesso ao formulário

3. **Backup Automático:**
   - Configurar backups diários do RDS
   - Exportação automática para S3

4. **Monitoramento Avançado:**
   - Integrar com Sentry (error tracking)
   - Configurar alertas de downtime

5. **Performance:**
   - Adicionar CDN (CloudFlare)
   - Implementar cache de dados

---

## ✅ Resumo Rápido

1. ✅ Banco já está criado e funcionando
2. 📤 Deploy do backend em Render/Heroku/Railway
3. 🔧 Atualizar URL da API no `api-client.js`
4. 📤 Push para GitHub
5. ⚙️ Habilitar GitHub Pages
6. 🎉 Pronto!

**Tempo total: ~15-30 minutos**

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do backend
2. Abra o Console do navegador (F12) e veja erros
3. Teste cada endpoint da API manualmente
4. Verifique se todas as variáveis de ambiente estão configuradas

Boa sorte! 🚀
