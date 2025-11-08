# 📁 ESTRUTURA DO PROJETO PLI 2050

**Data:** 08/11/2025  
**Sistema:** Formulário de Entrevistas com Embarcadores  
**Repositório:** formulario_entrevista_embarcadores

---

## 🏗️ ESTRUTURA COMPLETA

```
SISTEMA_FORMULARIOS_ENTREVISTA/
│
├── 📂 .github/
│   └── copilot-instructions.md          # Instruções para GitHub Copilot
│
├── 📂 .vscode/
│   └── launch.json                      # Configurações de debug
│
├── 📂 assets/
│   ├── 📂 assets/
│   │   ├── favicon.svg
│   │   └── pagina_info_pli.zip
│   ├── 📂 data_base_monitoring/
│   │   └── data-1762445210906.csv
│   ├── 📂 database_utils/
│   │   ├── campos_frontend_SPA_POST.md
│   │   ├── campos_tabelas_banco_payload.json
│   │   └── credencias_bd.txt
│   ├── Entrevistas embarcadores - Rev02 1.pdf
│   └── favicon.svg
│
├── 📂 backend-fastapi/                   # ⭐ BACKEND PRINCIPAL (FastAPI + Python)
│   ├── 📂 app/
│   │   ├── 📂 models/                   # SQLAlchemy Models
│   │   ├── 📂 routers/                  # FastAPI Routers (modular)
│   │   ├── 📂 schemas/                  # Pydantic Schemas
│   │   ├── 📂 services/                 # Lógica de negócio
│   │   ├── __init__.py
│   │   └── database.py                  # Conexão PostgreSQL
│   │
│   ├── 📂 lists/                        # JSONs estáticos (países, estados, etc)
│   │
│   ├── 📂 migrations/                   # SQL migrations
│   │   └── fix_schema_nullable_fields.sql
│   │
│   ├── 📂 venv/                         # Ambiente virtual Python
│   │   ├── Include/
│   │   ├── Lib/
│   │   ├── Scripts/
│   │   └── pyvenv.cfg
│   │
│   ├── 📂 __pycache__/
│   │
│   ├── .dockerignore
│   ├── .env                             # ⚙️ Configurações ambiente (AWS RDS)
│   ├── .env.production                  # Configurações produção
│   ├── .gitignore
│   ├── Dockerfile                       # Docker container
│   ├── executar_migracao.py             # Script migração banco
│   ├── INICIO_RAPIDO.md                 # Guia início rápido
│   ├── inserir_10_registros_completos.py # Script teste inserção
│   ├── main.py                          # ⭐ ENTRY POINT FastAPI
│   ├── README.md
│   ├── requirements.txt                 # Dependências Python
│   ├── start-server.ps1                 # 🚀 Script iniciar servidor
│   ├── _start_server_exclusive.ps1
│   ├── testar_rds.py                    # Script teste conexão RDS
│   └── verificar_dados.py               # Script verificar dados
│
├── 📂 docs/                              # 📚 DOCUMENTAÇÃO COMPLETA
│   ├── API_RECEITA_FEDERAL_IMPLEMENTADO.md
│   ├── ARQUITETURA_VISUAL.md
│   ├── ATUALIZACAO_MUNICIPIOS_BRASIL.md
│   ├── COMECE_AQUI.md                   # ⭐ INÍCIO RECOMENDADO
│   ├── DOCUMENTACAO_COMPLETA.md         # Referência principal
│   ├── FLUXO_SALVAMENTO_BANCO.md
│   ├── GUIA_DEPLOY.md
│   ├── GUIA_TESTES.md
│   ├── IDS_AUTO_GERADOS_BANCO.md
│   ├── MUNICIPIOS_BRASIL_IMPLEMENTADO.md
│   ├── PADRONIZACAO_VISUAL.md
│   ├── README.md
│   ├── REFATORACAO_COMPLETA.md
│   ├── REFATORACAO_MODULAR_BACKEND.md
│   └── RESPOSTAS_HTML_REDESIGN.md
│
├── 📂 frontend/                          # 💻 FRONTEND (SPA - Single Page Application)
│   │
│   ├── 📂 assets/
│   │   ├── favicon.svg
│   │   └── pagina_info_pli.zip
│   │
│   ├── 📂 css/                           # Estilos CSS
│   │   ├── index.css                    # Estilos globais
│   │   ├── pages.css                    # Estilos páginas específicas
│   │   └── validation.css               # Estilos validação visual
│   │
│   ├── 📂 html/                          # Páginas HTML
│   │   ├── 📂 lists/                    # JSONs de listas (países, estados, etc)
│   │   ├── analytics.html               # Página analytics/gráficos
│   │   ├── diagnostico_api.html         # Diagnóstico API
│   │   ├── executar_teste.html          # Página testes
│   │   ├── index.html                   # ⭐ PÁGINA PRINCIPAL (Formulário)
│   │   ├── instrucoes.html              # Instruções de uso
│   │   ├── limpar_cache.html            # Utilitário limpar cache
│   │   ├── respostas.html               # Listagem respostas
│   │   ├── testar_conexao_api.html      # Teste conexão backend
│   │   ├── visualizador_dados.html      # Visualizador dados
│   │   └── visualizador.html            # Visualizador alternativo
│   │
│   ├── 📂 js/                            # JavaScript Modular (7 módulos)
│   │   │
│   │   ├── 🔵 CORE - Infraestrutura Base
│   │   ├── core-api.js                  # Cliente HTTP + Cache JSON
│   │   ├── core-validators.js           # Validadores puros (sem DOM)
│   │   │
│   │   ├── 🟢 DROPDOWN - Listas Cascateadas
│   │   ├── dropdown-manager.js          # ⭐ Motor de dropdowns (NOVO)
│   │   │
│   │   ├── 🟡 FORM - Formulário
│   │   ├── form-collector.js            # Coleta dados formulário
│   │   ├── form-validator.js            # Validação visual (3 estados)
│   │   │
│   │   ├── 🔴 UI - Interface Visual
│   │   ├── ui-feedback.js               # Modais + mensagens
│   │   ├── navbar.js                    # Navegação entre páginas
│   │   │
│   │   ├── 🟣 INTEGRATION - APIs Externas
│   │   ├── integration-cnpj.js          # Auto-fill Receita Federal
│   │   │
│   │   ├── 📊 PAGES - Visualização
│   │   ├── page-analytics.js            # Gráficos Chart.js
│   │   ├── page-respostas.js            # Listagem pesquisas
│   │   │
│   │   ├── 🧪 TESTES
│   │   ├── test-suite.js                # Suite testes automatizados
│   │   └── preencher_formulario_teste.js # Auto-fill para testes
│   │
│   └── 📂 vendor/                        # Bibliotecas externas
│       └── xlsx.full.min.js             # SheetJS (geração Excel)
│
├── 📂 lists/                             # Listas auxiliares (dropdowns)
│   └── 📂 municipios_por_uf/            # Municípios por UF (27 arquivos)
│       ├── AC.json
│       ├── AL.json
│       ├── ... (27 estados)
│       └── SP.json                      # 645 municípios
│
├── 📂 migrations/                        # Migrações SQL
│   ├── 20251106_add_codigo_produto_and_constraints.sql
│   ├── 20251106_apply_constraints_ordered.sql
│   └── ...
│
├── 📂 scripts/                           # Scripts auxiliares
│   ├── backend.node.pid
│   ├── backend.pid
│   ├── bulk_insert_34.js
│   ├── bulk_insert_via_api_34.js
│   ├── create_and_send_submit_payload.js
│   ├── criar_banco.js
│   ├── executar_migracao_numericos.js
│   ├── executar_municipios.js
│   ├── executar_update_view.sql
│   ├── generate_payload_from_columns.js
│   ├── generate_payload_from_db.js
│   ├── generate_tables_ddl.js
│   ├── gerar_listas_json.py
│   └── ...
│
├── 📂 sql/                               # Scripts SQL
│   ├── database_schema_completo.sql     # Schema completo PostgreSQL
│   ├── create_tables_ordered.sql        # Criação tabelas (ordem FKs)
│   ├── insert_data.sql                  # Inserção dados iniciais
│   └── ...
│
├── 📂 tests/                             # Testes automatizados
│
├── 📂 vendor/                            # Bibliotecas globais
│
├── .env                                  # ⚙️ Variáveis ambiente raiz
├── .gitignore
├── ANALISE_CAMPOS_VALIDACAO.md
├── CHECKLIST_DEPLOY.md
├── COMO-INICIAR.md                       # Guia início rápido
├── CONFIGURACAO_RDS_SIGMA_PLI.md
├── CONFIGURAR-AWS.ps1
├── CONSTRUIR-DOCKER.ps1
├── demo-validacao.html
├── DEPLOY_RAILWAY.md
├── DEPLOY_RENDER_RAPIDO.md
├── DEPLOY-AWS.ps1
├── DEPLOY-EC2-FREETIER.ps1
├── DIAGNOSTICO.ps1
├── docker-compose.yml
├── Dockerfile
├── ecs-task-definition.json
├── ESTRATEGIA_INSERCAO_DADOS.md
├── ESTRUTURA_PROJETO.md                 # ⭐ ESTE ARQUIVO
├── GUIA_DEPLOY_AWS.md
├── GUIA_DEPLOY_FREE_TIER.md
├── GUIA_TESTES_REFATORACAO.md
├── INICIAR-BACKEND.ps1
├── INSTRUCOES_INICIAR_LOCAL.md
├── LEMBRETE_CONTINUACAO.md              # 📝 Lembrete continuação trabalho
├── Procfile
├── railway.json
├── README-RAPIDO.md
├── RELATORIO_CAMPOS_OUTRO.md
├── render.yaml
├── SISTEMA_FORMULARIOS_ENTREVISTA.code-workspace
└── STATUS_SISTEMA.md

```

