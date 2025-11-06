# 🔄 FLUXO DE SALVAMENTO NO BANCO DE DADOS - PLI 2050

**Arquivo**: `backend-fastapi/app/routers/submit/routes.py`  
**Endpoint**: `POST /api/submit-form`  
**Transação**: **ACID** (Atomicidade, Consistência, Isolamento, Durabilidade)

---

## 📊 VISÃO GERAL DO FLUXO

```
Frontend envia JSON
        ↓
FastAPI valida (Pydantic)
        ↓
Inicia transação PostgreSQL: BEGIN
        ↓
┌───────────────────────────────────────────┐
│  ETAPA 1: EMPRESA                         │
│  (INSERT ou UPDATE)                       │
├───────────────────────────────────────────┤
│  - Se CNPJ existe → UPDATE                │
│  - Se CNPJ novo → INSERT                  │
│  - db.flush() → gera id_empresa           │
└───────────────────────────────────────────┘
        ↓ (FK: id_empresa)
┌───────────────────────────────────────────┐
│  ETAPA 2: ENTREVISTADO                    │
│  (sempre INSERT)                          │
├───────────────────────────────────────────┤
│  - Usa id_empresa da etapa 1              │
│  - db.flush() → gera id_entrevistado      │
└───────────────────────────────────────────┘
        ↓ (FK: id_empresa + id_entrevistado)
┌───────────────────────────────────────────┐
│  ETAPA 3: PESQUISA                        │
│  (sempre INSERT)                          │
├───────────────────────────────────────────┤
│  - 47 campos obrigatórios                 │
│  - db.flush() → gera id_pesquisa          │
└───────────────────────────────────────────┘
        ↓ (FK: id_pesquisa)
┌───────────────────────────────────────────┐
│  ETAPA 4: PRODUTOS TRANSPORTADOS          │
│  (múltiplos INSERTs - loop)               │
├───────────────────────────────────────────┤
│  - Para cada produto no array:            │
│    • INSERT com id_pesquisa               │
│    • ordem = índice no array              │
└───────────────────────────────────────────┘
        ↓
db.commit() → CONFIRMA TUDO
        ↓
Retorna sucesso + IDs para frontend
```

---

## 🔐 TRANSAÇÃO ACID GARANTIDA

### **Atomicidade**
- Se **qualquer etapa falhar** → `db.rollback()`
- Todas as 4 etapas executam ou nenhuma executa
- Não fica "metade salvo" no banco

### **Consistência**
- Validação Pydantic **antes** de salvar
- Foreign Keys garantem integridade referencial
- Constraints SQL impedem dados inválidos

### **Isolamento**
- PostgreSQL gerencia locks automaticamente
- Outras requisições não interferem

### **Durabilidade**
- Após `COMMIT`, dados persistidos permanentemente
- Recuperável após crash do servidor

---

## 📋 ETAPA 1: EMPRESA (INSERT ou UPDATE)

### **Lógica Inteligente**
```python
# 1. Limpa CNPJ (remove formatação)
cnpj_digits = "12345678000199"  # De "12.345.678/0001-99"

# 2. Busca empresa existente
empresa_existente = db.query(Empresa).filter(
    Empresa.cnpj_digits == cnpj_digits
).first()

# 3. Decide: UPDATE ou INSERT
if empresa_existente:
    # ✅ ATUALIZA empresa existente
    empresa_existente.nome_empresa = data.nomeEmpresa
    empresa_existente.municipio = data.municipio
    # ... atualiza 12 campos
    empresa = empresa_existente
else:
    # ✅ CRIA nova empresa
    empresa = Empresa(
        nome_empresa=data.nomeEmpresa,
        cnpj=data.cnpj,
        cnpj_digits=cnpj_digits,
        # ... 12 campos
    )
    db.add(empresa)

db.flush()  # ⚠️ CRÍTICO: Gera id_empresa AGORA (sem commit ainda)
```

