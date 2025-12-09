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

            const allKeys = Object.keys(formData).filter(k => k !== 'produtos');
            const headerRow = allKeys.map(k => labelMap[k] || k);
            const valuesRow = allKeys.map(k => {
                let v = formData[k];
                if (Array.isArray(v)) return v.join(', ');
                if (typeof v === 'object' && v !== null) return JSON.stringify(v);
                return v == null ? '' : String(v);
            });
            const sheetColumns = [headerRow, valuesRow];
            const wsCols = XLSX.utils.aoa_to_sheet(sheetColumns);
            XLSX.utils.book_append_sheet(wb, wsCols, 'Dados (Colunas)');

            const dadosPrincipais = [['Campo', 'Valor']];
            Object.keys(formData).forEach(key => {
                if (key === 'produtos') return;
                let label = labelMap[key] || key;
                let value = formData[key];
                if (Array.isArray(value)) value = value.join(', ');
                if (typeof value === 'object' && value !== null) value = JSON.stringify(value);
                dadosPrincipais.push([label, value == null ? '' : String(value)]);
            });
            const ws1 = XLSX.utils.aoa_to_sheet(dadosPrincipais);
            XLSX.utils.book_append_sheet(wb, ws1, 'Dados (Campo-Valor)');

            const produtos = Array.isArray(formData.produtos) ? formData.produtos : [];
            if (produtos.length > 0) {
                // Determinar chaves (ordenando preferenciais)
                const preferred = ['carga', 'movimentacao', 'origemPais', 'origemEstado', 'origemMunicipio', 'destinoPais', 'destinoEstado', 'destinoMunicipio', 'distancia', 'modalidade', 'acondicionamento', 'observacoes'];
                const allKeys = Array.from(new Set(produtos.flatMap(p => Object.keys(p))));
                const orderedKeys = preferred.concat(allKeys.filter(k => !preferred.includes(k)));
                const headerLabels = orderedKeys.map(k => labelMap[k] || k);
                // Construir rows
                const rows = [headerLabels];
                produtos.forEach(p => {
                    const row = orderedKeys.map(k => {
                        let v = p[k];
                        if (Array.isArray(v)) return v.join(', ');
                        if (typeof v === 'object' && v !== null) return JSON.stringify(v);
                        return v == null ? '' : String(v);
                    });
                    rows.push(row);
                });
                const wsProdutos = XLSX.utils.aoa_to_sheet(rows);
                XLSX.utils.book_append_sheet(wb, wsProdutos, 'Produtos');
            } else {
                const emptySheet = XLSX.utils.aoa_to_sheet([['Nenhum produto informado']]);
                XLSX.utils.book_append_sheet(wb, emptySheet, 'Produtos');
            }

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

                // Aba 1: Dados Principais (colunas similares à view da page "respostas")
                const allKeys = Object.keys(formData).filter(k => k !== 'produtos');
                const headerRow = allKeys.map(k => labelMap[k] || k);
                const valuesRow = allKeys.map(k => {
                    let v = formData[k];
                    if (Array.isArray(v)) return v.join(', ');
                    if (typeof v === 'object' && v !== null) return JSON.stringify(v);
                    return v == null ? '' : String(v);
                });
                const sheetColumns = [headerRow, valuesRow];
                const wsCols = XLSX.utils.aoa_to_sheet(sheetColumns);
                XLSX.utils.book_append_sheet(wb, wsCols, 'Dados (Colunas)');

                // Aba 1b: Dados Principais em formato Campo/Valor (vertical)
                const dadosPrincipais = [['Campo', 'Valor']];

                // Normalize keys to user-friendly labels (map optional)
                // labelMap was already defined above

                // We only list top-level fields (excluding produtos)
                Object.keys(formData).forEach(key => {
                    if (key === 'produtos') return; // produtos em aba separada

                    let label = labelMap[key] || key;
                    let value = formData[key];

                    if (Array.isArray(value)) value = value.join(', ');
                    if (typeof value === 'object' && value !== null) value = JSON.stringify(value);

                    dadosPrincipais.push([label, value == null ? '' : String(value)]);
                });

                const ws1 = XLSX.utils.aoa_to_sheet(dadosPrincipais);
                XLSX.utils.book_append_sheet(wb, ws1, 'Dados (Campo-Valor)');

                // Aba 2: Produtos (tabela)
                const produtos = Array.isArray(formData.produtos) ? formData.produtos : [];
                if (produtos.length > 0) {
                        // Build ordered header and rows using labelMap to provide readable column names
                        const preferred = ['carga', 'movimentacao', 'origemPais', 'origemEstado', 'origemMunicipio', 'destinoPais', 'destinoEstado', 'destinoMunicipio', 'distancia', 'modalidade', 'acondicionamento', 'observacoes'];
                        const allKeysProd = Array.from(new Set(produtos.flatMap(p => Object.keys(p))));
                        const orderedProdKeys = preferred.concat(allKeysProd.filter(k => !preferred.includes(k)));
                        const headerProdLabels = orderedProdKeys.map(k => labelMap[k] || k);
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
        nome: 'Nome',
        funcao: 'Função',
        telefone: 'Telefone',
        email: 'Email',
        razaoSocial: 'Razão Social',
        nomeEmpresa: 'Nome da Empresa',
        cnpj: 'CNPJ',
        produtoPrincipal: 'Produto Principal',
        agrupamentoProduto: 'Agrupamento',
        tipoTransporte: 'Tipo de Transporte',
        origemPais: 'Origem - País',
        origemEstado: 'Origem - Estado',
        origemMunicipio: 'Origem - Município',
        destinoPais: 'Destino - País',
        destinoEstado: 'Destino - Estado',
        destinoMunicipio: 'Destino - Município',
        distancia: 'Distância (km)'
    };
    window.ExcelGenerator = ExcelGenerator;

})(window);
