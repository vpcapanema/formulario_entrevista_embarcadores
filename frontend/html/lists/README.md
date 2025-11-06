# 📁 LISTAS AUXILIARES - JSON ESTÁTICOS

**Data de geração**: 06/11/2025  
**Fonte**: PostgreSQL RDS `sigma-pli-postgresql-db`

---

## 📊 **ARQUIVOS GERADOS**

### **✅ Listas Fixas (107 registros total)**

| Arquivo | Registros | Tamanho | Uso |
|---------|-----------|---------|-----|
| `estados.json` | 27 | 2.88 KB | Estados do Brasil |
| `paises.json` | 61 | 8.11 KB | Países (com relevância) |
| `funcoes.json` | 12 | 0.87 KB | Funções/cargos de entrevistados |
| `instituicoes.json` | 1 | 0.17 KB | Instituições parceiras |
| `entrevistadores.json` | 2 | 0.32 KB | Entrevistadores ativos |

### **🏙️ Municípios (5573 registros)**

| Arquivo | Registros | Tamanho | Uso |
|---------|-----------|---------|-----|
| `municipios_completo.json` | 5573 | **2.85 MB** | Todos os municípios (NÃO usar no frontend) |
| `municipios_por_uf/*.json` | Variável | ~50-200 KB | Um arquivo por UF (**USAR NO FRONTEND**) |

**⚠️ IMPORTANTE**: Geometry removida! Apenas dados textuais.

---

## 📋 **ESTRUTURA DOS DADOS**

### **1. Estados** (`estados.json`)
```json
{
  "id_estado": 28,
  "uf": "AC",
  "nome_estado": "Acre",
  "regiao": "Norte"
}
```

### **2. Países** (`paises.json`)
```json
{
  "id_pais": 31,
  "nome_pais": "Brasil",
  "codigo_iso2": "BR",
  "codigo_iso3": "BRA",
  "relevancia": 1  // Maior = mais relevante
}
```

### **3. Funções** (`funcoes.json`)
```json
{
  "id_funcao": 1,
  "nome_funcao": "Diretor Geral"
}
```

### **4. Instituições** (`instituicoes.json`)
```json
{
  "id_instituicao": 1,
  "nome_instituicao": "SEMIL-SP",
  "tipo_instituicao": "governo",
  "cnpj": "12345678000190"
}
```

### **5. Entrevistadores** (`entrevistadores.json`)
```json
{
  "id_entrevistador": 1,
  "nome_completo": "João da Silva",
  "email": "joao@example.com",
  "id_instituicao": 1
}
```

### **6. Municípios** (`municipios_por_uf/{UF}.json`)
```json
{
  "id_municipio": 2995,
  "cd_mun": "5300108",           // Código IBGE (7 dígitos)
  "nm_mun": "Brasília",          // Nome do município
  "cd_uf": "53",                 // Código UF
  "nm_uf": "Distrito Federal",   // Nome UF completo
  "sigla_uf": "DF",              // Sigla UF
  "cd_regia": "5",               // Código região
  "nm_regia": "Centro-oeste",    // Nome região
  "sigla_rg": "CO",              // Sigla região
  "area_km2": 5760.783,          // Área em km²
  "created_at": "2025-08-26T14:25:16.599609",
  "updated_at": "2025-08-26T14:25:16.599609"
}
```

**Campos removidos**: `geom` (geometry) - removido para reduzir tamanho

---

## 🗂️ **MUNICÍPIOS POR UF**

### **Diretório**: `municipios_por_uf/`

**27 arquivos** (um por UF):

| UF | Arquivo | Municípios |
|----|---------|------------|
| AC | AC.json | 22 |
| AL | AL.json | 102 |
| AM | AM.json | 62 |
| AP | AP.json | 16 |
| BA | BA.json | 417 |
| CE | CE.json | 184 |
| **DF** | **DF.json** | **1** |
| ES | ES.json | 78 |
| GO | GO.json | 246 |
| MA | MA.json | 217 |
| MG | MG.json | 853 |
| MS | MS.json | 79 |
| MT | MT.json | 142 |
| PA | PA.json | 144 |
| PB | PB.json | 223 |
| PE | PE.json | 185 |
| PI | PI.json | 224 |
| PR | PR.json | 399 |
| RJ | RJ.json | 92 |
| RN | RN.json | 167 |
| RO | RO.json | 52 |
| RR | RR.json | 15 |
| RS | RS.json | 499 |
| SC | SC.json | 295 |
| SE | SE.json | 75 |
| **SP** | **SP.json** | **645** |
| TO | TO.json | 139 |

