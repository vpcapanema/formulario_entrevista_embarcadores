// Aplicação Principal
let produtoRowCounter = 0;

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await dbManager.init();
        console.log('Banco de dados inicializado');
        
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

// Configurar event listeners
function setupEventListeners() {
    // Formulário
    const form = document.getElementById('entrevista-form');
    form.addEventListener('submit', handleFormSubmit);
    
    // Tipo de empresa
    document.getElementById('tipo-empresa').addEventListener('change', function() {
        const outroContainer = document.getElementById('outro-tipo-container');
        outroContainer.style.display = this.value === 'outro' ? 'block' : 'none';
    });
    
    // Agrupamento de produto
    document.getElementById('agrupamento-produto').addEventListener('change', function() {
        const outroContainer = document.getElementById('outro-produto-container');
        outroContainer.style.display = this.value === 'outro-produto' ? 'block' : 'none';
    });
    
    // Modo rodoviário
    document.querySelectorAll('input[name="modo"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const configContainer = document.getElementById('config-veiculo-container');
            const rodoviarioChecked = document.querySelector('input[name="modo"][value="rodoviario"]').checked;
            configContainer.style.display = rodoviarioChecked ? 'block' : 'none';
        });
    });
}

// Alternar visibilidade de paradas
function toggleParadas() {
    const temParadas = document.getElementById('tem-paradas').value;
    const numParadasContainer = document.getElementById('num-paradas-container');
    numParadasContainer.style.display = temParadas === 'sim' ? 'block' : 'none';
}

// Alternar frequência diária
function toggleFrequenciaDiaria() {
    const frequencia = document.getElementById('frequencia').value;
    const diariaContainer = document.getElementById('frequencia-diaria-container');
    const outraContainer = document.getElementById('frequencia-outra-container');
    
    diariaContainer.style.display = frequencia === 'diaria' ? 'block' : 'none';
    outraContainer.style.display = frequencia === 'outra' ? 'block' : 'none';
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
