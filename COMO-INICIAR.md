# 🚀 Como Iniciar o Sistema PLI 2050

## 📋 Scripts Disponíveis

### ✅ **RECOMENDADO: INICIAR-BACKEND.ps1**
```powershell
.\INICIAR-BACKEND.ps1
```

**O que faz:**
- ✅ Usa o Python do **ambiente virtual** (venv)
- ✅ Inicia o backend FastAPI na porta 8000
- ✅ Serve o frontend automaticamente em http://localhost:8000
- ✅ Simples e direto

**Quando usar:** 
- **SEMPRE!** Este é o script principal para desenvolvimento.

---

### 📄 Outros Scripts (menos usados)

#### START-PLI2050.ps1
```powershell
.\START-PLI2050.ps1
```

**O que faz:**
- Inicia o backend Node.js **ANTIGO** (porta 3000)
- Abre o VS Code com o index.html
- Requer Five Server extension

**Quando usar:**
- ❌ **NÃO USE!** Este script é do backend antigo (Node.js).
- O sistema agora usa FastAPI (Python).

---

#### open-frontend.ps1
```powershell
.\frontend\open-frontend.ps1
```

**O que faz:**
- Apenas abre o arquivo index.html no VS Code

**Quando usar:**
- Raramente. O backend FastAPI já serve o frontend automaticamente.

---

## 🎯 Fluxo Recomendado

### 1️⃣ **Iniciar o Sistema**
```powershell
cd D:\SISTEMA_FORMULARIOS_ENTREVISTA
.\INICIAR-BACKEND.ps1
```

### 2️⃣ **Acessar o Frontend**
Abra o navegador em: **http://localhost:8000**

### 3️⃣ **Acessar a Documentação da API**
Abra: **http://localhost:8000/docs**

### 4️⃣ **Verificar Health Check**
Abra: **http://localhost:8000/health**

---

## 🔧 Ambiente Virtual Python (venv)

O script **INICIAR-BACKEND.ps1** já usa automaticamente o Python do ambiente virtual localizado em:

```
D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi\venv\Scripts\python.exe
```

### Se precisar criar o venv novamente:
```powershell
cd backend-fastapi
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

---

## 🛑 Como Parar o Backend

Pressione **Ctrl+C** no terminal onde o servidor está rodando.

---

## ❓ Troubleshooting

### Erro: "main.py não encontrado"
```powershell
# Verifique se está no diretório correto
cd D:\SISTEMA_FORMULARIOS_ENTREVISTA
```

### Erro: "Porta 8000 já está em uso"
```powershell
# Pare todos os processos Python
Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
```

### Erro: "Ambiente virtual não encontrado"
```powershell
cd backend-fastapi
python -m venv venv
```

---

## 📚 Estrutura do Sistema

```
D:\SISTEMA_FORMULARIOS_ENTREVISTA\
├── INICIAR-BACKEND.ps1          ⭐ USE ESTE!
├── START-PLI2050.ps1             ❌ Antigo (Node.js)
├── frontend\
│   ├── html\
│   │   └── index.html           📱 Frontend
│   └── open-frontend.ps1         ℹ️ Raramente usado
└── backend-fastapi\
    ├── main.py                  🐍 Backend FastAPI
    ├── venv\                    🔧 Ambiente virtual Python
    └── requirements.txt         📦 Dependências
```

---

## ✅ Checklist de Desenvolvimento

- [ ] Backend rodando? `.\INICIAR-BACKEND.ps1`
- [ ] Frontend acessível? http://localhost:8000
- [ ] Console sem erros? Pressione F12 no navegador
- [ ] Testou o formulário? Preencha e envie
- [ ] Backend respondendo? http://localhost:8000/health

---

**Última atualização:** 06/11/2025  
**Versão do sistema:** v2.0.0 (FastAPI + Frontend integrado)
