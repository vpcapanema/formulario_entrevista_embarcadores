# 🚀 BACKEND FASTAPI - PLI 2050

## ✅ O QUE FOI CRIADO

Backend FastAPI completo e production-ready com:

### 📁 Estrutura Completa
```
backend-fastapi/
├── main.py                    # App FastAPI principal
├── requirements.txt           # Dependências Python
├── .env                       # Credenciais RDS (configurado)
├── start-server.ps1          # Script de inicialização
├── README.md
├── .gitignore
└── app/
    ├── database.py           # Conexão PostgreSQL + Pool
    ├── models/
    │   └── __init__.py       # 9 SQLAlchemy Models completos
    ├── schemas/
    │   └── __init__.py       # Pydantic Schemas com validações
    └── routers/
        ├── submit.py         # POST /api/submit-form ⭐ CRÍTICO
        └── lists.py          # GETs auxiliares (estados, paises, etc.)
```

### 🎯 Endpoints Implementados

#### **CRÍTICO - Salvar Pesquisa**
- **POST** `/api/submit-form`
  - Recebe payload completo do frontend
  - Transação atômica em 4 tabelas:
    1. `empresas` (INSERT ou UPDATE se CNPJ existe)
    2. `entrevistados` (INSERT)
    3. `pesquisas` (INSERT com 89 campos)
    4. `produtos_transportados` (INSERT múltiplo)
  - **Rollback automático** em caso de erro
  - Retorna IDs das entidades criadas

#### **Listas Auxiliares (GETs)**
- **GET** `/api/estados` - 27 estados do Brasil
- **GET** `/api/municipios` - 645 municípios de SP
- **GET** `/api/paises` - 61 países ordenados por relevância
- **GET** `/api/instituicoes` - Instituições cadastradas
- **GET** `/api/funcoes` - Funções/cargos de entrevistados
- **GET** `/api/entrevistadores` - Lista de entrevistadores

#### **Utilitários**
- **GET** `/health` - Health check + status DB
- **GET** `/` - Info da API
- **GET** `/docs` - Swagger UI interativa
- **GET** `/redoc` - Documentação ReDoc

### 🔧 Configurações

#### Banco de Dados
- **Host**: sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
- **Database**: sigma_pli
- **Schema**: formulario_embarcadores
- **SSL**: Habilitado (obrigatório)
- **Pool**: 10 conexões permanentes + 20 extras

#### CORS
- `http://localhost:5500` (Five Server)
- `http://127.0.0.1:5500`
- `http://localhost:8000` (API)
- `http://127.0.0.1:8000`

#### Porta
- **8000** (FastAPI/Uvicorn)

---

## 🚀 COMO INICIAR

### Opção 1: Script Automatizado (RECOMENDADO)

```powershell
cd D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi
.\start-server.ps1
```

**O script vai:**
1. ✅ Verificar Python instalado
2. ✅ Criar ambiente virtual (venv)
3. ✅ Instalar dependências automaticamente
4. ✅ Iniciar servidor na porta 8000

### Opção 2: Manual (sem venv)

```powershell
# 1. Instalar dependências (apenas primeira vez)
cd D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi
python -m pip install -r requirements.txt --user

# 2. Iniciar servidor
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Opção 3: Com venv (produção)

```powershell
# 1. Criar venv (apenas primeira vez)
cd D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi
python -m venv venv

# 2. Ativar venv
.\venv\Scripts\Activate.ps1

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Iniciar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## ✅ VERIFICAR SE ESTÁ FUNCIONANDO

### 1. Health Check

