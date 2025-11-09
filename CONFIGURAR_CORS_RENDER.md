# 🔧 Configurar CORS no Render

## Problema
GitHub Pages (`https://vpcapanema.github.io`) está sendo bloqueado por CORS porque o Render não tem essa origem configurada.

## Solução: Adicionar variável de ambiente no Render

### Passo a Passo:

1. **Acesse o Dashboard do Render**
   - URL: https://dashboard.render.com
   - Faça login com sua conta

2. **Selecione seu serviço**
   - Clique no serviço do backend (provavelmente `formulario-entrevista-embarcadores` ou `pli2050-api`)

3. **Vá em "Environment"**
   - No menu lateral, clique em **"Environment"**

4. **Adicione/Edite a variável `ALLOWED_ORIGINS`**
   
   **Nome da variável:**
   ```
   ALLOWED_ORIGINS
   ```
   
   **Valor da variável:**
   ```
   http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,http://127.0.0.1:8000,https://vpcapanema.github.io
   ```

5. **Salve as mudanças**
   - Clique em **"Save Changes"**
   - O Render vai **reiniciar o serviço automaticamente** (~2 minutos)

6. **Aguarde o deploy**
   - Vá na aba **"Events"** ou **"Logs"**
   - Aguarde aparecer: `✅ Deploy live`

---

## Verificação

Depois que o deploy terminar, teste no console do navegador:

```javascript
fetch('https://formulario-entrevista-embarcadores.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('✅ CORS OK:', d))
  .catch(e => console.error('❌ CORS Erro:', e));
```

Se funcionar, você verá:
```
✅ CORS OK: {status: "OK", database: "Connected", ...}
```

---

## Alternativa: Verificar se a variável já existe

Se a variável `ALLOWED_ORIGINS` já existir no Render:
1. Clique no ícone de **lápis (✏️)** ao lado dela
2. **Adicione** `,https://vpcapanema.github.io` no final do valor existente
3. Salve

---

## ⚠️ Importante

- **NÃO remova** as origens localhost (necessárias para desenvolvimento local)
- **Separe** as origens por vírgula, sem espaços extras
- O Render vai **reiniciar automaticamente** após salvar
- Aguarde ~2 minutos para o deploy completar

---

## Logs esperados após configurar

No Render, na aba **"Logs"**, você deve ver:

```
✅ CORS habilitado para: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:8000', 'http://127.0.0.1:8000', 'https://vpcapanema.github.io']
```

Se aparecer isso, **CORS está configurado corretamente**! 🎉
