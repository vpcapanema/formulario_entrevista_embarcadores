# 🔐 IDs AUTO-GERADOS - REGRAS CRÍTICAS

**Data**: 06/11/2025  
**Sistema**: PLI 2050 v2.0.0

---

## ✅ **REGRA DE OURO**

> **USUÁRIO NUNCA DIGITA IDs**  
> **FRONTEND NUNCA ENVIA IDs**  
> **BACKEND NUNCA RECEBE IDs DE PKs**  
> **POSTGRESQL GERA TODOS OS IDs AUTOMATICAMENTE**

---

## 🔑 **IDs GERENCIADOS PELO BANCO (AUTO-INCREMENT)**

Todos os IDs são **SERIAL** no PostgreSQL (equivalente a AUTO_INCREMENT do MySQL):

| Tabela | Coluna PK | Tipo | Gerado Por | Exemplo |
|--------|-----------|------|------------|---------|
| `empresas` | `id_empresa` | SERIAL | PostgreSQL | 1, 2, 3... |
| `entrevistados` | `id_entrevistado` | SERIAL | PostgreSQL | 1, 2, 3... |
| `pesquisas` | `id_pesquisa` | SERIAL | PostgreSQL | 1, 2, 3... |
| `produtos_transportados` | `id_produto` | SERIAL | PostgreSQL | 1, 2, 3... |

### **Como Funciona SERIAL**
```sql
-- Definição da tabela (DDL)
CREATE TABLE empresas (
    id_empresa SERIAL PRIMARY KEY,  -- ⚡ AUTO-INCREMENT
    nome_empresa VARCHAR(500) NOT NULL,
    cnpj VARCHAR(18),
    ...
);

-- INSERT sem especificar id_empresa
INSERT INTO empresas (nome_empresa, cnpj)
VALUES ('Empresa ABC', '12.345.678/0001-99');

-- PostgreSQL retorna automaticamente:
-- id_empresa = 123 (próximo número disponível)
```

---

## 📝 **O QUE O USUÁRIO PREENCHE (Dados de Negócio)**

### **Card 1: Dados do Entrevistado**
```
✍️ Nome: "João Silva"
✍️ Função: "Gerente de Logística" (seleciona de dropdown)
✍️ Telefone: "11999999999"
✍️ Email: "joao@empresa.com"
```

### **Card 2: Dados da Empresa**
```
✍️ Tipo empresa: "Embarcador" (seleciona de dropdown)
✍️ Razão Social: "Empresa ABC LTDA"
✍️ CNPJ: "12.345.678/0001-99" (opcional)
✍️ Endereço: "Rua Teste, 123"
✍️ Município: "São Paulo" (seleciona de dropdown)
✍️ Estado: "SP" (seleciona de dropdown)
```

### **Card 3: Produtos (Tabela Q8)**
```
✍️ Produto 1:
   - Carga: "Soja em grãos"
   - Movimentação: "50000"
   - Origem: "Ribeirão Preto"
   - Destino: "Santos"
   - Modalidade: "Rodoviário"

✍️ Produto 2:
   - Carga: "Açúcar"
   - Movimentação: "30000"
   ...
```

### **Cards 4-8: Características do Transporte**
```
✍️ Origem país: "Brasil" (seleciona)
✍️ Origem estado: "SP" (seleciona)
✍️ Origem município: "Ribeirão Preto" (seleciona)
✍️ Destino país: "Brasil" (seleciona)
✍️ Destino estado: "SP" (seleciona)
✍️ Destino município: "Santos" (seleciona)
✍️ Distância: "450" (digita em km)
✍️ Tem paradas: "Sim" (seleciona)
✍️ Número de paradas: "3" (digita)
✍️ Modais: ["Rodoviário"] (seleciona checkboxes)
✍️ Configuração veículo: "Carreta" (seleciona)
... (mais 30+ campos)
```

---

## 🤖 **O QUE O BANCO GERA AUTOMATICAMENTE**

