# ====================================================================
# DEPLOY RAILWAY.APP - GUIA ULTRA RÁPIDO (3 MINUTOS)
# ====================================================================
# Railway oferece $5 de crédito grátis por mês
# Deploy automático via GitHub
# Conecta no RDS Sigma PLI (já configurado)
# ====================================================================

## 🚀 PASSOS PARA DEPLOY:

### 1. Acessar Railway
- URL: https://railway.app/
- Clique em "Start a New Project"
- Login com GitHub

### 2. Conectar Repositório
- Escolha: "Deploy from GitHub repo"
- Selecione: `vpcapanema/formulario_entrevista_embarcadores`
- Railway detecta automaticamente Python/FastAPI

### 3. Configurar Environment Variables
Vá em "Variables" e adicione:

```bash
PGHOST=sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
PGPORT=5432
PGDATABASE=sigma_pli
PGUSER=sigma_admin
PGPASSWORD=Malditas131533*
SCHEMA_NAME=formulario_embarcadores
ALLOWED_ORIGINS=https://vpcapanema.github.io,http://localhost:5500
APP_ENV=production
DEBUG=false
LOG_LEVEL=info
PORT=8000
```

### 4. Deploy Automático!
- Railway faz build e deploy automaticamente
- Aguarde ~2-3 minutos
- Railway gera URL: `https://formulario-embarcadores-production.up.railway.app`

### 5. Gerar Domínio Público
- Vá em "Settings" → "Networking"
- Clique em "Generate Domain"
- Copie a URL gerada (ex: `pli2050-backend-production.up.railway.app`)

### 6. Atualizar Frontend
Edite `frontend/js/core-api.js` linha ~28:

```javascript
if (hostname.includes('github.io')) {
    return 'https://SEU-PROJETO.up.railway.app'; // URL do Railway
}
```

### 7. Commit e Push
```powershell
git add .
git commit -m "feat: Deploy configurado para Railway.app"
git push
```

### 8. Railway faz Re-deploy Automático!
- Cada push no GitHub → Railway faz deploy automático
- Aguardar ~1-2 minutos

## ✅ TESTAR:

### Health Check:
```bash
curl https://SEU-PROJETO.up.railway.app/health
```

### Docs API:
```
https://SEU-PROJETO.up.railway.app/docs
```

### Frontend (GitHub Pages):
```
https://vpcapanema.github.io/formulario_entrevista_embarcadores
```

## 💰 CUSTOS:

| Recurso | Custo |
|---------|-------|
| Railway Hobby Plan | $5/mês de crédito GRÁTIS |
| Uso estimado | ~$3-4/mês |
| RDS Sigma PLI | $0/mês (Free Tier) |
| GitHub Pages | $0/mês |
| **SOBRA** | **~$1-2/mês de crédito** |

**Após créditos acabarem**: $5/mês (Hobby Plan)

## 📊 RECURSOS RAILWAY HOBBY:

- ✅ 512MB RAM
- ✅ 1GB Disk
- ✅ Shared vCPU
- ✅ Deploy ilimitados
- ✅ GitHub auto-deploy
- ✅ Logs em tempo real
- ✅ Domínio público grátis
- ✅ SSL/HTTPS automático

## 🔧 ARQUIVOS CRIADOS:

1. **Procfile** - Comando de start
2. **railway.json** - Configuração Railway
3. **requirements.txt** - Já existe em `backend-fastapi/`

## ⚡ VANTAGENS RAILWAY:

✅ Deploy em 2 minutos
✅ GitHub auto-deploy (push = deploy)
✅ Logs em tempo real
✅ Métricas de CPU/RAM
✅ Rollback fácil (versões anteriores)
✅ CLI poderoso (opcional)
✅ Domínio HTTPS grátis
✅ Sem limite de builds/deploys

## 🆘 TROUBLESHOOTING:

### Build falha:
- Verificar logs no Railway Dashboard
- Verificar se `backend-fastapi/requirements.txt` existe
- Verificar `railway.json` está correto

### API retorna 500:
- Checar Variables no Railway
- Ver logs: Railway Dashboard → "Deployments" → Ver logs

### CORS Error:
- Adicionar GitHub Pages URL em `ALLOWED_ORIGINS`
- Formato: `https://vpcapanema.github.io`

### Connection timeout RDS:
- RDS Security Group permite conexões públicas? ✅ Sim (0.0.0.0/0)
- Credenciais corretas? ✅ Testadas anteriormente

## 📱 RAILWAY CLI (Opcional):

### Instalar:
```powershell
npm install -g @railway/cli
```

### Login:
```bash
railway login
```

### Deploy via CLI:
```bash
railway up
```

### Ver logs:
```bash
railway logs
```

## 🔗 LINKS ÚTEIS:

- **Railway Dashboard**: https://railway.app/dashboard
- **Docs Railway**: https://docs.railway.app/
- **Status**: https://status.railway.app/
- **Pricing**: https://railway.app/pricing

---

## ✅ CHECKLIST RÁPIDO:

- [ ] Conta Railway criada (login com GitHub)
- [ ] Repositório conectado
- [ ] Environment Variables adicionadas (10 vars)
- [ ] Deploy concluído (verde no dashboard)
- [ ] Domínio público gerado
- [ ] Health check OK: `/health`
- [ ] Docs acessível: `/docs`
- [ ] Frontend atualizado (`core-api.js`)
- [ ] Commit + push realizado
- [ ] Re-deploy automático OK
- [ ] Frontend testado end-to-end

---

## 🎯 TEMPO TOTAL: 3-5 MINUTOS
## 💵 CUSTO: $0-5/mês (crédito grátis)
## 🚀 RESULTADO: PRODUÇÃO COMPLETA!

**URL Final**:
- Frontend: https://vpcapanema.github.io/formulario_entrevista_embarcadores
- Backend: https://pli2050-backend-production.up.railway.app
- Database: RDS Sigma PLI (AWS us-east-1)
