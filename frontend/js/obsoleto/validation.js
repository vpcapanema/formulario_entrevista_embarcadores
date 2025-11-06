// Mapeamento completo de todas as perguntas do formulário (1-43)
const QUESTION_MAPPING = [
    { num: 1, field: 'nome', label: 'Nome', type: 'text', required: true },
    { num: 2, field: 'funcao', label: 'Função', type: 'text', required: true },
    { num: 3, field: 'telefone', label: 'Telefone', type: 'tel', required: true },
    { num: 4, field: 'email', label: 'E-mail', type: 'email', required: true },
    { num: 5, field: 'tipoEmpresa', label: 'A empresa é um', type: 'select', required: true },
    { num: 6, field: 'nomeEmpresa', label: 'Nome da empresa', type: 'text', required: true },
    { num: 7, field: 'municipio', label: 'Município da(s) unidade(s) de produção', type: 'text', required: true },
    { num: 8, field: 'produtos', label: 'Principais produtos transportados', type: 'table', required: false },
    { num: 9, field: 'produtoPrincipal', label: 'Produto mais representativo', type: 'text', required: true },
    { num: 10, field: 'agrupamentoProduto', label: 'Agrupamento do produto', type: 'select', required: true },
    { num: 11, field: 'tipoTransporte', label: 'O transporte refere-se a', type: 'select', required: true },
    { num: 12, field: 'origem', label: 'Origem (País, Estado, Município)', type: 'composite', required: true, subfields: ['origemPais', 'origemEstado', 'origemMunicipio'] },
    { num: 13, field: 'destino', label: 'Destino (País, Estado, Município)', type: 'composite', required: true, subfields: ['destinoPais', 'destinoEstado', 'destinoMunicipio'] },
    { num: 14, field: 'distancia', label: 'Distância (km)', type: 'number', required: true },
    { num: 15, field: 'temParadas', label: 'Tem paradas', type: 'select', required: true },
    { num: 16, field: 'numParadas', label: 'Número de paradas', type: 'number', required: false, conditional: true },
    { num: 17, field: 'modos', label: 'Modo(s) utilizado(s)', type: 'checkbox', required: true },
    { num: 18, field: 'configVeiculo', label: 'Configuração do veículo rodoviário', type: 'select', required: false, conditional: true },
    { num: 19, field: 'capacidadeUtilizada', label: 'Capacidade utilizada (%)', type: 'number', required: true },
    { num: 20, field: 'pesoCarga', label: 'Peso da carga', type: 'number', required: true },
    { num: 21, field: 'unidadePeso', label: 'Unidade do peso', type: 'select', required: true },
    { num: 22, field: 'custoTransporte', label: 'Custo total do transporte (R$)', type: 'number', required: true },
    { num: 23, field: 'valorCarga', label: 'Valor total da carga (R$)', type: 'number', required: true },
    { num: 24, field: 'tipoEmbalagem', label: 'Tipo de embalagem', type: 'select', required: true },
    { num: 25, field: 'cargaPerigosa', label: 'É carga perigosa', type: 'select', required: true },
    { num: 26, field: 'tempo', label: 'Tempo de deslocamento', type: 'composite', required: true, subfields: ['tempoDias', 'tempoHoras', 'tempoMinutos'] },
    { num: 27, field: 'frequencia', label: 'Frequência de deslocamento', type: 'select', required: true },
    { num: 28, field: 'frequenciaDiaria', label: 'Quantas vezes no dia', type: 'number', required: false, conditional: true },
    { num: 29, field: 'importanciaCusto', label: 'Importância - CUSTO', type: 'select', required: true },
    { num: 30, field: 'variacaoCusto', label: 'Variação % - CUSTO', type: 'number', required: true },
    { num: 31, field: 'importanciaTempo', label: 'Importância - TEMPO', type: 'select', required: true },
    { num: 32, field: 'variacaoTempo', label: 'Variação % - TEMPO', type: 'number', required: true },
    { num: 33, field: 'importanciaConfiabilidade', label: 'Importância - CONFIABILIDADE', type: 'select', required: true },
    { num: 34, field: 'variacaoConfiabilidade', label: 'Variação % - CONFIABILIDADE', type: 'number', required: true },
    { num: 35, field: 'importanciaSeguranca', label: 'Importância - SEGURANÇA', type: 'select', required: true },
    { num: 36, field: 'variacaoSeguranca', label: 'Variação % - SEGURANÇA', type: 'number', required: true },
    { num: 37, field: 'importanciaCapacidade', label: 'Importância - CAPACIDADE', type: 'select', required: true },
    { num: 38, field: 'variacaoCapacidade', label: 'Variação % - CAPACIDADE', type: 'number', required: true },
    { num: 39, field: 'tipoCadeia', label: 'Tipo de cadeia (Suprimento ou Distribuição)', type: 'select', required: true },
    { num: 40, field: 'modaisAlternativos', label: 'Disposição para usar modais alternativos', type: 'checkbox', required: false },
    { num: 41, field: 'fatorAdicional', label: 'Fator adicional para escolha modal', type: 'textarea', required: false },
    { num: 42, field: 'dificuldades', label: 'Principais dificuldades logísticas', type: 'checkbox', required: false },
    { num: 43, field: 'detalheDificuldade', label: 'Detalhe da dificuldade', type: 'textarea', required: false }
];

