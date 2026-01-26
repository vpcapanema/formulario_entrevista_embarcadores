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

                // Default behavior: download the final workbook
                const ab = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([ab], { type: 'application/octet-stream' });
                XLSX.writeFile(wb, fileName);

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
