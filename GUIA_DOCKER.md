# 🐳 GUIA DE TESTE COM DOCKER

## Sistema PLI 2050 - Formulários de Entrevista

---

## 📋 PRÉ-REQUISITOS

1. **Docker Desktop instalado e rodando**

   - Windows: Abra o Docker Desktop (ícone da baleia na bandeja)
   - Aguarde até aparecer "Docker Desktop is running"

2. **Credenciais do banco RDS**
   - Você precisa das credenciais do PostgreSQL no AWS RDS

---

## 🚀 PASSO A PASSO

### 1️⃣ Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```powershell
# Copiar arquivo de exemplo
Copy-Item .env.example .env

# Editar o arquivo .env com suas credenciais
notepad .env
```

**Exemplo de `.env`**:

```env
PGHOST=pli2050-rds.xxxx.us-east-1.rds.amazonaws.com
PGPORT=5432
PGDATABASE=formulario_pli2050
PGUSER=postgres
PGPASSWORD=sua-senha-segura

ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,https://vpcapanema.github.io
ENVIRONMENT=development
LOG_LEVEL=debug
```

---

### 2️⃣ Buildar a Imagem Docker

```powershell
# No diretório raiz do projeto
docker-compose build
```

**O que acontece**:

- ✅ Baixa imagem base Python 3.11
- ✅ Instala dependências do sistema (gcc, postgresql-client)
- ✅ Instala pacotes Python (FastAPI, SQLAlchemy, etc)
- ✅ Copia código do backend
- ⏱️ Tempo: ~2-5 minutos

---

### 3️⃣ Iniciar o Container

```powershell
# Iniciar em modo detached (background)
docker-compose up -d

# OU iniciar com logs visíveis (foreground)
docker-compose up
```

**Saída esperada**:

```
✔ Network pli2050-network    Created
✔ Container pli2050-backend  Started
```

---

### 4️⃣ Verificar Status

```powershell
# Ver containers rodando
docker ps

# Ver logs em tempo real
docker-compose logs -f backend

# Testar endpoint de health
curl http://localhost:8000/health
```

**Resposta esperada** (`/health`):

```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2025-12-12T08:30:00Z"
}
```

---

### 5️⃣ Testar a API

```powershell
# Testar endpoint de listas (entrevistadores)
curl http://localhost:8000/api/lists/entrevistadores

# Testar endpoint de estados
curl http://localhost:8000/api/lists/estados

# Ver documentação interativa (Swagger)
start http://localhost:8000/docs
```

---

## 🧪 TESTES IMPORTANTES

### Teste 1: Conexão com Banco

```powershell
# Ver logs do container
docker-compose logs backend | Select-String -Pattern "database"
```

**Busque por**:

- ✅ `"database": "Connected"`
- ❌ `Error connecting to database`

---

### Teste 2: CORS Configurado

```powershell
# Verificar variável de ambiente
docker exec pli2050-backend env | Select-String ALLOWED_ORIGINS
```

---

### Teste 3: Endpoints Funcionando

```powershell
# Testar submissão (mock - precisa de dados válidos)
Invoke-RestMethod -Uri "http://localhost:8000/api/lists/estados" -Method GET
```

---

## 🔍 COMANDOS ÚTEIS

### Ver Logs

```powershell
# Logs em tempo real
docker-compose logs -f

# Últimas 100 linhas
docker-compose logs --tail=100

# Apenas backend
docker-compose logs backend
```

---

### Entrar no Container

```powershell
# Shell interativo
docker exec -it pli2050-backend bash

# Dentro do container:
# - Ver variáveis: env
# - Testar banco: psql $DATABASE_URL -c "SELECT 1"
# - Ver arquivos: ls -la /app
```

---

### Parar/Remover

```powershell
# Parar containers
docker-compose stop

# Parar e remover
docker-compose down

# Remover incluindo volumes
docker-compose down -v

# Rebuild completo (força reconstrução)
docker-compose build --no-cache
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Cannot connect to Docker daemon"

**Solução**: Abra o Docker Desktop e aguarde iniciar completamente

---

### Problema: "Error connecting to database"

**Soluções**:

1. Verifique credenciais no `.env`
2. Teste conexão fora do Docker:
   ```powershell
   # No PowerShell com psql instalado
   psql "postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE" -c "SELECT 1"
   ```
3. Verifique Security Group do RDS (porta 5432 liberada para seu IP)

---

### Problema: "Port 8000 is already allocated"

**Solução**: Parar processo na porta 8000

```powershell
# Ver processo usando porta 8000
Get-NetTCPConnection -LocalPort 8000 | Format-Table

# Matar processo (use PID da linha acima)
Stop-Process -Id <PID> -Force
```

---

### Problema: Build muito lento

**Solução**: Limpar cache do Docker

```powershell
# Limpar build cache
docker builder prune

# Limpar tudo (imagens, containers, volumes)
docker system prune -a --volumes
```

---

## 📊 VERIFICAÇÃO FINAL

Checklist de sucesso:

- [ ] Docker Desktop rodando
- [ ] `.env` configurado com credenciais corretas
- [ ] `docker-compose build` sem erros
- [ ] `docker-compose up -d` container iniciado
- [ ] `curl http://localhost:8000/health` retorna status OK
- [ ] `curl http://localhost:8000/api/lists/estados` retorna JSON
- [ ] Swagger acessível em http://localhost:8000/docs

---

## 🎯 PRÓXIMOS PASSOS

Depois de testar localmente:

1. **Deploy no Render**: O mesmo Dockerfile é usado automaticamente
2. **CI/CD**: GitHub Actions pode buildar e testar a imagem
3. **Produção**: Container roda no Render com mesmas variáveis de ambiente

---

## 📖 DOCUMENTAÇÃO

- Docker: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- FastAPI: https://fastapi.tiangolo.com
- Render: https://render.com/docs

---

**Última atualização**: 12/12/2025
