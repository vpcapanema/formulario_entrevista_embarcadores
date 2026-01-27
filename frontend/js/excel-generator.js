/*
 * ============================================================
 * EXCEL-GENERATOR - Gerador de XLSX automático para submissão
 * ============================================================
 * Funções:
 *  - generateXlsxFromFormData(formData, opts)
 *
 * Requisitos:
 *  - Reutiliza a biblioteca XLSX (SheetJS) que já está incluída no index.html
 *  - Gera 2 abas: "Dados Principais" (campo: valor) e "Produtos" (tabela)
 *  - Quando houver erro, gera também aba "Log de Erro" com details
 */

(function (window) {
    'use strict';

    const ExcelGenerator = {
        /**
         * Gera um ArrayBuffer (XLSX) a partir de formData e opções (sem download automático)
         * Retorna ArrayBuffer
         */
        createWorkbookArrayBuffer(formData, opts = {}) {
            const { success = true, errorDetails = null } = opts;
            const labelMap = opts.labels || {};
            const wb = XLSX.utils.book_new();

            // Mapeamento de campos código → campo nome amigável
            // Quando existir o campo "Nome", usar o valor amigável no Excel
            const CODE_TO_NAME_MAP = {
                'funcao': 'funcaoNome',
                'tipoEmpresa': 'tipoEmpresaNome',
                'municipio': 'municipioNome',
                'agrupamentoProduto': 'agrupamentoProdutoNome',
                'tipoTransporte': 'tipoTransporteNome',
                'origemPais': 'origemPaisNome',
                'origemEstado': 'origemEstadoNome',
                'origemMunicipio': 'origemMunicipioNome',
                'destinoPais': 'destinoPaisNome',
                'destinoEstado': 'destinoEstadoNome',
                'destinoMunicipio': 'destinoMunicipioNome',
                'configVeiculo': 'configVeiculoNome',
                'unidadePeso': 'unidadePesoNome',
                'tipoEmbalagem': 'tipoEmbalagemNome',
                'frequencia': 'frequenciaNome',
                'importanciaCusto': 'importanciaCustoNome',
                'importanciaTempo': 'importanciaTempoNome',
                'importanciaConfiabilidade': 'importanciaConfiabilidadeNome',
                'importanciaSeguranca': 'importanciaSegurancaNome',
                'importanciaCapacidade': 'importanciaCapacidadeNome',
                'tipoCadeia': 'tipoCadeiaNome'
            };

            /**
             * Retorna o valor amigável se existir, senão retorna o valor código
             */
            const getDisplayValue = (key) => {
                // Se existe mapeamento para campo Nome e o campo Nome está preenchido, usar ele
                if (CODE_TO_NAME_MAP[key] && formData[CODE_TO_NAME_MAP[key]]) {
                    return formData[CODE_TO_NAME_MAP[key]];
                }
                // Senão, usar o valor original
                return formData[key];
            };

            // Ordem fixa das colunas (deve seguir a ordem das questões do formulário)
            const FIELDS_ORDER = [
                'tipoResponsavel', 'idResponsavel',
                'nome', 'funcao', 'outraFuncao', 'telefone', 'email', 'estadoCivil', 'nacionalidade', 'ufNaturalidade', 'municipioNaturalidade',
                'tipoEmpresa', 'outroTipo', 'razaoSocial', 'nomeEmpresa', 'municipio', 'cnpj', 'nomeFantasia', 'nomeFantasiaReceita', 'situacaoCadastralReceita', 'atividadePrincipalReceita', 'logradouro', 'numero', 'complemento', 'bairro', 'cep',
                'produtoPrincipal', 'agrupamentoProduto', 'outroProduto', 'observacoesProdutoPrincipal',
                'tipoTransporte', 'origemPais', 'origemEstado', 'origemMunicipio', 'destinoPais', 'destinoEstado', 'destinoMunicipio', 'distancia', 'temParadas', 'numParadas', 'modos', 'configVeiculo', 'capacidadeUtilizada', 'pesoCarga', 'unidadePeso', 'custoTransporte', 'valorCarga', 'tipoEmbalagem', 'cargaPerigosa', 'tempoDias', 'tempoHoras', 'tempoMinutos', 'frequencia', 'frequenciaDiaria', 'frequenciaOutra', 'observacoesSazonalidade',
                'importanciaCusto', 'variacaoCusto', 'importanciaTempo', 'variacaoTempo', 'importanciaConfiabilidade', 'variacaoConfiabilidade', 'importanciaSeguranca', 'variacaoSeguranca', 'importanciaCapacidade', 'variacaoCapacidade',
                'tipoCadeia', 'modaisAlternativos', 'fatorAdicional', 'dificuldades', 'detalheDificuldade',
                'transportaCarga', 'consentimento'
            ];
            const allKeys = FIELDS_ORDER.filter(k => formData.hasOwnProperty(k));
            const headerRow = allKeys.map(k => labelMap[k] || k);
            const valuesRow = allKeys.map(k => {
                // ⭐ USAR VALOR AMIGÁVEL quando disponível
                let v = getDisplayValue(k);
                if (Array.isArray(v)) return v.join(', ');
                if (typeof v === 'object' && v !== null) return JSON.stringify(v);
                return v == null ? '' : String(v);
            });
            
            // ABA 1: Dados (Colunas) + Produtos em seções separadas
            const sheetColumns = [headerRow, valuesRow];
            
            // Mapeamento de campos código → campo nome para produtos
            const PRODUTO_CODE_TO_NAME = {
                'origemPaisCodigo': 'origemPaisNome',
                'origemEstadoUf': 'origemEstadoNome',
                'origemMunicipioCodigo': 'origemMunicipioNome',
                'destinoPaisCodigo': 'destinoPaisNome',
                'destinoEstadoUf': 'destinoEstadoNome',
                'destinoMunicipioCodigo': 'destinoMunicipioNome'
            };
            
            // Campos a ocultar dos produtos (códigos redundantes quando temos nomes)
            const PRODUTO_HIDE_KEYS = [
                'origemPaisCodigo', 'origemEstadoUf', 'origemMunicipioCodigo',
                'destinoPaisCodigo', 'destinoEstadoUf', 'destinoMunicipioCodigo',
                'origemText', 'destinoText'
            ];
            
            // Adicionar espaço e depois produtos se houver
            const produtos = Array.isArray(formData.produtos) ? formData.produtos : [];
            if (produtos.length > 0) {
                sheetColumns.push([]); // linha vazia separadora
                
                // Header dos produtos - usar campos de NOME em vez de código
                const preferred = ['carga', 'movimentacao', 'origemPaisNome', 'origemEstadoNome', 'origemMunicipioNome', 'destinoPaisNome', 'destinoEstadoNome', 'destinoMunicipioNome', 'distancia', 'modalidade', 'acondicionamento', 'observacoes', 'confirmado'];
                const produtoKeys = Array.from(new Set(produtos.flatMap(p => Object.keys(p))));
                // Filtrar campos de código que já têm versão Nome
                const filteredKeys = produtoKeys.filter(k => !PRODUTO_HIDE_KEYS.includes(k));
                const orderedKeys = preferred.filter(k => filteredKeys.includes(k)).concat(filteredKeys.filter(k => !preferred.includes(k)));
                
                // Labels amigáveis para headers de produtos
                const produtoLabelMap = {
                    'carga': 'Produto',
                    'movimentacao': 'Movimentação (ton/ano)',
                    'origemPaisNome': 'Origem - País',
                    'origemEstadoNome': 'Origem - Estado',
                    'origemMunicipioNome': 'Origem - Município',
                    'destinoPaisNome': 'Destino - País',
                    'destinoEstadoNome': 'Destino - Estado',
                    'destinoMunicipioNome': 'Destino - Município',
                    'distancia': 'Distância (km)',
                    'modalidade': 'Modalidade',
                    'acondicionamento': 'Acondicionamento',
                    'observacoes': 'Observações',
                    'confirmado': 'Confirmado'
                };
                const produtoHeaderLabels = orderedKeys.map(k => produtoLabelMap[k] || labelMap[k] || k);
                sheetColumns.push(produtoHeaderLabels);
                
                // Linhas dos produtos
                produtos.forEach(p => {
                    const row = orderedKeys.map(k => {
                        let v = p[k];
                        if (Array.isArray(v)) return v.join(', ');
                        if (typeof v === 'object' && v !== null) return JSON.stringify(v);
                        return v == null ? '' : String(v);
                    });
                    sheetColumns.push(row);
                });
            }
            
            const wsCols = XLSX.utils.aoa_to_sheet(sheetColumns);
            XLSX.utils.book_append_sheet(wb, wsCols, 'Dados (Colunas)');

            // ABA 2: Dados (Campo-Valor) + Produtos em seções separadas
            // ⭐ Filtrar campos auxiliares (terminados em "Nome", "Codigo", etc.) para evitar duplicação
            const EXCLUDE_SUFFIXES = ['Nome', 'Codigo', 'Uf', 'Completo'];
            const shouldExcludeKey = (key) => {
                // Excluir campos que são versões auxiliares (ex: funcaoNome, origemPaisCodigo)
                return EXCLUDE_SUFFIXES.some(suffix => 
                    key.endsWith(suffix) && key !== suffix && CODE_TO_NAME_MAP[key.replace(suffix, '')]
                );
            };
            
            const dadosPrincipais = [['Campo', 'Valor']];
            Object.keys(formData).forEach(key => {
                if (key === 'produtos') return;
                // Pular campos auxiliares que já foram usados para exibir valores amigáveis
                if (shouldExcludeKey(key)) return;
                // Pular campos que terminam com Nome (são auxiliares)
                if (key.endsWith('Nome') && CODE_TO_NAME_MAP[key.slice(0, -4)]) return;
                
                let label = labelMap[key] || key;
                // ⭐ USAR VALOR AMIGÁVEL quando disponível
                let value = getDisplayValue(key);
                if (Array.isArray(value)) value = value.join(', ');
                if (typeof value === 'object' && value !== null) value = JSON.stringify(value);
                dadosPrincipais.push([label, value == null ? '' : String(value)]);
            });
            
            // Adicionar produtos à aba 2 também
            if (produtos.length > 0) {
                dadosPrincipais.push([]); // linha vazia separadora
                dadosPrincipais.push(['PRODUTOS TRANSPORTADOS', '']); // Seção de produtos
                dadosPrincipais.push([]);
                
                // Mapeamento de campos código → campo nome para produtos
                const PRODUTO_CODE_TO_NAME = {
                    'origemPaisCodigo': 'origemPaisNome',
                    'origemEstadoUf': 'origemEstadoNome',
                    'origemMunicipioCodigo': 'origemMunicipioNome',
                    'destinoPaisCodigo': 'destinoPaisNome',
                    'destinoEstadoUf': 'destinoEstadoNome',
                    'destinoMunicipioCodigo': 'destinoMunicipioNome'
                };
                
                // Campos a ocultar (códigos redundantes quando temos nomes)
                const PRODUTO_HIDE_KEYS = [
                    'origemPaisCodigo', 'origemEstadoUf', 'origemMunicipioCodigo',
                    'destinoPaisCodigo', 'destinoEstadoUf', 'destinoMunicipioCodigo',
                    'origemText', 'destinoText' // Campos de fallback também podem ser omitidos
                ];
                
                // Para cada produto, exibir em formato campo-valor
                produtos.forEach((p, idx) => {
                    dadosPrincipais.push([`Produto ${idx + 1}`, '']);
                    Object.entries(p).forEach(([k, v]) => {
                        // Pular campos de código que têm versão Nome
                        if (PRODUTO_HIDE_KEYS.includes(k)) return;
                        
                        const label = labelMap[k] || k;
                        if (Array.isArray(v)) v = v.join(', ');
                        if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
                        dadosPrincipais.push([`  ${label}`, v == null ? '' : String(v)]);
                    });
                    dadosPrincipais.push([]);
                });
            }
            
            const ws1 = XLSX.utils.aoa_to_sheet(dadosPrincipais);
            XLSX.utils.book_append_sheet(wb, ws1, 'Dados (Campo-Valor)');

            // ABA 3: Status / Log (com Timestamp)
            const statusText = opts.statusLabel || (success ? 'SUCESSO' : 'ERRO');
            const timestamp = new Date().toISOString();
            const statusSheet = XLSX.utils.aoa_to_sheet([['Status', statusText], ['Timestamp', timestamp]]);
            XLSX.utils.book_append_sheet(wb, statusSheet, 'Status');

            if (!success && errorDetails) {
                const logs = typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2);
                const logLines = [['Log (detalhado)']].concat(logs.split('\n').map(l => [l]));
                const logSheet = XLSX.utils.aoa_to_sheet(logLines);
                XLSX.utils.book_append_sheet(wb, logSheet, 'Log de Erro');
            }

            // Retorna ArrayBuffer (tipo 'array') para escrita em Blob
            const ab = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            return ab;
        },

        /**
         * 📊 GERA EXCEL ESTILIZADO (OFICIAL) - Com labels amigáveis, múltiplas abas e formatação
         * Retorna ArrayBuffer para download externo
         */
        createStyledWorkbook(formData, response = {}) {
            const wb = XLSX.utils.book_new();
            const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
            
            // ===== HELPERS DE FORMATAÇÃO =====
            const formatTelefone = (tel) => {
                if (!tel) return '';
                const cleaned = String(tel).replace(/\D/g, '');
                if (cleaned.length === 11) return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                if (cleaned.length === 10) return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                return tel;
            };
            
            const formatCNPJ = (cnpj) => {
                if (!cnpj) return '';
                const cleaned = String(cnpj).replace(/\D/g, '');
                if (cleaned.length === 14) return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                return cnpj;
            };
            
            const formatMoeda = (valor) => {
                if (!valor && valor !== 0) return '';
                return `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            };
            
            const formatNumero = (num, decimais = 1) => {
                if (!num && num !== 0) return '';
                return Number(num).toLocaleString('pt-BR', { minimumFractionDigits: decimais, maximumFractionDigits: decimais });
            };

            // ===== ABA 1: IDENTIFICAÇÃO =====
            const abaIdentificacao = [
                ['PLI 2050 - FORMULÁRIO DE ENTREVISTA COM EMBARCADORES'],
                ['Emitido em:', timestamp],
                ['ID da Pesquisa:', `#${response.id_pesquisa || 'Pendente'}`],
                [],
                ['CARD 0 - RESPONSÁVEL PELO PREENCHIMENTO'],
                ['Tipo de Responsável', formData.tipoResponsavel || 'N/I'],
                ['ID do Responsável', formData.idResponsavel || 'N/I'],
                [],
                ['CARD 1 - DADOS DO ENTREVISTADO'],
                ['Q1. Nome', formData.nome || 'N/I'],
                ['Q2. Função', formData.funcaoNome || formData.funcao || 'N/I'],
                ['Q2b. Outra Função', formData.outraFuncao || ''],
                ['Q3. Telefone', formatTelefone(formData.telefone)],
                ['Q4. E-mail', formData.email || 'N/I'],
                [],
                ['CARD 2 - DADOS DA EMPRESA'],
                ['Q5. Tipo de Empresa', formData.tipoEmpresaNome || formData.tipoEmpresa || 'N/I'],
                ['Q5b. Outro Tipo', formData.outroTipo || ''],
                ['Q6a. CNPJ', formatCNPJ(formData.cnpj)],
                ['Q6b. Razão Social', formData.razaoSocial || 'N/I'],
                ['Q6c. Nome Fantasia (Receita Federal)', formData.nomeFantasiaReceita || ''],
                ['Q6d. Situação Cadastral (Receita Federal)', formData.situacaoCadastralReceita || ''],
                ['Q6e. Atividade Principal CNAE (Receita Federal)', formData.atividadePrincipalReceita || ''],
                ['Q7. Município da Empresa', formData.municipioNome || formData.municipio || 'N/I']
            ];
            const wsIdentificacao = XLSX.utils.aoa_to_sheet(abaIdentificacao);
            // Larguras de coluna
            wsIdentificacao['!cols'] = [{ wch: 45 }, { wch: 50 }];
            XLSX.utils.book_append_sheet(wb, wsIdentificacao, '1. Identificação');

            // ===== ABA 2: PRODUTOS (Q8) =====
            const produtos = Array.isArray(formData.produtos) ? formData.produtos : [];
            if (produtos.length > 0) {
                const headerProdutos = [
                    '#',
                    'Carga Transportada',
                    'Movimentação (ton/ano)',
                    'Origem - País',
                    'Origem - Estado',
                    'Origem - Município',
                    'Destino - País',
                    'Destino - Estado',
                    'Destino - Município',
                    'Distância (km)',
                    'Modalidade',
                    'Acondicionamento',
                    'Observações'
                ];
                const rowsProdutos = [headerProdutos];
                
                produtos.forEach((p, idx) => {
                    rowsProdutos.push([
                        idx + 1,
                        p.carga || '',
                        p.movimentacao_anual || p.movimentacao ? formatNumero(p.movimentacao_anual || p.movimentacao, 0) : '',
                        p.origem_pais_nome || p.origem_pais || '',
                        p.origem_estado_nome || p.origem_estado || '',
                        p.origem_municipio_nome || p.origem_municipio || '',
                        p.destino_pais_nome || p.destino_pais || '',
                        p.destino_estado_nome || p.destino_estado || '',
                        p.destino_municipio_nome || p.destino_municipio || '',
                        p.distancia ? formatNumero(p.distancia) : '',
                        p.modalidade || '',
                        p.acondicionamento || '',
                        p.observacoes || ''
                    ]);
                });
                
                const wsProdutos = XLSX.utils.aoa_to_sheet(rowsProdutos);
                wsProdutos['!cols'] = [
                    { wch: 5 },   // #
                    { wch: 25 },  // Carga
                    { wch: 18 },  // Movimentação
                    { wch: 15 },  // Origem - País
                    { wch: 15 },  // Origem - Estado
                    { wch: 20 },  // Origem - Município
                    { wch: 15 },  // Destino - País
                    { wch: 15 },  // Destino - Estado
                    { wch: 20 },  // Destino - Município
                    { wch: 12 },  // Distância
                    { wch: 20 },  // Modalidade
                    { wch: 18 },  // Acondicionamento
                    { wch: 30 }   // Observações
                ];
                XLSX.utils.book_append_sheet(wb, wsProdutos, '2. Produtos (Q8)');
            } else {
                const wsEmpty = XLSX.utils.aoa_to_sheet([['Nenhum produto cadastrado']]);
                XLSX.utils.book_append_sheet(wb, wsEmpty, '2. Produtos (Q8)');
            }

            // ===== ABA 3: TRANSPORTE =====
            const abaTransporte = [
                ['CARD 4 - PRODUTO PRINCIPAL'],
                ['Q9. Produto Mais Representativo', formData.produtoPrincipal || 'N/I'],
                ['Q10. Agrupamento do Produto', formData.agrupamentoProdutoNome || formData.agrupamentoProduto || 'N/I'],
                ['Q10b. Outro Produto', formData.outroProduto || ''],
                [],
                ['CARD 5 - CARACTERÍSTICAS DO TRANSPORTE'],
                ['Q11. Tipo de Transporte', formData.tipoTransporteNome || formData.tipoTransporte || 'N/I'],
                ['Q12. Origem - País', formData.origemPaisNome || formData.origemPais || 'N/I'],
                ['Q12b. Origem - Estado', formData.origemEstadoNome || formData.origemEstado || 'N/I'],
                ['Q12c. Origem - Município', formData.origemMunicipioNome || formData.origemMunicipio || 'N/I'],
                ['Q13. Destino - País', formData.destinoPaisNome || formData.destinoPais || 'N/I'],
                ['Q13b. Destino - Estado', formData.destinoEstadoNome || formData.destinoEstado || 'N/I'],
                ['Q13c. Destino - Município', formData.destinoMunicipioNome || formData.destinoMunicipio || 'N/I'],
                ['Q14. Distância do Deslocamento', formData.distancia ? `${formatNumero(formData.distancia)} km` : 'N/I'],
                ['Q15. Tem Paradas?', formData.temParadas === 'sim' ? 'Sim' : (formData.temParadas === 'nao' ? 'Não' : 'N/I')],
                ['Q16. Número de Paradas', formData.numParadas || ''],
                ['Q17. Modais Utilizados', Array.isArray(formData.modos) ? formData.modos.join(', ') : formData.modos || 'N/I'],
                ['Q18. Configuração do Veículo Rodoviário', formData.configVeiculoNome || formData.configVeiculo || ''],
                ['Q19. Capacidade Utilizada (%)', formData.capacidadeUtilizada ? `${formatNumero(formData.capacidadeUtilizada)}%` : 'N/I'],
                ['Q20. Peso da Carga', formData.pesoCarga ? formatNumero(formData.pesoCarga, 0) : 'N/I'],
                ['Q21. Unidade de Peso', formData.unidadePesoNome || formData.unidadePeso || 'N/I'],
                ['Q22. Custo Total do Transporte', formatMoeda(formData.custoTransporte)],
                ['Q23. Valor Total da Carga', formatMoeda(formData.valorCarga)],
                ['Q24. Tipo de Embalagem', formData.tipoEmbalagemNome || formData.tipoEmbalagem || 'N/I'],
                ['Q25. Carga Perigosa?', formData.cargaPerigosa === 'sim' ? 'Sim' : (formData.cargaPerigosa === 'nao' ? 'Não' : 'N/I')],
                ['Q26. Tempo de Deslocamento', `${formData.tempoDias || 0} dia(s), ${formData.tempoHoras || 0} hora(s), ${formData.tempoMinutos || 0} minuto(s)`],
                ['Q27. Frequência de Deslocamento', formData.frequenciaNome || formData.frequencia || 'N/I'],
                ['Q28. Observações sobre Sazonalidade', formData.observacoesSazonalidade || '']
            ];
            const wsTransporte = XLSX.utils.aoa_to_sheet(abaTransporte);
            wsTransporte['!cols'] = [{ wch: 45 }, { wch: 50 }];
            XLSX.utils.book_append_sheet(wb, wsTransporte, '3. Transporte');

            // ===== ABA 4: INFRAESTRUTURA =====
            const abaInfra = [
                ['CARD 6 - FATORES DE DECISÃO MODAL'],
                ['Q29. Importância do Custo', formData.importanciaCustoNome || formData.importanciaCusto || 'N/I'],
                ['Q30. Variação Tolerada - Custo (%)', formData.variacaoCusto || ''],
                ['Q31. Importância do Tempo', formData.importanciaTempoNome || formData.importanciaTempo || 'N/I'],
                ['Q32. Variação Tolerada - Tempo (%)', formData.variacaoTempo || ''],
                ['Q33. Importância da Confiabilidade', formData.importanciaConfiabilidadeNome || formData.importanciaConfiabilidade || 'N/I'],
                ['Q34. Variação Tolerada - Confiabilidade (%)', formData.variacaoConfiabilidade || ''],
                ['Q35. Importância da Segurança', formData.importanciaSegurancaNome || formData.importanciaSeguranca || 'N/I'],
                ['Q36. Variação Tolerada - Segurança (%)', formData.variacaoSeguranca || ''],
                ['Q37. Importância da Capacidade', formData.importanciaCapacidadeNome || formData.importanciaCapacidade || 'N/I'],
                ['Q38. Variação Tolerada - Capacidade (%)', formData.variacaoCapacidade || ''],
                [],
                ['CARD 7 - POSICIONAMENTO ESTRATÉGICO'],
                ['Q39. Tipo de Cadeia', formData.tipoCadeiaNome || formData.tipoCadeia || 'N/I'],
                ['Q40. Modais Alternativos', Array.isArray(formData.modaisAlternativos) ? formData.modaisAlternativos.join(', ') : formData.modaisAlternativos || 'N/I'],
                ['Q41. Fator Adicional', formData.fatorAdicional || ''],
                [],
                ['CARD 8 - AVALIAÇÃO DA INFRAESTRUTURA'],
                ['Q42. Dificuldades', Array.isArray(formData.dificuldades) ? formData.dificuldades.join('; ') : formData.dificuldades || 'N/I'],
                ['Q43. Detalhe das Dificuldades', formData.detalheDificuldade || '']
            ];
            const wsInfra = XLSX.utils.aoa_to_sheet(abaInfra);
            wsInfra['!cols'] = [{ wch: 50 }, { wch: 50 }];
            XLSX.utils.book_append_sheet(wb, wsInfra, '4. Infraestrutura');

            // ===== ABA 5: TODOS OS DADOS (COMPLETO) =====
            const abaTodosDados = [
                ['PLI 2050 - DADOS COMPLETOS DA PESQUISA'],
                ['Emitido em:', timestamp],
                ['ID da Pesquisa:', `#${response.id_pesquisa || 'Pendente'}`],
                ['ID da Empresa:', response.id_empresa || 'Pendente'],
                ['ID do Entrevistado:', response.id_entrevistado || 'Pendente'],
                [],
                ['CAMPO', 'VALOR'],
                // Card 0
                ['--- RESPONSÁVEL PELO PREENCHIMENTO ---', ''],
                ['Tipo de Responsável', formData.tipoResponsavel || 'N/I'],
                ['ID do Responsável', formData.idResponsavel || 'N/I'],
                // Card 1
                ['--- DADOS DO ENTREVISTADO ---', ''],
                ['Q1. Nome', formData.nome || 'N/I'],
                ['Q2. Função', formData.funcaoNome || formData.funcao || 'N/I'],
                ['Q2b. Outra Função', formData.outraFuncao || ''],
                ['Q3. Telefone', formatTelefone(formData.telefone)],
                ['Q4. E-mail', formData.email || 'N/I'],
                // Card 2
                ['--- DADOS DA EMPRESA ---', ''],
                ['Q5. Tipo de Empresa', formData.tipoEmpresaNome || formData.tipoEmpresa || 'N/I'],
                ['Q5b. Outro Tipo', formData.outroTipo || ''],
                ['Q6a. CNPJ', formatCNPJ(formData.cnpj)],
                ['Q6b. Razão Social', formData.razaoSocial || 'N/I'],
                ['Q6c. Nome Fantasia (Receita Federal)', formData.nomeFantasiaReceita || ''],
                ['Q6d. Situação Cadastral (Receita Federal)', formData.situacaoCadastralReceita || ''],
                ['Q6e. Atividade Principal CNAE (Receita Federal)', formData.atividadePrincipalReceita || ''],
                ['Q7. Município da Empresa', formData.municipioNome || formData.municipio || 'N/I'],
                // Card 3 - Produtos (resumo)
                ['--- PRODUTOS TRANSPORTADOS (Q8) ---', ''],
                ['Quantidade de Produtos', produtos.length]
            ];
            
            // Adicionar resumo dos produtos
            produtos.forEach((p, idx) => {
                abaTodosDados.push([`Produto ${idx + 1} - Carga`, p.carga || '']);
                abaTodosDados.push([`Produto ${idx + 1} - Movimentação (ton/ano)`, p.movimentacao_anual || p.movimentacao ? formatNumero(p.movimentacao_anual || p.movimentacao, 0) : '']);
                abaTodosDados.push([`Produto ${idx + 1} - Origem - País`, p.origem_pais_nome || p.origem_pais || '']);
                abaTodosDados.push([`Produto ${idx + 1} - Origem - Estado`, p.origem_estado_nome || p.origem_estado || '']);
                abaTodosDados.push([`Produto ${idx + 1} - Origem - Município`, p.origem_municipio_nome || p.origem_municipio || '']);
                abaTodosDados.push([`Produto ${idx + 1} - Destino - País`, p.destino_pais_nome || p.destino_pais || '']);
                abaTodosDados.push([`Produto ${idx + 1} - Destino - Estado`, p.destino_estado_nome || p.destino_estado || '']);
                abaTodosDados.push([`Produto ${idx + 1} - Destino - Município`, p.destino_municipio_nome || p.destino_municipio || '']);
                abaTodosDados.push([`Produto ${idx + 1} - Distância (km)`, p.distancia ? formatNumero(p.distancia) : '']);
                abaTodosDados.push([`Produto ${idx + 1} - Modalidade`, p.modalidade || '']);
                abaTodosDados.push([`Produto ${idx + 1} - Acondicionamento`, p.acondicionamento || '']);
                if (p.observacoes) {
                    abaTodosDados.push([`Produto ${idx + 1} - Observações`, p.observacoes]);
                }
            });
            
            // Card 4 - Produto Principal
            abaTodosDados.push(['--- PRODUTO PRINCIPAL ---', '']);
            abaTodosDados.push(['Q9. Produto Mais Representativo', formData.produtoPrincipal || 'N/I']);
            abaTodosDados.push(['Q10. Agrupamento do Produto', formData.agrupamentoProdutoNome || formData.agrupamentoProduto || 'N/I']);
            abaTodosDados.push(['Q10b. Outro Produto', formData.outroProduto || '']);
            
            // Card 5 - Transporte
            abaTodosDados.push(['--- CARACTERÍSTICAS DO TRANSPORTE ---', '']);
            abaTodosDados.push(['Q11. Tipo de Transporte', formData.tipoTransporteNome || formData.tipoTransporte || 'N/I']);
            abaTodosDados.push(['Q12. Origem - País', formData.origemPaisNome || formData.origemPais || 'N/I']);
            abaTodosDados.push(['Q12b. Origem - Estado', formData.origemEstadoNome || formData.origemEstado || 'N/I']);
            abaTodosDados.push(['Q12c. Origem - Município', formData.origemMunicipioNome || formData.origemMunicipio || 'N/I']);
            abaTodosDados.push(['Q13. Destino - País', formData.destinoPaisNome || formData.destinoPais || 'N/I']);
            abaTodosDados.push(['Q13b. Destino - Estado', formData.destinoEstadoNome || formData.destinoEstado || 'N/I']);
            abaTodosDados.push(['Q13c. Destino - Município', formData.destinoMunicipioNome || formData.destinoMunicipio || 'N/I']);
            abaTodosDados.push(['Q14. Distância do Deslocamento', formData.distancia ? `${formatNumero(formData.distancia)} km` : 'N/I']);
            abaTodosDados.push(['Q15. Tem Paradas?', formData.temParadas === 'sim' ? 'Sim' : (formData.temParadas === 'nao' ? 'Não' : 'N/I')]);
            abaTodosDados.push(['Q16. Número de Paradas', formData.numParadas || '']);
            abaTodosDados.push(['Q17. Modais Utilizados', Array.isArray(formData.modos) ? formData.modos.join(', ') : formData.modos || 'N/I']);
            abaTodosDados.push(['Q18. Configuração do Veículo Rodoviário', formData.configVeiculoNome || formData.configVeiculo || '']);
            abaTodosDados.push(['Q19. Capacidade Utilizada (%)', formData.capacidadeUtilizada ? `${formatNumero(formData.capacidadeUtilizada)}%` : 'N/I']);
            abaTodosDados.push(['Q20. Peso da Carga', formData.pesoCarga ? formatNumero(formData.pesoCarga, 0) : 'N/I']);
            abaTodosDados.push(['Q21. Unidade de Peso', formData.unidadePesoNome || formData.unidadePeso || 'N/I']);
            abaTodosDados.push(['Q22. Custo Total do Transporte', formatMoeda(formData.custoTransporte)]);
            abaTodosDados.push(['Q23. Valor Total da Carga', formatMoeda(formData.valorCarga)]);
            abaTodosDados.push(['Q24. Tipo de Embalagem', formData.tipoEmbalagemNome || formData.tipoEmbalagem || 'N/I']);
            abaTodosDados.push(['Q25. Carga Perigosa?', formData.cargaPerigosa === 'sim' ? 'Sim' : (formData.cargaPerigosa === 'nao' ? 'Não' : 'N/I')]);
            abaTodosDados.push(['Q26. Tempo de Deslocamento', `${formData.tempoDias || 0} dia(s), ${formData.tempoHoras || 0} hora(s), ${formData.tempoMinutos || 0} minuto(s)`]);
            abaTodosDados.push(['Q27. Frequência de Deslocamento', formData.frequenciaNome || formData.frequencia || 'N/I']);
            abaTodosDados.push(['Q28. Observações sobre Sazonalidade', formData.observacoesSazonalidade || '']);
            
            // Card 6 - Fatores de Decisão
            abaTodosDados.push(['--- FATORES DE DECISÃO MODAL ---', '']);
            abaTodosDados.push(['Q29. Importância do Custo', formData.importanciaCustoNome || formData.importanciaCusto || 'N/I']);
            abaTodosDados.push(['Q30. Variação Tolerada - Custo (%)', formData.variacaoCusto || '']);
            abaTodosDados.push(['Q31. Importância do Tempo', formData.importanciaTempoNome || formData.importanciaTempo || 'N/I']);
            abaTodosDados.push(['Q32. Variação Tolerada - Tempo (%)', formData.variacaoTempo || '']);
            abaTodosDados.push(['Q33. Importância da Confiabilidade', formData.importanciaConfiabilidadeNome || formData.importanciaConfiabilidade || 'N/I']);
            abaTodosDados.push(['Q34. Variação Tolerada - Confiabilidade (%)', formData.variacaoConfiabilidade || '']);
            abaTodosDados.push(['Q35. Importância da Segurança', formData.importanciaSegurancaNome || formData.importanciaSeguranca || 'N/I']);
            abaTodosDados.push(['Q36. Variação Tolerada - Segurança (%)', formData.variacaoSeguranca || '']);
            abaTodosDados.push(['Q37. Importância da Capacidade', formData.importanciaCapacidadeNome || formData.importanciaCapacidade || 'N/I']);
            abaTodosDados.push(['Q38. Variação Tolerada - Capacidade (%)', formData.variacaoCapacidade || '']);
            
            // Card 7 - Estratégico
            abaTodosDados.push(['--- POSICIONAMENTO ESTRATÉGICO ---', '']);
            abaTodosDados.push(['Q39. Tipo de Cadeia', formData.tipoCadeiaNome || formData.tipoCadeia || 'N/I']);
            abaTodosDados.push(['Q40. Modais Alternativos', Array.isArray(formData.modaisAlternativos) ? formData.modaisAlternativos.join(', ') : formData.modaisAlternativos || 'N/I']);
            abaTodosDados.push(['Q41. Fator Adicional', formData.fatorAdicional || '']);
            
            // Card 8 - Infraestrutura
            abaTodosDados.push(['--- AVALIAÇÃO DA INFRAESTRUTURA ---', '']);
            abaTodosDados.push(['Q42. Dificuldades', Array.isArray(formData.dificuldades) ? formData.dificuldades.join('; ') : formData.dificuldades || 'N/I']);
            abaTodosDados.push(['Q43. Detalhe das Dificuldades', formData.detalheDificuldade || '']);
            
            const wsTodosDados = XLSX.utils.aoa_to_sheet(abaTodosDados);
            wsTodosDados['!cols'] = [{ wch: 50 }, { wch: 70 }];
            XLSX.utils.book_append_sheet(wb, wsTodosDados, '5. Todos os Dados');

            // Retorna ArrayBuffer
            const ab = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            return ab;
        },

        /**
         * Faz o download de um ArrayBuffer com o nome de arquivo.
         */
        downloadArrayBuffer(ab, filename) {
            try {
                const blob = new Blob([ab], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                return true;
            } catch (err) {
                console.error('Erro ao baixar XLSX:', err);
                return false;
            }
        },
        generateXlsxFromFormData(formData, opts = {}) {
            // opts: { success: boolean|null, errorDetails: string|object, filename: string, statusLabel: string }
            const { success = true, errorDetails = null, filename, statusLabel = null } = opts;
            const labelMap = opts.labels || {};
            try {
                const wb = XLSX.utils.book_new();

                // Mapeamento de campos código → campo nome amigável (igual ao createWorkbookArrayBuffer)
                const CODE_TO_NAME_MAP = {
                    'funcao': 'funcaoNome',
                    'tipoEmpresa': 'tipoEmpresaNome',
                    'municipio': 'municipioNome',
                    'agrupamentoProduto': 'agrupamentoProdutoNome',
                    'tipoTransporte': 'tipoTransporteNome',
                    'origemPais': 'origemPaisNome',
                    'origemEstado': 'origemEstadoNome',
                    'origemMunicipio': 'origemMunicipioNome',
                    'destinoPais': 'destinoPaisNome',
                    'destinoEstado': 'destinoEstadoNome',
                    'destinoMunicipio': 'destinoMunicipioNome',
                    'configVeiculo': 'configVeiculoNome',
                    'unidadePeso': 'unidadePesoNome',
                    'tipoEmbalagem': 'tipoEmbalagemNome',
                    'frequencia': 'frequenciaNome',
                    'importanciaCusto': 'importanciaCustoNome',
                    'importanciaTempo': 'importanciaTempoNome',
                    'importanciaConfiabilidade': 'importanciaConfiabilidadeNome',
                    'importanciaSeguranca': 'importanciaSegurancaNome',
                    'importanciaCapacidade': 'importanciaCapacidadeNome',
                    'tipoCadeia': 'tipoCadeiaNome'
                };

                const getDisplayValue = (key) => {
                    if (CODE_TO_NAME_MAP[key] && formData[CODE_TO_NAME_MAP[key]]) {
                        return formData[CODE_TO_NAME_MAP[key]];
                    }
                    return formData[key];
                };

                // Aba 1: Dados Principais (colunas similares à view da page "respostas")
                const FIELDS_ORDER_TOP = [
                    'tipoResponsavel', 'idResponsavel',
                    'nome', 'funcao', 'outraFuncao', 'telefone', 'email', 'estadoCivil', 'nacionalidade', 'ufNaturalidade', 'municipioNaturalidade',
                    'tipoEmpresa', 'outroTipo', 'razaoSocial', 'nomeEmpresa', 'municipio', 'cnpj', 'nomeFantasia', 'nomeFantasiaReceita', 'situacaoCadastralReceita', 'atividadePrincipalReceita', 'logradouro', 'numero', 'complemento', 'bairro', 'cep',
                    'produtoPrincipal', 'agrupamentoProduto', 'outroProduto', 'observacoesProdutoPrincipal',
                    'tipoTransporte', 'origemPais', 'origemEstado', 'origemMunicipio', 'destinoPais', 'destinoEstado', 'destinoMunicipio', 'distancia', 'temParadas', 'numParadas', 'modos', 'configVeiculo', 'capacidadeUtilizada', 'pesoCarga', 'unidadePeso', 'custoTransporte', 'valorCarga', 'tipoEmbalagem', 'cargaPerigosa', 'tempoDias', 'tempoHoras', 'tempoMinutos', 'frequencia', 'frequenciaDiaria', 'frequenciaOutra', 'observacoesSazonalidade',
                    'importanciaCusto', 'variacaoCusto', 'importanciaTempo', 'variacaoTempo', 'importanciaConfiabilidade', 'variacaoConfiabilidade', 'importanciaSeguranca', 'variacaoSeguranca', 'importanciaCapacidade', 'variacaoCapacidade',
                    'tipoCadeia', 'modaisAlternativos', 'fatorAdicional', 'dificuldades', 'detalheDificuldade',
                    'transportaCarga', 'consentimento'
                ];
                const allKeys = FIELDS_ORDER_TOP.filter(k => formData.hasOwnProperty(k));
                const headerRow = allKeys.map(k => labelMap[k] || k);
                const valuesRow = allKeys.map(k => {
                    // ⭐ USAR VALOR AMIGÁVEL quando disponível
                    let v = getDisplayValue(k);
                    if (Array.isArray(v)) return v.join(', ');
                    if (typeof v === 'object' && v !== null) return JSON.stringify(v);
                    return v == null ? '' : String(v);
                });
                const sheetColumns = [headerRow, valuesRow];
                const wsCols = XLSX.utils.aoa_to_sheet(sheetColumns);
                XLSX.utils.book_append_sheet(wb, wsCols, 'Dados (Colunas)');

                // Aba 1b: Dados Principais em formato Campo/Valor (vertical)
                const dadosPrincipais = [['Campo', 'Valor']];

                // Pular campos auxiliares (terminados em Nome)
                Object.keys(formData).forEach(key => {
                    if (key === 'produtos') return; // produtos em aba separada
                    // Pular campos que terminam com Nome (são auxiliares)
                    if (key.endsWith('Nome') && CODE_TO_NAME_MAP[key.slice(0, -4)]) return;

                    let label = labelMap[key] || key;
                    // ⭐ USAR VALOR AMIGÁVEL quando disponível
                    let value = getDisplayValue(key);

                    if (Array.isArray(value)) value = value.join(', ');
                    if (typeof value === 'object' && value !== null) value = JSON.stringify(value);

                    dadosPrincipais.push([label, value == null ? '' : String(value)]);
                });

                const ws1 = XLSX.utils.aoa_to_sheet(dadosPrincipais);
                XLSX.utils.book_append_sheet(wb, ws1, 'Dados (Campo-Valor)');

                // Aba 2: Produtos (tabela) - usar campos de NOME
                const produtos = Array.isArray(formData.produtos) ? formData.produtos : [];
                
                // Campos a ocultar dos produtos
                const PRODUTO_HIDE_KEYS = [
                    'origemPaisCodigo', 'origemEstadoUf', 'origemMunicipioCodigo',
                    'destinoPaisCodigo', 'destinoEstadoUf', 'destinoMunicipioCodigo',
                    'origemText', 'destinoText'
                ];
                
                if (produtos.length > 0) {
                        // Build ordered header using campos de NOME
                        const preferred = ['carga', 'movimentacao', 'origemPaisNome', 'origemEstadoNome', 'origemMunicipioNome', 'destinoPaisNome', 'destinoEstadoNome', 'destinoMunicipioNome', 'distancia', 'modalidade', 'acondicionamento', 'observacoes', 'confirmado'];
                        const allKeysProd = Array.from(new Set(produtos.flatMap(p => Object.keys(p))));
                        const filteredKeys = allKeysProd.filter(k => !PRODUTO_HIDE_KEYS.includes(k));
                        const orderedProdKeys = preferred.filter(k => filteredKeys.includes(k)).concat(filteredKeys.filter(k => !preferred.includes(k)));
                        
                        const produtoLabelMap = {
                            'carga': 'Produto',
                            'movimentacao': 'Movimentação (ton/ano)',
                            'origemPaisNome': 'Origem - País',
                            'origemEstadoNome': 'Origem - Estado',
                            'origemMunicipioNome': 'Origem - Município',
                            'destinoPaisNome': 'Destino - País',
                            'destinoEstadoNome': 'Destino - Estado',
                            'destinoMunicipioNome': 'Destino - Município',
                            'distancia': 'Distância (km)',
                            'modalidade': 'Modalidade',
                            'acondicionamento': 'Acondicionamento',
                            'observacoes': 'Observações',
                            'confirmado': 'Confirmado'
                        };
                        const headerProdLabels = orderedProdKeys.map(k => produtoLabelMap[k] || labelMap[k] || k);
                        const rowsProd = [headerProdLabels];
                        produtos.forEach(p => {
                            const rowProd = orderedProdKeys.map(k => {
                                let v = p[k];
                                if (Array.isArray(v)) return v.join(', ');
                                if (typeof v === 'object' && v !== null) return JSON.stringify(v);
                                return v == null ? '' : String(v);
                            });
                            rowsProd.push(rowProd);
                        });
                        const produtosSheet = XLSX.utils.aoa_to_sheet(rowsProd);
                        XLSX.utils.book_append_sheet(wb, produtosSheet, 'Produtos');
                } else {
                    // Even if empty, add a placeholder sheet
                    const emptySheet = XLSX.utils.aoa_to_sheet([['Nenhum produto informado']]);
                    XLSX.utils.book_append_sheet(wb, emptySheet, 'Produtos');
                }

                // Aba 3: Status / Log (com Timestamp)
                const statusText = statusLabel || (success ? 'SUCESSO' : 'ERRO');
                const timestamp = new Date().toISOString();
                const statusSheet = XLSX.utils.aoa_to_sheet([['Status', statusText], ['Timestamp', timestamp]]);
                // Tentar aplicar estilos (pode não ser suportado por todos os browsers/editores)
                try {
                    if (success) {
                        statusSheet['B1'].s = { fill: { fgColor: { rgb: 'C6EFCE' } }, font: { color: { rgb: '006100' } } };
                    } else {
                        statusSheet['B1'].s = { fill: { fgColor: { rgb: 'FFD7D7' } }, font: { color: { rgb: '9C0006' } } };
                    }
                } catch (err) {
                    // Silencioso: estilos podem não ser suportados em libs antigas
                }
                XLSX.utils.book_append_sheet(wb, statusSheet, 'Status');

                if (!success && errorDetails) {
                    const logs = typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2);
                    const logLines = [['Log (detalhado)']].concat(logs.split('\n').map(l => [l]));
                    const logSheet = XLSX.utils.aoa_to_sheet(logLines);
                    XLSX.utils.book_append_sheet(wb, logSheet, 'Log de Erro');
                }

                // Default filename
                const fileName = filename || `PLI2050_Resposta_${(formData.nomeEmpresa || formData.razaoSocial || 'resposta')}_${new Date().toISOString().split('T')[0]}.xlsx`;

                // Gerar apenas o ArrayBuffer (sem download automático)
                // O download deve ser feito externamente via downloadArrayBuffer()
                const ab = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

                return { success: true, filename: fileName, arrayBuffer: ab };
            } catch (err) {
                console.error('Erro ao gerar XLSX:', err);
                return { success: false, error: err };
            }
        }
    };

    // Export simple default label maps (field -> label) for top-level fields
    window.ExcelLabels = {
        // Entrevistado
        tipoResponsavel: 'Tipo de Responsável',
        idResponsavel: 'ID do Responsável',
        nome: 'Nome',
        funcao: 'Função',
        outraFuncao: 'Outra Função',
        telefone: 'Telefone',
        email: 'E-mail',
        estadoCivil: 'Estado Civil',
        nacionalidade: 'Nacionalidade',
        ufNaturalidade: 'UF Naturalidade',
        municipioNaturalidade: 'Município Naturalidade',
        
        // Empresa
        tipoEmpresa: 'Tipo de Empresa',
        outroTipo: 'Outro Tipo de Empresa',
        razaoSocial: 'Razão Social',
        nomeEmpresa: 'Nome da Empresa',
        municipio: 'Município da Empresa',
        cnpj: 'CNPJ',
        nomeFantasia: 'Nome Fantasia',
        nomeFantasiaReceita: 'Nome Fantasia (Receita)',
        situacaoCadastralReceita: 'Situação Cadastral (Receita)',
        atividadePrincipalReceita: 'Atividade Principal (Receita)',
        logradouro: 'Logradouro',
        numero: 'Número',
        complemento: 'Complemento',
        bairro: 'Bairro',
        cep: 'CEP',
        
        // Produto
        produtoPrincipal: 'Produto Principal',
        agrupamentoProduto: 'Agrupamento do Produto',
        outroProduto: 'Outro Produto',
        observacoesProdutoPrincipal: 'Observações do Produto Principal',
        
        // Transporte
        tipoTransporte: 'Tipo de Transporte',
        origemPais: 'Origem - País',
        origemEstado: 'Origem - Estado',
        origemMunicipio: 'Origem - Município',
        destinoPais: 'Destino - País',
        destinoEstado: 'Destino - Estado',
        destinoMunicipio: 'Destino - Município',
        distancia: 'Distância (km)',
        temParadas: 'Tem Paradas?',
        numParadas: 'Número de Paradas',
        modos: 'Modos de Transporte',
        configVeiculo: 'Configuração do Veículo',
        capacidadeUtilizada: 'Capacidade Utilizada (%)',
        pesoCarga: 'Peso da Carga',
        unidadePeso: 'Unidade de Peso',
        custoTransporte: 'Custo de Transporte (R$)',
        valorCarga: 'Valor da Carga (R$)',
        tipoEmbalagem: 'Tipo de Embalagem',
        cargaPerigosa: 'Carga Perigosa?',
        tempoDias: 'Tempo - Dias',
        tempoHoras: 'Tempo - Horas',
        tempoMinutos: 'Tempo - Minutos',
        frequencia: 'Frequência',
        frequenciaDiaria: 'Frequência Diária',
        frequenciaOutra: 'Outra Frequência',
        observacoesSazonalidade: 'Observações de Sazonalidade',
        
        // Fatores de Decisão
        importanciaCusto: 'Importância do Custo',
        variacaoCusto: 'Variação Tolerada - Custo (%)',
        importanciaTempo: 'Importância do Tempo',
        variacaoTempo: 'Variação Tolerada - Tempo (%)',
        importanciaConfiabilidade: 'Importância da Confiabilidade',
        variacaoConfiabilidade: 'Variação Tolerada - Confiabilidade (%)',
        importanciaSeguranca: 'Importância da Segurança',
        variacaoSeguranca: 'Variação Tolerada - Segurança (%)',
        importanciaCapacidade: 'Importância da Capacidade',
        variacaoCapacidade: 'Variação Tolerada - Capacidade (%)',
        
        // Estratégico
        tipoCadeia: 'Tipo de Cadeia',
        modaisAlternativos: 'Modais Alternativos',
        fatorAdicional: 'Fator Adicional',
        dificuldades: 'Dificuldades',
        detalheDificuldade: 'Detalhes das Dificuldades',
        
        // Flags
        transportaCarga: 'Transporta Carga?',
        consentimento: 'Consentimento'
    };
    window.ExcelGenerator = ExcelGenerator;

})(window);