---

## 📊 ESTATÍSTICAS DO PROJETO

### Backend (FastAPI)
- **Linguagem:** Python 3.12
- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Database:** PostgreSQL 17 (AWS RDS)
- **Arquitetura:** Modular (routers, models, schemas, services)

### Frontend (SPA)
- **Arquitetura:** Single Page Application
- **JavaScript:** 7 módulos especializados (2.600+ linhas)
  - Core: API + Validators
  - Dropdown: Manager cascateado
  - Form: Collector + Validator
  - UI: Feedback + Navbar
  - Integration: CNPJ auto-fill
  - Pages: Analytics + Respostas
- **CSS:** 3 arquivos modulares
- **HTML:** 10 páginas + 1 principal (index.html)

### Database (PostgreSQL)
- **Schema:** `formulario_embarcadores`
- **Tabelas principais:** 10 tabelas
  - empresas (19 colunas)
  - entrevistados (9 colunas)
  - pesquisas (89 colunas)
  - produtos_transportados (10 colunas)
  - + 6 tabelas auxiliares
- **Views:** v_pesquisas_completa (65 colunas)
- **Constraints:** FKs, UNIQUEs, CHECKs

### Documentação
- **Total:** 20+ arquivos markdown
- **Guias:** Início, deploy, testes, refatoração
- **Referências:** Arquitetura, fluxos, APIs

---

## 🚀 COMO INICIAR

### 1. Backend FastAPI
```powershell
cd backend-fastapi
.\start-server.ps1
# Ou manualmente:
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend (Five Server)
```
Abrir index.html com Five Server (VS Code)
URL: http://127.0.0.1:5500/frontend/html/index.html
```

### 3. Testar
```
Backend: http://127.0.0.1:8000/health
Frontend: http://127.0.0.1:5500/frontend/html/index.html
Docs API: http://127.0.0.1:8000/docs
```

---

## 📚 DOCUMENTAÇÃO IMPORTANTE

1. **Início:** `docs/COMECE_AQUI.md`
2. **Documentação Completa:** `docs/DOCUMENTACAO_COMPLETA.md`
3. **Guia Testes:** `docs/GUIA_TESTES.md`
4. **Deploy:** `docs/GUIA_DEPLOY.md`
5. **Continuação:** `LEMBRETE_CONTINUACAO.md`

---

**Última atualização:** 08/11/2025  
**Status:** ✅ Frontend refatorado | 🔧 Backend em configuração