### **Ao Inserir uma Empresa**
```sql
-- Frontend envia (JSON):
{
  "nomeEmpresa": "Empresa ABC LTDA",
  "cnpj": "12.345.678/0001-99",
  "municipio": "São Paulo"
}

-- Backend faz INSERT:
INSERT INTO empresas (nome_empresa, cnpj, municipio)
VALUES ('Empresa ABC LTDA', '12.345.678/0001-99', 'São Paulo');

-- PostgreSQL gera AUTOMATICAMENTE:
id_empresa = 123              -- ⚡ SERIAL (auto-increment)
cnpj_digits = '12345678000199' -- Calculado pelo backend
data_criacao = '2025-11-06 14:30:00'  -- NOW()
data_atualizacao = '2025-11-06 14:30:00'  -- NOW()
```

### **Ao Inserir um Entrevistado**
```sql
-- Frontend envia:
{
  "nome": "João Silva",
  "funcao": "Gerente de Logística",
  "email": "joao@empresa.com"
}

-- Backend faz INSERT:
INSERT INTO entrevistados (id_empresa, nome, funcao, email)
VALUES (123, 'João Silva', 'Gerente de Logística', 'joao@empresa.com');

-- PostgreSQL gera:
id_entrevistado = 456         -- ⚡ SERIAL
email_lower = 'joao@empresa.com'  -- Calculado pelo backend
data_criacao = '2025-11-06 14:30:01'  -- NOW()
```

### **Ao Inserir uma Pesquisa**
```sql
-- Frontend envia 47 campos de dados

-- Backend faz INSERT:
INSERT INTO pesquisas (id_empresa, id_entrevistado, produto_principal, ...)
VALUES (123, 456, 'Soja', ...);

-- PostgreSQL gera:
id_pesquisa = 789             -- ⚡ SERIAL
status = 'finalizada'         -- Default do backend
data_criacao = '2025-11-06 14:30:02'  -- NOW()
```

### **Ao Inserir Produtos**
```sql
-- Frontend envia array de produtos:
{
  "produtos": [
    {"carga": "Soja", "movimentacao": 50000},
    {"carga": "Açúcar", "movimentacao": 30000}
  ]
}

-- Backend faz 2 INSERTs:
INSERT INTO produtos_transportados (id_pesquisa, id_empresa, carga, movimentacao, ordem)
VALUES (789, 123, 'Soja', 50000, 1);

INSERT INTO produtos_transportados (id_pesquisa, id_empresa, carga, movimentacao, ordem)
VALUES (789, 123, 'Açúcar', 30000, 2);

-- PostgreSQL gera:
id_produto = 1001  -- ⚡ SERIAL (produto 1)
id_produto = 1002  -- ⚡ SERIAL (produto 2)
data_criacao = '2025-11-06 14:30:03'  -- NOW() para cada
```

---

## 🚫 **O QUE O FRONTEND NUNCA ENVIA**

### ❌ **IDs de Primary Keys (PKs)**
```javascript
// ❌ ERRADO - Frontend NUNCA envia isso:
{
  "id_empresa": 123,           // ❌ Gerado pelo banco
  "id_entrevistado": 456,      // ❌ Gerado pelo banco
  "id_pesquisa": 789,          // ❌ Gerado pelo banco
  "id_produto": 1001           // ❌ Gerado pelo banco
}

// ✅ CORRETO - Frontend envia apenas dados:
{
  "nomeEmpresa": "Empresa ABC",
  "nome": "João Silva",
  "produtoPrincipal": "Soja"
}
```

### ❌ **Timestamps Automáticos**
```javascript
// ❌ ERRADO - Frontend NUNCA envia:
{
  "data_criacao": "2025-11-06",     // ❌ Gerado por NOW()
  "data_atualizacao": "2025-11-06"  // ❌ Gerado por NOW()
}
```

### ❌ **Campos Calculados pelo Backend**
```javascript
// ❌ ERRADO - Frontend NUNCA envia:
{
  "cnpj_digits": "12345678000199",  // ❌ Backend calcula de cnpj
  "email_lower": "joao@empresa.com" // ❌ Backend calcula de email
}
```

---

## ✅ **EXCEÇÃO: FKs de Tabelas Auxiliares**

### **Usuário NÃO digita, mas SELECIONA de dropdown**

Estas são **Foreign Keys** de tabelas pré-populadas:

```javascript
// ✅ CORRETO - Frontend envia FK após seleção:
{
  "idResponsavel": 5,  // ✅ FK de tabela entrevistadores (selecionado)
  "funcao": "Gerente de Logística",  // ✅ FK de tabela funcoes_entrevistado (selecionado)
}
```

