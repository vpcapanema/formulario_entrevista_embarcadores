/**
 * ============================================================
 * PDF-GENERATOR - Geração de Relatórios PDF Estilizados
 * ============================================================
 * Gera PDF com cabeçalho padrão PLI e respostas formatadas
 */

const PDFGenerator = {
    
    // Cores padrão PLI - Paleta Padronizada
    colors: {
        primary: '#072B47',      // Azul escuro (labels)
        secondary: '#0C4C7D',    // Azul médio (títulos seção)
        accent: '#3949ab',       // Azul navy claro (tabelas)
        text: '#1f2937',         // Preto (valores)
        textLight: '#6b7280',    // Cinza médio (info secundária)
        border: '#424242',       // Cinza escuro (bordas sólidas 1pt)
        background: '#f9fafb',   // Fundo
        labelColor: [7, 43, 71],  // RGB #072B47 para labels
        valueColor: [31, 41, 55]    // RGB text para valores
    },
    
    /**
     * Formata texto com capitalização adequada
     */
    _capitalize(text) {
        if (!text || text === 'Não informado' || text === '-' || text === 'N/I') {
            return text;
        }
        // Se já está em maiúsculas, mantém (ex: siglas)
        if (text === text.toUpperCase() && text.length <= 5) {
            return text;
        }
        // Capitaliza primeira letra de cada palavra (exceto conectores)
        return text.split(' ').map((word, idx) => {
            const lower = word.toLowerCase();
            if (idx > 0 && ['de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'em', 'na', 'no'].includes(lower)) {
                return lower;
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
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
            // ⭐ ATUALIZADO: Exibe TODOS os dados do entrevistador + instituição
            const tipoResponsavel = formData.tipoResponsavel || 'Não informado';
            const camposCard0 = [
                { label: 'Q0. Quem está preenchendo', value: tipoResponsavel === 'entrevistador' ? 'Entrevistador' : 'Entrevistado' }
            ];
            
            // Se for entrevistador, adicionar TODOS os dados do entrevistador e instituição
            if (tipoResponsavel === 'entrevistador') {
                if (formData.entrevistadorCompleto && formData.entrevistadorCompleto.entrevistador) {
                    const ent = formData.entrevistadorCompleto.entrevistador;
                    
                    // Dados do Entrevistador
                    camposCard0.push({ label: 'ID do Entrevistador', value: ent.id_entrevistador || 'N/I' });
                    camposCard0.push({ label: 'Nome Completo do Entrevistador', value: ent.nome_completo || 'N/I' });
                    camposCard0.push({ label: 'E-mail do Entrevistador', value: ent.email || 'N/I' });
                    
                    // Dados da Instituição (se existir)
                    if (formData.entrevistadorCompleto.instituicao) {
                        const inst = formData.entrevistadorCompleto.instituicao;
                        camposCard0.push({ label: '--- INSTITUIÇÃO ---', value: '' });
                        camposCard0.push({ label: 'ID da Instituição', value: inst.id_instituicao || 'N/I' });
                        camposCard0.push({ label: 'Nome da Instituição', value: inst.nome_instituicao || 'N/I' });
                        camposCard0.push({ label: 'Tipo da Instituição', value: inst.tipo_instituicao || 'N/I' });
                        camposCard0.push({ label: 'CNPJ da Instituição', value: this._formatCNPJ(inst.cnpj) || 'N/I' });
                    }
                } else if (formData.idResponsavel) {
                    // Fallback: apenas ID se dados completos não disponíveis
                    camposCard0.push({ label: 'ID do Entrevistador', value: formData.idResponsavel });
                }
            }
            yPosition = this._addSection(doc, yPosition, 'CARD 0 - RESPONSÁVEL PELO PREENCHIMENTO', formData, camposCard0);
            
            // ===== CARD 1: DADOS DO ENTREVISTADO =====
            // ⭐ Usar funcaoNome (texto legível) ao invés de funcao (código)
            const funcaoExibir = formData.funcaoNome || formData.funcao || 'Não informado';
            const camposCard1 = [
                { label: 'Q1. Nome', value: formData.nome },
                { label: 'Q2. Função', value: funcaoExibir }
            ];
            if (formData.funcao === 'outro' || formData.funcao === 'Outro' || funcaoExibir.toLowerCase().includes('outro')) {
                camposCard1.push({ label: 'Q2b. Outra Função (especificada)', value: formData.outraFuncao });
            }
            camposCard1.push(
                { label: 'Q3. Telefone', value: this._formatTelefone(formData.telefone) },
                { label: 'Q4. E-mail', value: formData.email }
            );
            yPosition = this._addSection(doc, yPosition, 'CARD 1 - DADOS DO ENTREVISTADO', formData, camposCard1);
            
            // ===== CARD 2: DADOS DA EMPRESA =====
            // ⭐ Usar tipoEmpresaNome (texto legível) ao invés de tipoEmpresa (código)
            const tipoEmpresaExibir = formData.tipoEmpresaNome || formData.tipoEmpresa || 'Não informado';
            const camposCard2 = [
                { label: 'Q5. Tipo de Empresa', value: tipoEmpresaExibir }
            ];
            if (formData.tipoEmpresa === 'outro' || tipoEmpresaExibir.toLowerCase().includes('outro')) {
                camposCard2.push({ label: 'Q5b. Outro Tipo (especificado)', value: formData.outroTipo });
            }
            camposCard2.push(
                { label: 'Q6a. CNPJ', value: this._formatCNPJ(formData.cnpj) },
                { label: 'Q6b. Razão Social', value: formData.razaoSocial },
                { label: 'Q6c. Nome Fantasia (Receita Federal)', value: formData.nomeFantasiaReceita || 'Não informado' },
                { label: 'Q6d. Situação Cadastral (Receita Federal)', value: formData.situacaoCadastralReceita || 'Não informado' },
                { label: 'Q6e. Atividade Principal CNAE (Receita Federal)', value: formData.atividadePrincipalReceita || 'Não informado' },
                { label: 'Q7. Município da Empresa', value: formData.municipioNome || formData.municipio || 'Não informado' }
            );
            yPosition = this._addSection(doc, yPosition, 'CARD 2 - DADOS DA EMPRESA', formData, camposCard2);
            
            // ===== CARD 3: PRODUTOS TRANSPORTADOS (Q8) =====
            if (formData.produtos && formData.produtos.length > 0) {
                const camposCard3 = [];
                formData.produtos.forEach((produto, idx) => {
                    const prefixo = `Q8 - Produto ${idx + 1}`;
                    
                    // Origem em formato: País | Estado | Município (usar *_nome se disponível)
                    const origemCompleta = [
                        produto.origem_pais_nome || produto.origem_pais || '-',
                        produto.origem_estado_nome || produto.origem_estado || '-',
                        produto.origem_municipio_nome || produto.origem_municipio || '-'
                    ].join(' | ');
                    
                    // Destino em formato: País | Estado | Município (usar *_nome se disponível)
                    const destinoCompleto = [
                        produto.destino_pais_nome || produto.destino_pais || '-',
                        produto.destino_estado_nome || produto.destino_estado || '-',
                        produto.destino_municipio_nome || produto.destino_municipio || '-'
                    ].join(' | ');
                    
                    camposCard3.push({ label: `${prefixo} - Carga`, value: produto.carga || 'N/I' });
                    camposCard3.push({ label: `${prefixo} - Movimentação Anual`, value: produto.movimentacao_anual || produto.movimentacao ? `${Number(produto.movimentacao_anual || produto.movimentacao).toLocaleString('pt-BR')} t/ano` : 'N/I' });
                    camposCard3.push({ label: `${prefixo} - Origem (País | Estado | Município)`, value: origemCompleta });
                    camposCard3.push({ label: `${prefixo} - Destino (País | Estado | Município)`, value: destinoCompleto });
                    camposCard3.push({ label: `${prefixo} - Distância`, value: produto.distancia ? `${Number(produto.distancia).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km` : 'N/I' });
                    camposCard3.push({ label: `${prefixo} - Modalidade`, value: produto.modalidade || 'N/I' });
                    camposCard3.push({ label: `${prefixo} - Acondicionamento`, value: produto.acondicionamento || 'N/I' });
                    camposCard3.push({ label: `${prefixo} - Observações`, value: produto.observacoes || 'N/I' });
                    
                    // Adicionar linha separadora após cada produto (exceto o último)
                    if (idx < formData.produtos.length - 1) {
                        camposCard3.push({ label: '___SEPARATOR___', value: '' });
                    }
                });
                yPosition = this._addSection(doc, yPosition, 'CARD 3 - PRODUTOS TRANSPORTADOS (Q8)', formData, camposCard3);
            } else {
                yPosition = this._addSection(doc, yPosition, 'CARD 3 - PRODUTOS TRANSPORTADOS (Q8)', formData, [
                    { label: 'Q8. Produtos', value: 'Nenhum produto cadastrado' }
                ]);
            }
            
            // ===== CARD 4: PRODUTO PRINCIPAL =====
            // ⭐ Usar agrupamentoProdutoNome ao invés de código
            const agrupamentoExibir = formData.agrupamentoProdutoNome || formData.agrupamentoProduto || 'Não informado';
            const camposCard4 = [
                { label: 'Q9. Produto Mais Representativo', value: formData.produtoPrincipal },
                { label: 'Q10. Agrupamento do Produto', value: agrupamentoExibir }
            ];
            if (formData.agrupamentoProduto === 'outro-produto' || agrupamentoExibir.toLowerCase().includes('outro')) {
                camposCard4.push({ label: 'Q10b. Outro Produto (especificado)', value: formData.outroProduto });
            }
            if (formData.observacoesProdutoPrincipal) {
                camposCard4.push({ label: 'Q18. Observações sobre o Transporte do Produto Principal', value: formData.observacoesProdutoPrincipal });
            }
            yPosition = this._addSection(doc, yPosition, 'CARD 4 - PRODUTO PRINCIPAL', formData, camposCard4);
            
            // ===== CARD 5: CARACTERÍSTICAS DO TRANSPORTE =====
            // ⭐ IMPORTANTE: Usar campos *Nome (ex: origemPaisNome) para PDF, não códigos!
            const tipoTransporteExibir = formData.tipoTransporteNome || this._formatTipoTransporte(formData.tipoTransporte);
            const camposCard5 = [
                { label: 'Q11. Tipo de Transporte', value: tipoTransporteExibir },
                { label: 'Q12. Origem - País', value: formData.origemPaisNome || formData.origemPais || 'Não informado' },
                { label: 'Q12b. Origem - Estado', value: formData.origemEstadoNome || formData.origemEstado || 'Não informado' },
                { label: 'Q12c. Origem - Município', value: formData.origemMunicipioNome || formData.origemMunicipio || 'Não informado' },
                { label: 'Q13. Destino - País', value: formData.destinoPaisNome || formData.destinoPais || 'Não informado' },
                { label: 'Q13b. Destino - Estado', value: formData.destinoEstadoNome || formData.destinoEstado || 'Não informado' },
                { label: 'Q13c. Destino - Município', value: formData.destinoMunicipioNome || formData.destinoMunicipio || 'Não informado' },
                { label: 'Q14. Distância do Deslocamento', value: formData.distancia ? `${Number(formData.distancia).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km` : 'Não informado' },
                { label: 'Q15. Tem Paradas?', value: formData.temParadas === 'sim' ? 'Sim' : (formData.temParadas === 'nao' ? 'Não' : 'Não informado') }
            ];
            if (formData.temParadas === 'sim') {
                const numParadas = formData.numParadas === '11' ? `Mais de 10 (${formData.numParadasExato || 'não especificado'})` : formData.numParadas;
                camposCard5.push({ label: 'Q16. Número de Paradas', value: numParadas });
            }
            camposCard5.push({ label: 'Q17. Modais Utilizados', value: this._formatModais(formData.modos) });
            if (formData.modos && formData.modos.includes('rodoviario')) {
                // Usar configVeiculoNome se disponível
                const configVeiculoExibir = formData.configVeiculoNome || formData.configVeiculo || 'Não informado';
                camposCard5.push({ label: 'Q18. Configuração do Veículo Rodoviário', value: configVeiculoExibir });
            }
            camposCard5.push(
                { label: 'Q19. Capacidade Utilizada (%)', value: formData.capacidadeUtilizada ? `${Number(formData.capacidadeUtilizada).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` : 'Não informado' },
                { label: 'Q20. Peso da Carga', value: formData.pesoCarga ? `${Number(formData.pesoCarga).toLocaleString('pt-BR')}` : 'Não informado' },
                { label: 'Q21. Unidade de Peso', value: formData.unidadePesoNome || formData.unidadePeso || 'Não informado' },
                { label: 'Q22. Custo Total do Transporte', value: this._formatMoeda(formData.custoTransporte) },
                { label: 'Q23. Valor Total da Carga', value: this._formatMoeda(formData.valorCarga) },
                { label: 'Q24. Tipo de Embalagem', value: formData.tipoEmbalagemNome || formData.tipoEmbalagem || 'Não informado' },
                { label: 'Q25. Carga Perigosa?', value: formData.cargaPerigosa === 'sim' ? 'Sim' : (formData.cargaPerigosa === 'nao' ? 'Não' : 'Não informado') },
                { label: 'Q26. Tempo de Deslocamento', value: this._formatTempo(formData.tempoDias, formData.tempoHoras, formData.tempoMinutos) },
                { label: 'Q27. Frequência de Deslocamento', value: formData.frequenciaNome || formData.frequencia || 'Não informado' }
            );
            if (formData.frequencia === 'diaria') {
                camposCard5.push({ label: 'Quantas vezes por dia?', value: formData.frequenciaDiaria || 'Não informado' });
            }
            if (formData.frequencia === 'outra') {
                camposCard5.push({ label: 'Frequência Outra (especificada)', value: formData.frequenciaOutra });
            }
            if (formData.observacoesSazonalidade) {
                camposCard5.push({ label: 'Q28. Observações sobre Sazonalidade', value: formData.observacoesSazonalidade });
            }
            yPosition = this._addSection(doc, yPosition, 'CARD 5 - CARACTERÍSTICAS DO TRANSPORTE', formData, camposCard5);
            
            // ===== CARD 6: FATORES DE DECISÃO MODAL =====
            // ⭐ Usar *Nome para campos de importância
            const camposCard6 = [
                { label: 'Q29. Importância do CUSTO', value: formData.importanciaCustoNome || formData.importanciaCusto || 'Não informado' },
                { label: 'Q30. Variação % de Custo', value: formData.variacaoCusto ? `${formData.variacaoCusto}%` : 'Não informado' },
                { label: 'Q31. Importância do TEMPO', value: formData.importanciaTempoNome || formData.importanciaTempo || 'Não informado' },
                { label: 'Q32. Variação % de Tempo', value: formData.variacaoTempo ? `${formData.variacaoTempo}%` : 'Não informado' },
                { label: 'Q33. Importância da CONFIABILIDADE', value: formData.importanciaConfiabilidadeNome || formData.importanciaConfiabilidade || 'Não informado' },
                { label: 'Q34. Variação % de Confiabilidade', value: formData.variacaoConfiabilidade ? `${formData.variacaoConfiabilidade}%` : 'Não informado' },
                { label: 'Q35. Importância da SEGURANÇA', value: formData.importanciaSegurancaNome || formData.importanciaSeguranca || 'Não informado' },
                { label: 'Q36. Variação % de Segurança', value: formData.variacaoSeguranca ? `${formData.variacaoSeguranca}%` : 'Não informado' },
                { label: 'Q37. Importância da CAPACIDADE', value: formData.importanciaCapacidadeNome || formData.importanciaCapacidade || 'Não informado' },
                { label: 'Q38. Variação % de Capacidade', value: formData.variacaoCapacidade ? `${formData.variacaoCapacidade}%` : 'Não informado' }
            ];
            yPosition = this._addSection(doc, yPosition, 'CARD 6 - FATORES DE DECISÃO MODAL', formData, camposCard6);
            
            // ===== CARD 7: ANÁLISE ESTRATÉGICA =====
            const camposCard7 = [
                { label: 'Q39. Tipo de Cadeia', value: formData.tipoCadeiaNome || formData.tipoCadeia || 'Não informado' },
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
            
            // Usar jsPDF save() para download automático
            doc.save(nomeArquivo);
            console.log('✅ PDF COMPLETO gerado:', nomeArquivo);
            
            // Retorna nome do arquivo e documento para download manual via botão
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
        
        // Retângulo de cabeçalho azul navy
        doc.setFillColor(7, 43, 71); // primary color #072B47
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
        doc.setDrawColor(66, 66, 66); // border color (cinza escuro)
        doc.roundedRect(10, yPosition, pageWidth - 20, 20, 2, 2, 'FD');
        
        // Informações
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.colors.labelColor); // Azul navy
        doc.text('ID DA PESQUISA:', 15, yPosition + 7);
        doc.text('DATA/HORA:', 15, yPosition + 14);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.colors.valueColor); // Preto
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
        const margemEsquerda = 10;  // Reduzido para aproveitar espaço
        const margemDireita = 10;   // Reduzido para aproveitar espaço
        const larguraDisponivel = pageWidth - margemEsquerda - margemDireita;
        
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
        }
        
        // Título da seção
        doc.setFillColor(12, 76, 125); // secondary color #0C4C7D
        doc.rect(margemEsquerda, yPosition, pageWidth - margemEsquerda - margemDireita, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(titulo, margemEsquerda + 3, yPosition + 5.5);
        
        yPosition += 12;
        
        // Campos
        doc.setFontSize(9);
        
        // Controle de posicionamento em grid
        let xAtual = margemEsquerda;
        let yLinhaAtual = yPosition;
        let camposNaLinha = 0;
        const maxCamposPorLinha = 2;
        const larguraCampoCompacto = (larguraDisponivel - 4) / 2; // 2 colunas com espaço
        
        campos.forEach((campo, index) => {
            // ===== DETECTAR SEPARADOR =====
            if (campo.label === '___SEPARATOR___') {
                // Desenhar linha separadora horizontal
                yPosition = yLinhaAtual;
                xAtual = margemEsquerda;
                camposNaLinha = 0;
                
                // Verificar quebra de página
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = 20;
                    yLinhaAtual = yPosition;
                }
                
                // Linha cinza com padding
                yPosition += 5;
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.8);
                doc.line(margemEsquerda + 5, yPosition, pageWidth - margemDireita - 5, yPosition);
                yPosition += 5;
                yLinhaAtual = yPosition;
                return; // Pular para próximo campo
            }
            
            // Determinar se o campo tem resposta curta (pode ficar em linha com outros)
            const valorOriginal = campo.value || 'Não informado';
            const valorFormatado = this._capitalize(String(valorOriginal));
            const labelFormatado = campo.label.toUpperCase();
            
            // Forçar campos específicos a ficarem em linha (2 colunas) mesmo com texto longo
            const isCampoOrigemDestino = labelFormatado.includes('ORIGEM') || labelFormatado.includes('DESTINO');
            const isCampoTempo = labelFormatado.includes('TEMPO DE DESLOCAMENTO');
            const isCampoCompacto = isCampoOrigemDestino || isCampoTempo || (valorFormatado.length < 30 && labelFormatado.length < 50);
            
            // Calcular dimensões
            const larguraCampo = isCampoCompacto ? larguraCampoCompacto : larguraDisponivel;
            const alturaCampo = 14;
            
            // Se campo não é compacto, força nova linha
            if (!isCampoCompacto && camposNaLinha > 0) {
                yPosition = yLinhaAtual;
                xAtual = margemEsquerda;
                camposNaLinha = 0;
            }
            
            // Se ultrapassou limite de campos por linha, nova linha
            if (camposNaLinha >= maxCamposPorLinha) {
                yPosition = yLinhaAtual;
                xAtual = margemEsquerda;
                camposNaLinha = 0;
            }
            
            // Verificar quebra de página
            if (yPosition > pageHeight - alturaCampo - 15) {
                doc.addPage();
                yPosition = 20;
                yLinhaAtual = yPosition;
                xAtual = margemEsquerda;
                camposNaLinha = 0;
            }
            
            // ===== RETÂNGULO ARREDONDADO COM BORDA =====
            doc.setDrawColor(66, 66, 66); // Cinza escuro
            doc.setLineWidth(0.4);
            doc.setFillColor(255, 255, 255); // Fundo branco
            doc.roundedRect(xAtual, yPosition, larguraCampo, alturaCampo, 2, 2, 'D');
            
            // ===== LABEL (PERGUNTA) - EM CIMA, NEGRITO, MENOR =====
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...this.colors.labelColor); // Azul
            doc.setFontSize(7); // Menor para o label
            
            // Formatar label em MAIÚSCULAS (PERMITIR quebra se necessário)
            const labelLinhas = doc.splitTextToSize(labelFormatado, larguraCampo - 6);
            doc.text(labelLinhas, xAtual + 3, yPosition + 3);
            
            const alturaLabel = Math.min(labelLinhas.length * 2.5, 6); // Máximo 2 linhas
            
            // ===== VALOR (RESPOSTA) - EMBAIXO, NORMAL, MAIOR =====
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...this.colors.valueColor); // Preto
            doc.setFontSize(9); // Maior para o valor
            
            // Renderizar valor (PERMITIR quebra se necessário)
            const valorLinhas = doc.splitTextToSize(valorFormatado, larguraCampo - 6);
            const yValor = yPosition + 3 + alturaLabel + 2; // +2mm de espaçamento extra
            doc.text(valorLinhas, xAtual + 3, yValor);
            
            // Atualizar posição para próximo campo
            if (isCampoCompacto) {
                xAtual += larguraCampo + 4; // Próxima coluna
                camposNaLinha++;
                yLinhaAtual = Math.max(yLinhaAtual, yPosition + alturaCampo + 3);
            } else {
                // Campo largo ocupa linha inteira
                yPosition += alturaCampo + 3;
                yLinhaAtual = yPosition;
                xAtual = margemEsquerda;
                camposNaLinha = 0;
            }
        });
        
        // Ajustar posição Y final
        yPosition = yLinhaAtual;
        
        return yPosition + 5;
    },
    
    /**
     * Adiciona tabela de produtos transportados
     * ⭐ CORRIGIDO: Usar NOMES ao invés de códigos + Tabela dividida para não cortar
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
        
        // ⭐ ESTRATÉGIA: Dividir em 2 tabelas para caber na página A4 portrait
        // Tabela 1: Dados básicos (Produto, Movimentação, Acondicionamento, Modal, Distância)
        // Tabela 2: Origem e Destino (detalhados)
        
        // ===== TABELA 1: DADOS BÁSICOS =====
        const tableData1 = produtos.map((p, idx) => {
            return [
                idx + 1,                                                           // #
                p.carga || '-',                                                    // Produto
                p.movimentacao != null ? `${Number(p.movimentacao).toLocaleString('pt-BR')} t/ano` : '-',
                p.acondicionamento || '-',                                         // Acondicionamento
                p.modalidade || '-',                                               // Modal
                p.distancia != null ? `${p.distancia} km` : '-',                   // Distância
                p.observacoes ? (p.observacoes.length > 30 ? p.observacoes.substring(0, 30) + '...' : p.observacoes) : '-'
            ];
        });

        doc.autoTable({
            startY: yPosition,
            head: [['#', 'Produto', 'Movimentação', 'Acondicionamento', 'Modal', 'Distância', 'Observações']],
            body: tableData1,
            margin: { left: 15, right: 15 },
            theme: 'grid',
            headStyles: {
                fillColor: [59, 130, 246],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [31, 41, 55]
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251]
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },  // #
                1: { cellWidth: 40 },                     // Produto
                2: { cellWidth: 28 },                     // Movimentação
                3: { cellWidth: 30 },                     // Acondicionamento
                4: { cellWidth: 25 },                     // Modal
                5: { cellWidth: 20 },                     // Distância
                6: { cellWidth: 'auto' }                  // Observações
            }
        });

        yPosition = doc.lastAutoTable.finalY + 5;
        
        // ===== TABELA 2: ORIGEM E DESTINO (usando NOMES, não códigos) =====
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 20;
        }
        
        // Subtítulo
        doc.setFillColor(96, 165, 250); // accent color (azul mais claro)
        doc.rect(15, yPosition, pageWidth - 30, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Origem e Destino dos Produtos', 20, yPosition + 4);
        yPosition += 8;
        
        const tableData2 = produtos.map((p, idx) => {
            // ⭐ PRIORIZAR campos *Nome (texto legível) ao invés de códigos
            // Fallback para campos com código se nome não existir
            const origemPais = p.origemPaisNome || p.origem_pais_nome || p.origem_pais || '-';
            const origemEstado = p.origemEstadoNome || p.origem_estado_nome || p.origemEstadoUf || p.origem_estado || '-';
            const origemMunicipio = p.origemMunicipioNome || p.origem_municipio_nome || p.origem_municipio || '-';
            
            const destinoPais = p.destinoPaisNome || p.destino_pais_nome || p.destino_pais || '-';
            const destinoEstado = p.destinoEstadoNome || p.destino_estado_nome || p.destinoEstadoUf || p.destino_estado || '-';
            const destinoMunicipio = p.destinoMunicipioNome || p.destino_municipio_nome || p.destino_municipio || '-';
            
            // Formatar origem e destino de forma compacta
            const origemFormatada = this._formatLocalidade(origemMunicipio, origemEstado, origemPais);
            const destinoFormatado = this._formatLocalidade(destinoMunicipio, destinoEstado, destinoPais);
            
            return [
                idx + 1,
                p.carga || '-',
                origemFormatada,
                destinoFormatado
            ];
        });

        doc.autoTable({
            startY: yPosition,
            head: [['#', 'Produto', 'Origem (Município/Estado/País)', 'Destino (Município/Estado/País)']],
            body: tableData2,
            margin: { left: 15, right: 15 },
            theme: 'grid',
            headStyles: {
                fillColor: [96, 165, 250],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [31, 41, 55]
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251]
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },   // #
                1: { cellWidth: 40 },                      // Produto
                2: { cellWidth: 'auto' },                  // Origem
                3: { cellWidth: 'auto' }                   // Destino
            }
        });

        return doc.lastAutoTable.finalY + 10;
    },
    
    /**
     * Formata localidade de forma compacta: "Município/UF - País" ou "Município/UF" se Brasil
     */
    _formatLocalidade(municipio, estado, pais) {
        const parts = [];
        
        // Município
        if (municipio && municipio !== '-' && municipio.trim() !== '') {
            parts.push(municipio.trim());
        }
        
        // Estado (UF)
        if (estado && estado !== '-' && estado.trim() !== '') {
            if (parts.length > 0) {
                parts[0] = parts[0] + '/' + estado.trim();
            } else {
                parts.push(estado.trim());
            }
        }
        
        // País (só adiciona se não for Brasil ou se for o único dado)
        if (pais && pais !== '-' && pais.trim() !== '') {
            const paisNormalizado = pais.trim().toLowerCase();
            if (paisNormalizado !== 'brasil' && paisNormalizado !== 'br' && paisNormalizado !== '31') {
                parts.push(pais.trim());
            } else if (parts.length === 0) {
                parts.push('Brasil');
            }
        }
        
        return parts.length > 0 ? parts.join(' - ') : '-';
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
            
            // Texto do rodapé (2 linhas)
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128); // textLight
            doc.setFont('helvetica', 'italic');
            doc.text('PLI 2050 - Secretaria de Logística e Transportes do Estado de São Paulo', pageWidth / 2, pageHeight - 12, { align: 'center' });
            
            // Data/hora de emissão (horário de Brasília)
            const dataEmissao = new Date().toLocaleString('pt-BR', { 
                timeZone: 'America/Sao_Paulo',
                dateStyle: 'short',
                timeStyle: 'medium'
            });
            doc.text(`Emitido em: ${dataEmissao}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
            
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
    
    _formatCPF(cpf) {
        if (!cpf) return 'Não informado';
        const cleaned = String(cpf).replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return cpf;
    },
    
    _formatTelefone(telefone) {
        if (!telefone) return 'Não informado';
        const cleaned = String(telefone).replace(/\D/g, '');
        // (11) 98765-4321
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        // (11) 3456-7890
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return telefone;
    },
    
    _formatCEP(cep) {
        if (!cep) return 'Não informado';
        const cleaned = String(cep).replace(/\D/g, '');
        if (cleaned.length === 8) {
            return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        return cep;
    },
    
    _formatMoeda(valor) {
        if (!valor && valor !== 0) return 'Não informado';
        // Formato brasileiro: separador de milhar = ponto, decimal = vírgula
        return `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    
    _formatNumero(numero) {
        if (!numero && numero !== 0) return 'Não informado';
        // Separador de milhar = ponto, decimal = vírgula
        return Number(numero).toLocaleString('pt-BR');
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