### **Campos Salvos** (12 campos)
| Campo | Tipo | Exemplo | Obrigatório |
|-------|------|---------|-------------|
| `nome_empresa` | VARCHAR(500) | "Empresa ABC LTDA" | ✅ |
| `tipo_empresa` | VARCHAR(100) | "embarcador" | ✅ |
| `outro_tipo` | VARCHAR(200) | null | ❌ |
| `municipio` | VARCHAR(200) | "São Paulo" | ✅ |
| `cnpj` | VARCHAR(18) | "12.345.678/0001-99" | ❌ |
| `cnpj_digits` | VARCHAR(14) | "12345678000199" | ❌ |
| `razao_social` | VARCHAR(500) | "Empresa ABC LTDA" | ❌ |
| `nome_fantasia` | VARCHAR(500) | "ABC Logística" | ❌ |
| `logradouro` | VARCHAR(500) | "Rua Teste, 123" | ❌ |
| `numero` | VARCHAR(20) | "123" | ❌ |
| `complemento` | VARCHAR(200) | "Sala 45" | ❌ |
| `bairro` | VARCHAR(200) | "Centro" | ❌ |
| `cep` | VARCHAR(10) | "01234-567" | ❌ |

### **Resultado**
```python
empresa.id_empresa  # 🔑 PK gerada (ex: 123)
```

---

## 👤 ETAPA 2: ENTREVISTADO (sempre INSERT)

### **Lógica**
```python
entrevistado = Entrevistado(
    id_empresa=empresa.id_empresa,  # 🔗 FK da etapa 1
    nome=data.nome,
    funcao=data.funcao,
    telefone=data.telefone,
    email=data.email,
    email_lower=data.email.lower(),  # Para validação case-insensitive
    principal=True  # Primeiro entrevistado é sempre principal
)
db.add(entrevistado)
db.flush()  # ⚠️ CRÍTICO: Gera id_entrevistado
```

### **Campos Salvos** (6 campos)
| Campo | Tipo | Exemplo | Constraint |
|-------|------|---------|------------|
| `id_empresa` | INTEGER | 123 | FK → empresas.id_empresa |
| `nome` | VARCHAR(200) | "João Silva" | NOT NULL |
| `funcao` | VARCHAR(100) | "Gerente de Logística" | NOT NULL |
| `telefone` | VARCHAR(20) | "11999999999" | NOT NULL |
| `email` | VARCHAR(200) | "joao@empresa.com" | UNIQUE per empresa |
| `email_lower` | VARCHAR(200) | "joao@empresa.com" | Validação |
| `principal` | BOOLEAN | true | DEFAULT true |

### **Resultado**
```python
entrevistado.id_entrevistado  # 🔑 PK gerada (ex: 456)
```

---

## 📋 ETAPA 3: PESQUISA (sempre INSERT - 47 campos!)

### **Lógica**
```python
pesquisa = Pesquisa(
    # ===== FKs (3) =====
    id_empresa=empresa.id_empresa,              # FK etapa 1
    id_entrevistado=entrevistado.id_entrevistado,  # FK etapa 2
    id_responsavel=data.idResponsavel,          # FK tabela entrevistadores
    
    # ===== Produto (3) =====
    produto_principal=data.produtoPrincipal,
    agrupamento_produto=data.agrupamentoProduto,
    outro_produto=data.outroProduto,
    
    # ===== Transporte (1) =====
    tipo_transporte=data.tipoTransporte,
    
    # ===== Origem (3) =====
    origem_pais=data.origemPais,
    origem_estado=data.origemEstado,
    origem_municipio=data.origemMunicipio,
    
    # ===== Destino (3) =====
    destino_pais=data.destinoPais,
    destino_estado=data.destinoEstado,
    destino_municipio=data.destinoMunicipio,
    
    # ===== Distância e Paradas (3) =====
    distancia=data.distancia,
    tem_paradas=data.temParadas,
    num_paradas=data.numParadas,
    
    # ===== Modais (2) =====
    modos=data.modos,
    config_veiculo=data.configVeiculo,
    
    # ===== Capacidade e Peso (3) =====
    capacidade_utilizada=data.capacidadeUtilizada,
    peso_carga=data.pesoCarga,
    unidade_peso=data.unidadePeso,
    
    # ===== Custos (2) =====
    custo_transporte=data.custoTransporte,
    valor_carga=data.valorCarga,
    
    # ===== Embalagem (2) =====
    tipo_embalagem=data.tipoEmbalagem,
    carga_perigosa=data.cargaPerigosa,
    
    # ===== Tempo (3) =====
    tempo_dias=data.tempoDias,
    tempo_horas=data.tempoHoras,
    tempo_minutos=data.tempoMinutos,
    
    # ===== Frequência (3) =====
    frequencia=data.frequencia,
    frequencia_diaria=data.frequenciaDiaria,
    frequencia_outra=data.frequenciaOutra,
    
    # ===== Importâncias (10 - 5 pares) =====
    importancia_custo=data.importanciaCusto,
    variacao_custo=data.variacaoCusto,
    importancia_tempo=data.importanciaTempo,
    variacao_tempo=data.variacaoTempo,
    importancia_confiabilidade=data.importanciaConfiabilidade,
    variacao_confiabilidade=data.variacaoConfiabilidade,
    importancia_seguranca=data.importanciaSeguranca,
    variacao_seguranca=data.variacaoSeguranca,
    importancia_capacidade=data.importanciaCapacidade,
    variacao_capacidade=data.variacaoCapacidade,
    
    # ===== Estratégia (3) =====
    tipo_cadeia=data.tipoCadeia,
    modais_alternativos=data.modaisAlternativos,
    fator_adicional=data.fatorAdicional,
    
    # ===== Dificuldades (2) =====
    dificuldades=data.dificuldades,
    detalhe_dificuldade=data.detalheDificuldade,
    
    # ===== Outros (4) =====
    observacoes=data.observacoes,
    consentimento=data.consentimento,
    transporta_carga=data.transportaCarga,
    status="finalizada"
)
db.add(pesquisa)
db.flush()  # ⚠️ CRÍTICO: Gera id_pesquisa
```

