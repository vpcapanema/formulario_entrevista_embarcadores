# 🚀 Instruções para Rodar a Aplicação Localmente

## ✅ Configuração Concluída

As seguintes configurações já foram realizadas:

1. ✅ Dependências do backend instaladas (`npm install`)
2. ✅ Arquivo `.env` configurado com credenciais RDS:
   - Host: `sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com`
   - Database: `sigma_pli`
   - User: `sigma_admin`
   - CORS configurado para: `http://localhost:5500, http://127.0.0.1:5500`

3. ✅ Frontend já está configurado para usar `http://localhost:3000` em desenvolvimento

## 📝 Próximos Passos (MANUAL)

### 1. Iniciar o Backend

Abra um **novo terminal PowerShell** no VS Code e execute:

```powershell
cd D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend\server\backend-api
node server.js
```

**Você deve ver:**
```
════════════════════════════════════════════════════════════
🚀 API REST - Sistema PLI 2050
════════════════════════════════════════════════════════════
📡 Servidor rodando na porta: 3000
🌍 URL: http://localhost:3000
🏥 Health Check: http://localhost:3000/health
📊 Database: sigma_pli
🔒 CORS habilitado para: http://localhost:5500, ...
════════════════════════════════════════════════════════════
```

**Deixe este terminal ABERTO** - o servidor precisa continuar rodando!

### 2. Testar a Conexão (Opcional)

Em **outro terminal**, teste:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health"
```

**Resposta esperada:**
```json
{
    "status": "OK",
    "database": "Connected",
    "timestamp": "..."
}
```

### 3. Iniciar o Frontend

Você tem **3 opções**:

#### Opção A: Five Server (Recomendado)
1. Instale a extensão **Five Server** no VS Code (se não tiver)
2. Navegue até `D:\SISTEMA_FORMULARIOS_ENTREVISTA\frontend\html\index.html`
3. Clique com botão direito → **"Open with Five Server"**
4. Acesse: http://localhost:5500/frontend/html/index.html

#### Opção B: Live Server
1. Instale a extensão **Live Server** no VS Code
2. Navegue até `D:\SISTEMA_FORMULARIOS_ENTREVISTA\frontend\html\index.html`
3. Clique com botão direito → **"Open with Live Server"**

#### Opção C: Abrir direto no navegador
1. Abra o arquivo `D:\SISTEMA_FORMULARIOS_ENTREVISTA\frontend\html\index.html` no navegador
2. **Atenção**: Pode ter problemas de CORS se não usar servidor local!

### 4. Verificar Conexão Frontend-Backend

1. Abra o **Console do Navegador** (F12)
2. Você deve ver:
   ```
   🔍 Verificando conexão com API...
   📡 URL da API: http://localhost:3000
   ✅ API online e funcionando!
   ```

3. Se aparecer "⚠️ API offline", verifique se o backend está rodando (Passo 1)

### 5. Testar o Formulário

1. Preencha os campos obrigatórios do formulário
2. Clique em **"💾 Salvar Respostas"**
3. Se tudo funcionar:
   - Você verá um modal verde de sucesso
   - Um arquivo Excel será baixado automaticamente
   - Os dados serão salvos no banco **sigma_pli** no RDS AWS

## 🔍 Resolução de Problemas

### Backend não inicia
- ✅ Certifique-se que está no diretório correto: `backend/server/backend-api/`
- ✅ Execute `npm install` novamente
- ✅ Verifique se o arquivo `.env` existe no diretório `backend/server/backend-api/`

### "API offline" no console do navegador
- ✅ Verifique se o backend está rodando (`node server.js`)
- ✅ Acesse http://localhost:3000/health no navegador
- ✅ Verifique o firewall do Windows

### Erro CORS
- ✅ Certifique-se que o frontend está rodando em `http://localhost:5500`
- ✅ Verifique o `.env` - deve ter `ALLOWED_ORIGINS` configurado
- ✅ Reinicie o backend após alterar o `.env`

### Erro ao salvar no banco
- ✅ Verifique se as credenciais do RDS estão corretas no `.env`
- ✅ Teste a conexão: `SELECT 1` deve funcionar
- ✅ Verifique os logs do backend no terminal

## 📊 Arquitetura Atual

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Five Server - porta 5500)                        │
│  - frontend/html/index.html                                 │
│  - frontend/js/api-client.js (aponta para localhost:3000)   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Requests
                      │ (CORS habilitado)
┌─────────────────────▼───────────────────────────────────────┐
│  BACKEND (Node.js - porta 3000)                             │
│  - backend/server/backend-api/server.js                     │
│  - 25+ endpoints REST (JSON)                                │
│  - Pool de conexões PostgreSQL                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ SSL/TLS
                      │ pg driver
┌─────────────────────▼───────────────────────────────────────┐
│  DATABASE (PostgreSQL RDS)                                  │
│  - sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1...        │
│  - Database: sigma_pli                                      │
│  - Schema: formulario_embarcadores                          │
│  - 10 tabelas + 1 view (v_pesquisas_completa)               │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Endpoints Principais

- **GET** `/health` - Health check + status DB
- **GET** `/api/estados` - Lista estados do Brasil
- **GET** `/api/municipios` - Lista municípios SP
- **GET** `/api/paises` - Lista países
- **GET** `/api/instituicoes` - Lista instituições
- **GET** `/api/funcoes` - Lista funções de entrevistados
- **POST** `/api/submit-form` - **Salvar pesquisa completa** ⭐

## 📁 Estrutura de Pastas (Atualizada)

```
D:\SISTEMA_FORMULARIOS_ENTREVISTA\
├── .env                           ← Credenciais RDS (NÃO commitar)
├── frontend/
│   ├── html/
│   │   └── index.html             ← Formulário principal
│   ├── js/
│   │   ├── api-client.js          ← Cliente HTTP (detecção automática)
│   │   ├── app.js                 ← Lógica do formulário
│   │   └── validation.js          ← Validações
│   └── css/
│       └── styles.css
├── backend/
│   └── server/
│       └── backend-api/
│           ├── .env               ← Cópia das credenciais
│           ├── server.js          ← API REST (1133 linhas)
│           ├── package.json
│           └── routes/            ← 12 arquivos de rotas
└── sql/
    └── database_schema_completo.sql

```

## ✨ Pronto!

Após seguir estes passos, você terá:
- ✅ Backend rodando conectado ao RDS **sigma_pli**
- ✅ Frontend servido localmente na porta 5500
- ✅ Sistema completo funcionando com dados REAIS

**Última atualização**: 06/11/2025
