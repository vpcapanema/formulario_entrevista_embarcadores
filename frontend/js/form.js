/**
 * ============================================================
 * FORM MANAGER - PLI 2050
 * ============================================================
 * Gerencia coleta de dados do formulário e submissão
 * 
 * PRINCÍPIO: Frontend coleta dados, backend valida e salva
 * NÃO faz validação de negócio (backend Pydantic faz isso)
 * Apenas validação visual básica (campos vazios)
 */

const FORM = {
    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    
    /**
     * Inicializa eventos do formulário
     */
    init() {
        // Aguardar DOM carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._setup());
        } else {
            this._setup();
        }
    },
    
    /**
     * Configuração interna
     */
    _setup() {
        const form = document.getElementById('entrevista-form');
        if (!form) {
            console.error('❌ Formulário não encontrado');
            return;
        }
        
        // Interceptar submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submit();
        });
        
        // Configurar campos condicionais
        this._setupConditionalFields();
        
        // Carregar listas auxiliares
        UI.carregarListas();
        
        console.log('✅ Form manager inicializado');
    },
    
    /**
     * Configura campos condicionais (mostrar/esconder baseado em seleções)
     */
    _setupConditionalFields() {
        // ===== RESPONSÁVEL PELA PESQUISA (ENTREVISTADOR vs ENTREVISTADO) =====
        const tipoResponsavelRadios = document.querySelectorAll('input[name="tipo-responsavel"]');
        const entrevistadorContainer = document.getElementById('selecionar-entrevistador-container');
        const entrevistadoContainer = document.getElementById('info-entrevistado-container');
        
        // Função para atualizar visibilidade
        const updateResponsavelVisibility = () => {
            const selected = document.querySelector('input[name="tipo-responsavel"]:checked');
            if (!selected) {
                // NENHUM SELECIONADO: esconder ambos (estado inicial)
                entrevistadorContainer?.classList.add('hidden-field');
                entrevistadoContainer?.classList.add('hidden-field');
                return;
            }
            
            if (selected.value === 'entrevistador') {
                // ENTREVISTADOR: mostrar dropdown, esconder info
                entrevistadorContainer?.classList.remove('hidden-field');
                entrevistadoContainer?.classList.add('hidden-field');
            } else {
                // ENTREVISTADO: esconder dropdown, mostrar info
                entrevistadorContainer?.classList.add('hidden-field');
                entrevistadoContainer?.classList.remove('hidden-field');
            }
        };
        
        // Executar na inicialização
        updateResponsavelVisibility();
        
        // Adicionar listeners nos radio buttons
        tipoResponsavelRadios.forEach(radio => {
            radio.addEventListener('change', updateResponsavelVisibility);
        });
        
        // ===== TIPO DE EMPRESA: "Outro" =====
        const tipoEmpresaSelect = document.getElementById('tipo-empresa');
        const outroTipoContainer = document.getElementById('outro-tipo-container');
        
        const updateTipoEmpresaVisibility = () => {
            if (tipoEmpresaSelect?.value === 'outro') {
                outroTipoContainer?.classList.remove('hidden-field');
            } else {
                outroTipoContainer?.classList.add('hidden-field');
                // Limpar valor quando oculto
                const outroTipoInput = document.getElementById('outro-tipo');
                if (outroTipoInput) outroTipoInput.value = '';
            }
        };
        
        tipoEmpresaSelect?.addEventListener('change', updateTipoEmpresaVisibility);
        updateTipoEmpresaVisibility(); // Executar na inicialização
        
        // ===== AGRUPAMENTO DE PRODUTO: "Outro" =====
        const agrupamentoProdutoSelect = document.getElementById('agrupamento-produto');
        const outroProdutoContainer = document.getElementById('outro-produto-container');
        
        const updateAgrupamentoProdutoVisibility = () => {
            if (agrupamentoProdutoSelect?.value === 'outro-produto') {
                outroProdutoContainer?.classList.remove('hidden-field');
            } else {
                outroProdutoContainer?.classList.add('hidden-field');
                // Limpar valor quando oculto
                const outroProdutoInput = document.getElementById('outro-produto');
                if (outroProdutoInput) outroProdutoInput.value = '';
            }
        };
        
        agrupamentoProdutoSelect?.addEventListener('change', updateAgrupamentoProdutoVisibility);
        updateAgrupamentoProdutoVisibility(); // Executar na inicialização
        
        // ===== NÚMERO DE PARADAS: Mostrar campo de paradas exatas =====
        const numParadasSelect = document.getElementById('num-paradas');
        const numParadasExatoContainer = document.getElementById('num-paradas-exato-container');
        
        const updateNumParadasVisibility = () => {
            const value = numParadasSelect?.value;
            if (value === '6-ou-mais') {
                numParadasExatoContainer?.classList.remove('hidden-field');
            } else {
                numParadasExatoContainer?.classList.add('hidden-field');
                // Limpar valor quando oculto
                const numParadasExatoInput = document.getElementById('num-paradas-exato');
                if (numParadasExatoInput) numParadasExatoInput.value = '';
            }
        };
        
        numParadasSelect?.addEventListener('change', updateNumParadasVisibility);
        updateNumParadasVisibility(); // Executar na inicialização
        
        // ===== MODO RODOVIÁRIO: Mostrar configuração de veículo =====
        const checkboxes = document.querySelectorAll('input[name="modo-transporte"]');
        const configVeiculoContainer = document.getElementById('config-veiculo-container');
        
        const updateConfigVeiculoVisibility = () => {
            const rodoviarioChecked = document.querySelector('input[name="modo-transporte"][value="rodoviario"]')?.checked;
            if (rodoviarioChecked) {
                configVeiculoContainer?.classList.remove('hidden-field');
            } else {
                configVeiculoContainer?.classList.add('hidden-field');
                // Limpar valor quando oculto
                const configVeiculoSelect = document.getElementById('config-veiculo');
                if (configVeiculoSelect) configVeiculoSelect.value = '';
            }
        };
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateConfigVeiculoVisibility);
        });
        updateConfigVeiculoVisibility(); // Executar na inicialização
        
        // ===== FREQUÊNCIA: "Diária" ou "Outra" =====
        const frequenciaSelect = document.getElementById('frequencia');
        const frequenciaDiariaContainer = document.getElementById('frequencia-diaria-container');
        const frequenciaOutraContainer = document.getElementById('frequencia-outra-container');
        
        const updateFrequenciaVisibility = () => {
            const value = frequenciaSelect?.value;
            
            // Frequência Diária
            if (value === 'diaria') {
                frequenciaDiariaContainer?.classList.remove('hidden-field');
            } else {
                frequenciaDiariaContainer?.classList.add('hidden-field');
                const frequenciaDiariaInput = document.getElementById('frequencia-diaria');
                if (frequenciaDiariaInput) frequenciaDiariaInput.value = '';
            }
            
            // Frequência Outra
            if (value === 'outra') {
                frequenciaOutraContainer?.classList.remove('hidden-field');
            } else {
                frequenciaOutraContainer?.classList.add('hidden-field');
                const frequenciaOutraInput = document.getElementById('frequencia-outra');
                if (frequenciaOutraInput) frequenciaOutraInput.value = '';
            }
        };
        
        frequenciaSelect?.addEventListener('change', updateFrequenciaVisibility);
        updateFrequenciaVisibility(); // Executar na inicialização
        
        console.log('✅ Campos condicionais configurados: tipo-responsavel, tipo-empresa (outro), agrupamento-produto (outro), num-paradas, modo-rodoviario, frequencia');
    },
    
    // ============================================================
    // COLETA DE DADOS
    // ============================================================
    
    /**
     * Coleta todos os dados do formulário
     * Retorna objeto com estrutura esperada pelo backend
     */
    collectData() {
        const data = {};
        
        // ==== SEÇÃO 0: Responsável pelo Preenchimento ====
        const tipoResponsavel = document.querySelector('input[name="tipo-responsavel"]:checked');
        data.tipoResponsavel = tipoResponsavel ? tipoResponsavel.value : null;
        
        if (data.tipoResponsavel === 'entrevistador') {
            const idResponsavel = document.getElementById('id-responsavel');
            data.idResponsavel = idResponsavel ? parseInt(idResponsavel.value) : null;
        }
        
        // ==== SEÇÃO 1: Dados do Entrevistado ====
        data.nome = this._getValue('nome');
        data.funcao = this._getValue('funcao');
        data.telefone = this._getValue('telefone');
        data.email = this._getValue('email');
        
        // ==== SEÇÃO 2: Dados da Empresa ====
        data.tipoEmpresa = this._getValue('tipo-empresa');
        if (data.tipoEmpresa === 'outro') {
            data.outroTipo = this._getValue('outro-tipo');
        }
        data.nomeEmpresa = this._getValue('nome-empresa');
        data.municipio = this._getValue('municipio-empresa');
        data.cnpj = this._getValue('cnpj-empresa');
        data.razaoSocial = this._getValue('razao-social');
        data.nomeFantasia = this._getValue('nome-fantasia');
        data.logradouro = this._getValue('logradouro');
        data.numero = this._getValue('numero');
        data.complemento = this._getValue('complemento');
        data.bairro = this._getValue('bairro');
        data.cep = this._getValue('cep');
        
        // ==== SEÇÃO 3: Produtos Transportados (tabela) ====
        data.produtos = this._collectProdutos();
        
        // ==== SEÇÃO 4: Produto Principal ====
        data.produtoPrincipal = this._getValue('produto-principal');
        data.agrupamentoProduto = this._getValue('agrupamento-produto');
        if (data.agrupamentoProduto === 'outro-produto') {
            data.outroProduto = this._getValue('outro-produto');
        }
        
        // ==== SEÇÃO 5: Características do Transporte ====
        data.tipoTransporte = this._getValue('tipo-transporte');
        data.origemPais = this._getValue('origem-pais');
        data.origemEstado = this._getValue('origem-estado');
        data.origemMunicipio = this._getValue('origem-municipio');
        data.destinoPais = this._getValue('destino-pais');
        data.destinoEstado = this._getValue('destino-estado');
        data.destinoMunicipio = this._getValue('destino-municipio');
        data.distancia = this._getNumeric('distancia');
        data.temParadas = this._getValue('tem-paradas');
        
        if (data.temParadas === 'sim') {
            data.numParadas = this._getInteger('num-paradas');
        }
        
        // Modos de transporte (checkboxes múltiplos)
        data.modos = this._getCheckedValues('modo');
        
        if (data.modos && data.modos.includes('rodoviario')) {
            data.configVeiculo = this._getValue('config-veiculo');
        }
        
        data.capacidadeUtilizada = this._getNumeric('capacidade-utilizada');
        data.pesoCarga = this._getNumeric('peso-carga');
        data.unidadePeso = this._getValue('unidade-peso');
        data.custoTransporte = this._getNumeric('custo-transporte');
        data.valorCarga = this._getNumeric('valor-carga');
        data.tipoEmbalagem = this._getValue('tipo-embalagem');
        data.cargaPerigosa = this._getValue('carga-perigosa');
        
        data.tempoDias = this._getInteger('tempo-dias');
        data.tempoHoras = this._getInteger('tempo-horas');
        data.tempoMinutos = this._getInteger('tempo-minutos');
        
        data.frequencia = this._getValue('frequencia');
        if (data.frequencia === 'diaria') {
            data.frequenciaDiaria = this._getNumeric('frequencia-diaria');
        }
        if (data.frequencia === 'outra') {
            data.frequenciaOutra = this._getValue('frequencia-outra');
        }
        
        // ==== SEÇÃO 6: Fatores de Decisão ====
        data.importanciaCusto = this._getValue('importancia-custo');
        data.variacaoCusto = this._getNumeric('variacao-custo');
        data.importanciaTempo = this._getValue('importancia-tempo');
        data.variacaoTempo = this._getNumeric('variacao-tempo');
        data.importanciaConfiabilidade = this._getValue('importancia-confiabilidade');
        data.variacaoConfiabilidade = this._getNumeric('variacao-confiabilidade');
        data.importanciaSeguranca = this._getValue('importancia-seguranca');
        data.variacaoSeguranca = this._getNumeric('variacao-seguranca');
        data.importanciaCapacidade = this._getValue('importancia-capacidade');
        data.variacaoCapacidade = this._getNumeric('variacao-capacidade');
        
        // ==== SEÇÃO 7: Análise Estratégica ====
        data.tipoCadeia = this._getValue('tipo-cadeia');
        data.modaisAlternativos = this._getCheckedValues('modal-alternativo');
        data.fatorAdicional = this._getValue('fator-adicional');
        
        // ==== SEÇÃO 8: Dificuldades ====
        data.dificuldades = this._getCheckedValues('dificuldade');
        data.detalheDificuldade = this._getValue('detalhe-dificuldade');
        
        // ==== SEÇÃO 9: Outros ====
        data.observacoes = this._getValue('observacoes');
        data.consentimento = this._getChecked('consentimento');
        data.transportaCarga = true; // Sempre true (formulário é para embarcadores)
        
        console.log('📋 Dados coletados:', data);
        return data;
    },
    
    /**
     * Coleta produtos da tabela
     */
    _collectProdutos() {
        const produtos = [];
        const rows = document.querySelectorAll('#produtos-tbody tr');
        
        rows.forEach((row) => {
            const inputs = row.querySelectorAll('input, select');
            if (inputs.length >= 7) {
                const produto = {
                    carga: inputs[0].value,
                    movimentacao: this._parseNumeric(inputs[1].value),
                    origem: inputs[2].value,
                    destino: inputs[3].value,
                    distancia: this._parseNumeric(inputs[4].value),
                    modalidade: inputs[5].value,
                    acondicionamento: inputs[6].value
                };
                
                // Só adicionar se tiver pelo menos o nome da carga
                if (produto.carga && produto.carga.trim() !== '') {
                    produtos.push(produto);
                }
            }
        });
        
        return produtos;
    },
    
    // ============================================================
    // UTILITÁRIOS DE COLETA
    // ============================================================
    
    _getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value : null;
    },
    
    _getNumeric(id) {
        const value = this._getValue(id);
        return this._parseNumeric(value);
    },
    
    _getInteger(id) {
        const value = this._getValue(id);
        return value ? parseInt(value) || 0 : 0;
    },
    
    _getChecked(id) {
        const el = document.getElementById(id);
        return el ? el.checked : false;
    },
    
    _getCheckedValues(name) {
        const checked = [];
        document.querySelectorAll(`input[name="${name}"]:checked`).forEach(cb => {
            checked.push(cb.value);
        });
        return checked.length > 0 ? checked : null;
    },
    
    _parseNumeric(value) {
        if (!value) return null;
        const str = String(value).replace(/[^\d.,-]/g, '').replace(',', '.');
        const num = parseFloat(str);
        return isNaN(num) ? null : num;
    },
    
    // ============================================================
    // SUBMISSÃO
    // ============================================================
    
    /**
     * Submete formulário para o backend
     */
    async submit() {
        try {
            console.log('🚀 Iniciando submissão...');
            
            // Validação visual básica (campos obrigatórios vazios)
            if (!UI.validateRequiredFields()) {
                console.warn('⚠️ Validação visual falhou');
                return;
            }
            
            // Coletar dados
            const formData = this.collectData();
            
            // Mostrar loading
            UI.mostrarLoading('Enviando dados para o servidor...');
            
            // Enviar para backend
            const response = await API.submitForm(formData);
            
            console.log('✅ Resposta do backend:', response);
            
            // Fechar loading
            UI.esconderLoading();
            
            // Verificar sucesso
            if (response.success) {
                // Gerar Excel
                const nomeArquivo = this._generateExcel(formData, response);
                
                // Mostrar sucesso
                UI.mostrarSucesso(formData.nomeEmpresa, nomeArquivo);
                
                // Aguardar 3s e resetar formulário
                setTimeout(() => {
                    UI.resetForm();
                }, 3000);
            } else {
                // Erro retornado pelo backend
                UI.mostrarErroBanco(response.message || 'Erro desconhecido');
            }
            
        } catch (error) {
            console.error('❌ Erro na submissão:', error);
            UI.esconderLoading();
            
            // Tratar diferentes tipos de erro
            if (error.status) {
                // Erro HTTP com status
                if (error.status === 409) {
                    UI.mostrarErroBanco('Registro duplicado: ' + error.message);
                } else if (error.status >= 500) {
                    UI.mostrarErroBanco('Erro no servidor: ' + error.message);
                } else {
                    UI.mostrarErroBanco(error.message);
                }
            } else if (error.message && error.message.includes('fetch')) {
                // Erro de conexão
                UI.mostrarErroConexao(error.message);
            } else {
                // Erro genérico
                UI.mostrarErroBanco(JSON.stringify(error));
            }
        }
    },
    
    // ============================================================
    // GERAÇÃO DE EXCEL
    // ============================================================
    
    /**
     * Gera arquivo Excel com os dados submetidos
     */
    _generateExcel(formData, response) {
        try {
            // Preparar dados para Excel
            const excelData = [{
                'ID Pesquisa': response.id_pesquisa || '',
                'ID Empresa': response.id_empresa || '',
                'ID Entrevistado': response.id_entrevistado || '',
                'Nome Empresa': formData.nomeEmpresa || '',
                'CNPJ': formData.cnpj || '',
                'Nome Entrevistado': formData.nome || '',
                'Email': formData.email || '',
                'Telefone': formData.telefone || '',
                'Produto Principal': formData.produtoPrincipal || '',
                'Origem': `${formData.origemMunicipio}/${formData.origemEstado}` || '',
                'Destino': `${formData.destinoMunicipio}/${formData.destinoEstado}` || '',
                'Distância (km)': formData.distancia || '',
                'Peso Carga': formData.pesoCarga || '',
                'Valor Carga': formData.valorCarga || '',
                'Data/Hora': new Date().toLocaleString('pt-BR')
            }];
            
            // Criar workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);
            XLSX.utils.book_append_sheet(wb, ws, 'Resposta');
            
            // Se houver produtos, criar aba separada
            if (formData.produtos && formData.produtos.length > 0) {
                const wsProdutos = XLSX.utils.json_to_sheet(formData.produtos);
                XLSX.utils.book_append_sheet(wb, wsProdutos, 'Produtos');
            }
            
            // Nome do arquivo
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const nomeArquivo = `PLI2050_${formData.nomeEmpresa}_${timestamp}.xlsx`;
            
            // Download
            XLSX.writeFile(wb, nomeArquivo);
            
            console.log('✅ Excel gerado:', nomeArquivo);
            return nomeArquivo;
            
        } catch (error) {
            console.error('❌ Erro ao gerar Excel:', error);
            return 'PLI2050_Resposta.xlsx';
        }
    }
};