### **Total de Campos**: **47 campos**

### **Resultado**
```python
pesquisa.id_pesquisa  # 🔑 PK gerada (ex: 789)
```

---

## 📦 ETAPA 4: PRODUTOS TRANSPORTADOS (múltiplos INSERTs)

### **Lógica (Loop)**
```python
produtos_count = 0
for idx, produto_data in enumerate(data.produtos, start=1):
    produto = ProdutoTransportado(
        id_pesquisa=pesquisa.id_pesquisa,  # 🔗 FK da etapa 3
        id_empresa=empresa.id_empresa,     # 🔗 FK da etapa 1
        carga=produto_data.carga,
        movimentacao=produto_data.movimentacao,
        origem=produto_data.origem,
        destino=produto_data.destino,
        distancia=produto_data.distancia,
        modalidade=produto_data.modalidade,
        acondicionamento=produto_data.acondicionamento,
        ordem=idx  # 1, 2, 3, ... (preserva ordem da tabela)
    )
    db.add(produto)
    produtos_count += 1

db.flush()  # Gera IDs de todos os produtos
```

### **Campos Salvos** (9 campos por produto)
| Campo | Tipo | Exemplo | Descrição |
|-------|------|---------|-----------|
| `id_pesquisa` | INTEGER | 789 | FK → pesquisas.id_pesquisa |
| `id_empresa` | INTEGER | 123 | FK → empresas.id_empresa |
| `carga` | VARCHAR(200) | "Soja em grãos" | Nome do produto |
| `movimentacao` | NUMERIC(15,2) | 50000.00 | Toneladas/ano |
| `origem` | VARCHAR(200) | "Ribeirão Preto/SP" | Origem |
| `destino` | VARCHAR(200) | "Santos/SP" | Destino |
| `distancia` | NUMERIC(10,2) | 450.50 | Km |
| `modalidade` | VARCHAR(100) | "Rodoviário" | Modal |
| `acondicionamento` | VARCHAR(200) | "Granel" | Embalagem |
| `ordem` | INTEGER | 1 | Posição na tabela |

### **Exemplo de Array JSON**
```json
{
  "produtos": [
    {
      "carga": "Soja em grãos",
      "movimentacao": 50000,
      "origem": "Ribeirão Preto/SP",
      "destino": "Santos/SP",
      "distancia": 450,
      "modalidade": "Rodoviário",
      "acondicionamento": "Granel"
    },
    {
      "carga": "Açúcar",
      "movimentacao": 30000,
      "origem": "Piracicaba/SP",
      "destino": "Santos/SP",
      "distancia": 180,
      "modalidade": "Rodoviário",
      "acondicionamento": "Ensacado"
    }
  ]
}
```

### **Resultado**
```python
# 2 INSERTs executados
produto1.id_produto  # 🔑 PK gerada (ex: 1001)
produto2.id_produto  # 🔑 PK gerada (ex: 1002)
produtos_count = 2
```

