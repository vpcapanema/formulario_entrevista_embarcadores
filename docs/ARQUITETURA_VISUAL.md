# 🏗️ ARQUITETURA MODULAR - DIAGRAMA VISUAL

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🌐 FRONTEND (SPA)                           │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│   │  index.html  │  │ analytics.html│  │respostas.html│       │
│   │  (Formulário)│  │  (Gráficos)  │  │ (Consulta)   │       │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│          │                  │                  │                │
│          └──────────────────┴──────────────────┘                │
│                             │                                   │
│                             │ HTTP Requests                     │
│                             ▼                                   │
└─────────────────────────────────────────────────────────────────┘

                              │
                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                🚀 BACKEND (FastAPI)                            │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐ │
│   │                                                         │ │
│   │               main.py (ORQUESTRADOR)                    │ │
│   │                                                         │ │
│   │   • Configuração CORS                                   │ │
│   │   • Montagem de arquivos estáticos                     │ │
│   │   • Registro de routers                                │ │
│   │   • Eventos startup/shutdown                           │ │
│   │                                                         │ │
│   └────────────┬─────────┬─────────┬─────────┬─────────────┘ │
│                │         │         │         │                 │
│      ┌─────────┘         │         │         └─────────┐       │
│      │                   │         │                   │       │
│      ▼                   ▼         ▼                   ▼       │
│  ┌────────┐       ┌────────┐  ┌────────┐       ┌──────────┐  │
│  │ health │       │ submit │  │ lists  │       │analytics │  │
│  └───┬────┘       └───┬────┘  └───┬────┘       └────┬─────┘  │
│      │                │           │                  │         │
│      │                │           │                  │         │
│  ┌───▼────┐       ┌───▼────┐  ┌──▼─────┐       ┌───▼──────┐  │
│  │routes  │       │routes  │  │routes  │       │ routes   │  │
│  │        │       │        │  │        │       │          │  │
│  │/health │       │/api/   │  │/api/   │       │/api/     │  │
│  │/info   │       │submit- │  │estados │       │analytics/│  │
│  │        │       │form    │  │...     │       │kpis      │  │
│  │        │       │        │  │        │       │...       │  │
│  └────────┘       └────────┘  └────────┘       └──────────┘  │
│      │                │           │                  │         │
│      └────────────────┴───────────┴──────────────────┘         │
│                              │                                 │
│                              │ SQLAlchemy ORM                  │
│                              ▼                                 │
└─────────────────────────────────────────────────────────────────┘

                              │
                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              🗄️  BANCO DE DADOS (PostgreSQL)                   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐ │
│   │                                                         │ │
│   │         Schema: formulario_embarcadores                 │ │
│   │                                                         │ │
│   │   ┌──────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│   │   │ empresas │  │ entrevistados│  │   pesquisas  │    │ │
│   │   └─────┬────┘  └──────┬───────┘  └──────┬───────┘    │ │
│   │         │              │                  │             │ │
│   │         └──────────────┴──────────────────┘             │ │
│   │                        │                                │ │
│   │                        ▼                                │ │
│   │              ┌─────────────────────┐                    │ │
│   │              │produtos_transportados│                    │ │
│   │              └─────────────────────┘                    │ │
│   │                                                         │ │
│   │   Tabelas Auxiliares:                                  │ │
│   │   • estados_brasil                                     │ │
│   │   • municipios_sp                                      │ │
│   │   • paises                                             │ │
│   │   • instituicoes                                       │ │
│   │   • funcoes_entrevistado                               │ │
│   │   • entrevistadores                                    │ │
│   │                                                         │ │
│   └─────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 FLUXO DE DADOS

### 1️⃣ SUBMISSÃO DE FORMULÁRIO

```
Frontend                Backend                   Database
   │                       │                         │
   │ POST /api/submit-form │                         │
   │──────────────────────>│                         │
   │                       │                         │
   │                       │ BEGIN TRANSACTION       │
   │                       │────────────────────────>│
   │                       │                         │
   │                       │ INSERT empresas         │
   │                       │────────────────────────>│
   │                       │<─ id_empresa            │
   │                       │                         │
   │                       │ INSERT entrevistados    │
   │                       │────────────────────────>│
   │                       │<─ id_entrevistado       │
   │                       │                         │
   │                       │ INSERT pesquisas        │
   │                       │────────────────────────>│
   │                       │<─ id_pesquisa           │
   │                       │                         │
   │                       │ INSERT produtos (loop)  │
   │                       │────────────────────────>│
   │                       │                         │
   │                       │ COMMIT                  │
   │                       │────────────────────────>│
   │                       │                         │
   │<─ 201 Created + IDs   │                         │
   │                       │                         │
   │ Exibir modal verde +  │                         │
   │ gerar Excel           │                         │
```

### 2️⃣ CARREGAMENTO DE ANALYTICS

```
Frontend                Backend                   Database
   │                       │                         │
   │ GET /api/analytics/kpis                         │
   │──────────────────────>│                         │
   │                       │                         │
   │                       │ SELECT                  │
   │                       │ COUNT(DISTINCT id_*),   │
   │                       │ SUM(peso_carga),        │
   │                       │ AVG(distancia)          │
   │                       │ FROM pesquisas          │
   │                       │────────────────────────>│
   │                       │<─ Resultado agregado    │
   │                       │                         │
   │<─ JSON com KPIs       │                         │
   │                       │                         │
   │ Renderizar Chart.js   │                         │
```

### 3️⃣ POPULAÇÃO DE DROPDOWNS

