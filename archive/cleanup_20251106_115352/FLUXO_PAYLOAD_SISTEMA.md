# 🔄 FLUXO COMPLETO DO SISTEMA DE PAYLOAD

**Data**: 05/11/2025  
**Sistema**: PLI 2050 - Formulário de Entrevistas com Embarcadores

---

## 📋 VISÃO GERAL

O sistema utiliza **payload padronizado** que é preenchido **em tempo real** conforme o usuário interage com o formulário. Quando finalizado, os dados são enviados ao backend que os transforma em queries SQL e salva no PostgreSQL.

---

## 🎯 ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. USUÁRIO PREENCHE FORMULÁRIO                                │
│     ├── Campo: "Razão Social" (alias amigável)                 │
│     ├── Valor digitado: "Transportadora ABC Ltda"              │
│     └── Evento: input/change                                    │
│                                                                 │
│  2. FORM PAYLOAD INTEGRATOR                                     │
│     ├── Captura evento do campo                                │
│     ├── Consulta mapeamento: 'razao-social' → empresa.razao_social│
│     ├── Chama: payloadManager.updateField()                    │
│     └── Debounce: 300ms (aguarda usuário parar de digitar)     │
│                                                                 │
│  3. PAYLOAD MANAGER                                             │
│     ├── Recebe: tabela='empresa', campo='razao_social', valor  │
│     ├── Formata valor: .trim(), validações                     │
│     ├── Atualiza payload interno:                              │
│     │   payload.empresa.razao_social = "Transportadora ABC"    │
│     └── Log: ✅ Payload atualizado                             │
│                                                                 │
│  4. USUÁRIO CLICA "SALVAR RESPOSTA"                            │
│     ├── Evento: click no botão submit                          │
│     ├── Chama: formIntegrator.submitForm()                     │
│     └── Previne envio padrão: e.preventDefault()               │
│                                                                 │
│  5. VALIDAÇÃO E FORMATAÇÃO FINAL                                │
│     ├── payloadManager.validate()                              │
│     ├── Verifica campos obrigatórios:                          │
│     │   ✅ empresa.razao_social (obrigatório)                  │
│     │   ✅ entrevistado.nome (obrigatório)                     │
│     │   ✅ pesquisa.consentimento (obrigatório)                │
│     ├── Formata códigos IBGE:                                  │
│     │   origem_estado: "35" (STRING)                           │
│     │   origem_municipio: "3550308" (STRING)                   │
│     ├── Converte números:                                      │
│     │   distancia_km: parseFloat("850.5") → 850.5              │
│     │   qtd_caminhoes: parseInt("15") → 15                     │
│     └── Gera payload consolidado                               │
│                                                                 │
│  6. ENVIO PARA BACKEND                                          │
│     ├── fetch('/api/submit-form', {                            │
│     │     method: 'POST',                                      │
│     │     headers: { 'Content-Type': 'application/json' },     │
│     │     body: JSON.stringify(payload)                        │
│     │   })                                                     │
│     └── Aguarda resposta...                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  7. API RECEBE PAYLOAD                                          │
│     ├── Endpoint: POST /api/submit-form                        │
│     ├── Middleware: express.json() parseia body                │
│     ├── dados = req.body                                       │
│     └── Log: 📥 Payload recebido                               │
│                                                                 │
│  8. INICIA TRANSAÇÃO NO BANCO                                   │
│     ├── client = await pool.connect()                          │
│     ├── await client.query('BEGIN')                            │
│     └── Log: 🔄 Transação iniciada                             │
│                                                                 │
│  9. INSERT/UPDATE EMPRESA                                       │
│     ├── Verifica se CNPJ já existe:                            │
│     │   SELECT id_empresa FROM empresas WHERE cnpj = $1        │
│     ├── Se existe:                                             │
│     │   UPDATE empresas SET ... WHERE id_empresa = $1          │
│     │   id_empresa = registro_existente.id_empresa             │
│     ├── Se não existe:                                         │
│     │   INSERT INTO empresas (...) VALUES (...)                │
│     │   RETURNING id_empresa                                   │
│     │   id_empresa = novo_registro.id_empresa                  │
│     └── Log: ✅ Empresa salva (id_empresa = X)                 │
│                                                                 │
│  10. INSERT ENTREVISTADO                                        │
│     ├── INSERT INTO entrevistados (...) VALUES (...)           │
│     │   RETURNING id_entrevistado                              │
│     ├── id_entrevistado = resultado.id_entrevistado            │
│     └── Log: ✅ Entrevistado salvo (id_entrevistado = Y)       │
│                                                                 │
│  11. INSERT PESQUISA                                            │
│     ├── INSERT INTO pesquisas (                                │
│     │     id_empresa, id_entrevistado, id_entrevistador,       │
│     │     origem_pais, origem_estado, origem_municipio,        │
│     │     destino_pais, destino_estado, destino_municipio,     │
│     │     distancia_km, volume_anual_toneladas,                │
│     │     ... (46 colunas totais)                              │
│     │   ) VALUES (                                             │
│     │     $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ...         │
│     │   ) RETURNING id_pesquisa                                │
│     ├── id_pesquisa = resultado.id_pesquisa                    │
│     └── Log: ✅ Pesquisa salva (id_pesquisa = Z)               │
│                                                                 │
│  12. INSERT PRODUTOS (opcional)                                 │
│     ├── if (dados.produtos_transportados) {                    │
│     │     for (produto of produtos) {                          │
│     │       INSERT INTO produtos_transportados                 │
│     │         (id_pesquisa, produto) VALUES ($1, $2)           │
│     │     }                                                    │
│     │   }                                                      │
│     └── Log: ✅ Produtos salvos                                │
│                                                                 │
│  13. COMMIT TRANSAÇÃO                                           │
│     ├── await client.query('COMMIT')                           │
│     ├── client.release()                                       │
│     └── Log: ✅ Transação confirmada                           │
│                                                                 │
│  14. RESPONSE PARA FRONTEND                                     │
│     ├── res.status(201).json({                                 │
│     │     success: true,                                       │
│     │     message: 'Pesquisa salva com sucesso!',              │
│     │     data: {                                              │
│     │       id_pesquisa: Z,                                    │
│     │       id_empresa: X,                                     │
│     │       id_entrevistado: Y,                                │
│     │       razao_social: "Transportadora ABC Ltda",           │
│     │       nome_entrevistado: "João da Silva"                 │
│     │     }                                                    │
│     │   })                                                     │
│     └── Log: 📤 Resposta enviada                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  15. DADOS PERSISTIDOS                                          │
│     ├── Tabela: empresas                                       │
│     │   └── id_empresa, cnpj, razao_social, ...               │
│     ├── Tabela: entrevistados                                  │
│     │   └── id_entrevistado, nome, cargo, ...                 │
│     ├── Tabela: pesquisas                                      │
│     │   └── id_pesquisa, id_empresa, id_entrevistado,         │
│     │       origem_estado ('35'), origem_municipio ('3550308')│
│     └── Tabela: produtos_transportados (opcional)              │
│                                                                 │
│  16. VIEW ATUALIZADA AUTOMATICAMENTE                            │
│     ├── View: v_pesquisas_completa                             │
│     ├── JOIN com dados_brasil.vw_dim_municipio_alias           │
│     ├── Traduz códigos IBGE → nomes:                           │
│     │   origem_estado '35' → "São Paulo"                       │
│     │   origem_municipio '3550308' → "São Paulo"               │
│     └── Disponível para consulta imediata                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Resposta)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  17. FRONTEND RECEBE RESPOSTA                                   │
│     ├── result = await response.json()                         │
│     ├── if (result.success) {                                  │
│     │     console.log('✅ Salvo!', result.data)                │
│     │   }                                                      │
│     └── Log: ✅ Resposta recebida                              │
│                                                                 │
│  18. FEEDBACK AO USUÁRIO                                        │
│     ├── alert('✅ Resposta salva com sucesso!\n\n' +           │
│     │        'ID da Pesquisa: ' + result.data.id_pesquisa)     │
│     └── Mensagem exibida na tela                               │
│                                                                 │
│  19. RESET DO FORMULÁRIO                                        │
│     ├── payloadManager.reset()                                 │
│     │   └── Limpa payload interno                              │
│     ├── formIntegrator.resetForm()                             │
│     │   └── form.reset() → Limpa campos HTML                   │
│     └── Pronto para nova entrevista                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 ESTRUTURA DO PAYLOAD