**Como funciona:**
1. Usuário abre dropdown "Selecionar entrevistador"
2. Dropdown foi populado por `GET /api/entrevistadores`:
   ```json
   [
     {"id_entrevistador": 5, "nome_completo": "Maria Santos"},
     {"id_entrevistador": 7, "nome_completo": "Pedro Silva"}
   ]
   ```
3. Usuário clica em "Maria Santos"
4. Frontend envia `idResponsavel: 5`

**Por que essa FK é enviada?**
- Não é uma PK da transação atual
- É uma FK referenciando tabela **pré-existente**
- Usuário **seleciona** de lista, não digita manualmente

---

## 📊 **RESUMO: ORIGEM DOS DADOS**

| Campo | Origem | Exemplo | Tipo |
|-------|--------|---------|------|
| `id_empresa` | 🤖 **Banco (SERIAL)** | 123 | PK auto-gerado |
| `id_entrevistado` | 🤖 **Banco (SERIAL)** | 456 | PK auto-gerado |
| `id_pesquisa` | 🤖 **Banco (SERIAL)** | 789 | PK auto-gerado |
| `id_produto` | 🤖 **Banco (SERIAL)** | 1001 | PK auto-gerado |
| `nome_empresa` | ✍️ **Usuário digita** | "Empresa ABC" | Texto livre |
| `cnpj` | ✍️ **Usuário digita** | "12.345.678/0001-99" | Texto com máscara |
| `cnpj_digits` | 🔧 **Backend calcula** | "12345678000199" | Remove formatação |
| `email` | ✍️ **Usuário digita** | "joao@empresa.com" | Texto livre |
| `email_lower` | 🔧 **Backend calcula** | "joao@empresa.com" | Lowercase |
| `municipio` | ✍️ **Usuário seleciona** | "São Paulo" | Dropdown |
| `funcao` | ✍️ **Usuário seleciona** | "Gerente" | Dropdown |
| `idResponsavel` | ✍️ **Usuário seleciona** | 5 | Dropdown (FK) |
| `data_criacao` | 🤖 **Banco (NOW())** | 2025-11-06 14:30 | Timestamp |
| `data_atualizacao` | 🤖 **Banco (NOW())** | 2025-11-06 14:30 | Timestamp |

---

## 🔍 **SCHEMA PYDANTIC - O QUE O BACKEND ESPERA**

```python
# backend-fastapi/app/schemas/__init__.py

class SubmitFormData(BaseModel):
    """
    ✅ CAMPOS QUE O FRONTEND ENVIA
    ❌ SEM NENHUM ID DE PK
    """
    
    # ---- DADOS DO ENTREVISTADO (digitados) ----
    nome: str                    # ✍️ "João Silva"
    funcao: str                  # ✍️ "Gerente de Logística"
    telefone: str                # ✍️ "11999999999"
    email: EmailStr              # ✍️ "joao@empresa.com"
    
    # ---- DADOS DA EMPRESA (digitados) ----
    nomeEmpresa: str             # ✍️ "Empresa ABC LTDA"
    tipoEmpresa: str             # ✍️ "embarcador"
    municipio: str               # ✍️ "São Paulo"
    cnpj: Optional[str]          # ✍️ "12.345.678/0001-99" (opcional)
    
    # ---- METADADOS (selecionados) ----
    tipoResponsavel: str         # ✍️ "entrevistador"
    idResponsavel: int           # ✍️ 5 (FK - selecionado de dropdown)
    
    # ---- 47 CAMPOS DE PESQUISA (mix) ----
    produtoPrincipal: str        # ✍️ Digitado ou selecionado
    origemPais: str              # ✍️ Selecionado de dropdown
    origemEstado: str            # ✍️ Selecionado de dropdown
    distancia: Decimal           # ✍️ Digitado (km)
    # ... mais 43 campos
    
    # ---- PRODUTOS (array de objetos) ----
    produtos: List[ProdutoData]  # ✍️ Array digitado linha por linha
    
    # ❌ SEM IDs DE PKs:
    # - Sem id_empresa
    # - Sem id_entrevistado
    # - Sem id_pesquisa
    # - Sem id_produto
    # - Sem data_criacao
    # - Sem data_atualizacao
```

---

## 🎯 **FLUXO COMPLETO: USUÁRIO → BANCO**

