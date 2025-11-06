# ✅ ATUALIZAÇÃO BACKEND COMPLETA

**Data:** 05/11/2025  
**Arquivo:** backend-api/server.js  
**Objetivo:** Integrar novas colunas do banco com busca CNPJ e payload-manager.js

---

## 📊 RESUMO DAS MUDANÇAS

### 1️⃣ Rota GET `/api/cnpj/:cnpj` ✅

**Objetivo:** Buscar dados da ReceitaWS e preencher campos ausentes da interface

**Mudanças:**
- ✅ Adicionada busca do `id_municipio` (código IBGE) no banco `dados_auxiliares.municipios`
- ✅ Retorno agora inclui TODOS os campos necessários para o payload-manager.js
- ✅ Comentários indicando qual questão cada campo representa (Q6a-Q11)

**Campos Retornados:**

```javascript
{
    // Dados básicos
    cnpj: "...",                    // Q6a - CNPJ
    razaoSocial: "...",             // Q6b - Razão Social
    nomeFantasia: "...",            // Q6b - Nome Fantasia
    
    // Endereço (Q7, Q10a-d, Q11)
    endereco: {
        logradouro: "...",          // Q10a - Logradouro
        numero: "...",              // Q10b - Número
        complemento: "...",         // Q10c - Complemento
        bairro: "...",              // Q10d - Bairro
        municipio: "...",           // Q7 - Município (nome)
        uf: "...",                  // Q7 - Estado
        cep: "..."                  // Q11 - CEP
    },
    
    // Código IBGE (Q7 - para id_municipio)
    id_municipio: 3550308,          // Q7 - Código IBGE 7 dígitos
    
    // Contato (Q8, Q9)
    email: "...",                   // Q9 - Email
    telefone: "...",                // Q8 - Telefone
    
    // Outros
    situacao: "...",
    porte: "...",
    naturezaJuridica: "...",
    atividadePrincipal: {...},
    abertura: "...",
    dataSituacao: "..."
}
```

**Benefício:** Quando o usuário digitar o CNPJ e a API retornar os dados, o frontend pode preencher automaticamente:
- Q6b - Razão Social e Nome Fantasia
- Q7 - Município (nome + código IBGE)
- Q8 - Telefone
- Q9 - Email
- Q10a-d - Endereço completo (logradouro, número, complemento, bairro)
- Q11 - CEP

---

### 2️⃣ Rota POST `/api/empresas` ✅

**Objetivo:** Aceitar e salvar as 10 novas colunas da tabela empresas

**Mudanças:**
- ✅ INSERT agora inclui 16 colunas (6 antigas + 10 novas)
- ✅ Comentários indicando origem dos dados (interface vs API CNPJ)

**Colunas Antigas (interface):**
- `nome_empresa` - Nome da empresa (campo da interface)
- `tipo_empresa` - Tipo (Embarcador, etc)
- `outro_tipo` - Outro tipo
- `municipio` - Município (VARCHAR - nome)
- `estado` - Estado (VARCHAR - nome)
- `cnpj` - CNPJ

**Colunas Novas (API CNPJ):**
- `razao_social` - Q6b - Razão Social
- `nome_fantasia` - Q6b - Nome Fantasia
- `telefone` - Q8 - Telefone
- `email` - Q9 - Email
- `id_municipio` - Q7 - Código IBGE
- `logradouro` - Q10a - Logradouro
- `numero` - Q10b - Número
- `complemento` - Q10c - Complemento
- `bairro` - Q10d - Bairro
- `cep` - Q11 - CEP

---

### 3️⃣ Rota POST `/api/submit-form` ✅

**Objetivo:** Salvar formulário completo com todas as novas colunas

**Mudanças:**

#### 3.1. INSERT Empresa ✅
- ✅ JÁ estava usando as novas colunas (`razao_social`, `nome_fantasia`, etc)
- ✅ Verifica se empresa existe por CNPJ
- ✅ Se existe, atualiza dados
- ✅ Se não existe, insere nova

#### 3.2. INSERT Entrevistado ✅
- ✅ **CORRIGIDO** para usar nomes corretos do banco
- ✅ Antes: `cargo`, `telefone_entrevistado`, `email_entrevistado`
- ✅ Agora: `funcao`, `telefone`, `email`
- ✅ Adicionado `id_empresa` (FK)
- ✅ Adicionado `principal = true`

**Query Antiga:**
```sql
INSERT INTO formulario_embarcadores.entrevistados (
    nome, cargo, telefone_entrevistado, email_entrevistado
) VALUES ($1, $2, $3, $4)
```

**Query Nova:**
```sql
INSERT INTO formulario_embarcadores.entrevistados (
    id_empresa, nome, funcao, telefone, email, principal
) VALUES ($1, $2, $3, $4, $5, $6)
```

#### 3.3. INSERT Pesquisa ✅
- ✅ JÁ estava usando as 35 colunas adicionadas na migration
- ✅ Campos: `consentimento`, `transporta_carga`, `origem_instalacao`, etc
- ✅ Nenhuma alteração necessária

