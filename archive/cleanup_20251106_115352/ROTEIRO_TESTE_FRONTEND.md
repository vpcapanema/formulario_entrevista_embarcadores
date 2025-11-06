# 🧪 ROTEIRO DE TESTE VIA FRONTEND - VALIDAÇÃO COMPLETA

## 📋 OBJETIVO
Validar que todos os dados são salvos corretamente no banco após o preenchimento do formulário web.

---

## 📝 PASSO A PASSO

### 🔹 PASSO 1: LIMPAR AMBIENTE
1. Acesse: http://localhost:3000/limpar-cache.html
2. Clique: '🧹 Limpar Tudo'
3. Aguarde confirmação
4. Clique: '🏠 Ir para Formulário'

---

### 🔹 PASSO 2: ABRIR CONSOLE DO NAVEGADOR
1. Pressione **F12**
2. Vá na aba **'Console'**
3. Deixe aberto durante todo o teste

---

### 🔹 PASSO 3: PREENCHER DADOS DA EMPRESA

#### 📍 Card 1: Informações do Entrevistado

- **Q1** - Nome: `João da Silva Santos`
- **Q2** - Cargo: `Gerente de Logística`
- **Q3** - Telefone: `(11) 98765-4321`
- **Q4** - Email: `joao.silva@teste.com.br`

#### 📍 Card 2: Informações da Empresa

- **Q5** - Tipo de Organização: `Embarcador`
- **Q6a** - CNPJ: `33.000.167/0001-01`
- **Q6b** - Clique em **'Buscar dados do CNPJ'**

**⚠️ VALIDAR:**
- ✅ Console deve mostrar: `🔍 Buscando dados do CNPJ...`
- ✅ Campos devem preencher automaticamente:
  - Razão Social: `PETRÓLEO BRASILEIRO S.A.`
  - Nome Fantasia: `PETROBRAS`
  - Telefone: `(21) 2534-1000`
  - Email: `contato@petrobras.com.br`
  - Logradouro: `Av República do Chile`
  - Número: `65`
  - Bairro: `Centro`
  - CEP: `20031-912`
- ✅ Console deve mostrar: `✅ Dados preenchidos com sucesso!`

- **Q7** - Município/Estado: `Rio de Janeiro / RJ`
- **Q8** - Telefone: *(já preenchido pela API)*
- **Q9** - Email: *(já preenchido pela API)*

#### 📍 Card 3: Endereço Completo

- **Q10a** - Logradouro: *(já preenchido)*
- **Q10b** - Número: *(já preenchido)*
- **Q10c** - Complemento: `Torre Executiva`
- **Q10d** - Bairro: *(já preenchido)*
- **Q11** - CEP: *(já preenchido)*

---

### 🔹 PASSO 4: PREENCHER DADOS DO PRODUTO

#### 📍 Card 4: Produto Principal

- **Q9** - Produto: `Diesel`
- **Q10** - Outro produto: *(deixar vazio)*

---

### 🔹 PASSO 5: PREENCHER CARACTERÍSTICAS DO TRANSPORTE

#### 📍 Card 5: Características do Transporte

- **Q11** - Tipo de Transporte: `Local (Brasil-Brasil)`

**Q12 - Origem:**
- País: `Brasil`
- Estado: `São Paulo`
- Município: `Santos`

**⚠️ VALIDAR:**
- ✅ Console deve mostrar: `🔍 Estado selecionado: 25`
- ✅ Console deve mostrar: `🏙️ Municípios filtrados: XXX`
- ✅ Dropdown de municípios deve aparecer com cidades de SP

**Q13 - Destino:**
- País: `Brasil`
- Estado: `Rio de Janeiro`
- Município: `Duque de Caxias`

**Demais campos:**
- **Q14** - Distância: `430.5`
- **Q15** - Possui paradas intermediárias?: `Sim`
- **Q16** - Número de paradas: `2`
- **Q17** - Modalidades de Transporte: ✅ `Rodoviário`
- **Q18** - Configuração do Veículo: `Carreta`
- **Q19** - Capacidade Utilizada: `85`
- **Q20** - Peso da Carga: `25000`
- **Q21** - Unidade de Peso: `toneladas`
- **Q22** - Custo do Transporte: `85000`
- **Q23** - Valor da Carga: `500000`
- **Q24** - Tipo de Embalagem: `Tanque`
- **Q25** - Carga Perigosa?: `Não`

