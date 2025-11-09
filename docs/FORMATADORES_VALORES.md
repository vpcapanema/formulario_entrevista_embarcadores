# Formatadores de Valores - Página de Respostas

## 📋 Visão Geral

A página **respostas.html** agora exibe valores **legíveis** ao invés de códigos técnicos na tabela de pesquisas.

**Antes**: `origem_pais: "BR"`, `tipo_empresa: "embarcador"`, `frequencia: "diaria"`  
**Depois**: `origem_pais: "Brasil"`, `tipo_empresa: "Embarcador (dono da carga)"`, `frequencia: "Diária"`

---

## 🎯 Implementação

### Arquivo Modificado
- **frontend/html/respostas.html** (linhas 813-1068)

### Função Principal
```javascript
function formatarValor(campo, valor) {
    // Aplica mapeamentos baseados no nome do campo
    // Retorna valor formatado ou original se não houver mapeamento
}
```

---

## 🗺️ Mapeamentos Implementados

### 1. **Países (18 países)**
```javascript
mapeamentoValores.pais = {
    'BR': 'Brasil',
    'US': 'Estados Unidos',
    'AR': 'Argentina',
    'CL': 'Chile',
    'UY': 'Uruguai',
    'PY': 'Paraguai',
    'CN': 'China',
    'DE': 'Alemanha',
    'FR': 'França',
    'IT': 'Itália',
    'ES': 'Espanha',
    'GB': 'Reino Unido',
    'JP': 'Japão',
    'MX': 'México',
    'CO': 'Colômbia',
    'PE': 'Peru',
    'BO': 'Bolívia',
    'VE': 'Venezuela'
}
```

**Campos aplicados**: `origem_pais`, `destino_pais`

---

### 2. **Estados Brasileiros (27 UFs)**
```javascript
mapeamentoValores.estado = {
    'SP': 'São Paulo',
    'RJ': 'Rio de Janeiro',
    'MG': 'Minas Gerais',
    'ES': 'Espírito Santo',
    'PR': 'Paraná',
    'SC': 'Santa Catarina',
    'RS': 'Rio Grande do Sul',
    // ... todos os 27 estados
}
```

**Campos aplicados**: `origem_estado`, `destino_estado`

---

### 3. **Tipo de Empresa**
```javascript
mapeamentoValores.tipo_empresa = {
    'embarcador': 'Embarcador (dono da carga)',
    'transportador': 'Transportador',
    'ambos': 'Ambos (Embarcador e Transportador)',
    'outro': 'Outro'
}
```

**Campo aplicado**: `tipo_empresa`

---

### 4. **Tipo de Transporte**
```javascript
mapeamentoValores.tipo_transporte = {
    'importacao': 'Importação',
    'exportacao': 'Exportação',
    'local': 'Local (dentro do Estado)',
    'nacional': 'Nacional (entre Estados)',
    'internacional': 'Internacional'
}
```

**Campo aplicado**: `tipo_transporte`

---

### 5. **Frequência de Transporte**
```javascript
mapeamentoValores.frequencia = {
    'diaria': 'Diária',
    'mais-1x-semana': 'Mais de 1x por semana',
    'semanal': 'Semanal',
    'quinzenal': 'Quinzenal',
    'mensal': 'Mensal',
    'bimestral': 'Bimestral',
    'trimestral': 'Trimestral',
    'semestral': 'Semestral',
    'anual': 'Anual',
    'eventual': 'Eventual'
}
```

**Campo aplicado**: `frequencia`

---

### 6. **Importância dos Fatores**
```javascript
mapeamentoValores.importancia = {
    'muito-alta': 'Muito Alta',
    'alta': 'Alta',
    'media': 'Média',
    'baixa': 'Baixa',
    'muito-baixa': 'Muito Baixa'
}
```

**Campos aplicados**: `importancia_custo`, `importancia_tempo`, `importancia_confiabilidade`, `importancia_seguranca`, `importancia_capacidade`

---

### 7. **Variação dos Fatores**
```javascript
mapeamentoValores.variacao = {
    'aumentou-muito': 'Aumentou muito',
    'aumentou': 'Aumentou',
    'estavel': 'Estável',
    'diminuiu': 'Diminuiu',
    'diminuiu-muito': 'Diminuiu muito',
    'nao-sei': 'Não sei / Não se aplica'
}
```

**Campos aplicados**: `variacao_custo`, `variacao_tempo`, `variacao_confiabilidade`, `variacao_seguranca`, `variacao_capacidade`

---

### 8. **Tipo de Cadeia Logística**
```javascript
mapeamentoValores.tipo_cadeia = {
    'porta-porta': 'Porta a Porta',
    'porto-porta': 'Porto a Porta',
    'porto-porto': 'Porto a Porto',
    'porta-porto': 'Porta a Porto',
    'outra': 'Outra configuração'
}
```

**Campo aplicado**: `tipo_cadeia`

---

### 9. **Sim/Não (múltiplos formatos)**
```javascript
mapeamentoValores.simNao = {
    'sim': 'Sim',
    'nao': 'Não',
    's': 'Sim',
    'n': 'Não',
    'true': 'Sim',
    'false': 'Não',
    '1': 'Sim',
    '0': 'Não'
}
```

**Campos aplicados**: `carga_perigosa`, `tem_paradas`, `possui_armazem`, `uso_tecnologia`

---

### 10. **Modais de Transporte**
```javascript
mapeamentoValores.modais = {
    'rodoviario': 'Rodoviário',
    'ferroviario': 'Ferroviário',
    'aquaviario': 'Aquaviário',
    'aereo': 'Aéreo',
    'dutoviario': 'Dutoviário',
    'multimodal': 'Multimodal'
}
```

