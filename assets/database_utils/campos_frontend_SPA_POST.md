# Campos do Frontend (SPA) — Payloads enviados via POST

Documento gerado automaticamente contendo a lista completa de campos que o frontend coleta e pode enviar ao backend (via `/api/submit-form` ou endpoints auxiliares). Agrupado por blocos do formulário, com tipo esperado e observações sobre mapeamentos e inconsistências conhecidas.

> Local: collectFormData() em `app.js` + scripts de teste (`scripts/bulk_insert_via_api_34.js`).

---

## 1. Metadados / Responsável pelo preenchimento
- tipoResponsavel (string)
  - radio; ex.: `'entrevistador'` | `'empresa'` etc.
- idResponsavel (string | number)
  - definido quando `tipoResponsavel === 'entrevistador'` (id do entrevistador)

## 2. Dados do entrevistado (Card 1)
- nome (string)
- funcao (string)
- telefone (string)
- email (string)

Observação: o backend em alguns handlers espera `nomeEntrevistado` / `cargoEntrevistado` — ver seção de inconsistências.

## 3. Dados da empresa (Card 2)
- tipoEmpresa (string)
- outroTipo (string) — condicional se `tipoEmpresa === 'outro'`
- nomeEmpresa (string)
- municipio (string)

Campos adicionais populados via busca CNPJ (`buscarCNPJ`):
- cnpj (string)
- razaoSocial / razao_social (string)
- nomeFantasia / nome_fantasia (string)
- telefone (string)
- email (string)
- logradouro, numero, complemento, bairro, cep (strings)
- id_municipio (integer) — quando disponível

## 4. Produtos transportados (tabela dinâmica Q8)
Frontend gera `formData.produtos` como array de objetos. Cada item contém:
- carga (string / number)
- movimentacao (string / number)  // valor anual
- origem (string)
- destino (string)
- distancia (string / number)
- modalidade (string)
- acondicionamento (string)

Nota: o script de bulk usa `produtos_transportados` no payload de API; mapear `formData.produtos` → `produtos_transportados` quando necessário.

## 5. Produto principal (Card 4)
- produtoPrincipal (string)
- agrupamentoProduto (string)
- outroProduto (string) — condicional

## 6. Características do transporte / rota (Card 5)
- tipoTransporte (string)
- origemPais (string)
- origemEstado (string)
- origemMunicipio (string)
- destinoPais (string)
- destinoEstado (string)
- destinoMunicipio (string)
- distancia (number) — convertido com `parseNumeric`
- temParadas (string) — `'sim'|'nao'`
- numParadas (integer) — condicional
- modos (array<string>) — checkboxes (ex.: `['rodoviario']`)
- configVeiculo (string) — aparece quando `modos` inclui `'rodoviario'`

## 7. Capacidade / peso / custos
- capacidadeUtilizada (number)
- pesoCarga (number)
- unidadePeso (string) — ex.: `'tonelada'|'kg'`
- custoTransporte (number)
- valorCarga (number)
- tipoEmbalagem (string)
- cargaPerigosa (string) — `'sim'|'nao'`

## 8. Tempo / Frequência
- tempoDias (integer)
- tempoHoras (integer)
- tempoMinutos (integer)
- frequencia (string) — ex.: `'semanal'|'diaria'|'outra'`
- frequenciaDiaria (number) — condicional
- frequenciaOutra (string) — condicional

## 9. Fatores de decisão (importância e variação)
- importanciaCusto (string)
- variacaoCusto (number)
- importanciaTempo (string)
- variacaoTempo (number)
- importanciaConfiabilidade (string)
- variacaoConfiabilidade (number)
- importanciaSeguranca (string)
- variacaoSeguranca (number)
- importanciaCapacidade (string)
- variacaoCapacidade (number)

## 10. Análise estratégica / Dificuldades (Card 7/8)
- tipoCadeia (string)
- modaisAlternativos (array<string>)
- fatorAdicional (string / text)
- dificuldades (array<string>)
- detalheDificuldade (string)

## 11. Campos usados para geração de arquivo / metadados
- razaoSocial / razao_social (string) — usado para nome do arquivo Excel
- nomeFantasia / nome_fantasia (string)
- Data/Hora (gerado ao exportar)

---

## 12. Payloads enviados pelos scripts de teste (exemplos)
- `/api/empresas` (script `bulk_insert_via_api_34.js`) — payload exemplo:
  - nome_empresa, tipo_empresa, outro_tipo, municipio, estado, cnpj, razao_social, nome_fantasia, telefone, email, id_municipio, logradouro, numero, complemento, bairro, cep

- `/api/entrevistados` — payload exemplo:
  - id_empresa, nome, funcao, telefone, email, principal