### **Payload Interno (PayloadManager)**

```javascript
{
  empresa: {
    cnpj: "12345678000190",              // VARCHAR(14)
    razao_social: "Transportadora ABC",   // VARCHAR(255) - OBRIGATÓRIO
    nome_fantasia: "ABC Transportes",     // VARCHAR(255)
    telefone: "11999887766",              // VARCHAR(20)
    email: "contato@abc.com.br",          // VARCHAR(255)
    id_municipio: 3550308,                // INTEGER - código IBGE
    logradouro: "Rua das Flores",         // VARCHAR(255)
    numero: "123",                        // VARCHAR(20)
    complemento: "Sala 45",               // VARCHAR(100)
    bairro: "Centro",                     // VARCHAR(100)
    cep: "01234567"                       // VARCHAR(8)
  },
  
  entrevistado: {
    nome: "João da Silva",                // VARCHAR(255) - OBRIGATÓRIO
    cargo: "Gerente de Logística",        // VARCHAR(100)
    telefone_entrevistado: "11988776655", // VARCHAR(20)
    email_entrevistado: "joao@abc.com.br" // VARCHAR(255)
  },
  
  pesquisa: {
    id_entrevistador: 1,                  // INTEGER
    data_entrevista: "2025-11-05",        // DATE
    horario_entrevista: "14:30:00",       // TIME
    id_instituicao: 1,                    // INTEGER
    consentimento: true,                  // BOOLEAN - OBRIGATÓRIO
    transporta_carga: true,               // BOOLEAN
    
    // Códigos IBGE (STRING)
    origem_pais: "Brasil",                // VARCHAR(100)
    origem_estado: "35",                  // VARCHAR(2) - código UF
    origem_municipio: "3550308",          // VARCHAR(7) - código IBGE
    origem_instalacao: "Terminal ABC",    // VARCHAR(255)
    
    destino_pais: "Brasil",               // VARCHAR(100)
    destino_estado: "52",                 // VARCHAR(2) - código UF
    destino_municipio: "5208707",         // VARCHAR(7) - código IBGE
    destino_instalacao: "Centro XYZ",     // VARCHAR(255)
    
    // Números (convertidos)
    distancia_km: 850.5,                  // DECIMAL(10,2)
    volume_anual_toneladas: 12000.00,     // DECIMAL(15,2)
    qtd_caminhoes_proprios: 0,            // INTEGER
    qtd_caminhoes_terceirizados: 15,      // INTEGER
    
    // Textos
    tipo_produto: "Grãos",                // VARCHAR(100)
    classe_produto: "Granel Sólido",      // VARCHAR(100)
    produtos_especificos: "Soja, Milho",  // TEXT
    modal_predominante: "Rodoviário",     // VARCHAR(50)
    // ... (mais campos)
  },
  
  produtos_transportados: [
    "Soja",
    "Milho",
    "Trigo"
  ]
}
```