// Validar campos obrigatórios
function validateRequiredFields(formData) {
    const errors = [];
    
    QUESTION_MAPPING.forEach(question => {
        if (!question.required) return;
        
        // Pular campos condicionais se não aplicáveis
        if (question.conditional) {
            if (question.num === 16 && formData.temParadas !== 'sim') return;
            if (question.num === 18 && !formData.modos.includes('rodoviario')) return;
            if (question.num === 28 && formData.frequencia !== 'diaria') return;
        }
        
        let isEmpty = false;
        
        if (question.type === 'composite') {
            // Validar campos compostos (origem, destino, tempo)
            isEmpty = question.subfields.some(subfield => 
                !formData[subfield] || formData[subfield].toString().trim() === ''
            );
        } else if (question.type === 'checkbox') {
            // Validar checkboxes (modos de transporte)
            isEmpty = !formData[question.field] || formData[question.field].length === 0;
        } else {
            // Validar campos simples
            isEmpty = !formData[question.field] || formData[question.field].toString().trim() === '';
        }
        
        if (isEmpty) {
            errors.push({
                questionNum: question.num,
                field: question.field,
                label: question.label
            });
        }
    });
    
    return errors;
}

// Gerar Excel com estrutura: cada empresa = linha, cada pergunta = coluna
function generateExcelFromSingleResponse(formData) {
    // Criar objeto com todas as perguntas como colunas
    const excelRow = {};
    
    QUESTION_MAPPING.forEach(question => {
        const columnName = `${question.num}. ${question.label}`;
        
        if (question.type === 'composite') {
            // Para campos compostos, criar colunas separadas ou concatenar
            if (question.field === 'origem' || question.field === 'destino') {
                const pais = formData[question.subfields[0]] || '';
                const estado = formData[question.subfields[1]] || '';
                const municipio = formData[question.subfields[2]] || '';
                excelRow[columnName] = `${municipio}, ${estado}, ${pais}`;
            } else if (question.field === 'tempo') {
                const dias = formData[question.subfields[0]] || 0;
                const horas = formData[question.subfields[1]] || 0;
                const minutos = formData[question.subfields[2]] || 0;
                excelRow[columnName] = `${dias}d ${horas}h ${minutos}min`;
            }
        } else if (question.type === 'checkbox') {
            // Para checkboxes, juntar valores com vírgula
            const values = formData[question.field] || [];
            excelRow[columnName] = Array.isArray(values) ? values.join(', ') : values;
        } else if (question.type === 'table') {
            // Para a tabela de produtos, criar resumo ou número de produtos
            const produtos = formData[question.field] || [];
            excelRow[columnName] = `${produtos.length} produto(s)`;
        } else {
            // Campos simples
            excelRow[columnName] = formData[question.field] || '';
        }
    });
    
    // Adicionar metadados
    excelRow['Data da Entrevista'] = new Date(formData.dataEntrevista).toLocaleString('pt-BR');
    
    return excelRow;
}

