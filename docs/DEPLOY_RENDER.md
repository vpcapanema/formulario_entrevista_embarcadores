# ====================================================================
# GUIA RÁPIDO: DEPLOY BACKEND EM RENDER.COM (5 MINUTOS)
# ====================================================================
# Render.com oferece deploy GRATUITO de aplicações Python/FastAPI
# Conecta automaticamente no RDS Sigma PLI (já configurado)
# ====================================================================

## 📋 PASSOS PARA DEPLOY NO RENDER.COM:

### 1. Criar conta no Render.com
- Acesse: https://render.com/
- Faça login com GitHub

### 2. Criar novo Web Service
- Clique em "New +" → "Web Service"
- Conectar repositório: `vpcapanema/formulario_entrevista_embarcadores`
- Branch: `main`

### 3. Configurações do Service:
```
Name: pli2050-backend
Region: Oregon (US West) ou Ohio (US East) - mais próximo do RDS us-east-1
Branch: main
Root Directory: backend-fastapi
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Instance Type: Free
```

### 4. Environment Variables (Copiar e colar no Render):
```
PGHOST=sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
PGPORT=5432
PGDATABASE=sigma_pli
PGUSER=sigma_admin
PGPASSWORD=Malditas131533*
SCHEMA_NAME=formulario_embarcadores
ALLOWED_ORIGINS=https://vpcapanema.github.io,http://localhost:5500,http://127.0.0.1:5500
APP_ENV=production
DEBUG=false
LOG_LEVEL=info
```

### 5. Deploy!
- Clique em "Create Web Service"
- Aguarde ~3-5 minutos (build + deploy automático)
- Render vai te dar uma URL: `https://pli2050-backend.onrender.com`

### 6. Atualizar Frontend
- Editar `frontend/js/core-api.js`
- Linha 28: Trocar URL de produção
```javascript
return 'https://pli2050-backend.onrender.com';
```

### 7. Commit e Push
```bash
git add frontend/js/core-api.js
git commit -m "feat: Atualizar URL da API para Render.com"
git push
```

### 8. GitHub Pages atualiza automaticamente!
- Aguardar ~1 minuto
- Acessar: https://vpcapanema.github.io/formulario_entrevista_embarcadores
- Testar formulário

## ✅ PRONTO! SISTEMA FUNCIONANDO EM PRODUÇÃO!

### URLs Finais:
- **Frontend**: https://vpcapanema.github.io/formulario_entrevista_embarcadores
- **Backend API**: https://pli2050-backend.onrender.com
- **Docs**: https://pli2050-backend.onrender.com/docs
- **Database**: RDS Sigma PLI (sigma-pli-postgresql-db...)

### 💰 Custo Total:
- Render.com Free Tier: $0/mês
- RDS db.t3.micro Free Tier: $0/mês
- GitHub Pages: $0/mês
- **TOTAL: $0/mês** 🎉

### ⚠️ Limitações Free Tier Render.com:
- 750h/mês (suficiente para uso 24/7)
- Instância "dorme" após 15 min de inatividade
- Primeiro acesso após dormir: ~30s para "acordar"
- Largura de banda: 100GB/mês

### 🚀 Alternativas se precisar de mais performance:
- Render Starter ($7/mês): Sempre ativo, sem "dormir"
- Railway ($5/mês): Similar ao Render
- Fly.io (Free Tier generoso): 3 VMs gratuitas
- AWS App Runner (~$17/mês): Já configurado com scripts

## 📝 CHECKLIST DE VALIDAÇÃO:

- [ ] Conta Render.com criada
- [ ] Repositório conectado
- [ ] Environment variables configuradas
- [ ] Deploy concluído (build OK)
- [ ] Health check respondendo: `https://pli2050-backend.onrender.com/health`
- [ ] Docs acessível: `https://pli2050-backend.onrender.com/docs`
- [ ] Frontend atualizado com nova URL
- [ ] Commit + push realizado
- [ ] GitHub Pages atualizado
- [ ] Formulário testado end-to-end

## 🆘 TROUBLESHOOTING:

### Build falha no Render:
- Verificar se `requirements.txt` está correto
- Verificar se `Root Directory` está como `backend-fastapi`

### API retorna 500:
- Checar Environment Variables (PGHOST, PGPASSWORD, etc)
- Ver logs no Render Dashboard

### CORS Error:
- Verificar se `ALLOWED_ORIGINS` inclui GitHub Pages URL
- Adicionar no .env: `https://vpcapanema.github.io`

### Database connection error:
- RDS permite conexões públicas? (Sim, porta 5432 aberta)
- Security Group permite IP do Render? (Sim, 0.0.0.0/0)
- Credenciais corretas? (Validado anteriormente)

## 📞 SUPORTE:

**Render.com Dashboard**: https://dashboard.render.com
**Docs Render**: https://render.com/docs/deploy-fastapi
**Status Render**: https://status.render.com/

---

✅ **TEMPO TOTAL: 5-10 MINUTOS**
🎯 **CUSTO: $0/mês**
🚀 **RESULTADO: SISTEMA COMPLETO EM PRODUÇÃO!**
