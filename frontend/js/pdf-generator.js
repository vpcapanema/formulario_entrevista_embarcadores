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
     */
    generatePDF(formData, response) {
        try {
            console.log('📄 Gerando PDF...');
            
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
            
            // ===== SEÇÃO: EMPRESA =====
            yPosition = this._addSection(doc, yPosition, 'EMPRESA', formData, [
                { label: 'Razão Social', value: formData.razaoSocial },
                { label: 'CNPJ', value: this._formatCNPJ(formData.cnpj) },
                { label: 'Tipo de Empresa', value: formData.tipoEmpresa },
                { label: 'Município', value: formData.municipioEmpresa },
                { label: 'Telefone', value: formData.telefoneEmpresa },
                { label: 'Email', value: formData.emailEmpresa }
            ]);
            
            // ===== SEÇÃO: ENTREVISTADO =====
            yPosition = this._addSection(doc, yPosition, 'ENTREVISTADO', formData, [
                { label: 'Nome', value: formData.nome },
                { label: 'Função', value: formData.funcao },
                { label: 'Telefone', value: formData.telefone },
                { label: 'Email', value: formData.email }
            ]);
            
            // ===== SEÇÃO: PRODUTOS TRANSPORTADOS =====
            if (formData.produtos && formData.produtos.length > 0) {
                yPosition = this._addProdutosTable(doc, yPosition, formData.produtos);
            }
            
            // ===== SEÇÃO: TRANSPORTE PRINCIPAL =====
            yPosition = this._addSection(doc, yPosition, 'TRANSPORTE PRINCIPAL', formData, [
                { label: 'Produto Principal', value: formData.produtoPrincipal },
                { label: 'Tipo de Transporte', value: this._formatTipoTransporte(formData.tipoTransporte) },
                { label: 'Origem', value: `${formData.origemMunicipio}/${formData.origemEstado} - ${formData.origemPais}` },
                { label: 'Destino', value: `${formData.destinoMunicipio}/${formData.destinoEstado} - ${formData.destinoPais}` },
                { label: 'Distância', value: `${formData.distancia} km` },
                { label: 'Modais Utilizados', value: this._formatModais(formData.modos) }
            ]);
            
            // ===== SEÇÃO: CARACTERÍSTICAS DA CARGA =====
            yPosition = this._addSection(doc, yPosition, 'CARACTERÍSTICAS DA CARGA', formData, [
                { label: 'Peso da Carga', value: `${formData.pesoCarga} ${formData.unidadePeso}` },
                { label: 'Valor da Carga', value: this._formatMoeda(formData.valorCarga) },
                { label: 'Custo de Transporte', value: this._formatMoeda(formData.custoTransporte) },
                { label: 'Tipo de Embalagem', value: formData.tipoEmbalagem },
                { label: 'Carga Perigosa', value: formData.cargaPerigosa ? 'Sim' : 'Não' }
            ]);
            
            // ===== SEÇÃO: TEMPO E FREQUÊNCIA =====
            yPosition = this._addSection(doc, yPosition, 'TEMPO E FREQUÊNCIA', formData, [
                { label: 'Tempo de Viagem', value: this._formatTempo(formData.tempoDias, formData.tempoHoras, formData.tempoMinutos) },
                { label: 'Frequência', value: formData.frequencia }
            ]);
            
            // ===== RODAPÉ =====
            this._addFooter(doc);
            
            // ===== SALVAR PDF =====
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const nomeArquivo = `PLI2050_Pesquisa_${response.id_pesquisa || 'Nova'}_${timestamp}.pdf`;
            doc.save(nomeArquivo);
            
            console.log('✅ PDF gerado:', nomeArquivo);
            return nomeArquivo;
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
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
     */
    _addSection(doc, yPosition, titulo, formData, campos) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
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
        doc.setTextColor(31, 41, 55); // text color
        doc.setFontSize(9);
        
        campos.forEach(campo => {
            // Verificar quebra de página
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }
            
            // Label
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(107, 114, 128); // textLight
            doc.text(`${campo.label}:`, 20, yPosition);
            
            // Valor
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(31, 41, 55); // text
            const valor = campo.value || 'Não informado';
            const valorSplit = doc.splitTextToSize(String(valor), pageWidth - 90);
            doc.text(valorSplit, 75, yPosition);
            
            yPosition += Math.max(6, valorSplit.length * 5);
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
            'aquaviario': 'Aquaviário',
            'aereo': 'Aéreo',
            'dutoviario': 'Dutoviário'
        };
        return modos.map(m => modaisMap[m] || m).join(', ');
    }
};

// Exportar para uso global
window.PDFGenerator = PDFGenerator;

console.log('✅ PDFGenerator carregado');