### **Payload Enviado (formato backend)**

```javascript
{
  // Empresa (alias amigáveis)
  cnpj: "12345678000190",
  razaoSocial: "Transportadora ABC",  // camelCase para backend
  nomeFantasia: "ABC Transportes",
  telefone: "11999887766",
  email: "contato@abc.com.br",
  municipio: 3550308,
  logradouro: "Rua das Flores",
  numero: "123",
  complemento: "Sala 45",
  bairro: "Centro",
  cep: "01234567",
  
  // Entrevistado
  nomeEntrevistado: "João da Silva",
  cargoEntrevistado: "Gerente de Logística",
  telefoneEntrevistado: "11988776655",
  emailEntrevistado: "joao@abc.com.br",
  
  // Pesquisa
  entrevistador: 1,
  dataEntrevista: "2025-11-05",
  horarioEntrevista: "14:30:00",
  instituicao: 1,
  consentimento: true,
  transportaCarga: true,
  
  // Origem/Destino (CÓDIGOS IBGE)
  origemPais: "Brasil",
  origemEstado: "35",           // STRING mantida
  origemMunicipio: "3550308",   // STRING mantida
  origemInstalacao: "Terminal ABC",
  
  destinoPais: "Brasil",
  destinoEstado: "52",          // STRING mantida
  destinoMunicipio: "5208707",  // STRING mantida
  destinoInstalacao: "Centro XYZ",
  
  // Demais campos...
  distanciaKm: 850.5,
  volumeAnual: 12000.00,
  // ...
  
  produtos_transportados: ["Soja", "Milho", "Trigo"]
}
```

---

## 🔧 MAPEAMENTO DE CAMPOS

### **Exemplos de Alias Amigáveis → Valores do Banco**

| Campo HTML                     | Alias (Label)              | Valor Exibido        | Valor Enviado      | Tipo Banco    |
|--------------------------------|----------------------------|----------------------|--------------------|---------------|
| `id="razao-social"`            | "Razão Social"             | "Transportadora ABC" | "Transportadora ABC" | VARCHAR(255)  |
| `id="origem-estado"`           | "Estado de Origem"         | "São Paulo"          | "35"               | VARCHAR(2)    |
| `id="origem-municipio"`        | "Município de Origem"      | "São Paulo"          | "3550308"          | VARCHAR(7)    |
| `id="distancia-km"`            | "Distância (km)"           | "850,5"              | 850.5              | DECIMAL(10,2) |
| `id="qtd-caminhoes-proprios"`  | "Qtd. Caminhões Próprios"  | "15"                 | 15                 | INTEGER       |
| `id="consentimento"`           | "Consentimento"            | "Sim"                | true               | BOOLEAN       |