- `/api/pesquisas` (script) — payload exemplo (campos principais):
  - id_empresa, id_entrevistado, tipo_responsavel, id_responsavel, produto_principal, agrupamento_produto, tipo_transporte, origem_pais, origem_estado, origem_municipio, destino_pais, destino_estado, destino_municipio, distancia, tem_paradas, modos, peso_carga, unidade_peso, custo_transporte, valor_carga, tipo_embalagem, carga_perigosa, tempo_dias, tempo_horas, tempo_minutos, frequencia, importancia_custo, variacao_custo, ..., tipo_cadeia, produtos_transportados (array com subcampos: produto, movimentacao_anual, origem, destino, distancia, modalidade, acondicionamento)

---

## 13. Campos que o backend espera (principais) — resumo a partir de `backend-api/server.js`
> Atenção: o backend possui **dois** conjuntos de nomes: o usado pelo handler `/api/pesquisas` e o usado pelo handler `/api/submit-form`. Há pequenas diferenças de nome (ex.: `distancia` vs `distanciaKm`, `nome` vs `nomeEntrevistado`).

- `/api/empresas`:
  - nome_empresa, tipo_empresa, outro_tipo, municipio, estado, cnpj, razao_social, nome_fantasia, telefone, email, id_municipio, logradouro, numero, complemento, bairro, cep

- `/api/entrevistados`:
  - id_empresa, nome, funcao, telefone, email, principal

- `/api/pesquisas` (handler direto):
  - id_empresa, id_entrevistado, tipo_responsavel, id_responsavel, produto_principal, agrupamento_produto, outro_produto, tipo_transporte, origem_pais, origem_estado, origem_municipio, destino_pais, destino_estado, destino_municipio, distancia, tem_paradas, num_paradas, modos, config_veiculo, capacidade_utilizada, peso_carga, unidade_peso, custo_transporte, valor_carga, tipo_embalagem, carga_perigosa, tempo_dias, tempo_horas, tempo_minutos, frequencia, frequencia_diaria, frequencia_outra, importancia_custo, variacao_custo, importancia_tempo, variacao_tempo, importancia_confiabilidade, variacao_confiabilidade, importancia_seguranca, variacao_seguranca, importancia_capacidade, variacao_capacidade, tipo_cadeia, modais_alternativos, fator_adicional, dificuldades, detalhe_dificuldade, observacoes, produtos_transportados

- `/api/submit-form` (endpoint usado pelo frontend):
  - nomeEntrevistado, cargoEntrevistado, telefoneEntrevistado, emailEntrevistado, razaoSocial, nomeFantasia, cnpj, municipio, logradouro, numero, complemento, bairro, cep, dataEntrevista, horarioEntrevista, entrevistador, instituicao, consentimento, transportaCarga, origemPais, origemEstado, origemMunicipio, origemInstalacao, destinoPais, destinoEstado, destinoMunicipio, destinoInstalacao, distanciaKm, volumeAnual, tipoProduto, classeProduto, produtosEspecificos, modalPredominante, modalSecundario, modalTerciario, proprioTerceirizado, qtdCaminhoesProprios, qtdCaminhoesTerceirizados, frequenciaEnvio, tempoTransporte, custoMedioTonelada, pedagioCusto, freteCusto, manutencaoCusto, outrosCustos, principaisDesafios, investimentoSustentavel, reducaoEmissoes, tecnologiasInteresse, usoTecnologia, grauAutomacao, rastreamentoCarga, usoDados, conhecimentoHidrovias, viabilidadeHidrovia, pontosMelhoria, observacoes, produtos_transportados

---

## 14. Inconsistências conhecidas e recomendações
- Nomes diferentes entre frontend e backend:
  - Frontend: `nome`, `funcao`, `distancia`, `pesoCarga`, `valorCarga`, `produtoPrincipal`, `produtos`.
  - Backend `/api/submit-form`: espera `nomeEntrevistado`, `cargoEntrevistado`, `distanciaKm`, `volumeAnual`, `produto_principal` (ou outros nomes). Isso causa valores `undefined` nos logs.

- Recomendações:
  1. Padronizar um mapeamento único antes de chamar `/api/submit-form` (p.ex. função `normalizeFormData(formData)` que cria as chaves que o backend espera: `nomeEntrevistado`, `cargoEntrevistado`, `distanciaKm`, etc.).
  2. Mapear `formData.produtos` → `produtos_transportados` com os nomes de coluna esperados (ex.: `movimentacao` → `movimentacao_anual` ou `movimentacao` conforme a tabela).
  3. Atualizar documentação ou o backend para aceitar os nomes produzidos pelo frontend (mais simples: normalizar no frontend antes do POST).

---

## 15. Próximos passos possíveis (automáticos)
- Gerar arquivo JSON com esta lista (`assets/database_utils/campos_frontend_SPA_POST.json`) — útil para testes e validação automática.
- Implementar `normalizeFormData()` em `app.js` que faz o mapeamento de nomes antes do `fetch('/api/submit-form', ...)`.

---

Arquivo gerado em: `assets/database_utils/campos_frontend_SPA_POST.md`

Se quiser, eu também implemento o arquivo JSON correspondente e/ou o patch para normalizar os nomes no `app.js`.
