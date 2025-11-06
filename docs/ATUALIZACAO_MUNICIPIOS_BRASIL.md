# 🗺️ ATUALIZAÇÃO: MUNICÍPIOS COMPLETOS DO BRASIL

**Data**: 06/11/2025  
**Objetivo**: Substituir `municipios_sp` (só SP) por tabela completa do IBGE com todos os municípios do Brasil

---

## ❌ **PROBLEMA ATUAL**

### **Endpoint Atual** (`/api/municipios`)
```python
# backend-fastapi/app/routers/lists/routes.py

@router.get("/municipios")
async def get_municipios(db: Session = Depends(get_db)):
    """Retorna todos os municípios de SP ordenados por nome"""
    municipios = db.query(MunicipioSP).order_by(MunicipioSP.nome_municipio).all()
    # ❌ RETORNA APENAS 645 MUNICÍPIOS DE SÃO PAULO
```

### **Model Atual**
```python
# backend-fastapi/app/models/__init__.py

class MunicipioSP(Base):
    __tablename__ = "municipios_sp"
    __table_args__ = {"schema": "formulario_embarcadores"}
    # ❌ TABELA LIMITADA A SP
```

### **Consequência**
- ❌ Usuário não pode selecionar municípios de outros estados
- ❌ Origem/destino fora de SP = impossível
- ❌ Formulário só funciona para transporte dentro de SP

---

## ✅ **SOLUÇÃO**

### **Opção A: Apontar para Tabela IBGE Existente (RECOMENDADO)**

Se você já tem uma tabela com **todos os municípios do Brasil** em outro schema:

#### **Passo 1: Criar novo Model**
```python
# backend-fastapi/app/models/__init__.py

class MunicipioBrasil(Base):
    """Model para tabela completa de municípios do IBGE"""
    __tablename__ = "municipios_brasil"  # ← SUBSTITUIR PELO NOME CORRETO
    __table_args__ = {"schema": "public"}  # ← SUBSTITUIR PELO SCHEMA CORRETO
    
    id_municipio = Column(Integer, primary_key=True)  # ou codigo_ibge STRING?
    codigo_ibge = Column(String(7), unique=True, nullable=False)  # 7 dígitos
    nome_municipio = Column(String(100), nullable=False)
    uf = Column(String(2), nullable=False)  # SP, RJ, MG, etc
    nome_estado = Column(String(50))  # "São Paulo", "Rio de Janeiro"
    # Outras colunas que existirem...
```

#### **Passo 2: Atualizar Endpoint**
```python
# backend-fastapi/app/routers/lists/routes.py

from app.models import MunicipioBrasil  # ← ADICIONAR IMPORT

@router.get("/municipios")
async def get_municipios(db: Session = Depends(get_db)):
    """
    Retorna TODOS os municípios do Brasil ordenados por estado e nome
    
    Query params opcionais:
    - uf: Filtra por estado (ex: ?uf=SP)
    - search: Busca por nome (ex: ?search=Santos)
    """
    municipios = db.query(MunicipioBrasil)\
        .order_by(MunicipioBrasil.uf, MunicipioBrasil.nome_municipio)\
        .all()
    
    return [
        {
            "codigo_ibge": m.codigo_ibge,
            "nome_municipio": m.nome_municipio,
            "uf": m.uf,
            "nome_estado": m.nome_estado  # se existir
        }
        for m in municipios
    ]
```

#### **Passo 3: Atualizar Frontend (opcional - filtro por UF)**
```javascript
// frontend/js/ui.js

// Ao selecionar estado, filtrar municípios
document.getElementById('origem-estado').addEventListener('change', async (e) => {
    const uf = e.target.value;
    const municipios = await API.getMunicipiosByUF(uf);  // Nova função
    UI.populateDropdown('origem-municipio', municipios, 'codigo_ibge', 'nome_municipio');
});
```

---

### **Opção B: Criar View Unificada (se quiser manter compatibilidade)**

Se quiser manter a tabela `municipios_sp` mas adicionar outros estados:

```sql
-- Criar view unificada
CREATE VIEW formulario_embarcadores.v_municipios_brasil AS
SELECT 
    codigo_ibge,
    nome_municipio,
    uf,
    nome_estado
FROM public.municipios_brasil  -- ← Tabela completa do IBGE
ORDER BY uf, nome_municipio;
```

Depois apontar o model para a view.

---

## 📊 **INFORMAÇÕES NECESSÁRIAS**

Para implementar, preciso saber:

### **1. Nome completo da tabela**
```sql
-- Formato: schema.tabela
-- Exemplo: public.municipios_ibge
-- Ou: dados_ibge.municipios
-- Ou: ibge.municipios_brasil
```

### **2. Estrutura da tabela**
```sql
-- Execute no banco:
\d+ schema.nome_da_tabela

-- Ou:
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'schema_aqui'
  AND table_name = 'tabela_aqui'
ORDER BY ordinal_position;
```

### **3. Exemplo de dados**
```sql
-- Primeiros 5 registros:
SELECT * FROM schema.municipios LIMIT 5;
```

---

## 🔧 **BENEFÍCIOS DA ATUALIZAÇÃO**

### **Antes** (municipios_sp - 645 registros)
- ✅ Só municípios de SP
- ❌ Não funciona para MG, RJ, PR, etc
- ❌ Rotas interestaduais = erro

### **Depois** (municipios_brasil - 5570 registros)
- ✅ Todos os 5.570 municípios do Brasil
- ✅ Funciona para qualquer estado
- ✅ Rotas interestaduais = OK
- ✅ Origem Ribeirão Preto/SP → Destino Rio de Janeiro/RJ = OK

---

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

- [ ] Identificar schema e tabela completa (ex: `public.municipios_brasil`)
- [ ] Criar model `MunicipioBrasil` apontando para tabela
- [ ] Atualizar endpoint `/api/municipios` para usar novo model
- [ ] Atualizar import em `lists/routes.py`
- [ ] Testar endpoint: `GET http://localhost:8000/api/municipios`
- [ ] Verificar frontend: dropdowns devem ter 5570 municípios
- [ ] (Opcional) Adicionar filtro por UF no frontend
- [ ] (Opcional) Remover model `MunicipioSP` se não for mais usado

---

## 🎯 **PRÓXIMO PASSO**

**ME INFORME**:

1. **Nome da tabela completa**: `schema.tabela` (ex: `public.municipios_brasil`)
2. **Colunas principais**: 
   - Nome da coluna de código IBGE
   - Nome da coluna do município
   - Nome da coluna da UF
3. **Se há Primary Key**: id_municipio ou codigo_ibge?

Com essas informações, atualizo o código em **2 minutos**! 🚀

---

**Sistema**: PLI 2050 v2.0.0  
**Impacto**: ALTO - Habilita transporte em TODO o Brasil  
**Complexidade**: BAIXA - Apenas trocar referência da tabela