```
Frontend                Backend                   Database
   │                       │                         │
   │ GET /api/estados      │                         │
   │──────────────────────>│                         │
   │                       │ SELECT * FROM           │
   │                       │ estados_brasil          │
   │                       │ ORDER BY nome_estado    │
   │                       │────────────────────────>│
   │                       │<─ 27 estados            │
   │<─ JSON array          │                         │
   │                       │                         │
   │ Popular <select>      │                         │
```

---

## 🔄 SEPARAÇÃO DE RESPONSABILIDADES

### 🎨 FRONTEND (SPA)
**Responsabilidade**: Interface visual APENAS

✅ Coletar dados do formulário  
✅ Validar visualmente (destaque vermelho)  
✅ Enviar HTTP requests  
✅ Renderizar respostas (modal/gráficos)  
✅ Gerar Excel para download  

❌ **NÃO** validar regras de negócio  
❌ **NÃO** normalizar dados  
❌ **NÃO** calcular agregações  
❌ **NÃO** armazenar dados (exceto cache temporário)  

---

### 🚀 BACKEND (FastAPI)
**Responsabilidade**: Lógica de negócio e dados

✅ Validar dados (Pydantic)  
✅ Normalizar formatos (camelCase → snake_case)  
✅ Transações ACID (INSERT/UPDATE/DELETE)  
✅ Cálculos e agregações (SQL)  
✅ Autenticação/Autorização (futuro)  

❌ **NÃO** renderizar HTML  
❌ **NÃO** processar eventos de UI  
❌ **NÃO** armazenar estado de sessão (stateless)  

---

### 🗄️ DATABASE (PostgreSQL)
**Responsabilidade**: Persistência e integridade

✅ Armazenar dados normalizados  
✅ Garantir constraints (NOT NULL, UNIQUE, FK)  
✅ Executar queries SQL otimizadas  
✅ Manter índices e views  

❌ **NÃO** validar regras de negócio (backend faz)  
❌ **NÃO** expor diretamente ao frontend (backend como camada)  

---

## 📦 MÓDULOS E RESPONSABILIDADES

| Módulo | Responsabilidade | Endpoints | Acessa DB? |
|--------|------------------|-----------|------------|
| **health** | Monitoramento e info | `GET /health`, `GET /info` | ✅ (teste) |
| **submit** | Processar formulários | `POST /api/submit-form` | ✅ (write) |
| **lists** | Dados auxiliares | `GET /api/estados`, etc | ✅ (read) |
| **analytics** | Estatísticas e KPIs | `GET /api/analytics/*` | ✅ (read) |

---

## 🎯 PRINCÍPIOS ARQUITETURAIS

### 1. **Single Responsibility Principle (SRP)**
Cada módulo tem UMA responsabilidade clara:
- `health` → Monitoramento
- `submit` → Processamento de formulários
- `lists` → Listas auxiliares
- `analytics` → Estatísticas

### 2. **Don't Repeat Yourself (DRY)**
- Configuração centralizada em `main.py`
- Schemas Pydantic reutilizados
- Database session via dependency injection

### 3. **Keep It Simple, Stupid (KISS)**
- Estrutura previsível (`routers/[nome]/routes.py`)
- Nomenclatura clara e consistente
- Separação clara de camadas

### 4. **Separation of Concerns (SoC)**
- Frontend = UI
- Backend = Lógica
- Database = Persistência

### 5. **API First Design**
- Backend retorna APENAS JSON
- Frontend consome APIs REST
- Desacoplamento total entre camadas

---

## 🔐 SEGURANÇA EM CAMADAS

```
┌──────────────────────────────────────────┐
│         🌐 FRONTEND (SPA)               │
│  • Validação visual básica               │
│  • Máscara de CPF/CNPJ                  │
│  • Required fields                       │
└────────────────┬─────────────────────────┘
                 │
                 │ HTTPS (produção)
                 ▼
┌──────────────────────────────────────────┐
│         🚀 BACKEND (FastAPI)            │
│  • CORS (origens permitidas)            │
│  • Validação Pydantic (tipos/valores)   │
│  • Rate limiting (100 req/min)          │
│  • Transações ACID                      │
│  • Prepared statements (SQL injection)  │
└────────────────┬─────────────────────────┘
                 │
                 │ Criptografia TLS
                 ▼
┌──────────────────────────────────────────┐
│      🗄️  DATABASE (PostgreSQL)          │
│  • Constraints (NOT NULL, UNIQUE, FK)   │
│  • Índices únicos                       │
│  • Triggers (futuro)                    │
│  • Backup automático (RDS)              │
└──────────────────────────────────────────┘
```

---

## 📈 PERFORMANCE E OTIMIZAÇÕES

### Backend (FastAPI)
- ✅ **Connection pooling**: SQLAlchemy gerencia pool de conexões
- ✅ **Lazy loading**: Dados carregados sob demanda
- ✅ **Query optimization**: Queries SQL otimizadas com índices
- ✅ **Async support**: Rotas async para I/O non-blocking

### Database (PostgreSQL)
- ✅ **Índices**: `cnpj_digits`, `email_lower`, `id_*`
- ✅ **Views**: `v_pesquisas_completa` com JOINs pré-calculados
- ✅ **Agregações**: `COUNT()`, `SUM()`, `AVG()` em SQL puro
- ✅ **Partitioning**: Futuro (se volume > 1M registros)

### Frontend (SPA)
- ✅ **Lazy loading**: Carregar analytics apenas na página analytics
- ✅ **Cache**: Guardar listas estáticas (estados, países)
- ✅ **Debouncing**: Evitar múltiplas chamadas simultâneas
- ✅ **Chart.js**: Renderização eficiente de gráficos

---

**Documentação criada em**: 06/11/2025  
**Versão**: 2.0.0  
**Status**: ✅ PRODUÇÃO-READY