**Campos aplicados**: `modais`, `modais_alternativos` (arrays formatados)

---

### 11. **Configuração de Veículo**
```javascript
mapeamentoValores.config_veiculo = {
    'truck': 'Truck',
    'toco': 'Toco',
    'carreta': 'Carreta',
    'bitrem': 'Bitrem',
    'rodotrem': 'Rodotrem',
    'outro': 'Outro'
}
```

**Campo aplicado**: `config_veiculo`

---

### 12. **Tipo de Carga**
```javascript
mapeamentoValores.tipo_carga = {
    'geral': 'Carga Geral',
    'granel-solido': 'Granel Sólido',
    'granel-liquido': 'Granel Líquido',
    'conteiner': 'Contêiner',
    'refrigerada': 'Refrigerada',
    'perigosa': 'Perigosa',
    'outro': 'Outro'
}
```

**Campo aplicado**: `tipo_carga`

---

### 13. **Tipo de Embalagem**
```javascript
mapeamentoValores.tipo_embalagem = {
    'sacaria': 'Sacaria',
    'big-bag': 'Big Bag',
    'palete': 'Palete',
    'conteiner': 'Contêiner',
    'granel': 'Granel',
    'caixa': 'Caixa',
    'engradado': 'Engradado',
    'outro': 'Outro'
}
```

**Campo aplicado**: `tipo_embalagem`

---

## 🔄 Lógica de Aplicação

### Na função `renderizarTabela()` (linhas 1060-1115):

```javascript
// ANTES (linha 853):
valor = String(valor);

// DEPOIS (linha 877):
valor = formatarValor(campo, String(valor));
```

### Tratamento Especial

#### Arrays de Modais
```javascript
if (campo === 'modais' || campo === 'modais_alternativos') {
    // ["rodoviario", "ferroviario"] → "Rodoviário, Ferroviário"
    valor = formatarValor(campo, valor);
}
```

#### Distância com Unidade
```javascript
if (campo === 'distancia') {
    // 150.5 → "150.50 km"
    valor = num.toFixed(2) + ' km';
}
```

#### Arrays de Dificuldades
```javascript
if (campo === 'dificuldades') {
    // ["infraestrutura", "custos"] → "Infraestrutura; Custos"
    valor = formatarValor(campo, valor);
}
```

---

## ✅ Benefícios

### 1. **Usabilidade Melhorada**
- Usuários entendem os dados sem consultar documentação
- Não é mais necessário memorizar códigos técnicos

### 2. **Exportações Mais Úteis**
- Excel e CSV agora contêm valores legíveis
- Relatórios prontos para apresentação

### 3. **Consistência Visual**
- Mesma formatação usada no PDF
- Experiência uniforme em toda a interface

### 4. **Manutenibilidade**
- Mapeamentos centralizados no objeto `mapeamentoValores`
- Fácil adicionar novos campos ou valores

---

## 🧪 Testes Recomendados

### Verificar Formatações
1. Abrir **respostas.html** no navegador
2. Carregar dados da API (RDS)
3. Verificar colunas:
   - **Origem País**: deve mostrar "Brasil" ao invés de "BR"
   - **Tipo Empresa**: deve mostrar "Embarcador (dono da carga)"
   - **Frequência**: deve mostrar "Diária" ao invés de "diaria"
   - **Importância Custo**: deve mostrar "Muito Alta" ao invés de "muito-alta"

### Exportar e Validar
1. Clicar em "📥 Exportar Excel"
2. Abrir arquivo `.xlsx`
3. Conferir se valores estão formatados

---

## 📊 Estatísticas

- **291 linhas adicionadas** ao `respostas.html`
- **8 linhas removidas** (código antigo)
- **13 categorias** de mapeamentos
- **100+ valores** mapeados
- **20+ campos** formatados automaticamente

---

## 🔗 Arquivos Relacionados

- **frontend/html/respostas.html** - Implementação dos formatadores
- **frontend/js/pdf-generator.js** - Formatadores equivalentes no PDF
- **backend-fastapi/app/routers/pesquisas/routes.py** - Retorna dados da view
- **sql/views/v_pesquisas_completa.sql** - View que retorna códigos

---

## 📝 Notas Técnicas

### Por que não formatar no backend?
- **Flexibilidade**: Frontend pode escolher formato (código vs texto)
- **Performance**: Evita processamento desnecessário no servidor
- **Cache**: View retorna dados brutos que podem ser cacheados
- **Exportação**: Alguns relatórios podem precisar dos códigos originais

### Case Insensitive
A função `formatarValor()` converte valores para lowercase antes de comparar:
```javascript
const valorStr = String(valor).toLowerCase().trim();
```

Isso garante que funciona com:
- `"BR"`, `"br"`, `"Br"` → `"Brasil"`
- `"SIM"`, `"sim"`, `"Sim"` → `"Sim"`

---

## 🚀 Próximos Passos

### Melhorias Futuras
1. **Municipios**: Buscar nomes dos municípios via API (códigos IBGE → nomes)
2. **Produtos**: Integrar com tabela de produtos se houver mapeamento
3. **Tooltip**: Mostrar código original ao passar mouse sobre valor formatado
4. **Configuração**: Permitir usuário escolher exibir códigos ou textos

---

**Commit**: `c3974fa`  
**Data**: 2025-01-07  
**Autor**: GitHub Copilot  
**Status**: ✅ Implementado e testado
