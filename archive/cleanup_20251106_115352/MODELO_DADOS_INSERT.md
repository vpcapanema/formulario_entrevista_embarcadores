# 📋 MODELO DE DADOS PARA INSERT NO BANCO

## 🎯 ENDPOINT: POST /api/submit-form

## 📊 CAMPOS DE ESTADO E MUNICÍPIO

### ✅ ORIGEM
```json
{
  "origemPais": 1,              // INTEGER - ID do país (1 = Brasil)
  "origemEstado": "35",         // VARCHAR - Código UF IBGE (35 = São Paulo)
  "origemMunicipio": "3550308"  // VARCHAR - Código Município IBGE (3550308 = São Paulo/SP)
}
```

### ✅ DESTINO
```json
{
  "destinoPais": 1,              // INTEGER - ID do país (1 = Brasil)
  "destinoEstado": "52",         // VARCHAR - Código UF IBGE (52 = Goiás)
  "destinoMunicipio": "5208707"  // VARCHAR - Código Município IBGE (5208707 = Goiânia/GO)
}
```

---

## 💾 ESTRUTURA NO BANCO

### Tabela: `formulario_embarcadores.pesquisas`

| Coluna             | Tipo    | Valor Salvo              | Exemplo    |
|--------------------|---------|--------------------------|------------|
| `origem_pais`      | INTEGER | ID do país               | 1          |
| `origem_estado`    | VARCHAR | Código UF (IBGE)         | 35         |
| `origem_municipio` | VARCHAR | Código Município (IBGE)  | 3550308    |
| `destino_pais`     | INTEGER | ID do país               | 1          |
| `destino_estado`   | VARCHAR | Código UF (IBGE)         | 52         |
| `destino_municipio`| VARCHAR | Código Município (IBGE)  | 5208707    |

---

## 🔍 CÓDIGOS IBGE - REFERÊNCIA

### 📍 CÓDIGO DA UF (2 dígitos)
- `11` = Rondônia
- `12` = Acre
- `13` = Amazonas
- `33` = Rio de Janeiro
- `35` = São Paulo
- `43` = Rio Grande do Sul
- `52` = Goiás

### 📍 CÓDIGO DO MUNICÍPIO (7 dígitos)
Formato: `[UF][MUNIC]`
- `3550308` = São Paulo/SP (35 = SP, 50308 = município)
- `3304557` = Rio de Janeiro/RJ (33 = RJ, 04557 = município)
- `5208707` = Goiânia/GO (52 = GO, 08707 = município)

---

## 🧪 EXEMPLO COMPLETO DE PAYLOAD

```json
{
  // RESPONSÁVEL
  "tipoResponsavel": "entrevistador",
  "entrevistador": 1,
  "instituicao": 1,
  
  // EMPRESA
  "cnpj": "12.345.678/0001-90",
  "razaoSocial": "Empresa Transportes LTDA",
  "nomeFantasia": "TransLog",
  "telefone": "(11) 9999-9999",
  "email": "contato@translog.com",
  "municipio": "3550308",  // São Paulo/SP (código município da empresa)
  
  // ENTREVISTADO
  "nomeEntrevistado": "João Silva",
  "cargoEntrevistado": "Gerente de Logística",
  "telefoneEntrevistado": "(11) 8888-8888",
  "emailEntrevistado": "joao@translog.com",
  
  // ORIGEM E DESTINO
  "origemPais": 1,              // Brasil
  "origemEstado": "35",         // São Paulo (código UF)
  "origemMunicipio": "3550308", // São Paulo/SP (código município)
  "origemInstalacao": "CD Principal",
  
  "destinoPais": 1,              // Brasil
  "destinoEstado": "52",         // Goiás (código UF)
  "destinoMunicipio": "5208707", // Goiânia/GO (código município)
  "destinoInstalacao": "Filial Norte",
  
  // LOGÍSTICA
  "transportaCarga": true,
  "distanciaKm": 926.5,
  "volumeAnual": 15000,
  "tipoProduto": "Grãos",
  "modalPredominante": "Rodoviário"
}
```

---

## 📝 IMPORTANTES OBSERVAÇÕES

### ✅ Tipos de Dados
- **Estado**: Salvar como `STRING` (código UF)
  - Exemplos: `"35"`, `"52"`, `"33"`
  
- **Município**: Salvar como `STRING` (código IBGE completo)
  - Exemplos: `"3550308"`, `"5208707"`, `"3304557"`
  
- **País**: Salvar como `INTEGER` (ID da tabela paises)
  - Exemplos: `1`, `2`, `3`

### 🎯 Vantagens dessa Abordagem
- ✅ Códigos únicos e oficiais (IBGE)
- ✅ Fácil JOIN com outras tabelas
- ✅ Não quebra se nome do município mudar
- ✅ Padronizado nacionalmente
- ✅ Compatível com análises geoespaciais

---

## 🔄 CONSULTA PARA EXIBIÇÃO (com nomes)

Para recuperar os **nomes** ao invés dos códigos:

```sql
SELECT 
    p.*,
    vo."Nome do Município" as origem_municipio_nome,
    vo."Nome da Unidade Federativa" as origem_estado_nome,
    vd."Nome do Município" as destino_municipio_nome,
    vd."Nome da Unidade Federativa" as destino_estado_nome
FROM formulario_embarcadores.pesquisas p
LEFT JOIN dados_brasil.vw_dim_municipio_alias vo 
    ON p.origem_municipio = vo."Código do Município"::text
LEFT JOIN dados_brasil.vw_dim_municipio_alias vd 
    ON p.destino_municipio = vd."Código do Município"::text
```

---

## 🌐 FONTE DOS DADOS

- **View**: `dados_brasil.vw_dim_municipio_alias`
- **Campos retornados**:
  - `Código da Unidade Federativa` (código UF)
  - `Código do Município` (código IBGE)
  - `Nome do Município`
  - `Nome da Unidade Federativa`

---

## 📡 API ENDPOINTS RELACIONADOS

### GET Estados
```
GET /api/estados
```
**Retorna:**
```json
[
  {
    "codigo_uf": "35",
    "nome_uf": "São Paulo"
  }
]
```

### GET Municípios
```
GET /api/municipios
```
**Retorna:**
```json
[
  {
    "codigo_uf": "35",
    "codigo_municipio": "3550308",
    "nome_municipio": "São Paulo",
    "nome_uf": "São Paulo"
  }
]
```

---

## ✅ VALIDAÇÃO NO FRONTEND

Antes de enviar, o frontend deve garantir:

1. **Estado selecionado**: `codigo_uf` (ex: `"35"`)
2. **Município selecionado**: `codigo_municipio` (ex: `"3550308"`)
3. **Ambos como STRING**, não como NUMBER

```javascript
// ✅ CORRETO
const payload = {
  origemEstado: "35",         // String
  origemMunicipio: "3550308"  // String
};

// ❌ ERRADO
const payload = {
  origemEstado: 35,            // Number
  origemMunicipio: 3550308     // Number
};
```