// Criar popup com link de download
function showDownloadPopup(fileName) {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.id = 'download-popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Criar popup
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        text-align: center;
        animation: slideIn 0.3s ease;
    `;
    
    popup.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
        <h2 style="color: #27ae60; margin-bottom: 1rem;">Resposta Salva com Sucesso!</h2>
        <p style="color: #7f8c8d; margin-bottom: 1.5rem;">
            Os dados foram salvos no banco de dados local e um arquivo Excel foi gerado automaticamente.
        </p>
        <div style="background: #ecf0f1; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="margin: 0; font-size: 0.9rem; color: #2c3e50;">
                <strong>📊 Arquivo Excel:</strong><br>
                <code style="background: #2c3e50; color: #ecf0f1; padding: 0.3rem 0.6rem; border-radius: 4px; display: inline-block; margin-top: 0.5rem;">${fileName}</code>
            </p>
        </div>
        <p style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 1.5rem;">
            O download deve iniciar automaticamente. Se não iniciar, verifique a pasta de Downloads.
        </p>
        <button id="close-popup-btn" style="
            background: #3498db;
            color: white;
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s ease;
        ">OK, Entendi</button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Adicionar animações CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        #close-popup-btn:hover {
            background: #2980b9 !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
        }
    `;
    document.head.appendChild(style);
    
    // Fechar popup
    document.getElementById('close-popup-btn').addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
        }, 300);
    });
    
    // Adicionar animação de saída
    const styleOut = document.createElement('style');
    styleOut.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(styleOut);
}

// Mostrar popup de erros de validação
function showValidationErrorsPopup(errors) {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.id = 'validation-popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Criar popup
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 600px;
        max-height: 80vh;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        overflow-y: auto;
        animation: slideIn 0.3s ease;
    `;
    
    const errorsList = errors.map(err => 
        `<li style="margin-bottom: 0.5rem;">
            <strong>Pergunta ${err.questionNum}:</strong> ${err.label}
        </li>`
    ).join('');
    
    popup.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem; text-align: center;">⚠️</div>
        <h2 style="color: #e74c3c; margin-bottom: 1rem; text-align: center;">Campos Obrigatórios não Preenchidos</h2>
        <p style="color: #7f8c8d; margin-bottom: 1.5rem; text-align: center;">
            Por favor, preencha os seguintes campos antes de salvar:
        </p>
        <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #f39c12;">
            <ul style="margin: 0; padding-left: 1.5rem; color: #856404;">
                ${errorsList}
            </ul>
        </div>
        <p style="color: #7f8c8d; font-size: 0.9rem; margin-bottom: 1.5rem; text-align: center;">
            <strong>Total de campos pendentes:</strong> ${errors.length}
        </p>
        <div style="text-align: center;">
            <button id="close-validation-btn" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 0.8rem 2rem;
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
                font-weight: 600;
                transition: background 0.3s ease;
            ">OK, Vou Preencher</button>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Fechar popup e focar no primeiro campo com erro
    document.getElementById('close-validation-btn').addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(overlay);
            
            // Focar no primeiro campo com erro
            if (errors.length > 0) {
                const firstError = errors[0];
                let elementToFocus = null;
                
                if (firstError.field === 'origem') {
                    elementToFocus = document.getElementById('origem-pais');
                } else if (firstError.field === 'destino') {
                    elementToFocus = document.getElementById('destino-pais');
                } else if (firstError.field === 'tempo') {
                    elementToFocus = document.getElementById('tempo-dias');
                } else if (firstError.field === 'modos') {
                    elementToFocus = document.querySelector('input[name="modo"]');
                } else {
                    elementToFocus = document.getElementById(firstError.field.replace(/([A-Z])/g, '-$1').toLowerCase());
                    if (!elementToFocus) {
                        // Tentar com o nome original
                        elementToFocus = document.getElementById(firstError.field);
                    }
                }
                
                if (elementToFocus) {
                    elementToFocus.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => {
                        elementToFocus.focus();
                    }, 500);
                }
            }
        }, 300);
    });
}