// ============================================================
// FUNÇÕES GLOBAIS PARA TABELA DINÂMICA DE PRODUTOS (Q8)
// ============================================================

// Contador de linhas de produtos
let produtoRowCounter = 1;

/**
 * Adiciona uma nova linha na tabela de produtos
 */
async function addProdutoRow() {
    const tbody = document.getElementById('produtos-tbody');
    const currentCounter = produtoRowCounter++;
    const rowId = `produto-row-${currentCounter}`;
    
    const row = document.createElement('tr');
    row.id = rowId;
    row.innerHTML = `
        <td><input type="text" name="produto-carga-${currentCounter}" class="table-input" placeholder="Nome da carga"></td>
        <td><input type="number" name="produto-movimentacao-${currentCounter}" class="table-input" placeholder="Toneladas/ano" min="0"></td>
        <td>
            <div class="produto-origem-container">
                <select name="produto-origem-pais-${currentCounter}" class="table-input produto-pais-select" data-row="${currentCounter}" data-tipo="origem" onchange="handleProdutoPaisChange(${currentCounter}, 'origem')" required>
                    <option value="">Selecione o país...</option>
                </select>
                <select name="produto-origem-estado-${currentCounter}" class="table-input produto-estado-select" data-row="${currentCounter}" data-tipo="origem" onchange="handleProdutoEstadoChange(${currentCounter}, 'origem')" style="display:none; margin-top:4px;" required>
                    <option value="">Selecione o estado...</option>
                </select>
                <select name="produto-origem-municipio-${currentCounter}" class="table-input produto-municipio-select" data-row="${currentCounter}" data-tipo="origem" style="display:none; margin-top:4px;">
                    <option value="">Município (opcional)...</option>
                </select>
                <input type="text" name="produto-origem-text-${currentCounter}" class="table-input produto-text-input" placeholder="Origem" style="display:none; margin-top:4px;">
            </div>
        </td>
        <td>
            <div class="produto-destino-container">
                <select name="produto-destino-pais-${currentCounter}" class="table-input produto-pais-select" data-row="${currentCounter}" data-tipo="destino" onchange="handleProdutoPaisChange(${currentCounter}, 'destino')" required>
                    <option value="">Selecione o país...</option>
                </select>
                <select name="produto-destino-estado-${currentCounter}" class="table-input produto-estado-select" data-row="${currentCounter}" data-tipo="destino" onchange="handleProdutoEstadoChange(${currentCounter}, 'destino')" style="display:none; margin-top:4px;" required>
                    <option value="">Selecione o estado...</option>
                </select>
                <select name="produto-destino-municipio-${currentCounter}" class="table-input produto-municipio-select" data-row="${currentCounter}" data-tipo="destino" style="display:none; margin-top:4px;">
                    <option value="">Município (opcional)...</option>
                </select>
                <input type="text" name="produto-destino-text-${currentCounter}" class="table-input produto-text-input" placeholder="Destino" style="display:none; margin-top:4px;">
            </div>
        </td>
        <td><input type="number" name="produto-distancia-${currentCounter}" class="table-input" placeholder="km" min="0"></td>
        <td>
            <select name="produto-modalidade-${currentCounter}" class="table-input">
                <option value="">Selecione...</option>
                <option value="rodoviario">Rodoviário</option>
                <option value="ferroviario">Ferroviário</option>
                <option value="hidroviario">Hidroviário</option>
                <option value="cabotagem">Cabotagem</option>
                <option value="dutoviario">Dutoviário</option>
                <option value="aeroviario">Aeroviário</option>
            </select>
        </td>
        <td>
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <select name="produto-acondicionamento-${currentCounter}" class="table-input" onchange="handleProdutoAcondicionamentoChange(${currentCounter})">
                    <option value="">Selecione...</option>
                    <option value="granel-solido">Granel sólido</option>
                    <option value="granel-liquido">Granel líquido</option>
                    <option value="paletizado">Paletizado</option>
                    <option value="container">Container</option>
                    <option value="big-bag">Big bag</option>
                    <option value="caixas">Caixas</option>
                    <option value="sacaria">Sacaria</option>
                    <option value="outro">Outro</option>
                </select>
                <input type="text" 
                       name="produto-acondicionamento-outro-${currentCounter}" 
                       class="table-input produto-acondicionamento-outro" 
                       placeholder="Especifique o tipo"
                       style="display:none;">
            </div>
        </td>
        <td><button type="button" class="btn-remove" onclick="removeProdutoRow('${rowId}')">🗑️</button></td>
    `;
    
    tbody.appendChild(row);
    
    // Popular dropdowns de países usando JSON
    await popularPaisesProduto(currentCounter, 'origem');
    await popularPaisesProduto(currentCounter, 'destino');
}

