# Backend API - Sistema PLI 2050

API REST para o Sistema de Formulários de Entrevistas do PLI 2050.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Acesso ao banco de dados PostgreSQL RDS

## 🚀 Instalação Local

```bash
cd backend-api
npm install
npm start
```

A API estará rodando em `http://localhost:3000`

## 📡 Endpoints Disponíveis

### Listas Auxiliares
- `GET /api/instituicoes` - Lista de instituições
- `GET /api/estados` - Estados do Brasil
- `GET /api/paises` - Países
- `GET /api/municipios` - Municípios de SP
- `GET /api/funcoes` - Funções/cargos

### Entrevistadores
- `GET /api/entrevistadores` - Listar todos
- `POST /api/entrevistadores` - Criar novo

### Empresas
- `GET /api/empresas` - Listar todas
- `GET /api/empresas/:id` - Buscar por ID
- `POST /api/empresas` - Criar nova

### Entrevistados
- `GET /api/empresas/:id_empresa/entrevistados` - Listar por empresa
- `POST /api/entrevistados` - Criar novo

### Pesquisas
- `GET /api/pesquisas` - Listar todas
- `GET /api/pesquisas/:id` - Buscar por ID
- `POST /api/pesquisas` - Criar nova

### Analytics
- `GET /api/analytics/kpis` - KPIs gerais
- `GET /api/analytics/distribuicao-modal` - Distribuição por modalidade
- `GET /api/analytics/produtos-ranking` - Ranking de produtos

### Health Check
- `GET /health` - Verificar status da API

## 🌐 Deploy em Produção

### Opção 1: AWS Lambda + API Gateway (Serverless)

1. Instale o Serverless Framework:
```bash
npm install -g serverless
```

2. Crie arquivo `serverless.yml`:
```yaml
service: pli2050-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    PGHOST: ${env:PGHOST}
    PGPORT: ${env:PGPORT}
    PGDATABASE: ${env:PGDATABASE}
    PGUSER: ${env:PGUSER}
    PGPASSWORD: ${env:PGPASSWORD}

functions:
  api:
    handler: lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
```

3. Deploy:
```bash
serverless deploy
```

### Opção 2: Heroku (Mais simples)

1. Instale o Heroku CLI
2. Login e crie app:
```bash
heroku login
heroku create pli2050-api
```

3. Configure variáveis de ambiente:
```bash
heroku config:set PGHOST=sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
heroku config:set PGPORT=5432
heroku config:set PGDATABASE=sigma_pli
heroku config:set PGUSER=sigma_admin
heroku config:set PGPASSWORD=Malditas131533*
heroku config:set ALLOWED_ORIGINS=https://vpcapanema.github.io
```

4. Deploy:
```bash
git add .
git commit -m "Deploy backend"
git push heroku main
```

### Opção 3: Render (Gratuito e Simples)

1. Acesse https://render.com
2. Crie novo "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - Build Command: `cd backend-api && npm install`
   - Start Command: `cd backend-api && npm start`
5. Adicione variáveis de ambiente no painel
6. Deploy automático!

### Opção 4: Railway (Gratuito)

1. Acesse https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Selecione o repositório
4. Railway detecta automaticamente Node.js
5. Adicione variáveis de ambiente
6. Deploy!

## 🔒 Segurança

- Rate limiting: 100 requests por 15 minutos por IP
- Helmet.js para headers de segurança
- CORS configurado para domínios específicos
- Validação de entrada em todas as rotas

## 📝 Notas

- A API usa connection pooling para otimização
- SSL/TLS habilitado para conexão com RDS
- Suporta graceful shutdown
- Logs estruturados para debugging

## 🔗 Configurar Frontend

Depois do deploy, atualize a URL da API no arquivo `config.js` do frontend:

```javascript
const API_URL = 'https://sua-api.herokuapp.com'; // ou outra URL
```
