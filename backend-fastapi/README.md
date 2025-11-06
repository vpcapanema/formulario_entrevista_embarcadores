backend-fastapi/
├── .env                  # Variáveis de ambiente (NÃO commitar!)
├── .gitignore
├── requirements.txt      # Dependências Python
├── start-server.ps1     # Script de inicialização
│
├── main.py              # Aplicação FastAPI principal
│
└── app/
    ├── __init__.py
    ├── database.py      # Conexão PostgreSQL + SessionLocal
    │
    ├── models/
    │   └── __init__.py  # SQLAlchemy models (9 tabelas)
    │
    ├── schemas/
    │   └── __init__.py  # Pydantic schemas (validação)
    │
    └── routers/
        ├── submit.py    # POST /api/submit-form (CRÍTICO)
        └── lists.py     # GETs auxiliares

## INICIAR SERVIDOR

```powershell
cd backend-fastapi
.\start-server.ps1
```

## ENDPOINTS PRINCIPAIS

- **POST** `/api/submit-form` - Salvar pesquisa completa ⭐
- **GET** `/api/estados` - Lista estados do Brasil
- **GET** `/api/municipios` - Lista municípios de SP
- **GET** `/api/paises` - Lista países
- **GET** `/api/instituicoes` - Lista instituições
- **GET** `/api/funcoes` - Lista funções/cargos
- **GET** `/api/entrevistadores` - Lista entrevistadores
- **GET** `/health` - Health check
- **GET** `/docs` - Documentação interativa (Swagger)

## PORTAS

- FastAPI: **8000**
- Frontend: **5500** (Five Server)

## DATABASE

- Host: sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
- Database: sigma_pli
- Schema: formulario_embarcadores
