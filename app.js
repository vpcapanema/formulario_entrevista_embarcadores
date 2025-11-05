// Aplicação Principal
let produtoRowCounter = 0;

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await dbManager.init();
        console.log('Banco de dados inicializado');
        
        // Carregar lista de entrevistadores
        await carregarEntrevistadores();
        
        // Adicionar primeira linha de produto
        addProdutoRow();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Carregar respostas na página de visualização
        loadRespostasPage();
        
        // Carregar analytics
        loadAnalytics();
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        alert('Erro ao inicializar aplicação. Por favor, recarregue a página.');
    }
});

// Carregar lista de entrevistadores da API
async function carregarEntrevistadores() {
    const selectEntrevistador = document.getElementById('id-entrevistador');
    
    try {
        // Tentar carregar da API (se disponível)
        if (typeof api !== 'undefined') {
            const entrevistadores = await api.get(API_CONFIG.ENDPOINTS.entrevistadores);
            
            selectEntrevistador.innerHTML = '<option value="">Selecione um entrevistador...</option>';
            
            entrevistadores.forEach(entrevistador => {
                const option = document.createElement('option');
                option.value = entrevistador.id_entrevistador;
                option.textContent = `${entrevistador.nome_completo} - ${entrevistador.nome_instituicao || 'Sem instituição'}`;
                selectEntrevistador.appendChild(option);
            });
            
            console.log(`✅ ${entrevistadores.length} entrevistadores carregados`);
        } else {
            // Fallback: lista fixa se API não estiver disponível
            selectEntrevistador.innerHTML = `
                <option value="">Selecione um entrevistador...</option>
                <option value="1">Entrevistador Concremat</option>
                <option value="2">Entrevistador PLI 2050</option>
            `;
            console.log('⚠️ API não disponível, usando lista fixa de entrevistadores');
        }
    } catch (error) {
        console.error('Erro ao carregar entrevistadores:', error);
        // Fallback em caso de erro
        selectEntrevistador.innerHTML = `
            <option value="">Selecione um entrevistador...</option>
            <option value="1">Entrevistador Concremat</option>
            <option value="2">Entrevistador PLI 2050</option>
        `;
    }
}


// Configurar event listeners
function setupEventListeners() {
    // Formulário
    const form = document.getElementById('entrevista-form');
    form.addEventListener('submit', handleFormSubmit);
    
    // Seção 0: Responsável pelo preenchimento
    document.querySelectorAll('input[name="tipo-responsavel"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const entrevistadorContainer = document.getElementById('selecionar-entrevistador-container');
            const infoEntrevistadoContainer = document.getElementById('info-entrevistado-container');
            const isEntrevistador = this.value === 'entrevistador';
            
            entrevistadorContainer.classList.toggle('hidden-field', !isEntrevistador);
            infoEntrevistadoContainer.classList.toggle('hidden-field', isEntrevistador);
            
            // Tornar campo obrigatório/opcional
            const selectEntrevistador = document.getElementById('id-entrevistador');
            if (isEntrevistador) {
                selectEntrevistador.setAttribute('required', 'required');
            } else {
                selectEntrevistador.removeAttribute('required');
            }
        });
    });
    
    // Tipo de empresa
    document.getElementById('tipo-empresa').addEventListener('change', function() {
        const outroContainer = document.getElementById('outro-tipo-container');
        outroContainer.classList.toggle('hidden-field', this.value !== 'outro');
    });
    
    // Agrupamento de produto
    document.getElementById('agrupamento-produto').addEventListener('change', function() {
        const outroContainer = document.getElementById('outro-produto-container');
        outroContainer.classList.toggle('hidden-field', this.value !== 'outro-produto');
    });
    
    // Modo rodoviário
    document.querySelectorAll('input[name="modo"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const configContainer = document.getElementById('config-veiculo-container');
            const rodoviarioChecked = document.querySelector('input[name="modo"][value="rodoviario"]').checked;
            configContainer.classList.toggle('hidden-field', !rodoviarioChecked);
        });
    });
}

// Alternar visibilidade de paradas
function toggleParadas() {
    const temParadas = document.getElementById('tem-paradas').value;
    const numParadasContainer = document.getElementById('num-paradas-container');
    numParadasContainer.classList.toggle('hidden-field', temParadas !== 'sim');
}

// Alternar frequência diária
function toggleFrequenciaDiaria() {
    const frequencia = document.getElementById('frequencia').value;
    const diariaContainer = document.getElementById('frequencia-diaria-container');
    const outraContainer = document.getElementById('frequencia-outra-container');
    
    diariaContainer.classList.toggle('hidden-field', frequencia !== 'diaria');
    outraContainer.classList.toggle('hidden-field', frequencia !== 'outra');
}

// Adicionar linha de produto na tabela
function addProdutoRow() {
    const tbody = document.getElementById('produtos-tbody');
    const rowId = `produto-row-${produtoRowCounter++}`;
    
    const row = document.createElement('tr');
    row.id = rowId;
    row.innerHTML = `
        <td><input type="text" name="produto-carga-${produtoRowCounter}" class="table-input" placeholder="Nome da carga"></td>
        <td><input type="number" name="produto-movimentacao-${produtoRowCounter}" class="table-input" placeholder="Toneladas/ano" min="0"></td>
        <td><input type="text" name="produto-origem-${produtoRowCounter}" class="table-input" placeholder="Origem"></td>
        <td><input type="text" name="produto-destino-${produtoRowCounter}" class="table-input" placeholder="Destino"></td>
        <td><input type="number" name="produto-distancia-${produtoRowCounter}" class="table-input" placeholder="km" min="0"></td>
        <td>
            <select name="produto-modalidade-${produtoRowCounter}" class="table-input">
                <option value="">Selecione...</option>
                <option value="rodoviario">Rodoviário</option>
                <option value="ferroviario">Ferroviário</option>
                <option value="hidroviario">Hidroviário</option>
                <option value="cabotagem">Cabotagem</option>
                <option value="dutoviario">Dutoviário</option>
                <option value="aeroviario">Aeroviário</option>
            </select>
        </td>
        <td><input type="text" name="produto-acondicionamento-${produtoRowCounter}" class="table-input" placeholder="Tipo"></td>
        <td><button type="button" class="btn-remove" onclick="removeProdutoRow('${rowId}')">🗑️</button></td>
    `;
    
    tbody.appendChild(row);
}

// Remover linha de produto
function removeProdutoRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
    }
}

