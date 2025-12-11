# ⚠️ INSTRUÇÕES CRÍTICAS - GERENCIAMENTO DE TERMINAIS

## REGRA ABSOLUTA

**NUNCA execute outros comandos no terminal onde o backend está rodando!**

## Fluxo de Trabalho

### 1. Iniciar Backend (Terminal Exclusivo)

```powershell
# Este comando cria um terminal EXCLUSIVO para o backend
cd d:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi
python main.py
```

**Características deste terminal:**

- ✅ APENAS o servidor backend roda aqui
- ❌ NUNCA executar curl, python scripts, testes ou outros comandos
- 🔒 Este terminal fica bloqueado enquanto servidor roda
- 📝 Identificar como "Terminal Backend" ou "Python Server"

### 2. Executar Outros Comandos (Novos Terminais)

Para qualquer outro comando (testes, curl, scripts):

```powershell
# SEMPRE em um terminal DIFERENTE do backend
# Exemplos:
python testar_endpoint_divided.py
curl http://localhost:8000/health
python verificar_dados.py
```

## Checklist Antes de Executar Comando

Antes de executar QUALQUER comando, verificar:

1. ⚠️ **Checar terminal atual**: Este é o terminal do backend?

   - Se SIM → PARE! Use outro terminal
   - Se NÃO → OK para executar

2. 🔍 **Identificar terminal backend**: Procurar por:

   - Mensagem: "Uvicorn running on http://127.0.0.1:8000"
   - Processo ativo do Python/Uvicorn
   - Últimos logs do servidor

3. ✅ **Confirmar separação**:
   - Backend = Terminal A (bloqueado, rodando servidor)
   - Comandos = Terminal B, C, D... (livres para executar)

## Comandos Seguros por Terminal

### Terminal Backend (Exclusivo)

```powershell
# APENAS isto:
cd d:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi
python main.py
# Depois disso, NÃO TOCAR MAIS neste terminal
```

### Terminal de Testes

```powershell
cd d:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi
python testar_endpoint_divided.py
python verificar_dados.py
```

### Terminal de Requisições

```powershell
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/submit-form-divided -H "Content-Type: application/json" -d @payload.json
```

### Terminal de Gerenciamento

```powershell
# Parar processos
Stop-Process -Name "python" -Force

# Ver processos ativos
Get-Process -Name "python"

# Ver porta 8000
Get-NetTCPConnection -LocalPort 8000
```

## Problemas Comuns

### ❌ ERRADO - Executar teste no terminal do backend

```powershell
# Terminal com backend rodando:
# Uvicorn running on http://127.0.0.1:8000
python testar_endpoint_divided.py  # ❌ NUNCA FAZER ISTO!
```

### ✅ CORRETO - Backend em um terminal, teste em outro

```powershell
# Terminal 1 (Backend - deixar rodando):
python main.py
# Uvicorn running on http://127.0.0.1:8000

# Terminal 2 (Testes - executar comandos):
python testar_endpoint_divided.py  # ✅ OK!
curl http://localhost:8000/health  # ✅ OK!
```

## Identificação Visual de Terminais

Quando tiver múltiplos terminais abertos:

1. **Terminal Backend**:

   - Última linha: "Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)"
   - Status: Bloqueado, aguardando requisições
   - Ação: NÃO TOCAR

2. **Terminal de Comandos**:
   - Última linha: Prompt de comando "PS D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi>"
   - Status: Livre para executar comandos
   - Ação: Usar para testes, curl, scripts

## Resumo em 3 Passos

1. **Inicie o backend** → Terminal exclusivo → Deixe rodando
2. **Abra NOVO terminal** → Para testes/comandos
3. **Sempre verifique** → Antes de qualquer comando, confirmar que NÃO é o terminal do backend

---

**Data de criação**: 10/12/2025  
**Motivo**: Evitar execução de comandos no terminal do backend que causam shutdown prematuro do servidor
