# 🚀 Como Iniciar o Backend - PLI 2050

## Métodos para Iniciar o Backend

### ✨ MÉTODO 1 - Arquivo .bat (MAIS FÁCIL - Windows)

**Passos:**
1. Localize o arquivo `iniciar_backend.bat` na raiz do projeto
2. Clique 2x nele para executar
3. Uma janela do terminal vai abrir
4. Aguarde ver a mensagem: `✅ PostgreSQL conectado`
5. Pronto! O backend está rodando em `http://localhost:3000`

**Vantagens:**
- ✅ Não precisa abrir terminal manualmente
- ✅ Instala dependências automaticamente se necessário
- ✅ Visual claro com mensagens coloridas

---

### 🔷 MÉTODO 2 - Terminal do VS Code

**Passos:**
1. Abra o VS Code na pasta do projeto
2. Pressione `Ctrl + \`` (abre o terminal integrado)
3. Cole e execute o comando:
   ```bash
   cd backend-api && npm start
   ```
4. Aguarde a mensagem: `✅ PostgreSQL conectado`

**Vantagens:**
- ✅ Mantém tudo dentro do VS Code
- ✅ Fácil de ver logs e erros
- ✅ Pode abrir múltiplos terminais

---

### 🔶 MÉTODO 3 - PowerShell ou CMD

**Passos:**
1. Abra o PowerShell ou Prompt de Comando
2. Navegue até a pasta do projeto:
   ```bash
   cd D:\SISTEMA_FORMULARIOS_ENTREVISTA
   ```
3. Execute o comando:
   ```bash
   cd backend-api
   npm start
   ```

---

## 🧪 Testando se o Backend Está Rodando

### Opção 1 - Página de Teste (Recomendado)
1. Abra o arquivo: `testar_conexao_api.html` no navegador
2. Veja o status: 🟢 Online ou ⚫ Offline
3. Clique em "🔄 Testar Todos os Endpoints" para verificar tudo

### Opção 2 - Navegador Direto
Abra no navegador: http://localhost:3000/health

Se ver `{"status":"ok"}`, está funcionando! ✅

### Opção 3 - cURL (Terminal)
```bash
curl http://localhost:3000/health
```

---

## 🛠️ Comandos Úteis

### Instalar Dependências (só precisa fazer 1x)
```bash
cd backend-api
npm install
```

### Ver Logs Detalhados
O backend mostra no terminal:
- 📡 Porta que está rodando
- 🏥 Health check URL
- 🔒 Configuração de CORS
- ✅ Status da conexão PostgreSQL

### Parar o Backend
Pressione `Ctrl + C` no terminal onde ele está rodando

---

## ⚠️ Problemas Comuns

### "Porta 3000 já está em uso"
**Solução:**
```bash
# Windows PowerShell (como Admin)
netstat -ano | findstr :3000
taskkill /PID <número_do_pid> /F
```

### "Cannot find module"
**Solução:**
```bash
cd backend-api
rm -rf node_modules package-lock.json
npm install
```

### "ECONNREFUSED - Conexão recusada ao PostgreSQL"
**Solução:**
- Verifique se o arquivo `.env` existe em `backend-api/`
- Confirme que as credenciais do RDS estão corretas
- Teste a conexão com o banco separadamente

---

## 📊 Endpoints Disponíveis

Após iniciar, você pode acessar:

| Endpoint | Descrição | Registros |
|----------|-----------|-----------|
| `/health` | Status do servidor | - |
| `/api/instituicoes` | Lista instituições | 3 |
| `/api/estados` | Estados brasileiros | 27 |
| `/api/paises` | Países (por relevância) | 45 |
| `/api/municipios` | Municípios de SP | 645 |
| `/api/funcoes` | Funções dos entrevistados | 12 |
| `/api/entrevistadores` | Lista entrevistadores | - |

---

## 🎯 Dica Pro

**Deixe o backend rodando enquanto desenvolve!**

1. Abra 2 terminais no VS Code (clique no `+` ao lado do terminal)
2. Terminal 1: `cd backend-api && npm start` (deixa rodando)
3. Terminal 2: Use para comandos git, testes, etc.

Assim você não precisa ficar parando/iniciando o backend toda hora! 🚀