// Coletar dados do formulário
function collectFormData() {
    const formData = {};
    
    // Seção 0: Responsável pelo preenchimento
    const tipoResponsavel = document.querySelector('input[name="tipo-responsavel"]:checked').value;
    formData.tipoResponsavel = tipoResponsavel;
    
    if (tipoResponsavel === 'entrevistador') {
        const idEntrevistador = document.getElementById('id-entrevistador').value;
        formData.idResponsavel = idEntrevistador;
    }
    // Se for entrevistado, o idResponsavel será o id_entrevistado (será definido no backend)
    
    // Dados básicos
    formData.nome = document.getElementById('nome').value;
    formData.funcao = document.getElementById('funcao').value;
    formData.telefone = document.getElementById('telefone').value;
    formData.email = document.getElementById('email').value;
    
    // Dados da empresa
    formData.tipoEmpresa = document.getElementById('tipo-empresa').value;
    if (formData.tipoEmpresa === 'outro') {
        formData.outroTipo = document.getElementById('outro-tipo').value;
    }
    formData.nomeEmpresa = document.getElementById('nome-empresa').value;
    formData.municipio = document.getElementById('municipio').value;
    
    // Produtos transportados (tabela)
    formData.produtos = [];
    const produtoRows = document.querySelectorAll('#produtos-tbody tr');
    produtoRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input, select');
        const produto = {
            carga: inputs[0].value,
            movimentacao: inputs[1].value,
            origem: inputs[2].value,
            destino: inputs[3].value,
            distancia: inputs[4].value,
            modalidade: inputs[5].value,
            acondicionamento: inputs[6].value
        };
        
        // Só adicionar se tiver pelo menos a carga preenchida
        if (produto.carga) {
            formData.produtos.push(produto);
        }
    });
    
    // Produto principal
    formData.produtoPrincipal = document.getElementById('produto-principal').value;
    formData.agrupamentoProduto = document.getElementById('agrupamento-produto').value;
    if (formData.agrupamentoProduto === 'outro-produto') {
        formData.outroProduto = document.getElementById('outro-produto').value;
    }
    
    // Características do transporte
    formData.tipoTransporte = document.getElementById('tipo-transporte').value;
    formData.origemPais = document.getElementById('origem-pais').value;
    formData.origemEstado = document.getElementById('origem-estado').value;
    formData.origemMunicipio = document.getElementById('origem-municipio').value;
    formData.destinoPais = document.getElementById('destino-pais').value;
    formData.destinoEstado = document.getElementById('destino-estado').value;
    formData.destinoMunicipio = document.getElementById('destino-municipio').value;
    formData.distancia = document.getElementById('distancia').value;
    formData.temParadas = document.getElementById('tem-paradas').value;
    if (formData.temParadas === 'sim') {
        formData.numParadas = document.getElementById('num-paradas').value;
    }
    
    // Modos de transporte
    formData.modos = [];
    document.querySelectorAll('input[name="modo"]:checked').forEach(checkbox => {
        formData.modos.push(checkbox.value);
    });
    
    if (formData.modos.includes('rodoviario')) {
        formData.configVeiculo = document.getElementById('config-veiculo').value;
    }
    
    formData.capacidadeUtilizada = document.getElementById('capacidade-utilizada').value;
    formData.pesoCarga = document.getElementById('peso-carga').value;
    formData.unidadePeso = document.getElementById('unidade-peso').value;
    formData.custoTransporte = document.getElementById('custo-transporte').value;
    formData.valorCarga = document.getElementById('valor-carga').value;
    formData.tipoEmbalagem = document.getElementById('tipo-embalagem').value;
    formData.cargaPerigosa = document.getElementById('carga-perigosa').value;
    
    // Tempo de deslocamento
    formData.tempoDias = document.getElementById('tempo-dias').value;
    formData.tempoHoras = document.getElementById('tempo-horas').value;
    formData.tempoMinutos = document.getElementById('tempo-minutos').value;
    
    formData.frequencia = document.getElementById('frequencia').value;
    if (formData.frequencia === 'diaria') {
        formData.frequenciaDiaria = document.getElementById('frequencia-diaria').value;
    }
    if (formData.frequencia === 'outra') {
        formData.frequenciaOutra = document.getElementById('frequencia-outra').value;
    }
    
    // Fatores de decisão
    formData.importanciaCusto = document.getElementById('importancia-custo').value;
    formData.variacaoCusto = document.getElementById('variacao-custo').value;
    formData.importanciaTempo = document.getElementById('importancia-tempo').value;
    formData.variacaoTempo = document.getElementById('variacao-tempo').value;
    formData.importanciaConfiabilidade = document.getElementById('importancia-confiabilidade').value;
    formData.variacaoConfiabilidade = document.getElementById('variacao-confiabilidade').value;
    formData.importanciaSeguranca = document.getElementById('importancia-seguranca').value;
    formData.variacaoSeguranca = document.getElementById('variacao-seguranca').value;
    formData.importanciaCapacidade = document.getElementById('importancia-capacidade').value;
    formData.variacaoCapacidade = document.getElementById('variacao-capacidade').value;
    
    // Análise estratégica
    formData.tipoCadeia = document.getElementById('tipo-cadeia').value;
    
    formData.modaisAlternativos = [];
    document.querySelectorAll('input[name="modal-alternativo"]:checked').forEach(checkbox => {
        formData.modaisAlternativos.push(checkbox.value);
    });
    
    formData.fatorAdicional = document.getElementById('fator-adicional').value;
    
    // Dificuldades
    formData.dificuldades = [];
    document.querySelectorAll('input[name="dificuldade"]:checked').forEach(checkbox => {
        formData.dificuldades.push(checkbox.value);
    });
    
    formData.detalheDificuldade = document.getElementById('detalhe-dificuldade').value;
    
    return formData;
}