**Q26 - Tempo de Deslocamento:**
- Dias: `0`
- Horas: `12`
- Minutos: `30`

- **Q27** - Frequência: `Diária`

---

### 🔹 PASSO 6: PREENCHER FATORES DE DECISÃO

#### 📍 Card 6: Fatores de Decisão Modal

**Q29-Q38** - Para cada fator:
- Importância: `Muito importante`
- Variação Aceitável: `15.5`

---

### 🔹 PASSO 7: ANÁLISE ESTRATÉGICA

#### 📍 Card 7: Análise Estratégica

- **Q39** - Tipo de Cadeia: `Pull`
- **Q40** - Modais Alternativos: `Ferroviário`
- **Q41** - Fatores Adicionais: `Teste de sistema`

---

### 🔹 PASSO 8: DIFICULDADES LOGÍSTICAS

#### 📍 Card 8: Dificuldades Logísticas

**Q42** - Principais Dificuldades:
- ✅ `Infraestrutura precária`
- ✅ `Custos elevados`

- **Q43** - Detalhes: `Sistema de testes funcionando`

---

### 🔹 PASSO 9: SUBMETER FORMULÁRIO

1. Clique no botão **'Enviar Formulário'**

**⚠️ VALIDAR NO CONSOLE:**
- ✅ `📦 Payload montado com sucesso`
- ✅ `📊 Estatísticas do payload: XXX campos`
- ✅ `🚀 Enviando dados para o servidor...`
- ✅ `POST http://localhost:3000/api/submit-form 200 OK`
- ✅ `✅ Formulário enviado com sucesso!`

**⚠️ VALIDAR NA TELA:**
- ✅ Mensagem de sucesso deve aparecer

---

### 🔹 PASSO 10: VERIFICAR NO BANCO

Execute no terminal do VS Code:

```bash
node backend-api/verificar_ultima_empresa.js
```

**⚠️ VALIDAR:**
- ✅ `nome_empresa`: PETROBRAS - Teste
- ✅ `razao_social`: PETRÓLEO BRASILEIRO S.A.
- ✅ `nome_fantasia`: PETROBRAS
- ✅ `telefone`: 2125341000
- ✅ `email`: contato@petrobras.com.br
- ✅ `id_municipio`: 3304557
- ✅ `cep`: 20031912

---

## 📊 CHECKLIST DE VALIDAÇÃO

### ✅ VALIDAÇÕES VISUAIS:
- [ ] Borda rosa grossa em campos obrigatórios vazios
- [ ] Texto vermelho de erro aparece
- [ ] Campos preenchem automaticamente via API CNPJ
- [ ] Municípios filtram por estado selecionado
- [ ] Todos os dropdowns carregam do banco

### ✅ VALIDAÇÕES TÉCNICAS:
- [ ] Console não mostra erros
- [ ] API CNPJ retorna dados corretos
- [ ] Logs de municípios aparecem no console
- [ ] POST /api/submit-form retorna 200 OK
- [ ] Mensagem de sucesso aparece

### ✅ VALIDAÇÕES DE DADOS:
- [ ] Empresa salva com 16 colunas
- [ ] Entrevistado salva com 6 colunas
- [ ] Pesquisa salva com 39 colunas
- [ ] Todos os campos numéricos são numéricos puros
- [ ] Dados da API CNPJ foram salvos (Q6b-Q11)

---

## 🎯 RESULTADO ESPERADO

✅ Formulário preenchido sem erros  
✅ API CNPJ funcionou perfeitamente  
✅ Todos os dados salvos no banco  
✅ 16 colunas empresa preenchidas (6 interface + 10 API)  
✅ Sistema 100% operacional  

---

## ❓ SE ALGO DER ERRADO

1. Abra o console (**F12**)
2. Copie a mensagem de erro completa
3. Tire um print da tela
4. Reporte o problema com detalhes

---

## 🔗 LINKS ÚTEIS

- 🏠 Formulário: http://localhost:3000
- 🧹 Limpar Cache: http://localhost:3000/limpar-cache.html
- 📊 Visualizador: http://localhost:3000/visualizador
- 📋 Respostas: http://localhost:3000/respostas
