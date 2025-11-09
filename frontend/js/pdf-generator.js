/**
 * ============================================================
 * PDF-GENERATOR - Geração de Relatórios PDF Estilizados
 * ============================================================
 * Gera PDF com cabeçalho padrão PLI e respostas formatadas
 */

const PDFGenerator = {
    
    // Cores padrão PLI
    colors: {
        primary: '#1e40af',      // Azul escuro
        secondary: '#3b82f6',    // Azul médio
        accent: '#60a5fa',       // Azul claro
        text: '#1f2937',         // Cinza escuro
        textLight: '#6b7280',    // Cinza médio
        border: '#e5e7eb',       // Cinza claro
        background: '#f9fafb'    // Fundo
    },
    
    /**
     * Gera PDF com os dados do formulário após submissão bem-sucedida
     * ✅ VERSÃO COMPLETA: Inclui TODOS os 55 campos + campos condicionais
     */
    generatePDF(formData, response) {
        try {
            console.log('📄 Gerando PDF COMPLETO (55+ campos)...');
            
            // Criar documento jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            let yPosition = 20;
            
            // ===== CABEÇALHO PADRÃO PLI =====
            yPosition = this._addHeader(doc, yPosition);
            
            // ===== INFORMAÇÕES DA PESQUISA =====
            yPosition = this._addPesquisaInfo(doc, yPosition, response);
            
            // ===== CARD 0: RESPONSÁVEL PELO PREENCHIMENTO =====
            const tipoResponsavel = formData.tipoResponsavel || 'Não informado';
            const camposCard0 = [
                { label: 'Q0. Quem está preenchendo', value: tipoResponsavel === 'entrevistador' ? 'Entrevistador' : 'Entrevistado' }
            ];
            if (tipoResponsavel === 'entrevistador' && formData.idEntrevistador) {
                camposCard0.push({ label: 'ID do Entrevistador', value: formData.idEntrevistador });
            }
            yPosition = this._addSection(doc, yPosition, 'CARD 0 - RESPONSÁVEL PELO PREENCHIMENTO', formData, camposCard0);
            
            // ===== CARD 1: DADOS DO ENTREVISTADO =====
            const camposCard1 = [
                { label: 'Q1. Nome', value: formData.nome },
                { label: 'Q2. Função', value: formData.funcao }
            ];
            if (formData.funcao === 'outro' || formData.funcao === 'Outro') {
                camposCard1.push({ label: 'Q2b. Outra Função (especificada)', value: formData.outraFuncao });
            }
            camposCard1.push(
                { label: 'Q3. Telefone', value: formData.telefone },
                { label: 'Q4. E-mail', value: formData.email }
            );
            yPosition = this._addSection(doc, yPosition, 'CARD 1 - DADOS DO ENTREVISTADO', formData, camposCard1);
            
            // ===== CARD 2: DADOS DA EMPRESA =====
            const camposCard2 = [
                { label: 'Q5. Tipo de Empresa', value: formData.tipoEmpresa }
            ];
            if (formData.tipoEmpresa === 'outro') {
                camposCard2.push({ label: 'Q5b. Outro Tipo (especificado)', value: formData.outroTipo });
            }
            camposCard2.push(
                { label: 'Q6a. CNPJ', value: this._formatCNPJ(formData.cnpj) },
                { label: 'Q6b. Razão Social', value: formData.razaoSocial },
                { label: 'Q6c. Nome Fantasia (Receita Federal)', value: formData.nomeFantasia || 'Não informado' },
                { label: 'Q6d. Situação Cadastral (Receita Federal)', value: formData.situacaoCadastral || 'Não informado' },
                { label: 'Q6e. Atividade Principal CNAE (Receita Federal)', value: formData.atividadePrincipal || 'Não informado' },
                { label: 'Q7. Município da Empresa', value: formData.municipio }
            );
            yPosition = this._addSection(doc, yPosition, 'CARD 2 - DADOS DA EMPRESA', formData, camposCard2);
            
            // ===== CARD 3: PRODUTOS TRANSPORTADOS (TABELA Q8) =====
            if (formData.produtos && formData.produtos.length > 0) {
                yPosition = this._addProdutosTable(doc, yPosition, formData.produtos);
            } else {
                yPosition = this._addSection(doc, yPosition, 'CARD 3 - PRODUTOS TRANSPORTADOS (Q8)', formData, [
                    { label: 'Q8. Produtos', value: 'Nenhum produto cadastrado' }
                ]);
            }
            
            // ===== CARD 4: PRODUTO PRINCIPAL =====
            const camposCard4 = [
                { label: 'Q9. Produto Mais Representativo', value: formData.produtoPrincipal },
                { label: 'Q10. Agrupamento do Produto', value: formData.agrupamentoProduto }
            ];
            if (formData.agrupamentoProduto === 'outro-produto') {
                camposCard4.push({ label: 'Q10b. Outro Produto (especificado)', value: formData.outroProduto });
            }
            yPosition = this._addSection(doc, yPosition, 'CARD 4 - PRODUTO PRINCIPAL', formData, camposCard4);
            
            // ===== CARD 5: CARACTERÍSTICAS DO TRANSPORTE =====
            const camposCard5 = [
                { label: 'Q11. Tipo de Transporte', value: this._formatTipoTransporte(formData.tipoTransporte) },
                { label: 'Q12. Origem - País', value: formData.origemPais || 'Não informado' },
                { label: 'Q12b. Origem - Estado', value: formData.origemEstado || 'Não informado' },
                { label: 'Q12c. Origem - Município', value: formData.origemMunicipio || 'Não informado' },
                { label: 'Q13. Destino - País', value: formData.destinoPais || 'Não informado' },
                { label: 'Q13b. Destino - Estado', value: formData.destinoEstado || 'Não informado' },
                { label: 'Q13c. Destino - Município', value: formData.destinoMunicipio || 'Não informado' },
                { label: 'Q14. Distância do Deslocamento', value: formData.distancia ? `${formData.distancia} km` : 'Não informado' },
                { label: 'Q15. Tem Paradas?', value: formData.temParadas === 'sim' ? 'Sim' : (formData.temParadas === 'nao' ? 'Não' : 'Não informado') }
            ];
            if (formData.temParadas === 'sim') {
                const numParadas = formData.numParadas === '11' ? `Mais de 10 (${formData.numParadasExato || 'não especificado'})` : formData.numParadas;
                camposCard5.push({ label: 'Q16. Número de Paradas', value: numParadas });
            }
            camposCard5.push({ label: 'Q17. Modais Utilizados', value: this._formatModais(formData.modos) });
            if (formData.modos && formData.modos.includes('rodoviario')) {
                camposCard5.push({ label: 'Q18. Configuração do Veículo Rodoviário', value: formData.configVeiculo || 'Não informado' });
            }
            camposCard5.push(
                { label: 'Q19. Capacidade Utilizada (%)', value: formData.capacidadeUtilizada ? `${formData.capacidadeUtilizada}%` : 'Não informado' },
                { label: 'Q20. Peso da Carga', value: formData.pesoCarga ? `${formData.pesoCarga}` : 'Não informado' },
                { label: 'Q21. Unidade de Peso', value: formData.unidadePeso || 'Não informado' },
                { label: 'Q22. Custo Total do Transporte', value: this._formatMoeda(formData.custoTransporte) },
                { label: 'Q23. Valor Total da Carga', value: this._formatMoeda(formData.valorCarga) },
                { label: 'Q24. Tipo de Embalagem', value: formData.tipoEmbalagem || 'Não informado' },
                { label: 'Q25. Carga Perigosa?', value: formData.cargaPerigosa === 'sim' ? 'Sim' : (formData.cargaPerigosa === 'nao' ? 'Não' : 'Não informado') },
                { label: 'Q26. Tempo de Deslocamento', value: this._formatTempo(formData.tempoDias, formData.tempoHoras, formData.tempoMinutos) },
                { label: 'Q27. Frequência de Deslocamento', value: formData.frequencia || 'Não informado' }
            );
            if (formData.frequencia === 'diaria') {
                camposCard5.push({ label: 'Q28. Quantas vezes por dia?', value: formData.frequenciaDiaria || 'Não informado' });
            }
            if (formData.frequencia === 'outra') {
                camposCard5.push({ label: 'Q28b. Frequência Outra (especificada)', value: formData.frequenciaOutra });
            }
            yPosition = this._addSection(doc, yPosition, 'CARD 5 - CARACTERÍSTICAS DO TRANSPORTE', formData, camposCard5);
            
            // ===== CARD 6: FATORES DE DECISÃO MODAL =====
            const camposCard6 = [
                { label: 'Q29. Importância do CUSTO', value: formData.importanciaCusto || 'Não informado' },
                { label: 'Q30. Variação % de Custo', value: formData.variacaoCusto ? `${formData.variacaoCusto}%` : 'Não informado' },
                { label: 'Q31. Importância do TEMPO', value: formData.importanciaTempo || 'Não informado' },
                { label: 'Q32. Variação % de Tempo', value: formData.variacaoTempo ? `${formData.variacaoTempo}%` : 'Não informado' },
                { label: 'Q33. Importância da CONFIABILIDADE', value: formData.importanciaConfiabilidade || 'Não informado' },
                { label: 'Q34. Variação % de Confiabilidade', value: formData.variacaoConfiabilidade ? `${formData.variacaoConfiabilidade}%` : 'Não informado' },
                { label: 'Q35. Importância da SEGURANÇA', value: formData.importanciaSeguranca || 'Não informado' },
                { label: 'Q36. Variação % de Segurança', value: formData.variacaoSeguranca ? `${formData.variacaoSeguranca}%` : 'Não informado' },
                { label: 'Q37. Importância da CAPACIDADE', value: formData.importanciaCapacidade || 'Não informado' },
                { label: 'Q38. Variação % de Capacidade', value: formData.variacaoCapacidade ? `${formData.variacaoCapacidade}%` : 'Não informado' }
            ];
            yPosition = this._addSection(doc, yPosition, 'CARD 6 - FATORES DE DECISÃO MODAL', formData, camposCard6);
            
            // ===== CARD 7: ANÁLISE ESTRATÉGICA =====
            const camposCard7 = [
                { label: 'Q39. Tipo de Cadeia', value: formData.tipoCadeia || 'Não informado' },
                { label: 'Q40. Modais Alternativos', value: this._formatModaisAlternativos(formData.modaisAlternativos) },
                { label: 'Q41. Fator Adicional', value: formData.fatorAdicional || 'Não informado' }
            ];
            yPosition = this._addSection(doc, yPosition, 'CARD 7 - ANÁLISE ESTRATÉGICA', formData, camposCard7);
            
            // ===== CARD 8: DIFICULDADES LOGÍSTICAS =====
            const camposCard8 = [
                { label: 'Q42. Principais Dificuldades', value: this._formatDificuldades(formData.dificuldades) },
                { label: 'Q43. Detalhamento das Dificuldades', value: formData.detalheDificuldade || 'Não informado' }
            ];
            yPosition = this._addSection(doc, yPosition, 'CARD 8 - DIFICULDADES LOGÍSTICAS', formData, camposCard8);
            
            // ===== RODAPÉ =====
            this._addFooter(doc);
            
            // ===== SALVAR PDF =====
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const nomeArquivo = `PLI2050_Pesquisa_${response.id_pesquisa || 'Nova'}_${timestamp}.pdf`;
            
            // Método 1: Tentar doc.save() padrão
            try {
                doc.save(nomeArquivo);
                console.log('✅ PDF COMPLETO gerado via doc.save():', nomeArquivo);
            } catch (e) {
                // Método 2: Fallback com Blob e createObjectURL
                console.warn('⚠️ doc.save() falhou, usando fallback com Blob');
                const pdfBlob = doc.output('blob');
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = nomeArquivo;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                console.log('✅ PDF COMPLETO gerado via Blob:', nomeArquivo);
            }
            
            // Retorna nome do arquivo e documento para download manual
            return {
                nomeArquivo: nomeArquivo,
                pdfDoc: doc
            };
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF COMPLETO:', error);
            throw error;
        }
    },
    
    /**
     * Adiciona cabeçalho padrão PLI
     */
    _addHeader(doc, yPosition) {
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Retângulo de cabeçalho azul
        doc.setFillColor(30, 64, 175); // primary color
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        // Título principal
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('PLI 2050 - ESTADO DE SÃO PAULO', pageWidth / 2, 12, { align: 'center' });
        
        // Subtítulo
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Plano de Logística e Investimentos', pageWidth / 2, 20, { align: 'center' });
        
        // Linha de descrição
        doc.setFontSize(10);
        doc.text('Formulário de Entrevista com Embarcadores', pageWidth / 2, 28, { align: 'center' });
        
        // Resetar cor do texto
        doc.setTextColor(31, 41, 55); // text color
        
        return 45;
    },
    
    /**
     * Adiciona informações da pesquisa (ID, data, etc)
     */
    _addPesquisaInfo(doc, yPosition, response) {
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Box de informações
        doc.setFillColor(249, 250, 251); // background color
        doc.setDrawColor(229, 231, 235); // border color
        doc.roundedRect(15, yPosition, pageWidth - 30, 20, 2, 2, 'FD');
        
        // Informações
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(107, 114, 128); // textLight
        doc.text('ID DA PESQUISA:', 20, yPosition + 7);
        doc.text('DATA/HORA:', 20, yPosition + 14);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(31, 41, 55); // text
        doc.text(`#${response.id_pesquisa || 'Pendente'}`, 55, yPosition + 7);
        doc.text(new Date().toLocaleString('pt-BR'), 55, yPosition + 14);
        
        return yPosition + 28;
    },
    
    /**
     * Adiciona uma seção com campos
     * ✅ MELHORADO: Quebra automática de linha para labels E valores
     */
    _addSection(doc, yPosition, titulo, formData, campos) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margemEsquerda = 20;
        const margemDireita = 15;
        const larguraDisponivel = pageWidth - margemEsquerda - margemDireita;
        
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 20;
        }
        
        // Título da seção
        doc.setFillColor(59, 130, 246); // secondary color
        doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(titulo, 20, yPosition + 5.5);
        
        yPosition += 12;
        
        // Campos
        doc.setFontSize(9);
        
        campos.forEach(campo => {
            // Verificar quebra de página ANTES de adicionar o campo
            const estimativaAltura = 15; // Altura estimada para evitar cortar campos
            if (yPosition > pageHeight - estimativaAltura) {
                doc.addPage();
                yPosition = 20;
            }
            
            // ===== LABEL (PERGUNTA) =====
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(107, 114, 128); // textLight (cinza)
            
            // Quebrar label em múltiplas linhas se necessário (40% da largura)
            const larguraLabel = larguraDisponivel * 0.4;
            const labelSplit = doc.splitTextToSize(`${campo.label}:`, larguraLabel);
            
            // Renderizar label
            doc.text(labelSplit, margemEsquerda, yPosition);
            const alturaLabel = labelSplit.length * 4;
            
            // ===== VALOR (RESPOSTA) =====
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(31, 41, 55); // text (preto)
            
            // Quebrar valor em múltiplas linhas (55% da largura)
            const valor = campo.value || 'Não informado';
            const larguraValor = larguraDisponivel * 0.55;
            const xValor = margemEsquerda + larguraLabel + 5; // 5mm de espaço entre label e valor
            const valorSplit = doc.splitTextToSize(String(valor), larguraValor);
            
            // Renderizar valor
            doc.text(valorSplit, xValor, yPosition);
            const alturaValor = valorSplit.length * 4;
            
            // Avançar Y pela maior altura (label ou valor)
            const alturaMaxima = Math.max(alturaLabel, alturaValor);
            yPosition += alturaMaxima + 2; // +2mm de espaçamento entre campos
        });
        
        return yPosition + 5;
    },
    
    /**
     * Adiciona tabela de produtos transportados
     */
    _addProdutosTable(doc, yPosition, produtos) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 80) {
            doc.addPage();
            yPosition = 20;
        }
        
        // Título da seção
        doc.setFillColor(59, 130, 246); // secondary color
        doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`PRODUTOS TRANSPORTADOS (${produtos.length})`, 20, yPosition + 5.5);
        
        yPosition += 12;
        
        // Tabela usando autoTable
        const tableData = produtos.map(p => [
            p.carga || '-',
            p.movimentacao ? `${p.movimentacao.toLocaleString('pt-BR')} ton/ano` : '-',
            p.origem || '-',
            p.destino || '-',
            p.distancia ? `${p.distancia} km` : '-',
            p.modalidade || '-'
        ]);
        
        doc.autoTable({
            startY: yPosition,
            head: [['Produto', 'Movimentação', 'Origem', 'Destino', 'Distância', 'Modal']],
            body: tableData,
            margin: { left: 15, right: 15 },
            theme: 'grid',
            headStyles: {
                fillColor: [59, 130, 246],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [31, 41, 55]
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251]
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 30 },
                2: { cellWidth: 35 },
                3: { cellWidth: 35 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 }
            }
        });
        
        return doc.lastAutoTable.finalY + 10;
    },
    
    /**
     * Adiciona rodapé
     */
    _addFooter(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Linha divisória
            doc.setDrawColor(229, 231, 235); // border color
            doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
            
            // Texto do rodapé
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128); // textLight
            doc.setFont('helvetica', 'italic');
            doc.text('PLI 2050 - Secretaria de Logística e Transportes do Estado de São Paulo', pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
        }
    },
    
    // ===== FORMATADORES =====
    
    _formatCNPJ(cnpj) {
        if (!cnpj) return 'Não informado';
        const cleaned = String(cnpj).replace(/\D/g, '');
        if (cleaned.length === 14) {
            return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return cnpj;
    },
    
    _formatMoeda(valor) {
        if (!valor && valor !== 0) return 'Não informado';
        return `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    
    _formatTempo(dias, horas, minutos) {
        const parts = [];
        if (dias > 0) parts.push(`${dias} dia(s)`);
        if (horas > 0) parts.push(`${horas} hora(s)`);
        if (minutos > 0) parts.push(`${minutos} minuto(s)`);
        return parts.length > 0 ? parts.join(', ') : 'Não informado';
    },
    
    _formatTipoTransporte(tipo) {
        const tipos = {
            'importacao': 'Importação',
            'exportacao': 'Exportação',
            'local': 'Local',
            'nao-sei': 'Não sei'
        };
        return tipos[tipo] || tipo || 'Não informado';
    },
    
    _formatModais(modos) {
        if (!modos || modos.length === 0) return 'Não informado';
        const modaisMap = {
            'rodoviario': 'Rodoviário',
            'ferroviario': 'Ferroviário',
            'hidroviario': 'Hidroviário',
            'aquaviario': 'Aquaviário',
            'cabotagem': 'Cabotagem',
            'aeroviario': 'Aeroviário',
            'aereo': 'Aéreo',
            'dutoviario': 'Dutoviário'
        };
        return modos.map(m => modaisMap[m] || m).join(', ');
    },
    
    _formatModaisAlternativos(modais) {
        if (!modais || modais.length === 0) return 'Nenhum';
        const modaisMap = {
            'ferrovia': 'Ferrovia',
            'hidrovia': 'Hidrovia',
            'dutovia': 'Dutovia',
            'cabotagem': 'Cabotagem (marítimo)',
            'nenhum': 'Nenhum'
        };
        return modais.map(m => modaisMap[m] || m).join(', ');
    },
    
    _formatDificuldades(dificuldades) {
        if (!dificuldades || dificuldades.length === 0) return 'Nenhuma dificuldade informada';
        const dificuldadesMap = {
            'infra-rodoviaria': 'Inadequação da infraestrutura rodoviária',
            'infra-ferroviaria': 'Inadequação da infraestrutura ferroviária',
            'infra-portuaria': 'Inadequação da infraestrutura portuária',
            'infra-aeroviaria': 'Inadequação da infraestrutura aeroviária',
            'infra-dutoviaria': 'Inadequação da infraestrutura dutoviária',
            'centros-distribuicao': 'Inexistência ou insuficiência de centros de distribuição',
            'terminais-intermodais': 'Oferta insuficiente de terminais intermodais',
            'armazenagem': 'Oferta insuficiente de instalações de armazenagem',
            'acessos-portos': 'Inadequação dos acessos aos portos e terminais'
        };
        return dificuldades.map(d => dificuldadesMap[d] || d).join('; ');
    }
};

// Exportar para uso global
window.PDFGenerator = PDFGenerator;

console.log('✅ PDFGenerator COMPLETO carregado (55+ campos)');