---

## ✅ COMMIT FINAL

```python
db.commit()  # ✅ CONFIRMA TUDO DE UMA VEZ
logger.info("✅ Transação completa com sucesso!")
```

### **O que acontece no banco:**
```sql
BEGIN;
  -- ETAPA 1
  INSERT INTO empresas (...) VALUES (...);  -- id_empresa = 123
  
  -- ETAPA 2
  INSERT INTO entrevistados (...) VALUES (...);  -- id_entrevistado = 456
  
  -- ETAPA 3
  INSERT INTO pesquisas (...) VALUES (...);  -- id_pesquisa = 789
  
  -- ETAPA 4
  INSERT INTO produtos_transportados (...) VALUES (...);  -- id_produto = 1001
  INSERT INTO produtos_transportados (...) VALUES (...);  -- id_produto = 1002
COMMIT;
```

---

## 📤 RESPOSTA ENVIADA AO FRONTEND

```json
{
  "success": true,
  "message": "Pesquisa salva com sucesso!",
  "data": {
    "empresa": "Empresa ABC LTDA",
    "entrevistado": "João Silva",
    "produto_principal": "Soja em grãos",
    "origem": "Ribeirão Preto/SP",
    "destino": "Santos/SP"
  },
  "id_pesquisa": 789,
  "id_empresa": 123,
  "id_entrevistado": 456,
  "produtos_inseridos": 2
}
```

---

## ⚠️ TRATAMENTO DE ERROS

### **1. Erro de Integridade (409 Conflict)**
```python
except IntegrityError as e:
    db.rollback()  # ❌ DESFAZ TUDO
    
    if "cnpj" in str(e).lower():
        raise HTTPException(409, "CNPJ já cadastrado")
    elif "email" in str(e).lower():
        raise HTTPException(409, "Email já cadastrado para esta empresa")
```

**Frontend recebe:**
```json
{
  "detail": "CNPJ já cadastrado no sistema"
}
```

### **2. Erro SQL (500 Internal Server Error)**
```python
except SQLAlchemyError as e:
    db.rollback()  # ❌ DESFAZ TUDO
    raise HTTPException(500, f"Erro ao salvar: {str(e)}")
```

### **3. Erro Inesperado (500)**
```python
except Exception as e:
    db.rollback()  # ❌ DESFAZ TUDO
    raise HTTPException(500, f"Erro interno: {str(e)}")
```

---

## 📊 RESUMO FINAL

| Etapa | Tabela | Operação | Campos | Resultado |
|-------|--------|----------|--------|-----------|
| 1 | `empresas` | INSERT ou UPDATE | 12 | `id_empresa` |
| 2 | `entrevistados` | INSERT | 6 | `id_entrevistado` |
| 3 | `pesquisas` | INSERT | 47 | `id_pesquisa` |
| 4 | `produtos_transportados` | INSERT (loop) | 9 × N | N `id_produto`s |

### **Total**:
- **4 tabelas** afetadas
- **12 + 6 + 47 + (9×N) campos** salvos
- **1 transação ACID**
- **Rollback automático** em caso de erro

---

## 🔍 QUERY PARA VERIFICAR NO BANCO

```sql
-- Buscar última pesquisa salva
SELECT 
    p.id_pesquisa,
    e.nome_empresa,
    ent.nome as entrevistado,
    p.produto_principal,
    p.origem_municipio,
    p.destino_municipio,
    COUNT(pt.id_produto) as qtd_produtos
FROM formulario_embarcadores.pesquisas p
JOIN formulario_embarcadores.empresas e ON e.id_empresa = p.id_empresa
JOIN formulario_embarcadores.entrevistados ent ON ent.id_entrevistado = p.id_entrevistado
LEFT JOIN formulario_embarcadores.produtos_transportados pt ON pt.id_pesquisa = p.id_pesquisa
GROUP BY p.id_pesquisa, e.nome_empresa, ent.nome, p.produto_principal, p.origem_municipio, p.destino_municipio
ORDER BY p.id_pesquisa DESC
LIMIT 1;
```

---

**Desenvolvido por**: Sistema PLI 2050 - SEMIL-SP / BID  
**Arquivo fonte**: `backend-fastapi/app/routers/submit/routes.py`  
**Versão**: 2.0.0
