# 🧪 GUIA DE TESTES - PLI 2050 Sistema Refatorado

## 📋 Checklist de Testes

### ✅ TESTE 1: Carregamento de Arquivos (1 minuto)

**O que fazer:**
1. Abra o navegador: http://127.0.0.1:5500/frontend/html/index.html
2. Pressione **F12** → Aba **Console**
3. Procure por erros 404 (arquivos não encontrados)

**✅ Resultado esperado:**
```
- Sem erros 404
- Sem erros de "is not defined"
- Console limpo ou com apenas logs informativos
```

**❌ Se falhar:**
- Verifique se todos os arquivos .js existem em `frontend/js/`
- Verifique se Five Server está rodando na porta 5500

---

### 🟢 TESTE 2: Dropdowns Cascateados (2 minutos)

**O que testar:**

#### 2A - Q12: Origem da Carga
1. Role até a pergunta "12. Origem da carga"
2. Clique no dropdown **"País de origem"**
3. Selecione **"Brasil"**
4. **Observe:** Dropdown "Estado de origem" deve aparecer e preencher
5. Selecione um estado (ex: "São Paulo")
6. **Observe:** Dropdown "Município de origem" deve aparecer e preencher

**✅ Resultado esperado:**
```
✅ Dropdown de países tem opções (68+ países)
✅ Ao selecionar Brasil → estados aparecem (27 estados)
✅ Ao selecionar estado → municípios aparecem (645 municípios para SP)
✅ Cascata funciona suavemente sem erros
```

#### 2B - Q13: Destino da Carga
1. Role até "13. Destino da carga"
2. Repita o mesmo teste (País → Brasil → Estado → Município)

**✅ Resultado esperado:**
```
✅ Mesma cascata funciona para destino
```

#### 2C - Q8: Produtos Transportados
1. Role até "8. Produtos transportados"
2. Clique em **"Adicionar Produto"**
3. Na nova linha, teste o dropdown de país/estado/município

**✅ Resultado esperado:**
```
✅ Cascata funciona na tabela de produtos
✅ Cada linha funciona independentemente
```

**❌ Se falhar:**
- Abra Console (F12) e procure por erros de `DropdownManager`
- Verifique se `dropdown-manager.js` foi carregado

---

### 🟡 TESTE 3: Validação Visual (3 minutos)

**O que testar:**

#### 3A - E-mail Inválido (onBlur)
1. Role até "Entrevistado - E-mail"
2. Digite: `teste@invalido`
3. Clique fora do campo (blur)
4. **Observe:** Campo deve ficar com borda laranja + mensagem de erro

**✅ Resultado esperado:**
```
🟠 Borda laranja
📝 Mensagem: "E-mail inválido. Formato esperado: usuario@dominio.com"
```

#### 3B - CNPJ Inválido
1. Role até "CNPJ"
2. Digite: `11.111.111/1111-11`
3. Clique fora do campo
4. **Observe:** Borda laranja + mensagem

**✅ Resultado esperado:**
```
🟠 Borda laranja
📝 Mensagem sobre CNPJ inválido
```

#### 3C - Campo Obrigatório Vazio (onSubmit)
1. Role até o final do formulário
2. Clique em **"💾 Salvar Respostas"** (sem preencher nada)
3. **Observe:** Campos obrigatórios ficam vermelhos

**✅ Resultado esperado:**
```
🔴 Campos obrigatórios com borda vermelha
📝 Mensagem: "Este campo é obrigatório"
📜 Página rola até o primeiro erro
```

**❌ Se falhar:**
- Verifique Console para erros de `FormValidator` ou `CoreValidators`
- Verifique se `form-validator.js` e `core-validators.js` foram carregados

---

### 🔴 TESTE 4: CNPJ Auto-fill (2 minutos)

**O que testar:**

1. Role até "CNPJ"
2. Digite um CNPJ válido: `27.865.757/0001-02`
3. Pressione **Tab** ou clique fora
4. **Aguarde 1-2 segundos**
5. **Observe:** Campos devem preencher automaticamente:
   - Razão Social
   - Nome Fantasia
   - Endereço (Logradouro, Número, Bairro, CEP)
   - Estado e Município

**✅ Resultado esperado:**
```
✅ Campos preenchidos automaticamente
✅ Loading spinner aparece durante consulta
✅ Mensagem de sucesso ou erro (se CNPJ não encontrado)
```

**⚠️ Nota:** API Receita Federal pode estar fora do ar. Se falhar, tente outro CNPJ:
- `00.000.000/0001-91` (CNPJ inválido para teste de erro)
- `06.990.590/0001-23` (Lojas Americanas)

**❌ Se falhar:**
- Verifique Console para erros de `IntegrationCNPJ`
- Verifique se `integration-cnpj.js` foi carregado
- Verifique conexão com internet (API externa)

---

### 🟣 TESTE 5: Submissão de Formulário (5 minutos)