/**
 * Remove uma linha da tabela de produtos
 */
function removeProdutoRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
    }
}

/**
 * Popular dropdown de países na tabela de produtos
 */
async function popularPaisesProduto(rowId, tipo) {
    const paisSelect = document.querySelector(`select[name="produto-${tipo}-pais-${rowId}"]`);
    
    if (!paisSelect) {
        console.error('❌ Select de país não encontrado');
        return;
    }
    
    try {
        // Buscar países usando o cache do API
        const paises = await API.getPaises();
        
        // Limpar opções existentes
        paisSelect.innerHTML = '<option value="">Selecione o país...</option>';
        
        // Popular com países
        paises.forEach(pais => {
            const option = document.createElement('option');
            option.value = pais.id_pais;
            option.textContent = pais.nm_pais;
            
            // Brasil pré-selecionado (id_pais = 31)
            if (pais.id_pais === 31) {
                option.selected = true;
            }
            
            paisSelect.appendChild(option);
        });
        
        console.log(`✅ ${paises.length} países carregados na tabela de produtos`);
        
        // Se Brasil foi selecionado (default), carregar estados
        if (paisSelect.value === '31') {
            handleProdutoPaisChange(rowId, tipo);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar países:', error);
    }
}

/**
 * Manipula mudança de país na tabela de produtos
 * REGRAS:
 * - País: OBRIGATÓRIO
 * - Se Brasil: mostra Estado (OBRIGATÓRIO) + Município (OPCIONAL)
 * - Se outro país: mostra input text (OPCIONAL)
 */
async function handleProdutoPaisChange(rowId, tipo) {
    const paisSelect = document.querySelector(`select[name="produto-${tipo}-pais-${rowId}"]`);
    const estadoSelect = document.querySelector(`select[name="produto-${tipo}-estado-${rowId}"]`);
    const municipioSelect = document.querySelector(`select[name="produto-${tipo}-municipio-${rowId}"]`);
    const textInput = document.querySelector(`input[name="produto-${tipo}-text-${rowId}"]`);
    
    if (!paisSelect) {
        console.error(`❌ País select não encontrado para row ${rowId} tipo ${tipo}`);
        return;
    }
    
    const idPais = parseInt(paisSelect.value);
    
    console.log(`🗺️ País selecionado na tabela de produtos (${tipo}): ${paisSelect.options[paisSelect.selectedIndex]?.text || 'nenhum'}`);
    
    // Brasil = id_pais 31
    if (idPais === 31) {
        // Mostrar dropdowns de estado e município
        if (estadoSelect) {
            estadoSelect.style.display = 'block';
            estadoSelect.setAttribute('required', 'required'); // ✅ Estado OBRIGATÓRIO
        }
        if (municipioSelect) {
            municipioSelect.style.display = 'none'; // Oculto até selecionar estado
            municipioSelect.removeAttribute('required'); // ❌ Município OPCIONAL
        }
        if (textInput) {
            textInput.style.display = 'none';
            textInput.removeAttribute('required');
        }
        
        // Popular dropdown de estados
        await popularEstadosProduto(rowId, tipo);
    } else if (idPais) {
        // Outro país: mostrar input text (OPCIONAL)
        if (estadoSelect) {
            estadoSelect.style.display = 'none';
            estadoSelect.removeAttribute('required');
        }
        if (municipioSelect) {
            municipioSelect.style.display = 'none';
            municipioSelect.removeAttribute('required');
        }
        if (textInput) {
            textInput.style.display = 'block';
            const nomePais = paisSelect.options[paisSelect.selectedIndex].text;
            textInput.placeholder = `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} (${nomePais})`;
            textInput.removeAttribute('required'); // ❌ Input text OPCIONAL
        }
    } else {
        // Nenhum país selecionado: ocultar tudo
        if (estadoSelect) {
            estadoSelect.style.display = 'none';
            estadoSelect.removeAttribute('required');
        }
        if (municipioSelect) {
            municipioSelect.style.display = 'none';
            municipioSelect.removeAttribute('required');
        }
        if (textInput) {
            textInput.style.display = 'none';
            textInput.removeAttribute('required');
        }
    }
}

/**
 * Popular dropdown de estados na tabela de produtos
 */
async function popularEstadosProduto(rowId, tipo) {
    const estadoSelect = document.querySelector(`select[name="produto-${tipo}-estado-${rowId}"]`);
    
    if (!estadoSelect) {
        console.error('❌ Select de estado não encontrado');
        return;
    }
    
    try {
        // Buscar estados usando o cache do API
        const estados = await API.getEstados();
        
        // Limpar opções existentes
        estadoSelect.innerHTML = '<option value="">Selecione o estado...</option>';
        
        // Popular com estados
        estados.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado.sigla_uf;
            option.textContent = estado.nm_uf;
            estadoSelect.appendChild(option);
        });
        
        console.log(`✅ ${estados.length} estados carregados na tabela de produtos`);
    } catch (error) {
        console.error('❌ Erro ao carregar estados:', error);
    }
}