---

## 🚀 **USO NO FRONTEND**

### **Carregar listas fixas (rápido)**
```javascript
// Carregar JSON estático
const estados = await fetch('/lists/estados.json').then(r => r.json());
const paises = await fetch('/lists/paises.json').then(r => r.json());
const funcoes = await fetch('/lists/funcoes.json').then(r => r.json());
```

### **Carregar municípios por UF (sob demanda)**
```javascript
// Quando usuário selecionar estado "SP"
const uf = 'SP';
const municipios = await fetch(`/lists/municipios_por_uf/${uf}.json`).then(r => r.json());

// Popular dropdown
municipios.forEach(m => {
  const option = document.createElement('option');
  option.value = m.cd_mun;  // Código IBGE
  option.textContent = m.nm_mun;  // Nome
  dropdown.appendChild(option);
});
```

### **❌ NÃO FAZER (arquivo muito grande)**
```javascript
// ❌ EVITAR - 2.85 MB!
const todos = await fetch('/lists/municipios_completo.json').then(r => r.json());
```

---

## 🔄 **ATUALIZAÇÃO DOS DADOS**

### **Quando atualizar?**
- **Estados**: Nunca (estrutura fixa)
- **Países**: Raramente (só se novo país)
- **Funções**: Quando adicionar novos cargos
- **Instituições**: Quando adicionar parceiros
- **Entrevistadores**: Quando entrar/sair pessoas do projeto
- **Municípios**: Raramente (IBGE atualiza códigos)

### **Como atualizar?**
```powershell
# Executar script Python
cd D:\SISTEMA_FORMULARIOS_ENTREVISTA
python scripts\gerar_listas_json.py
```

Script conecta no RDS e regenera todos os JSONs.

---

## 📦 **TAMANHOS E PERFORMANCE**

### **Listas fixas (total: ~12 KB)**
- Carregam instantaneamente
- Podem ser cacheadas indefinidamente
- Ideal para cache do navegador

### **Municípios por UF (50-200 KB cada)**
- Carregam em ~100ms (primeira vez)
- Cache do navegador: instantâneo
- **97% menor** que carregar TODOS (2.85 MB)

### **Economia de bandwidth**
- Sem JSONs: 27 queries SQL por sessão
- Com JSONs: 0 queries SQL
- Economia: ~100 ms de latência por lista

---

## 🔐 **FONTE DOS DADOS**

### **Schema**: `formulario_embarcadores`
- `estados_brasil`
- `paises`
- `funcoes_entrevistado`
- `instituicoes`
- `entrevistadores`

### **Schema**: `dados_brasil`
- `dim_municipio` (IBGE oficial)

### **Geometry removida**
Coluna `geom` (PostGIS) foi **removida** para reduzir tamanho:
- Com geometry: ~15 MB
- Sem geometry: ~2.85 MB
- **Redução**: 81%

---

## ✅ **VANTAGENS DO APPROACH JSON ESTÁTICO**

1. **Performance**: 
   - Frontend não depende do backend para listas básicas
   - Reduz ~27 queries SQL por usuário
   - Cache do navegador funciona perfeitamente

2. **Escalabilidade**:
   - Backend não sobrecarregado com listas simples
   - CDN pode servir os JSONs (GitHub Pages, Cloudflare)
   - Menos requisições = menor custo AWS RDS

3. **Offline-first**:
   - Frontend funciona mesmo com backend offline
   - Dropdowns sempre disponíveis
   - Melhor UX

4. **Deployment**:
   - JSONs commitados no Git
   - Deploy frontend = deploy dados
   - Sem sincronização backend/frontend

---

**Gerado por**: `scripts/gerar_listas_json.py`  
**Banco**: PostgreSQL RDS AWS  
**Data**: 06/11/2025