**⚠️ IMPORTANTE:** Este teste requer backend rodando na porta 8000

**Pré-requisito:**
```powershell
# Em outro terminal:
cd backend-api
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**O que testar:**

1. Preencha formulário completo com dados válidos:
   - **Bloco 1**: Nome empresa, CNPJ, etc
   - **Bloco 2**: Entrevistado (nome, e-mail, telefone)
   - **Bloco 3-8**: Perguntas sobre logística
   
2. Clique em **"💾 Salvar Respostas"**

3. **Observe:**
   - Modal de loading aparece
   - Requisição POST enviada para backend
   - Modal de sucesso aparece
   - Download automático de Excel

**✅ Resultado esperado:**
```
✅ Modal verde de sucesso
✅ Download automático: PLI2050_Resposta_{empresa}_{data}.xlsx
✅ Formulário limpo após sucesso
✅ Console mostra: "Formulário enviado com sucesso"
```

**❌ Se falhar:**
- Verifique se backend está rodando (http://127.0.0.1:8000/docs)
- Verifique Console → Aba **Network** para ver requisição
- Verifique se `FormCollector` e `CoreAPI` foram carregados

---

## 🧪 TESTES AUTOMATIZADOS (Opcional)

Prefere testes automáticos? Siga estes passos:

### Opção 1: Via Console

1. Abra Console (F12)
2. Copie e cole o conteúdo de `frontend/js/test-suite.js`
3. Execute:
   ```javascript
   await runAllTests()
   ```

### Opção 2: Carregar Script

1. Descomente no `index.html`:
   ```html
   <script src="/js/test-suite.js?v=20251107"></script>
   ```
2. Recarregue página (F5)
3. Abra Console (F12)
4. Execute:
   ```javascript
   await runAllTests()
   ```

**Comandos disponíveis:**
```javascript
await runAllTests()       // Executa TODOS os testes
testFileLoading()         // Apenas carregamento
await testDropdowns()     // Apenas dropdowns
testValidation()          // Apenas validação
await testCNPJ()          // Apenas CNPJ
testFormCollector()       // Apenas FormCollector
```

---

## 📊 Interpretando Resultados

### ✅ Tudo funcionando:
```
📊 Resultado Final
✅ Testes passaram: 25/25
❌ Testes falharam: 0/25
⏱️ Tempo total: 1.23s

🎉 TODOS OS TESTES PASSARAM! Sistema funcionando perfeitamente.
```

### ⚠️ Alguns erros:
```
📊 Resultado Final
✅ Testes passaram: 20/25
❌ Testes falharam: 5/25

⚠️ Alguns testes falharam. Verifique os erros acima.
```

**O que fazer:**
1. Role para cima no console
2. Procure por `❌` vermelho
3. Leia a mensagem de erro
4. Corrija o problema indicado

---

## 🔍 Debugging Comum

### Erro: "CoreAPI is not defined"
**Causa:** `core-api.js` não carregou  
**Solução:** Verifique se arquivo existe e está no HTML

### Erro: "Cannot read property 'cache' of undefined"
**Causa:** `DropdownManager` não carregou  
**Solução:** Verifique se `dropdown-manager.js` está no HTML

### Erro: "CORS policy blocked"
**Causa:** Backend não permite origem  
**Solução:** Adicione `http://127.0.0.1:5500` no ALLOWED_ORIGINS do backend

### Erro: "Failed to fetch"
**Causa:** Backend não está rodando  
**Solução:** Inicie backend na porta 8000

### Erro: Dropdowns não cascateiam
**Causa:** Eventos de mudança não configurados  
**Solução:** Verifique se `DropdownManager.setupBrasilCascade()` foi chamado

---

## 📝 Relatório de Teste

Após testar, preencha:

| Teste | Status | Observações |
|-------|--------|-------------|
| 1. Carregamento de arquivos | ⬜ OK / ⬜ FALHA | |
| 2A. Dropdown Q12 (Origem) | ⬜ OK / ⬜ FALHA | |
| 2B. Dropdown Q13 (Destino) | ⬜ OK / ⬜ FALHA | |
| 2C. Dropdown Q8 (Produtos) | ⬜ OK / ⬜ FALHA | |
| 3A. Validação e-mail | ⬜ OK / ⬜ FALHA | |
| 3B. Validação CNPJ | ⬜ OK / ⬜ FALHA | |
| 3C. Validação obrigatórios | ⬜ OK / ⬜ FALHA | |
| 4. CNPJ Auto-fill | ⬜ OK / ⬜ FALHA | |
| 5. Submissão completa | ⬜ OK / ⬜ FALHA | |

---

## 🎯 Próximos Passos

Após todos os testes passarem:

1. ✅ Commit das mudanças
2. ✅ Push para repositório
3. ✅ Deploy para produção
4. ✅ Teste em ambiente de produção

---

**Última atualização:** 07/11/2025  
**Versão dos scripts:** v20251107
