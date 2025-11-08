# 🚀 PLI 2050 - Sistema de Formulários de Entrevistas

Sistema web full-stack para coleta de dados de entrevistas com empresas embarcadoras do Estado de São Paulo.

## ⚡ Início Rápido

### Opção 1: Script Automatizado (Recomendado)

```powershell
.\START-PLI2050.ps1
```

Este script irá:
- ✅ Verificar dependências (Node.js, VS Code)
- ✅ Configurar ambiente (.env, node_modules)
- ✅ Iniciar backend na porta 3000
- ✅ Abrir frontend no VS Code

### Opção 2: Manual

**1. Backend:**
```powershell
cd backend\server\backend-api
node server.js
```

**2. Frontend:**
- Abra `frontend/html/index.html` no VS Code
- Botão direito → **"Open with Five Server"**
- Acesse: http://localhost:5500/frontend/html/index.html

## 📚 Documentação Completa

- 📖 **[INSTRUCOES_INICIAR_LOCAL.md](./INSTRUCOES_INICIAR_LOCAL.md)** - Guia passo a passo detalhado
- 📘 **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Documentação técnica completa
- 📗 **[docs/COMECE_AQUI.md](./docs/COMECE_AQUI.md)** - Visão geral do sistema

## 🏗️ Arquitetura

```
Frontend (SPA - porta 5500)
    ↓ HTTP/JSON
Backend API (Node.js - porta 3000)  
    ↓ PostgreSQL SSL
Database (AWS RDS - sigma_pli)
```

## 🔧 Tecnologias

- **Frontend**: HTML5, JavaScript (Vanilla), CSS3, Chart.js, SheetJS
- **Backend**: Node.js, Express, PostgreSQL (pg)
- **Database**: PostgreSQL 17 (AWS RDS)
- **Servidor Local**: Five Server (porta 5500)

## 📊 Database

- **Host**: sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
- **Database**: sigma_pli
- **Schema**: formulario_embarcadores
- **Tabelas**: 10 (empresas, pesquisas, produtos_transportados, etc.)

## 🔒 Segurança

- ✅ CORS configurado para localhost
- ✅ SSL/TLS para conexão com RDS
- ✅ Rate limiting (100 req/min)
- ✅ Helmet.js (security headers)
- ⚠️ **NÃO commitar** arquivos `.env`!

## 📁 Estrutura do Projeto

```
├── frontend/
│   ├── html/           # Páginas (index, respostas, analytics)
│   ├── js/             # Lógica (app, api-client, validation)
│   └── css/            # Estilos
├── backend/
│   └── server/
│       └── backend-api/
│           ├── server.js       # API REST
│           ├── routes/         # 12 módulos de rotas
│           └── .env            # Credenciais (NÃO commitar)
├── sql/                # Schema e migrações
├── scripts/            # Utilitários
└── docs/               # Documentação

```

## ✅ Checklist de Produção Local

- [x] Dependências instaladas (`npm install`)
- [x] Arquivo `.env` configurado
- [x] CORS configurado para localhost:5500
- [ ] Backend rodando (porta 3000)
- [ ] Frontend aberto (porta 5500)
- [ ] Health check OK: http://localhost:3000/health

## 🐛 Resolução de Problemas

### Backend não inicia
```powershell
cd backend\server\backend-api
npm install
node server.js
```

### Frontend não carrega dados
1. Verifique se backend está rodando: http://localhost:3000/health
2. Abra Console do navegador (F12) e procure por erros
3. Verifique CORS no terminal do backend

### Erro ao salvar no banco
1. Verifique credenciais no `.env`
2. Teste conexão: `SELECT 1` deve funcionar
3. Veja logs no terminal do backend

## 📞 Suporte

- **Documentação técnica**: `.github/copilot-instructions.md`
- **Instruções detalhadas**: `INSTRUCOES_INICIAR_LOCAL.md`
- **Testes**: `docs/GUIA_TESTES.md`

## 📜 Licença

Sistema desenvolvido para SEMIL-SP / BID - Plano de Logística e Investimentos 2050

---

**Última atualização**: 06/11/2025