```
1. Usuário preenche formulário
   ✍️ Nome: "João Silva"
   ✍️ Empresa: "ABC LTDA"
   ✍️ CNPJ: "12.345.678/0001-99"
   ✍️ Produto: "Soja"
        ↓
2. Frontend coleta dados (form.js)
   {
     "nome": "João Silva",
     "nomeEmpresa": "ABC LTDA",
     "cnpj": "12.345.678/0001-99",
     "produtoPrincipal": "Soja"
   }
        ↓
3. Frontend envia POST /api/submit-form
        ↓
4. Backend valida com Pydantic
   ✅ Sem id_empresa
   ✅ Sem id_entrevistado
   ✅ Sem id_pesquisa
        ↓
5. Backend executa transação:
   
   INSERT INTO empresas (nome_empresa, cnpj)
   VALUES ('ABC LTDA', '12.345.678/0001-99');
   🤖 PostgreSQL gera: id_empresa = 123
   
   INSERT INTO entrevistados (id_empresa, nome)
   VALUES (123, 'João Silva');
   🤖 PostgreSQL gera: id_entrevistado = 456
   
   INSERT INTO pesquisas (id_empresa, id_entrevistado, produto_principal)
   VALUES (123, 456, 'Soja');
   🤖 PostgreSQL gera: id_pesquisa = 789
   
   COMMIT;
        ↓
6. Backend retorna IDs gerados:
   {
     "id_empresa": 123,
     "id_entrevistado": 456,
     "id_pesquisa": 789
   }
        ↓
7. Frontend mostra modal de sucesso
   "✅ Pesquisa #789 salva com sucesso!"
```

---

## 🛡️ **SEGURANÇA: POR QUE NUNCA ACEITAR IDs DO FRONTEND**

### **Riscos se aceitássemos IDs do frontend:**

```javascript
// 🔥 VULNERABILIDADE - Se frontend pudesse enviar IDs:
{
  "id_empresa": 999,  // Atacante poderia associar com outra empresa
  "id_pesquisa": 111  // Atacante poderia sobrescrever pesquisa existente
}
```

### **Problemas:**
1. ⚠️ **Manipulação de dados alheios**: Usuário malicioso poderia associar sua resposta à empresa de outra pessoa
2. ⚠️ **Sobrescrita de dados**: Poderia tentar sobrescrever pesquisa existente
3. ⚠️ **Inconsistência**: Frontend e banco desincronizados

### **Solução Atual (Segura):**
- ✅ Banco gera IDs automaticamente (SERIAL)
- ✅ Backend ignora qualquer ID enviado pelo frontend
- ✅ Transação ACID garante integridade
- ✅ Impossível manipular dados alheios

---

## 📝 **CHECKLIST DE VALIDAÇÃO**

### **✅ Implementação Correta (Atual)**
- [x] Schema Pydantic **NÃO** tem campos `id_empresa`, `id_entrevistado`, `id_pesquisa`
- [x] Frontend **NÃO** envia IDs de PKs no JSON
- [x] Backend usa `db.flush()` para obter IDs após cada INSERT
- [x] PostgreSQL usa SERIAL (auto-increment) em todas as PKs
- [x] Timestamps usam `DEFAULT NOW()` no banco
- [x] `cnpj_digits` calculado pelo backend, não enviado pelo frontend
- [x] `email_lower` calculado pelo backend, não enviado pelo frontend

### **❌ Implementação ERRADA (Evitada)**
- [ ] ~~Frontend envia `id_empresa` no JSON~~
- [ ] ~~Backend aceita IDs do Pydantic schema~~
- [ ] ~~Frontend gera IDs localmente~~
- [ ] ~~IDs são UUIDs gerados no cliente~~

---

## 🎓 **CONCLUSÃO**

### **REGRA FINAL:**

> **PKs = Banco gera (SERIAL)**  
> **Dados = Usuário preenche**  
> **Timestamps = Banco gera (NOW())**  
> **Campos calculados = Backend calcula**  
> **FKs de auxiliares = Usuário seleciona (dropdown)**

### **NO CÓDIGO:**
- Frontend: Apenas coleta dados de negócio
- Backend: Recebe dados, banco gera IDs
- Banco: Autoridade única para PKs e timestamps

---

**Sistema**: PLI 2050 - Arquitetura Segura  
**Princípio**: Zero Trust - Frontend não é confiável  
**Garantia**: PostgreSQL SERIAL = Integridade garantida
