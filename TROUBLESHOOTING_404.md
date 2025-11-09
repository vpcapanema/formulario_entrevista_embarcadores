# 🔧 Troubleshooting: Erro 404 em /api/pesquisas/listar

## ✅ Status Atual (09/11/2025 17:35)

### Backend Local (http://localhost:8000)
- ✅ `/health` → 200 OK
- ✅ `/api/pesquisas/listar` → 200 OK
- ✅ Retorna: `{"success":true,"data":[...]}`

### Backend Produção (Render)
- ✅ `/health` → 200 OK  
- ✅ `/api/pesquisas/listar` → 200 OK
- ✅ Retorna: `{"success":true,"data":[...]}`

### Frontend (GitHub Pages)
- ✅ `core-api.js` aponta para: `https://formulario-entrevista-embarcadores.onrender.com`
- ✅ `page-respostas.js` usa: `response.data`
- ⚠️ **Possível cache do navegador**

---

## 🐛 Causa do Erro

O erro `404` que você está vendo é provavelmente causado por:

### 1. **Cache do Navegador** (Mais Provável)
- Service Workers antigos
- Cache de requisições HTTP
- JavaScript em cache com URL antiga

### 2. **CORS não configurado**
- Origin do GitHub Pages não está em `ALLOWED_ORIGINS`
- Verificar variáveis de ambiente no Render

---

## 🔧 Soluções

### Solução 1: Limpar Cache Completo (RECOMENDADO)

#### Google Chrome:
1. Pressione `Ctrl + Shift + Delete`
2. Selecione:
   - ✅ Cookies e dados de sites
   - ✅ Imagens e arquivos em cache
   - ✅ Dados de aplicativos hospedados
3. Período: **Todo o período**
4. Clique em **Limpar dados**
5. **Feche e reabra o Chrome completamente**

#### Microsoft Edge:
1. Pressione `Ctrl + Shift + Delete`
2. Selecione:
   - ✅ Cookies e dados do site
   - ✅ Imagens e arquivos em cache
3. Período: **Todo o período**
4. Clique em **Limpar agora**
5. **Feche e reabra o Edge completamente**

#### Firefox:
1. Pressione `Ctrl + Shift + Delete`
2. Selecione:
   - ✅ Cookies
   - ✅ Cache
3. Período: **Tudo**
4. Clique em **OK**
5. **Feche e reabra o Firefox completamente**

---

### Solução 2: Hard Refresh (Ignorar Cache)

1. Abra a página: `https://vpcapanema.github.io/formulario_entrevista_embarcadores/`
2. Pressione: `Ctrl + Shift + R` (Chrome/Edge) ou `Ctrl + F5` (Firefox)
3. Aguarde o carregamento completo
4. Pressione `F12` → aba **Network**
5. Clique em **Respostas**
6. Verifique se a requisição para `/api/pesquisas/listar` está indo para o Render

---

### Solução 3: Modo Anônimo (Teste Rápido)

1. Abra uma janela anônima: `Ctrl + Shift + N` (Chrome) ou `Ctrl + Shift + P` (Edge/Firefox)
2. Acesse: `https://vpcapanema.github.io/formulario_entrevista_embarcadores/`
3. Faça login com senha: `pli2050@admin`
4. Vá em **Respostas**
5. Se funcionar → problema é cache. Se não → veja Solução 4

---

### Solução 4: Verificar CORS no Render

1. Acesse: https://dashboard.render.com
2. Entre no serviço: **formulario-entrevista-embarcadores**
3. Vá em: **Environment** → **Environment Variables**
4. Verifique se existe: `ALLOWED_ORIGINS`
5. Valor deve conter: `https://vpcapanema.github.io`

#### Formato correto:
```
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,https://vpcapanema.github.io
```

6. Se alterou, clique em **Save Changes**
7. Aguarde o Render fazer redeploy automático (~2 minutos)

---

### Solução 5: Force GitHub Pages Rebuild

1. Acesse: https://github.com/vpcapanema/formulario_entrevista_embarcadores
2. Vá em: **Settings** → **Pages**
3. Em **Source**, mude para **None**
4. Clique em **Save**
5. Aguarde 10 segundos
6. Mude de volta para **main** branch
7. Clique em **Save**
8. Aguarde 1-2 minutos para rebuild

---

## 🧪 Como Testar se Funcionou

### Teste 1: DevTools Network
1. Abra a página do formulário
2. Pressione `F12`
3. Vá na aba **Network**
4. Filtre por: `listar`
5. Clique em **Respostas** na navbar
6. **Deve aparecer:**
   ```
   Request URL: https://formulario-entrevista-embarcadores.onrender.com/api/pesquisas/listar
   Status: 200 OK
   ```

### Teste 2: Console
1. Abra a página
2. Pressione `F12` → **Console**
3. Digite:
   ```javascript
   window.CoreAPI.BASE_URL
   ```
4. **Deve retornar:**
   ```
   "https://formulario-entrevista-embarcadores.onrender.com"
   ```

### Teste 3: API Direta
1. Abra nova aba
2. Cole: `https://formulario-entrevista-embarcadores.onrender.com/api/pesquisas/listar`
3. **Deve mostrar JSON:**
   ```json
   {
     "success": true,
     "data": [...]
   }
   ```

---

## 📊 Diagnóstico Avançado

Se nenhuma solução acima funcionar, colete estas informações:

### No Console (F12):
```javascript
// 1. URL da API
console.log('API URL:', window.CoreAPI.BASE_URL);

// 2. Hostname atual
console.log('Hostname:', window.location.hostname);

// 3. Testar requisição manual
window.CoreAPI.get('/api/pesquisas/listar').then(console.log).catch(console.error);
```

### No Network (F12 → Network):
1. Clique com botão direito na requisição `/api/pesquisas/listar`
2. **Copy** → **Copy as cURL**
3. Cole o resultado aqui para análise

---

## 📞 Se Nada Funcionar

1. Tire print do **Console** (F12)
2. Tire print do **Network** (F12 → Network)
3. Copie a URL completa que está acessando
4. Envie para análise

---

## ✅ Checklist Final

- [ ] Limpei cache completo do navegador
- [ ] Fechei e reabri o navegador
- [ ] Testei em modo anônimo
- [ ] Verifiquei CORS no Render
- [ ] Testei API diretamente no navegador
- [ ] Verifiquei DevTools → Network
- [ ] GitHub Pages está ativo

---

**Última atualização:** 09/11/2025 17:35  
**Status Backend:** ✅ Online e funcionando  
**Status API:** ✅ Endpoint `/api/pesquisas/listar` respondendo corretamente