/**
 * Manipula mudança de estado na tabela de produtos
 * Filtra e mostra municípios do estado selecionado
 */
async function handleProdutoEstadoChange(rowId, tipo) {
    const estadoSelect = document.querySelector(`select[name="produto-${tipo}-estado-${rowId}"]`);
    const municipioSelect = document.querySelector(`select[name="produto-${tipo}-municipio-${rowId}"]`);
    
    if (!estadoSelect || !municipioSelect) {
        console.error(`❌ Selects não encontrados para row ${rowId} tipo ${tipo}`);
        return;
    }
    
    const uf = estadoSelect.value;
    
    if (!uf) {
        municipioSelect.style.display = 'none';
        municipioSelect.innerHTML = '<option value="">Município (opcional)...</option>';
        return;
    }
    
    console.log(`🔍 Estado selecionado na tabela (${tipo}): ${uf}`);
    
    try {
        // Buscar municípios usando o cache do API
        const municipios = await API.getMunicipiosByUF(uf);
        
        // Limpar e popular dropdown de municípios
        municipioSelect.innerHTML = '<option value="">Município (opcional)...</option>';
        
        municipios.forEach(municipio => {
            const option = document.createElement('option');
            option.value = municipio.cd_mun;
            option.textContent = municipio.nm_mun;
            municipioSelect.appendChild(option);
        });
        
        // Mostrar dropdown de municípios
        municipioSelect.style.display = 'block';
        
        console.log(`🏙️ ${municipios.length} municípios carregados`);
    } catch (error) {
        console.error('❌ Erro ao carregar municípios:', error);
    }
}