// Gerar linha Excel a partir dos dados do formulário
function generateExcelFromSingleResponse(data) {
    const excelRow = {
        // Card 0 - Responsável pelo Preenchimento
        'Q0.1. Tipo de Responsável': data.tipoResponsavel || '',
        'Q0.2. ID do Responsável': data.idResponsavel || '',
        
        // Card 1 - Dados do Entrevistado
        'Q1. Nome': data.nome || '',
        'Q2. Função': data.funcao || '',
        'Q3. Telefone': data.telefone || '',
        'Q4. Email': data.email || '',
        
        // Card 2 - Dados da Empresa
        'Q5. Tipo de Empresa': data.tipoEmpresa || '',
        'Q5.1. Outro Tipo': data.outroTipo || '',
        'Q6. Nome da Empresa': data.nomeEmpresa || '',
        'Q7. Município': data.municipio || '',
        
        // Card 3 - Produtos (resumo)
        'Q8. Número de Produtos': (data.produtos && data.produtos.length) || 0,
        
        // Card 4 - Produto Principal
        'Q9. Produto Principal': data.produtoPrincipal || '',
        'Q10. Agrupamento': data.agrupamentoProduto || '',
        'Q10.1. Outro Produto': data.outroProduto || '',
        
        // Card 5 - Características do Transporte
        'Q11. Tipo de Transporte': data.tipoTransporte || '',
        'Q12. Origem (País)': data.origemPais || '',
        'Q12. Origem (Estado)': data.origemEstado || '',
        'Q12. Origem (Município)': data.origemMunicipio || '',
        'Q13. Destino (País)': data.destinoPais || '',
        'Q13. Destino (Estado)': data.destinoEstado || '',
        'Q13. Destino (Município)': data.destinoMunicipio || '',
        'Q14. Distância (km)': data.distancia || '',
        'Q15. Tem Paradas?': data.temParadas || '',
        'Q16. Número de Paradas': data.numParadas || '',
        'Q17. Modos': (data.modos && data.modos.join(', ')) || '',
        'Q17.1. Config. Veículo': data.configVeiculo || '',
        'Q18. Capacidade Utilizada (%)': data.capacidadeUtilizada || '',
        'Q19. Peso da Carga': data.pesoCarga || '',
        'Q19. Unidade': data.unidadePeso || '',
        'Q20. Custo Transporte (R$/ton)': data.custoTransporte || '',
        'Q21. Valor da Carga (R$)': data.valorCarga || '',
        'Q22. Tipo de Embalagem': data.tipoEmbalagem || '',
        'Q23. Carga Perigosa?': data.cargaPerigosa || '',
        'Q24. Tempo (dias)': data.tempoDias || '',
        'Q24. Tempo (horas)': data.tempoHoras || '',
        'Q24. Tempo (minutos)': data.tempoMinutos || '',
        'Q25. Frequência': data.frequencia || '',
        'Q25.1. Freq. Diária': data.frequenciaDiaria || '',
        'Q25.2. Freq. Outra': data.frequenciaOutra || '',
        
        // Card 6 - Fatores de Decisão
        'Q26. Import. Custo': data.importanciaCusto || '',
        'Q27. Variação Custo (%)': data.variacaoCusto || '',
        'Q28. Import. Tempo': data.importanciaTempo || '',
        'Q29. Variação Tempo (%)': data.variacaoTempo || '',
        'Q30. Import. Confiabilidade': data.importanciaConfiabilidade || '',
        'Q31. Variação Confiabilidade (%)': data.variacaoConfiabilidade || '',
        'Q32. Import. Segurança': data.importanciaSeguranca || '',
        'Q33. Variação Segurança (%)': data.variacaoSeguranca || '',
        'Q34. Import. Capacidade': data.importanciaCapacidade || '',
        'Q35. Variação Capacidade (%)': data.variacaoCapacidade || '',
        
        // Card 7 - Análise Estratégica
        'Q36. Tipo de Cadeia': data.tipoCadeia || '',
        'Q37. Modais Alternativos': (data.modaisAlternativos && data.modaisAlternativos.join(', ')) || '',
        'Q38. Fator Adicional': data.fatorAdicional || '',
        
        // Card 8 - Dificuldades
        'Q39. Dificuldades': (data.dificuldades && data.dificuldades.join(', ')) || '',
        'Q40. Detalhamento': data.detalheDificuldade || '',
        
        // Metadados
        'Data/Hora Resposta': new Date().toLocaleString('pt-BR')
    };
    
    return excelRow;
}

// Enviar formulário
async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        const formData = collectFormData();
        
        // Validar campos obrigatórios
        const validationErrors = validateRequiredFields(formData);
        
        if (validationErrors.length > 0) {
            showValidationErrorsPopup(validationErrors);
            return; // Não salvar se houver erros
        }
        
        // Salvar no banco de dados
        await dbManager.saveResposta(formData);
        
        // Gerar arquivo Excel automaticamente
        const excelRow = generateExcelFromSingleResponse(formData);
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const fileName = `PLI2050_Resposta_${formData.nomeEmpresa.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`;
        
        // Criar workbook do Excel
        const ws = XLSX.utils.json_to_sheet([excelRow]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Resposta');
        
        // Se houver produtos, adicionar aba
        if (formData.produtos && formData.produtos.length > 0) {
            const produtosData = formData.produtos.map((p, idx) => ({
                'Item': idx + 1,
                'Carga Transportada': p.carga,
                'Movimentação (ton/ano)': p.movimentacao,
                'Origem': p.origem,
                'Destino': p.destino,
                'Distância (km)': p.distancia,
                'Modalidade': p.modalidade,
                'Acondicionamento': p.acondicionamento
            }));
            const wsProdutos = XLSX.utils.json_to_sheet(produtosData);
            XLSX.utils.book_append_sheet(wb, wsProdutos, 'Produtos (Q8)');
        }
        
        // Fazer download do Excel
        XLSX.writeFile(wb, fileName);
        
        // Mostrar popup de sucesso
        showDownloadPopup(fileName);
        
        // Limpar formulário
        document.getElementById('entrevista-form').reset();
        
        // Recriar primeira linha de produtos
        document.getElementById('produtos-tbody').innerHTML = '';
        produtoRowCounter = 0;
        addProdutoRow();
        
        // Atualizar página de respostas
        loadRespostasPage();
        
        // Atualizar analytics
        loadAnalytics();
        
    } catch (error) {
        console.error('Erro ao salvar resposta:', error);
        alert('❌ Erro ao salvar resposta. Por favor, tente novamente.');
    }
}

// Navegação entre páginas
function showPage(pageName) {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remover classe active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar página selecionada
    document.getElementById(`page-${pageName}`).classList.add('active');
    
    // Adicionar classe active ao botão
    event.target.closest('.nav-btn').classList.add('active');
    
    // Recarregar dados se necessário
    if (pageName === 'respostas') {
        loadRespostasPage();
    } else if (pageName === 'analytics') {
        loadAnalytics();
    }
}

