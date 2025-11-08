# Análise de Paths do Frontend

## ✅ Arquivos Verificados (frontend/js)

### 1. **core-api.js** - ✅ CORRETO
- **BASE_URL**: Auto-detecta ambiente
  - GitHub Pages → `https://formulario-entrevista-embarcadores.onrender.com`
  - Localhost → `http://localhost:8000`
- **Endpoints API** (absolutos - correto, vão para backend):
  - `/health`
  - `/api/submit-form`
  - `/api/analytics/*`
  - `/api/external/cnpj/{cnpj}` ← **CNPJ**
  - `/api/pesquisas/*`
- **JSON Estáticos** (relativos - correto):
  - `./lists/*.json` ✅
  - `./lists/municipios_por_uf/{UF}.json` ✅

### 2. **integration-cnpj.js** - ✅ CORRETO
- Usa `CoreAPI.consultarCNPJ()` → vai para `/api/external/cnpj/{cnpj}`
- Usa `CoreAPI.getMunicipiosByUF()` → busca `./lists/municipios_por_uf/{UF}.json`

### 3. **spa-router.js** - ✅ CORRETO (Multi-Page)
- Navegação entre arquivos HTML locais:
  - `./index.html`
  - `./respostas.html`
  - `./analytics.html`
  - `./instrucoes.html`
  - `./visualizador_dados.html`

### 4. **auth-simple.js** - ✅ CORRETO
- Senha hardcoded: `pli2050@admin`
- Verifica página atual via `window.location.pathname`

### 5. **Outros arquivos JS** - ✅ CORRETOS
- `navbar.js` - Usa `window.router.navigate()`
- `dropdown-manager.js` - Não tem paths externos
- `form-collector.js` - Não tem paths externos
- `form-validator.js` - Não tem paths externos
- `ui-feedback.js` - Não tem paths externos
- `page-respostas.js` - Usa `CoreAPI.get('/api/...')`
- `page-analytics.js` - Usa `CoreAPI.get('/api/...')`

## 🔴 Problema Identificado: CNPJ

### Causa Provável:
**Backend não tem o endpoint `/api/external/cnpj/{cnpj}`**

### Verificar no Backend (FastAPI):
1. Arquivo: `backend-fastapi/main.py` ou `backend-fastapi/app/routes/`
2. Procurar por:
   ```python
   @app.get("/api/external/cnpj/{cnpj}")
   async def consultar_cnpj(cnpj: str):
       ...
   ```

### Se não existir, criar endpoint:
```python
from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/api/external")

@router.get("/cnpj/{cnpj}")
async def consultar_cnpj(cnpj: str):
    """
    Consulta CNPJ na BrasilAPI (Receita Federal)
    """
    if len(cnpj) != 14:
        raise HTTPException(status_code=400, detail="CNPJ deve ter 14 dígitos")
    
    try:
        async with httpx.AsyncClient() as client:
            url = f"https://brasilapi.com.br/api/cnpj/v1/{cnpj}"
            response = await client.get(url, timeout=10.0)
            
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="CNPJ não encontrado")
            
            response.raise_for_status()
            data = response.json()
            
            return {
                "success": True,
                "data": {
                    "razao_social": data.get("razao_social"),
                    "nome_fantasia": data.get("nome_fantasia"),
                    "municipio": data.get("municipio"),
                    "uf": data.get("uf"),
                    "cep": data.get("cep"),
                    "logradouro": data.get("logradouro"),
                    "numero": data.get("numero"),
                    "bairro": data.get("bairro"),
                    "complemento": data.get("complemento")
                }
            }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao consultar BrasilAPI: {str(e)}")

@router.get("/cnpj/{cnpj}/validar")
async def validar_cnpj(cnpj: str):
    """
    Valida se CNPJ existe e está ativo
    """
    try:
        result = await consultar_cnpj(cnpj)
        return {
            "success": True,
            "valido": True,
            "ativo": True
        }
    except HTTPException:
        return {
            "success": False,
            "valido": False,
            "ativo": False
        }
```

## ✅ Resumo Final

### Paths CORRETOS (não precisa alterar):
1. ✅ `core-api.js` - Detecção automática de ambiente
2. ✅ `./lists/*.json` - JSON estáticos relativos
3. ✅ `./municipios_por_uf/{UF}.json` - Municípios por UF
4. ✅ Navegação entre HTMLs - Caminhos relativos
5. ✅ Autenticação - Funcional em todas as páginas

### Paths com PROBLEMA:
1. ❌ **Backend não tem endpoint `/api/external/cnpj/`**
   - Solução: Criar endpoint no FastAPI conforme código acima
   - Adicionar dependência: `httpx` no `requirements.txt`

### Teste Rápido:
Abra o console do navegador (F12) e digite:
```javascript
CoreAPI.consultarCNPJ('00000000000191').then(console.log).catch(console.error)
```

**Se retornar erro 404** → Backend não tem o endpoint
**Se retornar dados** → Tudo funcionando!