---

## ✅ VALIDAÇÕES APLICADAS

### **Frontend (Tempo Real)**

1. **CNPJ**: Remove formatação → mantém apenas números
2. **CEP**: Remove formatação → mantém apenas números
3. **Email**: Valida formato (regex) → converte para lowercase
4. **Códigos UF**: Valida 2 dígitos → mantém como STRING
5. **Códigos IBGE**: Valida 7 dígitos → mantém como STRING
6. **Números decimais**: Substitui vírgula por ponto → parseFloat()
7. **Números inteiros**: Converte para integer → parseInt()
8. **Booleanos**: "sim"/true → true, "não"/false → false
9. **Datas**: Valida formato YYYY-MM-DD
10. **Horários**: Valida HH:MM ou HH:MM:SS

### **Backend (Antes de INSERT)**

1. **Transação**: BEGIN antes de qualquer INSERT
2. **UPSERT Empresa**: Verifica CNPJ antes de inserir
3. **Campos NULL**: Aceita valores opcionais como NULL (não string vazia)
4. **Foreign Keys**: Valida IDs de entrevistador e instituição
5. **Rollback**: Se qualquer erro, ROLLBACK completo
6. **Commit**: Só confirma se tudo OK

---

## 🐛 FUNÇÕES DE DEBUG

No console do navegador, você pode usar:

```javascript
// Exibir payload atual
debugPayload();

// Obter payload formatado para envio
const payload = getPayload();
console.log(payload);

// Resetar tudo (formulário + payload)
resetPayload();

// Acessar diretamente o manager
window.payloadManager.debug();
window.payloadManager.validate();
```

---

## 📊 EXEMPLO COMPLETO

### **1. Usuário preenche:**

- Razão Social: "Transportadora ABC Ltda"
- Estado Origem: **Seleciona** "São Paulo" (dropdown)
- Município Origem: **Seleciona** "São Paulo" (dropdown filtrado)

### **2. Frontend armazena:**

```javascript
payload.empresa.razao_social = "Transportadora ABC Ltda"
payload.pesquisa.origem_estado = "35"           // CÓDIGO UF
payload.pesquisa.origem_municipio = "3550308"   // CÓDIGO IBGE
```

### **3. Backend recebe:**

```javascript
{
  razaoSocial: "Transportadora ABC Ltda",
  origemEstado: "35",        // STRING
  origemMunicipio: "3550308" // STRING
}
```

### **4. SQL executado:**

```sql
INSERT INTO pesquisas (
  id_empresa,
  id_entrevistado,
  origem_estado,
  origem_municipio
) VALUES (
  1,
  1,
  '35',       -- VARCHAR(2)
  '3550308'   -- VARCHAR(7)
);
```

### **5. View retorna:**

```sql
SELECT 
  p.origem_estado,           -- '35'
  p.origem_municipio,        -- '3550308'
  v."Nome da Unidade Federativa",  -- 'São Paulo'
  v."Nome do Município"            -- 'São Paulo'
FROM pesquisas p
LEFT JOIN dados_brasil.vw_dim_municipio_alias v
  ON p.origem_municipio = v."Código do Município"::text
```

---

## 🚀 VANTAGENS DO SISTEMA

✅ **Dados sempre formatados**: Frontend garante formato correto  
✅ **Validação em tempo real**: Usuário vê erros imediatamente  
✅ **Alias amigáveis**: Interface mostra nomes, banco salva códigos  
✅ **Códigos IBGE oficiais**: Únicos, imutáveis, padrão nacional  
✅ **Transação atômica**: Tudo salvo ou nada (BEGIN/COMMIT)  
✅ **View automática**: JOIN com nomes sem esforço  
✅ **Debug fácil**: Funções globais para inspecionar payload  
✅ **Separação clara**: Payload separado por tabelas do banco  

---

📅 **Última atualização**: 05/11/2025  
🔗 **Arquivos criados**:
- `payload-manager.js`
- `form-payload-integrator.js`
- `payload-init.js`
- `MODELO_INSERT_TABELAS.md`
- `FLUXO_PAYLOAD_SISTEMA.md`
