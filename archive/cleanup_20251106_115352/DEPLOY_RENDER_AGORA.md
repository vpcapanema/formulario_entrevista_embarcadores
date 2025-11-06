# 🚀 DEPLOY NO RENDER - PASSO A PASSO

## ✅ PREPARAÇÃO (JÁ FEITO)
- [x] Código no GitHub
- [x] Backend em `backend-api/`
- [x] Arquivos .env ignorados
- [x] Procfile criado

---

## 📋 DEPLOY - SIGA ESTES PASSOS:

### PASSO 1: Criar Conta no Render

1. Acesse: **https://render.com**
2. Clique em **"Get Started for Free"**
3. Escolha **"Sign up with GitHub"**
4. Autorize o Render a acessar seus repositórios

---

### PASSO 2: Criar Web Service

1. No dashboard do Render, clique em **"New +"** (canto superior direito)
2. Selecione **"Web Service"**
3. Conecte seu repositório:
   - Se não aparecer automaticamente, clique em **"Connect account"** → **GitHub**
   - Autorize o acesso
   - Procure por: `formulario_entrevista_embarcadores`
   - Clique em **"Connect"**

---

### PASSO 3: Configurar o Serviço

Preencha os campos conforme abaixo:

| Campo | Valor |
|-------|-------|
| **Name** | `pli2050-api` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `backend-api` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

---

### PASSO 4: Adicionar Variáveis de Ambiente

Role até a seção **"Environment Variables"** e clique em **"Add Environment Variable"**.

Adicione TODAS as variáveis abaixo:

```
PGHOST=sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
PGPORT=5432
PGDATABASE=sigma_pli
PGUSER=sigma_admin
PGPASSWORD=Malditas131533*
PORT=10000
NODE_ENV=production
ALLOWED_ORIGINS=https://vpcapanema.github.io
```

**IMPORTANTE:** 
- Clique em **"Add Environment Variable"** para CADA linha acima
- O `PORT=10000` é obrigatório no Render (porta padrão deles)
- Copie e cole exatamente como está

---

### PASSO 5: Deploy!

1. Após adicionar todas as variáveis, clique em **"Create Web Service"**
2. O Render vai começar a fazer o build (aguarde 2-3 minutos)
3. Você verá os logs em tempo real
4. Quando aparecer: **"Your service is live 🎉"** está pronto!

---

### PASSO 6: Copiar URL da API

1. No topo da página, você verá uma URL parecida com:
   ```
   https://pli2050-api.onrender.com
   ```
2. **COPIE ESSA URL** (vamos usar no próximo passo)

3. Teste se está funcionando:
   - Abra: `https://pli2050-api.onrender.com/health`
   - Deve retornar:
     ```json
     {
       "status": "OK",
       "database": "Connected",
       "timestamp": "..."
     }
     ```

---

## ⚠️ NOTA IMPORTANTE

No plano gratuito do Render:
- O serviço "dorme" após 15 minutos de inatividade
- A primeira requisição após dormir demora ~30 segundos (cold start)
- Para usuários, isso é transparente (só o primeiro acesso é lento)

---

## ✅ PRÓXIMO PASSO

Depois de copiar a URL da API, volte aqui e me diga:

**"URL da API: https://pli2050-api.onrender.com"**

Eu vou automaticamente:
1. Atualizar o arquivo `api-client.js` com essa URL
2. Fazer commit e push
3. Habilitar o GitHub Pages
4. Testar tudo end-to-end

---

## 🆘 TROUBLESHOOTING

### Erro: "Build failed"
- Verifique se o Root Directory está como `backend-api`
- Verifique se Build Command é `npm install`

### Erro: "Cannot connect to database"
- Verifique se TODAS as variáveis de ambiente foram adicionadas
- Verifique se não há espaços extras nos valores
- Confirme que `PGPASSWORD` está correto

### Erro: CORS
- Verifique se `ALLOWED_ORIGINS` contém `https://vpcapanema.github.io`
- Sem barra `/` no final

---

## 📞 ME AVISE QUANDO TIVER A URL!

Assim que o deploy terminar e você tiver a URL, cole aqui e eu continuo automaticamente! 🚀
