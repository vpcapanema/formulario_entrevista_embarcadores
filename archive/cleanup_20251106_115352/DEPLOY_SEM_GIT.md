# 🚀 DEPLOY IMEDIATO - SEM GIT

## Você não tem Git instalado, mas não tem problema! 

Vou te mostrar 2 formas de fazer deploy SEM usar linha de comando:

---

## 🎯 OPÇÃO 1: Deploy via Interface Web do Render (RECOMENDADO)

### Passo 1: Criar conta no Render

1. Acesse: https://render.com
2. Clique em **"Get Started for Free"**
3. Escolha **"Sign up with GitHub"**
4. Autorize o Render a acessar seu GitHub

### Passo 2: Conectar Repositório

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Clique em **"Connect GitHub account"** (se ainda não conectou)
4. Na lista de repositórios, encontre: `formulario_entrevista_embarcadores`
5. Clique em **"Connect"**

### Passo 3: Configurar Web Service

Preencha os campos:

**Name:** `pli2050-api`

**Region:** `Oregon (US West)` ou qualquer região

**Branch:** `main`

**Root Directory:** `backend-api`

**Runtime:** `Node`

**Build Command:** `npm install`

**Start Command:** `npm start`

**Instance Type:** `Free`

### Passo 4: Adicionar Variáveis de Ambiente

Role até **"Environment Variables"** e clique em **"Add Environment Variable"**

Adicione CADA uma dessas variáveis (clique em "Add Environment Variable" para cada):

```
Key: PGHOST
Value: sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com

Key: PGPORT
Value: 5432

Key: PGDATABASE
Value: sigma_pli

Key: PGUSER
Value: sigma_admin

Key: PGPASSWORD
Value: Malditas131533*

Key: PORT
Value: 3000

Key: NODE_ENV
Value: production

Key: ALLOWED_ORIGINS
Value: https://vpcapanema.github.io,http://localhost:5500
```

### Passo 5: Deploy!

1. Clique no botão verde **"Create Web Service"**
2. Aguarde 3-5 minutos enquanto o Render faz o deploy
3. Você verá os logs em tempo real
4. Quando ver "✅ Build successful", está pronto!

### Passo 6: Copiar URL da API

1. No topo da página, você verá a URL, algo como:
   ```
   https://pli2050-api.onrender.com
   ```
2. **COPIE ESSA URL** (sem barra no final)

### Passo 7: Testar a API

1. Abra no navegador: `https://pli2050-api.onrender.com/health`
2. Deve aparecer:
   ```json
   {
     "status": "OK",
     "timestamp": "...",
     "database": "Connected"
   }
   ```
3. Se apareceu isso, **SUCESSO!** ✅

---

## 🎯 OPÇÃO 2: Deploy via Railway (Alternativa)

### Ainda mais simples:

1. Acesse: https://railway.app
2. Clique em **"Start a New Project"**
3. Escolha **"Deploy from GitHub repo"**
4. Selecione: `formulario_entrevista_embarcadores`
5. Railway detecta automaticamente que é Node.js
6. Clique em **"Variables"** e adicione as mesmas variáveis acima
7. Adicione uma variável extra:
   ```
   Key: ROOT_DIR
   Value: backend-api
   ```
8. Deploy automático!
9. Copie a URL gerada

---

## 📝 DEPOIS DO DEPLOY DO BACKEND

### Atualizar Frontend com URL da API

1. Abra o arquivo: `api-client.js`
2. Na **linha 9**, substitua:
   ```javascript
   PRODUCTION_URL: 'https://sua-api-aqui.herokuapp.com',
   ```
   
   Por (cole a URL que você copiou):
   ```javascript
   PRODUCTION_URL: 'https://pli2050-api.onrender.com',
   ```

3. Salve o arquivo

### Fazer Upload para GitHub

**Opção A: Via GitHub Desktop (Mais Fácil)**

1. Baixe: https://desktop.github.com/
2. Instale e faça login
3. File → Add Local Repository
4. Selecione a pasta: `D:\SISTEMA_FORMULARIOS_ENTREVISTA`
5. Veja os arquivos modificados
6. Escreva uma mensagem: "Deploy backend e integração"
7. Clique em "Commit to main"
8. Clique em "Push origin"

**Opção B: Via Interface Web do GitHub**

1. Acesse: https://github.com/vpcapanema/formulario_entrevista_embarcadores
2. Para cada arquivo novo:
   - Clique em "Add file" → "Upload files"
   - Arraste os arquivos da pasta `backend-api`
   - Commit changes
3. Para arquivos modificados (`api-client.js`):
   - Navegue até o arquivo
   - Clique no ícone de lápis (Edit)
   - Cole o conteúdo atualizado
   - Commit changes

### Habilitar GitHub Pages

1. No GitHub, vá em **Settings** (Configurações)
2. No menu lateral, clique em **Pages**
3. Em **Source**, selecione:
   - Branch: `main`
   - Folder: `/ (root)`
4. Clique em **Save**
5. Aguarde 2 minutos
6. A URL estará disponível:
   ```
   https://vpcapanema.github.io/formulario_entrevista_embarcadores/
   ```

---

## ✅ TESTE FINAL

1. Abra: `https://vpcapanema.github.io/formulario_entrevista_embarcadores/`
2. Pressione **F12** para abrir o Console
3. Procure por: `✅ API online e funcionando!`
4. Preencha o formulário e envie
5. Vá para página "Respostas"
6. Se aparecer os dados, **ESTÁ FUNCIONANDO!** 🎉

---

## 🆘 Problemas?

### Backend não inicia no Render

- Verifique os logs no dashboard do Render
- Certifique-se de que Root Directory = `backend-api`
- Verifique se todas as variáveis de ambiente estão corretas

### Frontend não conecta na API

- Abra F12 no navegador
- Veja erros no Console
- Verifique se a URL em `api-client.js` está correta
- Teste manualmente: `https://sua-api.onrender.com/health`

### CORS Error

- Adicione a URL do GitHub Pages em `ALLOWED_ORIGINS`:
  ```
  ALLOWED_ORIGINS=https://vpcapanema.github.io
  ```

---

## 📞 Próximos Passos

1. **Agora:** Faça deploy do backend no Render (10 minutos)
2. **Depois:** Atualize `api-client.js` com a URL
3. **Por último:** Faça upload pro GitHub e habilite Pages

**Boa sorte! Qualquer dúvida, me avise! 🚀**
