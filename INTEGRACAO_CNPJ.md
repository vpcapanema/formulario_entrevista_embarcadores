# 🏢 Integração CNPJ com Receita Federal

## 📋 Descrição

A Pergunta 6 do formulário agora possui integração automática com a **API da Receita Federal** para preenchimento automático do nome da empresa.

## 🎯 Funcionalidades

### 1. Máscara Automática
- Ao digitar o CNPJ, a máscara `XX.XXX.XXX/XXXX-XX` é aplicada automaticamente
- Aceita apenas números (pontos, barras e hífens são inseridos automaticamente)
- Limita a 14 dígitos

### 2. Validação de CNPJ
- Valida CNPJs com dígitos repetidos (00000000000000, etc.)
- Valida os dígitos verificadores (algoritmo oficial)
- Mostra mensagem de erro se CNPJ for inválido

### 3. Consulta Automática à Receita Federal
- Ao sair do campo (blur), busca dados na API da Receita
- Preenche automaticamente o **Nome da Empresa** com a **Razão Social**
- Mostra status da empresa e atividade principal

## 🔄 Fluxo de Uso

```
1. Usuário digita CNPJ
   ↓
2. Máscara aplicada automaticamente (XX.XXX.XXX/XXXX-XX)
   ↓
3. Ao sair do campo, CNPJ é validado
   ↓
4. Se válido, consulta API da Receita Federal
   ↓
5. Razão Social preenche automaticamente "Nome da Empresa"
   ↓
6. Status mostra: ✅ ATIVA | Atividade principal
```

## 📊 Informações Exibidas

### Status de Consulta
- **🔍 Consultando Receita Federal...** - Durante a busca
- **✅ ATIVA | Serviços de engenharia** - Empresa ativa
- **⚠️ INAPTA | Atividade...** - Empresa com restrição
- **❌ CNPJ não encontrado** - Erro na consulta

### Dados Preenchidos
- **Nome da Empresa** (readonly): Razão Social oficial
- **CNPJ Status**: Situação cadastral + Atividade principal

## 🔧 Exemplo de Uso

### CNPJ Válido
```
Entrada: 59073921000127
Máscara: 59.073.921/0001-27
Resultado: CONSORCIO CONCREMAT - TRANSPLAN
Status: ✅ ATIVA | Serviços de engenharia
```

### CNPJ Inválido
```
Entrada: 12345678000100
Resultado: ❌ CNPJ inválido
```

### CNPJ Incompleto
```
Entrada: 59073921
Resultado: ⚠️ CNPJ incompleto (14 dígitos necessários)
```

## 🌐 API Utilizada

**ReceitaWS** - https://www.receitaws.com.br/
- API pública e gratuita
- Dados atualizados da Receita Federal
- Sem necessidade de autenticação
- Limite: consultas razoáveis (não especificado)

### Resposta da API
```json
{
  "nome": "CONSORCIO CONCREMAT - TRANSPLAN",
  "fantasia": "",
  "cnpj": "59.073.921/0001-27",
  "situacao": "ATIVA",
  "tipo": "MATRIZ",
  "atividade_principal": [
    {
      "code": "71.12-0-00",
      "text": "Serviços de engenharia"
    }
  ],
  "municipio": "SAO PAULO",
  "uf": "SP",
  ...
}
```

## 📝 Dados Salvos no Formulário

Quando o formulário for submetido, serão salvos:
- `cnpj-empresa`: CNPJ formatado (XX.XXX.XXX/XXXX-XX)
- `nome-empresa`: Razão Social da Receita Federal

## ⚙️ Implementação Técnica

### Arquivos Criados
- **cnpj-validator.js**: Classe CNPJValidator com todas as funcionalidades
  - `aplicarMascara()`: Formata CNPJ enquanto digita
  - `validarCNPJ()`: Valida dígitos verificadores
  - `buscarDadosReceita()`: Consulta API ReceitaWS
  - `mostrarStatus()`: Exibe mensagens de feedback

### Modificações no HTML
- Campo CNPJ adicionado antes do Nome da Empresa
- Layout em grid (200px para CNPJ, restante para Nome)
- Nome da Empresa agora é `readonly` (preenchido pela API)
- Status visual abaixo do CNPJ

## 🎨 Interface

```
┌─────────────────────────────────────────────────────────┐
│ 6a. CNPJ *                6b. Nome da empresa *         │
│ ┌─────────────────────┐   ┌───────────────────────────┐ │
│ │ 59.073.921/0001-27  │   │ CONSORCIO CONCREMAT -     │ │
│ └─────────────────────┘   │ TRANSPLAN                 │ │
│ ✅ ATIVA | Serviços de    └───────────────────────────┘ │
│    engenharia              Razão social obtida da       │
│                            Receita Federal              │
└─────────────────────────────────────────────────────────┘
```

## 🚨 Tratamento de Erros

### Sem Conexão
```
❌ Erro na consulta à Receita Federal
```

### CNPJ Não Encontrado
```
❌ CNPJ não encontrado
```

### API Indisponível
```
❌ Erro na consulta à Receita Federal
```

## 🔒 Validações

1. **Formato**: 14 dígitos numéricos
2. **Algoritmo**: Dígitos verificadores válidos
3. **Existência**: CNPJ cadastrado na Receita
4. **Situação**: Mostra status (ATIVA, INAPTA, etc.)

## 📌 Notas Importantes

- O campo **Nome da Empresa** é `readonly` para evitar alterações manuais
- Se o CNPJ for apagado, o nome da empresa é limpo automaticamente
- A consulta só ocorre quando o CNPJ está completo (14 dígitos)
- Dados são validados antes de consultar a API (economia de requisições)
- Console do navegador mostra dados completos para debug

## 🧪 Como Testar

1. Abrir formulário no navegador
2. Rolar até a Pergunta 6
3. Digitar CNPJ (ex: 59073921000127)
4. Observar máscara sendo aplicada
5. Clicar fora do campo ou pressionar Tab
6. Aguardar "🔍 Consultando Receita Federal..."
7. Nome da empresa será preenchido automaticamente
8. Status mostrará situação cadastral

## 🎯 Benefícios

✅ **Precisão**: Dados oficiais da Receita Federal  
✅ **Velocidade**: Preenchimento automático  
✅ **Validação**: CNPJ verificado antes de salvar  
✅ **UX**: Feedback visual em tempo real  
✅ **Confiabilidade**: Reduz erros de digitação  

---

**Desenvolvido para PLI 2050 - Sistema de Formulários de Entrevista**