Abra navegador ou execute:

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health"
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-06T...",
  "database": "Connected",
  "message": "API está online e conectada ao banco de dados"
}
```

### 2. Swagger UI

Abra no navegador:
```
http://localhost:8000/docs
```

Você verá interface interativa com **TODOS** os endpoints documentados.

### 3. Teste POST /api/submit-form

No Swagger UI:
1. Clique em **POST /api/submit-form**
2. Clique em **"Try it out"**
3. Cole payload de exemplo (ver abaixo)
4. Clique em **"Execute"**

**Payload de exemplo** (mínimo):
```json
{
  "nome": "João Silva",
  "funcao": "Gerente de Logística",
  "telefone": "(11) 99999-9999",
  "email": "joao@empresa.com.br",
  "nomeEmpresa": "Transportes ABC",
  "tipoEmpresa": "embarcador",
  "municipio": "São Paulo",
  "tipoResponsavel": "entrevistador",
  "idResponsavel": 1,
  "produtoPrincipal": "Soja",
  "agrupamentoProduto": "Grãos",
  "tipoTransporte": "local",
  "origemPais": "Brasil",
  "origemEstado": "SP",
  "origemMunicipio": "Campinas",
  "destinoPais": "Brasil",
  "destinoEstado": "SP",
  "destinoMunicipio": "Santos",
  "distancia": 150.5,
  "temParadas": "nao",
  "modos": ["rodoviario"],
  "pesoCarga": 25000,
  "unidadePeso": "tonelada",
  "custoTransporte": 50000,
  "valorCarga": 500000,
  "tipoEmbalagem": "granel",
  "cargaPerigosa": "nao",
  "tempoDias": 0,
  "tempoHoras": 3,
  "tempoMinutos": 30,
  "frequencia": "diaria",
  "importanciaCusto": "alta",
  "variacaoCusto": 10,
  "importanciaTempo": "media",
  "variacaoTempo": 5,
  "importanciaConfiabilidade": "alta",
  "variacaoConfiabilidade": 8,
  "importanciaSeguranca": "alta",
  "variacaoSeguranca": 9,
  "importanciaCapacidade": "media",
  "variacaoCapacidade": 6,
  "tipoCadeia": "terceirizada",
  "produtos": []
}
```

**Resposta de sucesso (201):**
```json
{
  "success": true,
  "message": "Pesquisa salva com sucesso!",
  "data": {
    "empresa": "Transportes ABC",
    "entrevistado": "João Silva",
    "produto_principal": "Soja",
    "origem": "Campinas/SP",
    "destino": "Santos/SP"
  },
  "id_pesquisa": 123,
  "id_empresa": 45,
  "id_entrevistado": 67,
  "produtos_inseridos": 0
}
```

---

## 🔗 INTEGRAR COM FRONTEND

### Frontend já está configurado!

O arquivo `frontend/js/api-client.js` foi atualizado para usar porta **8000**.

### Teste Completo:

1. **Backend rodando** (porta 8000):
   ```powershell
   cd backend-fastapi
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend rodando** (porta 5500):
   - Abra `frontend/html/index.html` no VS Code
   - Botão direito → **"Open with Five Server"**

3. **Preencher formulário** e clicar **"Salvar"**

4. **Verificar no banco**:
   ```sql
   SELECT * FROM formulario_embarcadores.pesquisas ORDER BY id_pesquisa DESC LIMIT 1;
   ```

---

## 🐛 TROUBLESHOOTING

### Erro: "No module named 'fastapi'"

```powershell
python -m pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv pydantic email-validator --user
```

### Erro: "Connection refused" no health check

- Verifique se o servidor está rodando (ver console)
- Aguarde 5-10 segundos após iniciar
- Teste: `http://localhost:8000` no navegador

### Erro: "Database Disconnected"

- Verifique credenciais no `.env`
- Teste conexão direta ao RDS:
  ```powershell
  psql -h sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com -U sigma_admin -d sigma_pli
  ```

### Erro CORS no frontend

- Verifique `ALLOWED_ORIGINS` no `.env`
- Reinicie o servidor FastAPI
- Confirme frontend em `localhost:5500`

---

## 📊 TECNOLOGIAS UTILIZADAS

- **FastAPI** 0.109.0 - Framework web moderno e rápido
- **Uvicorn** 0.27.0 - ASGI server (production-ready)
- **SQLAlchemy** 2.0.25 - ORM para PostgreSQL
- **Psycopg2** 2.9.9 - Driver PostgreSQL
- **Pydantic** 2.5.3 - Validação de dados
- **Python-dotenv** 1.0.0 - Gerenciamento de variáveis de ambiente

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Iniciar servidor FastAPI** (porta 8000)
2. ✅ **Abrir frontend** (Five Server na porta 5500)
3. ✅ **Testar salvamento completo** com dados reais
4. ✅ **Validar dados no banco** `sigma_pli`

---

**Última atualização**: 06/11/2025  
**Status**: ✅ Backend FastAPI completo e pronto para uso  
**Desenvolvido por**: GitHub Copilot para PLI 2050 - SEMIL-SP
