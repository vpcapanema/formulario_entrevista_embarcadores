# 🔧 Correção Urgente: CORS no Render.com

## 🚨 Problema Atual

```
Access to fetch at 'https://formulario-entrevista-embarcadores.onrender.com/api/external/cnpj/...' 
from origin 'https://vpcapanema.github.io' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Causa**: Backend no Render.com não está retornando headers CORS corretos para o GitHub Pages.

---

## ✅ Solução: Verificar e Corrigir Variável de Ambiente

### Passo 1: Acessar Dashboard do Render

1. Ir para: https://dashboard.render.com/
2. Login com conta vinculada ao projeto
3. Selecionar o serviço: **`formulario-entrevista-embarcadores`**

### Passo 2: Verificar Environment Variables

1. No serviço, ir na aba **"Environment"**
2. Procurar variável: `ALLOWED_ORIGINS`
3. **Verificar se existe e está correta**

#### ✅ Valor CORRETO (copiar exatamente):
```
http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,http://127.0.0.1:8000,https://vpcapanema.github.io
```

#### 🔍 Verificações Importantes:
- [ ] Variável `ALLOWED_ORIGINS` existe?
- [ ] Contém `https://vpcapanema.github.io` (SEM barra no final)?
- [ ] Não tem espaços extras entre as vírgulas?
- [ ] Não tem aspas/quotes ao redor do valor?

### Passo 3: Adicionar/Corrigir (se necessário)

Se a variável não existir ou estiver errada:

1. Clicar em **"Add Environment Variable"**
2. **Key**: `ALLOWED_ORIGINS`
3. **Value**: Copiar exatamente o valor acima
4. Clicar **"Save Changes"**

⚠️ **O Render vai reiniciar automaticamente o serviço** (pode demorar 2-5 minutos)

### Passo 4: Aguardar Deploy

1. Na aba **"Logs"**, aguardar aparecer:
   ```
   ✅ CORS habilitado para: ['http://localhost:5500', ..., 'https://vpcapanema.github.io']
   ```

2. Quando aparecer `Server started on port 8000`, o serviço está pronto

### Passo 5: Testar

Abrir no navegador:
```
https://vpcapanema.github.io/formulario_entrevista_embarcadores/
```

Preencher campo CNPJ e verificar se a consulta funciona (não deve mais dar erro CORS).

---

## 🔍 Verificação Manual do CORS

Testar diretamente no navegador (Console F12):

```javascript
fetch('https://formulario-entrevista-embarcadores.onrender.com/health', {
    method: 'GET',
    headers: { 'Origin': 'https://vpcapanema.github.io' }
})
.then(r => r.json())
.then(data => console.log('✅ CORS OK:', data))
.catch(err => console.error('❌ CORS ERROR:', err));
```

**Resultado esperado:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-10T...",
  "database": "Connected"
}
```

---

## 📋 Checklist Completo

### No Render.com:
- [ ] Variável `ALLOWED_ORIGINS` existe
- [ ] Contém `https://vpcapanema.github.io`
- [ ] Serviço reiniciado após mudança
- [ ] Logs mostram `✅ CORS habilitado para: [...]`

### No GitHub Pages:
- [ ] URL correta: `https://vpcapanema.github.io/formulario_entrevista_embarcadores/`
- [ ] Console não mostra erros CORS
- [ ] Consulta CNPJ funciona

---

## 🐛 Troubleshooting

### Erro persiste após configurar ALLOWED_ORIGINS?

1. **Verificar se o serviço reiniciou**:
   - Ir em "Events" no Render
   - Deve ter evento "Deploy succeeded" recente

2. **Verificar logs em tempo real**:
   - Ir em "Logs"
   - Fazer requisição no site
   - Verificar se aparece log da requisição

3. **Forçar redeploy**:
   - Clicar em "Manual Deploy" → "Clear build cache & deploy"

4. **Verificar plano gratuito**:
   - Plano gratuito do Render **hiberna após 15 minutos sem uso**
   - Primeira requisição pode demorar 30-60s (cold start)
   - Se for isso, fazer uma requisição de teste e aguardar acordar

### Serviço está hibernando?

Adicionar **Cron Job** para manter ativo (opcional):

No Render.com:
1. Criar novo serviço tipo "Cron Job"
2. Schedule: `*/14 * * * *` (a cada 14 minutos)
3. Command: `curl https://formulario-entrevista-embarcadores.onrender.com/health`

Isso evita hibernação no plano gratuito.

---

## 📚 Referências

- [Documentação CORS FastAPI](https://fastapi.tiangolo.com/tutorial/cors/)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Última atualização**: 10/11/2025  
**Prioridade**: 🔴 CRÍTICO - Bloqueia uso em produção