/**
 * Manipula mudança de acondicionamento na tabela de produtos
 * Se "Outro": mostra campo de texto para especificar
 */
function handleProdutoAcondicionamentoChange(rowId) {
    const acondicionamentoSelect = document.querySelector(`select[name="produto-acondicionamento-${rowId}"]`);
    const outroInput = document.querySelector(`input[name="produto-acondicionamento-outro-${rowId}"]`);
    
    if (!acondicionamentoSelect || !outroInput) {
        console.error(`❌ Campos de acondicionamento não encontrados para row ${rowId}`);
        return;
    }
    
    const valor = acondicionamentoSelect.value;
    
    if (valor === 'outro') {
        // Mostrar campo de texto
        outroInput.style.display = 'block';
        outroInput.setAttribute('required', 'required');
        console.log(`📝 Campo "Outro" ativado para acondicionamento (row ${rowId})`);
    } else {
        // Ocultar e limpar campo de texto
        outroInput.style.display = 'none';
        outroInput.removeAttribute('required');
        outroInput.value = '';
        console.log(`✅ Campo "Outro" desativado para acondicionamento (row ${rowId})`);
    }
}

// Exportar funções para escopo global (para uso em onclick inline no HTML)
window.addProdutoRow = addProdutoRow;
window.removeProdutoRow = removeProdutoRow;
window.handleProdutoPaisChange = handleProdutoPaisChange;
window.handleProdutoEstadoChange = handleProdutoEstadoChange;
window.handleProdutoAcondicionamentoChange = handleProdutoAcondicionamentoChange;

// Exportar para uso global
window.FORM = FORM;

// Inicializar automaticamente
FORM.init();