// Carregar página de respostas
async function loadRespostasPage() {
    try {
        const respostas = await dbManager.getAllRespostas();
        const container = document.getElementById('respostas-list');
        
        if (respostas.length === 0) {
            container.innerHTML = '<div class="empty-state">📭 Nenhuma resposta coletada ainda.</div>';
            return;
        }
        
        let html = '';
        respostas.forEach((resposta, index) => {
            const dataEntrevista = new Date(resposta.dataEntrevista).toLocaleString('pt-BR');
            
            html += `
                <div class="resposta-card">
                    <div class="resposta-header">
                        <div>
                            <h3>${index + 1}. ${resposta.nomeEmpresa}</h3>
                            <p class="resposta-meta">Entrevistado: ${resposta.nome} | Data: ${dataEntrevista}</p>
                        </div>
                        <button class="btn-delete" onclick="deleteResposta(${resposta.id})">🗑️ Excluir</button>
                    </div>
                    <div class="resposta-body">
                        <div class="resposta-section">
                            <h4>📋 Informações Gerais</h4>
                            <div class="info-grid">
                                <div><strong>Tipo:</strong> ${resposta.tipoEmpresa}</div>
                                <div><strong>Município:</strong> ${resposta.municipio}</div>
                                <div><strong>Entrevistado:</strong> ${resposta.nome} (${resposta.funcao})</div>
                                <div><strong>Contato:</strong> ${resposta.email} | ${resposta.telefone}</div>
                            </div>
                        </div>
                        
                        <div class="resposta-section">
                            <h4>📦 Produto Principal</h4>
                            <div class="info-grid">
                                <div><strong>Produto:</strong> ${resposta.produtoPrincipal}</div>
                                <div><strong>Agrupamento:</strong> ${resposta.agrupamentoProduto}</div>
                                <div><strong>Tipo de Transporte:</strong> ${resposta.tipoTransporte}</div>
                                <div><strong>Embalagem:</strong> ${resposta.tipoEmbalagem}</div>
                            </div>
                        </div>
                        
                        <div class="resposta-section">
                            <h4>🚚 Características do Transporte</h4>
                            <div class="info-grid">
                                <div><strong>Origem:</strong> ${resposta.origemMunicipio}, ${resposta.origemEstado}, ${resposta.origemPais}</div>
                                <div><strong>Destino:</strong> ${resposta.destinoMunicipio}, ${resposta.destinoEstado}, ${resposta.destinoPais}</div>
                                <div><strong>Distância:</strong> ${resposta.distancia} km</div>
                                <div><strong>Modalidades:</strong> ${resposta.modos.join(', ')}</div>
                                <div><strong>Peso:</strong> ${resposta.pesoCarga} ${resposta.unidadePeso}</div>
                                <div><strong>Capacidade Utilizada:</strong> ${resposta.capacidadeUtilizada}%</div>
                                <div><strong>Custo:</strong> R$ ${parseFloat(resposta.custoTransporte).toLocaleString('pt-BR')}</div>
                                <div><strong>Valor da Carga:</strong> R$ ${parseFloat(resposta.valorCarga).toLocaleString('pt-BR')}</div>
                                <div><strong>Tempo:</strong> ${resposta.tempoDias}d ${resposta.tempoHoras}h ${resposta.tempoMinutos}min</div>
                                <div><strong>Frequência:</strong> ${resposta.frequencia}</div>
                                <div><strong>Carga Perigosa:</strong> ${resposta.cargaPerigosa}</div>
                            </div>
                        </div>
                        
                        ${resposta.produtos && resposta.produtos.length > 0 ? `
                        <div class="resposta-section">
                            <h4>📊 Produtos Transportados</h4>
                            <div class="table-responsive">
                                <table class="resposta-table">
                                    <thead>
                                        <tr>
                                            <th>Carga</th>
                                            <th>Movimentação (ton/ano)</th>
                                            <th>Origem</th>
                                            <th>Destino</th>
                                            <th>Distância (km)</th>
                                            <th>Modalidade</th>
                                            <th>Acondicionamento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${resposta.produtos.map(p => `
                                            <tr>
                                                <td>${p.carga || '-'}</td>
                                                <td>${p.movimentacao || '-'}</td>
                                                <td>${p.origem || '-'}</td>
                                                <td>${p.destino || '-'}</td>
                                                <td>${p.distancia || '-'}</td>
                                                <td>${p.modalidade || '-'}</td>
                                                <td>${p.acondicionamento || '-'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="resposta-section">
                            <h4>⚖️ Fatores de Decisão Modal</h4>
                            <div class="factors-grid">
                                <div class="factor-item">
                                    <strong>💰 CUSTO</strong>
                                    <span>Importância: ${resposta.importanciaCusto}</span>
                                    <span>Sensibilidade: ${resposta.variacaoCusto}%</span>
                                </div>
                                <div class="factor-item">
                                    <strong>⏱️ TEMPO</strong>
                                    <span>Importância: ${resposta.importanciaTempo}</span>
                                    <span>Sensibilidade: ${resposta.variacaoTempo}%</span>
                                </div>
                                <div class="factor-item">
                                    <strong>✅ CONFIABILIDADE</strong>
                                    <span>Importância: ${resposta.importanciaConfiabilidade}</span>
                                    <span>Sensibilidade: ${resposta.variacaoConfiabilidade}%</span>
                                </div>
                                <div class="factor-item">
                                    <strong>🔒 SEGURANÇA</strong>
                                    <span>Importância: ${resposta.importanciaSeguranca}</span>
                                    <span>Sensibilidade: ${resposta.variacaoSeguranca}%</span>
                                </div>
                                <div class="factor-item">
                                    <strong>📦 CAPACIDADE</strong>
                                    <span>Importância: ${resposta.importanciaCapacidade}</span>
                                    <span>Sensibilidade: ${resposta.variacaoCapacidade}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="resposta-section">
                            <h4>🔄 Análise Estratégica</h4>
                            <div class="info-grid">
                                <div><strong>Tipo de Cadeia:</strong> ${resposta.tipoCadeia}</div>
                                <div><strong>Modais Alternativos:</strong> ${resposta.modaisAlternativos.join(', ') || 'Nenhum'}</div>
                            </div>
                            ${resposta.fatorAdicional ? `<p><strong>Fatores Adicionais:</strong> ${resposta.fatorAdicional}</p>` : ''}
                        </div>
                        
                        <div class="resposta-section">
                            <h4>⚠️ Dificuldades Logísticas</h4>
                            <div class="tags">
                                ${resposta.dificuldades.map(d => `<span class="tag">${d}</span>`).join('')}
                            </div>
                            ${resposta.detalheDificuldade ? `<p class="mt-2"><strong>Detalhes:</strong> ${resposta.detalheDificuldade}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Erro ao carregar respostas:', error);
    }
}

// Deletar resposta individual
async function deleteResposta(id) {
    if (!confirm('Tem certeza que deseja excluir esta resposta?')) {
        return;
    }
    
    try {
        await dbManager.deleteResposta(id);
        alert('✅ Resposta excluída com sucesso!');
        loadRespostasPage();
        loadAnalytics();
    } catch (error) {
        console.error('Erro ao deletar resposta:', error);
        alert('❌ Erro ao deletar resposta.');
    }
}

// Deletar todas as respostas
async function deleteAllData() {
    if (!confirm('⚠️ ATENÇÃO: Isso irá excluir TODAS as respostas permanentemente. Deseja continuar?')) {
        return;
    }
    
    if (!confirm('Confirma novamente a exclusão de TODOS os dados?')) {
        return;
    }
    
    try {
        await dbManager.deleteAllRespostas();
        alert('✅ Todas as respostas foram excluídas!');
        loadRespostasPage();
        loadAnalytics();
    } catch (error) {
        console.error('Erro ao deletar todas as respostas:', error);
        alert('❌ Erro ao deletar respostas.');
    }
}

// Exportar para Excel
async function exportToExcel(tipo) {
    try {
        const respostas = await dbManager.getAllRespostas();
        
        if (respostas.length === 0) {
            alert('⚠️ Não há dados para exportar.');
            return;
        }
        
        // Preparar dados para exportação
        const dadosExportacao = respostas.map((r, index) => {
            const pesoEmToneladas = r.unidadePeso === 'kg' 
                ? parseFloat(r.pesoCarga) / 1000 
                : parseFloat(r.pesoCarga);
            
            return {
                'ID': index + 1,
                'Data da Entrevista': new Date(r.dataEntrevista).toLocaleString('pt-BR'),
                'Nome do Entrevistado': r.nome,
                'Função': r.funcao,
                'Telefone': r.telefone,
                'E-mail': r.email,
                'Tipo de Empresa': r.tipoEmpresa,
                'Nome da Empresa': r.nomeEmpresa,
                'Município': r.municipio,
                'Produto Principal': r.produtoPrincipal,
                'Agrupamento do Produto': r.agrupamentoProduto,
                'Tipo de Transporte': r.tipoTransporte,
                'Origem (País)': r.origemPais,
                'Origem (Estado)': r.origemEstado,
                'Origem (Município)': r.origemMunicipio,
                'Destino (País)': r.destinoPais,
                'Destino (Estado)': r.destinoEstado,
                'Destino (Município)': r.destinoMunicipio,
                'Distância (km)': r.distancia,
                'Tem Paradas': r.temParadas,
                'Número de Paradas': r.numParadas || '',
                'Modalidades': r.modos ? r.modos.join(', ') : '',
                'Configuração do Veículo': r.configVeiculo || '',
                'Capacidade Utilizada (%)': r.capacidadeUtilizada,
                'Peso da Carga (toneladas)': pesoEmToneladas,
                'Custo do Transporte (R$)': parseFloat(r.custoTransporte),
                'Valor da Carga (R$)': parseFloat(r.valorCarga),
                'Tipo de Embalagem': r.tipoEmbalagem,
                'Carga Perigosa': r.cargaPerigosa,
                'Tempo (dias)': r.tempoDias,
                'Tempo (horas)': r.tempoHoras,
                'Tempo (minutos)': r.tempoMinutos,
                'Frequência': r.frequencia,
                'Frequência Diária': r.frequenciaDiaria || '',
                'Importância - Custo': r.importanciaCusto,
                'Variação % - Custo': r.variacaoCusto,
                'Importância - Tempo': r.importanciaTempo,
                'Variação % - Tempo': r.variacaoTempo,
                'Importância - Confiabilidade': r.importanciaConfiabilidade,
                'Variação % - Confiabilidade': r.variacaoConfiabilidade,
                'Importância - Segurança': r.importanciaSeguranca,
                'Variação % - Segurança': r.variacaoSeguranca,
                'Importância - Capacidade': r.importanciaCapacidade,
                'Variação % - Capacidade': r.variacaoCapacidade,
                'Tipo de Cadeia': r.tipoCadeia,
                'Modais Alternativos': r.modaisAlternativos ? r.modaisAlternativos.join(', ') : '',
                'Fator Adicional': r.fatorAdicional || '',
                'Dificuldades': r.dificuldades ? r.dificuldades.join(', ') : '',
                'Detalhe da Dificuldade': r.detalheDificuldade || ''
            };
        });
        
        // Criar workbook
        const ws = XLSX.utils.json_to_sheet(dadosExportacao);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Respostas');
        
        // Se houver produtos transportados, criar aba separada
        const produtosData = [];
        respostas.forEach((r, index) => {
            if (r.produtos && r.produtos.length > 0) {
                r.produtos.forEach(p => {
                    produtosData.push({
                        'ID Empresa': index + 1,
                        'Nome Empresa': r.nomeEmpresa,
                        'Carga Transportada': p.carga,
                        'Movimentação (ton/ano)': p.movimentacao,
                        'Origem': p.origem,
                        'Destino': p.destino,
                        'Distância (km)': p.distancia,
                        'Modalidade': p.modalidade,
                        'Acondicionamento': p.acondicionamento
                    });
                });
            }
        });
        
        if (produtosData.length > 0) {
            const wsProdutos = XLSX.utils.json_to_sheet(produtosData);
            XLSX.utils.book_append_sheet(wb, wsProdutos, 'Produtos Transportados');
        }
        
        // Salvar arquivo
        const fileName = `PLI2050_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        alert('✅ Arquivo Excel exportado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
        alert('❌ Erro ao exportar arquivo Excel.');
    }
}

// Exportar para CSV
async function exportToCSV(tipo) {
    try {
        const respostas = await dbManager.getAllRespostas();
        
        if (respostas.length === 0) {
            alert('⚠️ Não há dados para exportar.');
            return;
        }
        
        // Preparar dados
        const headers = [
            'ID', 'Data da Entrevista', 'Nome do Entrevistado', 'Função', 'Telefone', 'E-mail',
            'Tipo de Empresa', 'Nome da Empresa', 'Município', 'Produto Principal', 
            'Agrupamento do Produto', 'Tipo de Transporte', 'Origem (País)', 'Origem (Estado)', 
            'Origem (Município)', 'Destino (País)', 'Destino (Estado)', 'Destino (Município)',
            'Distância (km)', 'Tem Paradas', 'Número de Paradas', 'Modalidades',
            'Configuração do Veículo', 'Capacidade Utilizada (%)', 'Peso da Carga (toneladas)',
            'Custo do Transporte (R$)', 'Valor da Carga (R$)', 'Tipo de Embalagem',
            'Carga Perigosa', 'Tempo (dias)', 'Tempo (horas)', 'Tempo (minutos)', 'Frequência',
            'Importância - Custo', 'Variação % - Custo', 'Importância - Tempo', 'Variação % - Tempo',
            'Importância - Confiabilidade', 'Variação % - Confiabilidade', 'Importância - Segurança',
            'Variação % - Segurança', 'Importância - Capacidade', 'Variação % - Capacidade',
            'Tipo de Cadeia', 'Modais Alternativos', 'Fator Adicional', 'Dificuldades',
            'Detalhe da Dificuldade'
        ];
        
        let csvContent = headers.join(',') + '\n';
        
        respostas.forEach((r, index) => {
            const pesoEmToneladas = r.unidadePeso === 'kg' 
                ? parseFloat(r.pesoCarga) / 1000 
                : parseFloat(r.pesoCarga);
            
            const row = [
                index + 1,
                new Date(r.dataEntrevista).toLocaleString('pt-BR'),
                r.nome,
                r.funcao,
                r.telefone,
                r.email,
                r.tipoEmpresa,
                r.nomeEmpresa,
                r.municipio,
                r.produtoPrincipal,
                r.agrupamentoProduto,
                r.tipoTransporte,
                r.origemPais,
                r.origemEstado,
                r.origemMunicipio,
                r.destinoPais,
                r.destinoEstado,
                r.destinoMunicipio,
                r.distancia,
                r.temParadas,
                r.numParadas || '',
                r.modos ? r.modos.join('; ') : '',
                r.configVeiculo || '',
                r.capacidadeUtilizada,
                pesoEmToneladas,
                parseFloat(r.custoTransporte),
                parseFloat(r.valorCarga),
                r.tipoEmbalagem,
                r.cargaPerigosa,
                r.tempoDias,
                r.tempoHoras,
                r.tempoMinutos,
                r.frequencia,
                r.importanciaCusto,
                r.variacaoCusto,
                r.importanciaTempo,
                r.variacaoTempo,
                r.importanciaConfiabilidade,
                r.variacaoConfiabilidade,
                r.importanciaSeguranca,
                r.variacaoSeguranca,
                r.importanciaCapacidade,
                r.variacaoCapacidade,
                r.tipoCadeia,
                r.modaisAlternativos ? r.modaisAlternativos.join('; ') : '',
                r.fatorAdicional || '',
                r.dificuldades ? r.dificuldades.join('; ') : '',
                r.detalheDificuldade || ''
            ];
            
            // Escapar vírgulas e aspas
            const escapedRow = row.map(field => {
                if (field === null || field === undefined) return '';
                const stringField = String(field);
                if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                    return '"' + stringField.replace(/"/g, '""') + '"';
                }
                return stringField;
            });
            
            csvContent += escapedRow.join(',') + '\n';
        });
        
        // Download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const fileName = `PLI2050_${tipo}_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('✅ Arquivo CSV exportado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao exportar para CSV:', error);
        alert('❌ Erro ao exportar arquivo CSV.');
    }
}

// Exportar para PDF
async function exportToPDF() {
    try {
        const respostas = await dbManager.getAllRespostas();
        
        if (respostas.length === 0) {
            alert('⚠️ Não há dados para exportar.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(18);
        doc.text('PLI 2050 - Relatório de Analytics', 14, 20);
        
        doc.setFontSize(12);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
        doc.text(`Total de Empresas: ${respostas.length}`, 14, 38);
        
        let yPos = 50;
        
        // KPIs
        doc.setFontSize(14);
        doc.text('Indicadores Principais', 14, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        
        // Volume total
        let volumeTotal = 0;
        respostas.forEach(r => {
            const peso = parseFloat(r.pesoCarga) || 0;
            const pesoEmToneladas = r.unidadePeso === 'kg' ? peso / 1000 : peso;
            volumeTotal += pesoEmToneladas;
        });
        
        doc.text(`Volume Total Transportado: ${volumeTotal.toLocaleString('pt-BR')} toneladas`, 14, yPos);
        yPos += 8;
        
        // Valor total
        const valorTotal = respostas.reduce((sum, r) => sum + (parseFloat(r.valorCarga) || 0), 0);
        doc.text(`Valor Total Movimentado: R$ ${valorTotal.toLocaleString('pt-BR')}`, 14, yPos);
        yPos += 8;
        
        // Distância média
        const distanciaMedia = respostas.reduce((sum, r) => sum + (parseFloat(r.distancia) || 0), 0) / respostas.length;
        doc.text(`Distância Média: ${distanciaMedia.toFixed(0)} km`, 14, yPos);
        yPos += 15;
        
        // Distribuição Modal
        doc.setFontSize(14);
        doc.text('Distribuição Modal', 14, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        const modoCount = {};
        respostas.forEach(r => {
            if (r.modos) {
                r.modos.forEach(modo => {
                    modoCount[modo] = (modoCount[modo] || 0) + 1;
                });
            }
        });
        
        Object.entries(modoCount).forEach(([modo, count]) => {
            const percentual = ((count / respostas.length) * 100).toFixed(1);
            doc.text(`${modo}: ${count} (${percentual}%)`, 14, yPos);
            yPos += 6;
        });
        
        // Nova página para tabela detalhada
        doc.addPage();
        yPos = 20;
        
        doc.setFontSize(14);
        doc.text('Dados Detalhados das Empresas', 14, yPos);
        yPos += 10;
        
        // Criar tabela
        const tableData = respostas.map((r, index) => [
            index + 1,
            r.nomeEmpresa,
            r.produtoPrincipal,
            r.modos ? r.modos.join(', ') : '',
            r.distancia + ' km',
            'R$ ' + parseFloat(r.custoTransporte).toLocaleString('pt-BR')
        ]);
        
        doc.autoTable({
            head: [['ID', 'Empresa', 'Produto', 'Modalidades', 'Distância', 'Custo']],
            body: tableData,
            startY: yPos,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] },
            margin: { top: 10 }
        });
        
        // Salvar PDF
        const fileName = `PLI2050_Analytics_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        alert('✅ Arquivo PDF exportado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao exportar para PDF:', error);
        alert('❌ Erro ao exportar arquivo PDF.');
    }
}

// ============================================
// FUNÇÕES DO VISUALIZADOR DE DADOS
// ============================================

// Detectar navegador e mostrar caminho do IndexedDB
function detectBrowserAndPath() {
    const userAgent = navigator.userAgent;
    let browserName = 'Desconhecido';
    let storagePath = '';

    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
        browserName = 'Google Chrome';
        storagePath = `
            <strong>Windows:</strong><br>
            C:\\Users\\[SeuUsuário]\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\IndexedDB\\
            <br><br>
            <strong>Mac:</strong><br>
            ~/Library/Application Support/Google/Chrome/Default/IndexedDB/
            <br><br>
            <strong>Linux:</strong><br>
            ~/.config/google-chrome/Default/IndexedDB/
        `;
    } else if (userAgent.indexOf('Edg') > -1) {
        browserName = 'Microsoft Edge';
        storagePath = `
            <strong>Windows:</strong><br>
            C:\\Users\\[SeuUsuário]\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\IndexedDB\\
            <br><br>
            <strong>Mac:</strong><br>
            ~/Library/Application Support/Microsoft Edge/Default/IndexedDB/
        `;
    } else if (userAgent.indexOf('Firefox') > -1) {
        browserName = 'Mozilla Firefox';
        storagePath = `
            <strong>Windows:</strong><br>
            C:\\Users\\[SeuUsuário]\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\[profile]\\storage\\default\\
            <br><br>
            <strong>Mac:</strong><br>
            ~/Library/Application Support/Firefox/Profiles/[profile]/storage/default/
        `;
    } else if (userAgent.indexOf('Safari') > -1) {
        browserName = 'Safari';
        storagePath = `
            <strong>Mac:</strong><br>
            ~/Library/Safari/Databases/
        `;
    }

    const browserEl = document.getElementById('browser-name-vis');
    const pathEl = document.getElementById('storage-path-vis');
    
    if (browserEl) browserEl.textContent = browserName;
    if (pathEl) pathEl.innerHTML = storagePath;
}

// Carregar e exibir dados
async function loadDataVisualizer() {
    try {
        const respostas = await dbManager.getAllRespostas();
        const container = document.getElementById('data-container-vis');
        
        if (respostas.length === 0) {
            container.innerHTML = '<p style="color: #666;">Nenhum dado encontrado no banco de dados.</p>';
            return;
        }

        let html = `<p><strong>Total de registros:</strong> ${respostas.length}</p><hr>`;
        
        respostas.forEach((resp, index) => {
            html += `
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <h4 style="color: var(--primary-color);">Registro ${index + 1} (ID: ${resp.id})</h4>
                    <p><strong>Empresa:</strong> ${resp.nomeEmpresa}</p>
                    <p><strong>Produto Principal:</strong> ${resp.produtoPrincipal}</p>
                    <p><strong>Data:</strong> ${new Date(resp.dataEntrevista).toLocaleString('pt-BR')}</p>
                    <details>
                        <summary style="cursor: pointer; color: var(--secondary-color); font-weight: bold;">Ver dados completos</summary>
                        <pre style="background: white; padding: 1rem; border-radius: 4px; overflow-x: auto; margin-top: 0.5rem;">${JSON.stringify(resp, null, 2)}</pre>
                    </details>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Atualizar estatísticas
        const statsContainer = document.getElementById('stats-container-vis');
        if (statsContainer) {
            const totalProdutos = respostas.reduce((sum, r) => sum + (r.produtos?.length || 0), 0);
            statsContainer.innerHTML = `
                <p>📊 <strong>Total de entrevistas:</strong> ${respostas.length}</p>
                <p>📦 <strong>Total de produtos cadastrados:</strong> ${totalProdutos}</p>
                <p>📅 <strong>Última atualização:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            `;
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados do banco de dados.');
    }
}

// Mostrar JSON completo
async function showRawDataVisualizer() {
    try {
        const respostas = await dbManager.getAllRespostas();
        const container = document.getElementById('data-container-vis');
        
        container.innerHTML = `
            <div style="background: #2c3e50; color: #ecf0f1; padding: 1.5rem; border-radius: 8px; overflow-x: auto;">
                <pre style="margin: 0; font-family: 'Courier New', monospace;">${JSON.stringify(respostas, null, 2)}</pre>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao mostrar JSON:', error);
        alert('Erro ao exibir JSON.');
    }
}

// Calcular tamanho dos dados
async function calculateSizeVisualizer() {
    try {
        const respostas = await dbManager.getAllRespostas();
        const jsonString = JSON.stringify(respostas);
        const sizeInBytes = new Blob([jsonString]).size;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        
        const statsContainer = document.getElementById('stats-container-vis');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <p>📊 <strong>Número de registros:</strong> ${respostas.length}</p>
                <p>💾 <strong>Tamanho total:</strong> ${sizeInBytes} bytes (${sizeInKB} KB / ${sizeInMB} MB)</p>
                <p>📏 <strong>Tamanho médio por registro:</strong> ${(sizeInBytes / respostas.length).toFixed(2)} bytes</p>
                <p>🔢 <strong>Limite do IndexedDB:</strong> ~50 MB (depende do navegador)</p>
                <p>📊 <strong>Uso estimado:</strong> ${((sizeInBytes / (50 * 1024 * 1024)) * 100).toFixed(2)}%</p>
            `;
        }
    } catch (error) {
        console.error('Erro ao calcular tamanho:', error);
        alert('Erro ao calcular tamanho dos dados.');
    }
}

// Inicializar visualizador quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    // Detectar navegador apenas se a página do visualizador estiver ativa
    const pageVis = document.getElementById('page-visualizador');
    if (pageVis) {
        detectBrowserAndPath();
    }
});

// Função de Preenchimento Automático para Testes
function preencherFormularioTeste() {
    if (!confirm('⚠️ Isso irá preencher o formulário com dados de teste.\n\nDeseja continuar?')) {
        return;
    }
    
    console.log('🧪 Preenchendo formulário com dados de teste...');
    
    // Função auxiliar para definir valor de forma segura
    function setVal(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    // Função auxiliar para marcar checkbox por valor
    function checkBoxByValue(name, value) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"][value="${value}"]`);
        checkboxes.forEach(cb => {
            cb.checked = true;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }
    
    // Função auxiliar para selecionar radio
    function selectRadio(name, value) {
        const radios = document.querySelectorAll(`input[name="${name}"]`);
        radios.forEach(radio => {
            if (radio.value === value) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }
    
    // Card 1: Dados do Entrevistado
    setVal('nome', 'João Silva Santos');
    setVal('funcao', 'Gerente de Logística');
    setVal('telefone', '(11) 98765-4321');
    setVal('email', 'joao.silva@exemplo.com.br');
    
    // Card 2: Dados da Empresa
    setVal('tipo-empresa', 'embarcador');
    setVal('nome-empresa', 'Transportes ABC Logística Ltda');
    setVal('municipio', 'São Paulo-SP');
    
    // Card 3: Adicionar produtos
    const tbody = document.getElementById('produtos-tbody');
    if (tbody) {
        tbody.innerHTML = ''; // Limpa produtos existentes
    }
    
    // Produto 1
    if (typeof addProdutoRow === 'function') {
        addProdutoRow();
        setTimeout(() => {
            const rows = tbody.querySelectorAll('tr');
            if (rows.length > 0) {
                const inputs = rows[0].querySelectorAll('input, select');
                if (inputs[0]) inputs[0].value = 'Soja em Grãos';
                if (inputs[1]) inputs[1].value = '50000';
                if (inputs[2]) inputs[2].value = 'Mato Grosso-MT';
                if (inputs[3]) inputs[3].value = 'Santos-SP';
                if (inputs[4]) inputs[4].value = '1850';
                if (inputs[5]) inputs[5].value = 'Rodoviário';
                if (inputs[6]) inputs[6].value = 'Granel';
            }
        }, 100);
        
        // Produto 2
        setTimeout(() => {
            addProdutoRow();
            setTimeout(() => {
                const rows = tbody.querySelectorAll('tr');
                if (rows.length > 1) {
                    const inputs = rows[1].querySelectorAll('input, select');
                    if (inputs[0]) inputs[0].value = 'Milho';
                    if (inputs[1]) inputs[1].value = '30000';
                    if (inputs[2]) inputs[2].value = 'Goiás-GO';
                    if (inputs[3]) inputs[3].value = 'Campinas-SP';
                    if (inputs[4]) inputs[4].value = '920';
                    if (inputs[5]) inputs[5].value = 'Ferroviário';
                    if (inputs[6]) inputs[6].value = 'Container';
                }
            }, 100);
        }, 300);
        
        // Produto 3
        setTimeout(() => {
            addProdutoRow();
            setTimeout(() => {
                const rows = tbody.querySelectorAll('tr');
                if (rows.length > 2) {
                    const inputs = rows[2].querySelectorAll('input, select');
                    if (inputs[0]) inputs[0].value = 'Fertilizantes';
                    if (inputs[1]) inputs[1].value = '15000';
                    if (inputs[2]) inputs[2].value = 'Uberaba-MG';
                    if (inputs[3]) inputs[3].value = 'Ribeirão Preto-SP';
                    if (inputs[4]) inputs[4].value = '350';
                    if (inputs[5]) inputs[5].value = 'Rodoviário';
                    if (inputs[6]) inputs[6].value = 'Ensacado';
                }
            }, 100);
        }, 600);
    }
    
    // Card 4: Produto Principal
    setTimeout(() => {
        setVal('produto-principal', 'Soja em Grãos');
        setVal('agrupamento-produto', 'cereais');
    }, 800);
    
    // Card 5: Características do Transporte
    setTimeout(() => {
        setVal('tipo-transporte', 'nacional');
        
        setVal('origem-pais', 'Brasil');
        setVal('origem-estado', 'Mato Grosso');
        setVal('origem-municipio', 'Sorriso');
        
        setVal('destino-pais', 'Brasil');
        setVal('destino-estado', 'São Paulo');
        setVal('destino-municipio', 'Santos');
        
        setVal('distancia', '1850');
        
        setVal('tem-paradas', 'sim');
        setVal('num-paradas', '2');
        
        // Modos de transporte (checkboxes)
        checkBoxByValue('modo', 'rodoviario');
        checkBoxByValue('modo', 'ferroviario');
        
        setVal('config-veiculo', 'bitrem');
        
        setVal('capacidade-utilizada', '85');
        setVal('peso-carga', '50000');
        setVal('unidade-peso', 'toneladas');
        setVal('custo-transporte', '125.50');
        setVal('valor-carga', '85000');
        setVal('tipo-embalagem', 'granel');
        setVal('carga-perigosa', 'nao');
        
        setVal('tempo-dias', '3');
        setVal('tempo-horas', '12');
        setVal('tempo-minutos', '0');
        
        setVal('frequencia', 'semanal');
    }, 1000);
    
    // Card 6: Fatores de Decisão Modal
    setTimeout(() => {
        setVal('importancia-custo', 'muito-alta');
        setVal('variacao-custo', '8');
        
        setVal('importancia-tempo', 'alta');
        setVal('variacao-tempo', '15');
        
        setVal('importancia-confiabilidade', 'muito-alta');
        setVal('variacao-confiabilidade', '5');
        
        setVal('importancia-seguranca', 'alta');
        setVal('variacao-seguranca', '10');
        
        setVal('importancia-capacidade', 'media');
        setVal('variacao-capacidade', '20');
    }, 1200);
    
    // Card 7: Análise Estratégica
    setTimeout(() => {
        setVal('tipo-cadeia', 'distribuicao');
        
        // Modais alternativos (checkboxes)
        checkBoxByValue('modal-alternativo', 'ferrovia');
        checkBoxByValue('modal-alternativo', 'hidrovia');
        
        setVal('fator-adicional', 'Disponibilidade de infraestrutura portuária e questões ambientais relacionadas ao transporte');
    }, 1400);
    
    // Card 8: Dificuldades Logísticas
    setTimeout(() => {
        // Dificuldades (checkboxes)
        checkBoxByValue('dificuldade', 'infra-rodoviaria');
        checkBoxByValue('dificuldade', 'infra-portuaria');
        checkBoxByValue('dificuldade', 'acessos-portos');
        
        setVal('detalhe-dificuldade', 'Principais desafios: estado precário das rodovias no trecho MT-SP, alto custo do frete rodoviário e baixa disponibilidade de vagões ferroviários. A infraestrutura portuária em Santos apresenta congestionamentos frequentes durante a safra.');
        
        console.log('✅ Formulário preenchido com sucesso!');
        console.log('📋 Próximo passo: Role até o final e clique em "💾 Salvar Respostas"');
        alert('✅ Formulário preenchido com dados de teste!\n\nRole até o final e clique em "💾 Salvar Respostas" para testar.');
    }, 1600);
}