---

## 🔄 FLUXO COMPLETO

### Cenário 1: Usuário preenche CNPJ

1. **Frontend** chama `GET /api/cnpj/33000167000101`
2. **Backend** busca na ReceitaWS
3. **Backend** busca `id_municipio` no banco (código IBGE)
4. **Backend** retorna JSON completo com 16 campos
5. **Frontend** preenche automaticamente:
   - Q6b - Razão Social e Nome Fantasia
   - Q7 - Município + id_municipio
   - Q8 - Telefone
   - Q9 - Email
   - Q10a-d - Endereço completo
   - Q11 - CEP

### Cenário 2: Usuário submete formulário

1. **Frontend** envia payload com:
   - Campos da interface (nome_empresa, tipo_empresa, etc)
   - Campos da API CNPJ (razao_social, nome_fantasia, telefone, email, etc)
2. **Backend** recebe em `POST /api/submit-form`
3. **Backend** INSERT empresa com 16 colunas
4. **Backend** INSERT entrevistado com 6 colunas (nomes corretos)
5. **Backend** INSERT pesquisa com 46 colunas
6. **Backend** INSERT produtos_transportados (array)
7. **Backend** retorna sucesso

---

## ✅ VALIDAÇÃO

### Testes Necessários:

1. **Testar busca CNPJ:**
   ```bash
   curl http://localhost:3000/api/cnpj/33000167000101
   ```
   Verificar se retorna `id_municipio` e todos os campos

2. **Testar INSERT empresa:**
   ```bash
   curl -X POST http://localhost:3000/api/empresas \
     -H "Content-Type: application/json" \
     -d '{
       "nome_empresa": "Petrobras",
       "tipo_empresa": "Embarcador",
       "cnpj": "33000167000101",
       "razao_social": "PETRÓLEO BRASILEIRO S.A.",
       "nome_fantasia": "PETROBRAS",
       "telefone": "2125341000",
       "email": "contato@petrobras.com.br",
       "id_municipio": 3304557,
       "logradouro": "Av. República do Chile",
       "numero": "65",
       "complemento": "Torre Executiva",
       "bairro": "Centro",
       "cep": "20031912"
     }'
   ```

3. **Testar submit-form completo:**
   Usar o formulário HTML para preencher e submeter

4. **Verificar no banco:**
   ```sql
   SELECT * FROM formulario_embarcadores.empresas ORDER BY id_empresa DESC LIMIT 1;
   SELECT * FROM formulario_embarcadores.entrevistados ORDER BY id_entrevistado DESC LIMIT 1;
   SELECT * FROM formulario_embarcadores.pesquisas ORDER BY id_pesquisa DESC LIMIT 1;
   ```

---

## 📋 CHECKLIST

- [x] Rota `/api/cnpj/:cnpj` atualizada
  - [x] Busca id_municipio no banco
  - [x] Retorna 16 campos (Q6a-Q11)
  - [x] Comentários com questões
  
- [x] Rota `POST /api/empresas` atualizada
  - [x] Aceita 16 campos
  - [x] INSERT com novas colunas
  - [x] Comentários com questões
  
- [x] Rota `POST /api/submit-form` atualizada
  - [x] INSERT empresa com 16 colunas
  - [x] INSERT entrevistado com nomes corretos (funcao, telefone, email)
  - [x] INSERT entrevistado com id_empresa e principal
  - [x] INSERT pesquisa com 46 colunas
  
- [ ] Testes executados
  - [ ] Busca CNPJ retorna id_municipio
  - [ ] INSERT empresa salva 16 campos
  - [ ] INSERT entrevistado salva com nomes corretos
  - [ ] Submit-form completo funciona
  - [ ] Dados aparecem no banco

---

## 🎯 PRÓXIMO PASSO

**Testar o sistema completo:**

1. Reiniciar servidor:
   ```bash
   cd backend-api
   node server.js
   ```

2. Abrir formulário:
   ```
   http://localhost:3000
   ```

3. Testar fluxo:
   - Digitar CNPJ válido (ex: 33.000.167/0001-01)
   - Ver campos preenchidos automaticamente
   - Preencher restante do formulário
   - Submeter
   - Verificar sucesso
   - Consultar banco

---

## 📊 RESULTADO ESPERADO

Após as atualizações, o sistema deve:

✅ Buscar CNPJ e preencher 10 campos automaticamente (Q6b-Q11)  
✅ Salvar empresa com 16 colunas (6 interface + 10 API)  
✅ Salvar entrevistado com nomes corretos do banco  
✅ Salvar pesquisa com 46 colunas (incluindo 35 novas)  
✅ Payload-manager.js 100% compatível com banco  
✅ Nenhum campo perdido  
✅ Sistema funcional de ponta a ponta

---

**Status:** ✅ **ATUALIZAÇÃO COMPLETA**  
**Data:** 05/11/2025  
**Executado por:** GitHub Copilot
