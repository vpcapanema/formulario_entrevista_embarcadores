/**
 * ============================================================
 * FORM-COLLECTOR - Coleta de Dados e Submissão
 * ============================================================
 * Gerencia coleta de dados do formulário e submissão para backend
 * 
 * MAPEAMENTO COMPLETO: Frontend → PostgreSQL
 * 
 * ========== TABELA: empresas (19 colunas) ==========
 * tipo-empresa                 → tipo_empresa (VARCHAR NOT NULL)
 * outro-tipo                   → outro_tipo (VARCHAR NULL)
 * cnpj-empresa                 → cnpj (VARCHAR NULL)
 * razao-social                 → razao_social (VARCHAR NOT NULL) - Q6b
 * municipio-empresa            → municipio (VARCHAR NOT NULL) - Q7
 * nome-fantasia                → nome_fantasia (VARCHAR NULL)
 * logradouro                   → logradouro (VARCHAR NULL)
 * numero                       → numero (VARCHAR NULL)
 * complemento                  → complemento (VARCHAR NULL)
 * bairro                       → bairro (VARCHAR NULL)
 * cep                          → cep (VARCHAR NULL)
 * 
 * ========== TABELA: entrevistados (9 colunas) ==========
 * nome                         → nome (VARCHAR NOT NULL)
 * funcao                        → funcao (VARCHAR NOT NULL)
 * telefone                     → telefone (VARCHAR NOT NULL)
 * email                        → email (VARCHAR NOT NULL)
 * 
 * ========== TABELA: pesquisas (89 colunas) ==========
 * tipo-responsavel             → tipo_responsavel (VARCHAR NOT NULL)
 * id-responsavel               → id_responsavel (INTEGER NOT NULL)
 * produto-principal            → produto_principal (VARCHAR NOT NULL)
 * agrupamento-produto          → agrupamento_produto (VARCHAR NOT NULL)
 * outro-produto                → outro_produto (VARCHAR NULL)
 * tipo-transporte              → tipo_transporte (VARCHAR NOT NULL)
 * origem-pais                  → origem_pais (VARCHAR NOT NULL)
 * origem-estado                → origem_estado (VARCHAR NOT NULL)
 * origem-municipio             → origem_municipio (VARCHAR NOT NULL)
 * destino-pais                 → destino_pais (VARCHAR NOT NULL)
 * destino-estado               → destino_estado (VARCHAR NOT NULL)
 * destino-municipio            → destino_municipio (VARCHAR NOT NULL)
 * distancia                    → distancia (NUMERIC NOT NULL)
 * tem-paradas                  → tem_paradas (VARCHAR NOT NULL)
 * num-paradas                  → num_paradas (INTEGER NULL)
 * modo (checkboxes)            → modos (ARRAY NOT NULL)
 * config-veiculo               → config_veiculo (VARCHAR NULL)
 * capacidade-utilizada         → capacidade_utilizada (NUMERIC NULL)
 * peso-carga                   → peso_carga (NUMERIC NOT NULL)
 * unidade-peso                 → unidade_peso (VARCHAR NOT NULL)
 * custo-transporte             → custo_transporte (NUMERIC NOT NULL)
 * valor-carga                  → valor_carga (NUMERIC NOT NULL)
 * tipo-embalagem               → tipo_embalagem (VARCHAR NOT NULL)
 * carga-perigosa               → carga_perigosa (VARCHAR NOT NULL)
 * tempo-dias                   → tempo_dias (INTEGER NOT NULL)
 * tempo-horas                  → tempo_horas (INTEGER NOT NULL)
 * tempo-minutos                → tempo_minutos (INTEGER NOT NULL)
 * frequencia                   → frequencia (VARCHAR NOT NULL)
 * frequencia-diaria            → frequencia_diaria (NUMERIC NULL)
 * frequencia-outra             → frequencia_outra (VARCHAR NULL)
 * importancia-custo            → importancia_custo (VARCHAR NOT NULL)
 * variacao-custo               → variacao_custo (NUMERIC NOT NULL)
 * importancia-tempo            → importancia_tempo (VARCHAR NOT NULL)
 * variacao-tempo               → variacao_tempo (NUMERIC NOT NULL)
 * importancia-confiabilidade   → importancia_confiabilidade (VARCHAR NOT NULL)
 * variacao-confiabilidade      → variacao_confiabilidade (NUMERIC NOT NULL)
 * importancia-seguranca        → importancia_seguranca (VARCHAR NOT NULL)
 * variacao-seguranca           → variacao_seguranca (NUMERIC NOT NULL)
 * importancia-capacidade       → importancia_capacidade (VARCHAR NOT NULL)
 * variacao-capacidade          → variacao_capacidade (NUMERIC NOT NULL)
 * tipo-cadeia                  → tipo_cadeia (VARCHAR NOT NULL)
 * modal-alternativo            → modais_alternativos (ARRAY NULL)
 * fator-adicional              → fator_adicional (TEXT NULL)
 * dificuldade (checkboxes)     → dificuldades (ARRAY NULL)
 * detalhe-dificuldade          → detalhe_dificuldade (TEXT NULL)
 * observacoes                  → observacoes (TEXT NULL)
 * consentimento                → consentimento (BOOLEAN DEFAULT false)
 *                              → transporta_carga (BOOLEAN DEFAULT true)
 * 
 * ========== TABELA: produtos_transportados (N produtos) ==========
 * produto-carga-*              → produto (VARCHAR)
 * produto-movimentacao-*       → movimentacao_anual (NUMERIC)
 * produto-origem-pais-*        → origem_pais (VARCHAR)
 * produto-origem-estado-*      → origem_estado (VARCHAR)
 * produto-origem-municipio-*   → origem_municipio (VARCHAR)
 * produto-destino-pais-*       → destino_pais (VARCHAR)
 * produto-destino-estado-*     → destino_estado (VARCHAR)
 * produto-destino-municipio-*  → destino_municipio (VARCHAR)
 * produto-distancia-*          → distancia (NUMERIC)
 * produto-modalidade-*         → modalidade (VARCHAR)
 * produto-acondicionamento-*   → acondicionamento (VARCHAR)
 * 
 * PRINCÍPIO: Frontend coleta dados, backend valida e salva
 * NÃO faz validação de negócio (FormValidator + Backend fazem isso)
 */

const FormCollector = {
    // Produtos confirmados (armazenamento global)
    produtosConfirmados: new Map(), // rowId -> dadosProduto
    
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
        
        // Carregar listas auxiliares via DropdownManager
        this._loadDropdowns();
        
        console.log('✅ FormCollector inicializado');
    },
    
    /**
     * Carrega dropdowns usando DropdownManager
     */
    async _loadDropdowns() {
        try {
            // Carregar listas iniciais
            await DropdownManager.loadInitialData();
            
            // Aplicar em seções específicas
            await DropdownManager.applyToOrigemDestino(); // Q12, Q13
            await DropdownManager.applyToFuncao(); // Q2
            await DropdownManager.applyToEntrevistador(); // Q0
            await DropdownManager.applyToNaturalidade(); // Q7-Q8 (Naturalidade)
            
            // ⭐ NOVO: Configurar listener para buscar dados completos do entrevistador
            this._setupEntrevistadorListener();
            
            console.log('✅ Dropdowns carregados via DropdownManager');
        } catch (error) {
            console.error('❌ Erro ao carregar dropdowns:', error);
        }
    },
    
    /**
     * ⭐ NOVO: Configura listener para buscar dados completos do entrevistador + instituição
     * Quando um entrevistador é selecionado, busca todos os dados via API
     */
    _setupEntrevistadorListener() {
        const entrevistadorSelect = document.getElementById('id-entrevistador');
        if (!entrevistadorSelect) return;
        
        entrevistadorSelect.addEventListener('change', async (e) => {
            const idEntrevistador = e.target.value;
            
            if (!idEntrevistador) {
                this._entrevistadorCompleto = null;
                console.log('📋 Entrevistador desmarcado - dados limpos');
                return;
            }
            
            try {
                console.log(`🔍 Buscando dados completos do entrevistador ID ${idEntrevistador}...`);
                
                // Buscar dados completos via API
                const response = await fetch(`/api/entrevistadores/${idEntrevistador}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    this._entrevistadorCompleto = {
                        entrevistador: result.entrevistador,
                        instituicao: result.instituicao
                    };
                    console.log('✅ Dados completos do entrevistador carregados:', this._entrevistadorCompleto);
                } else {
                    console.warn('⚠️ API retornou erro:', result);
                    this._entrevistadorCompleto = null;
                }
            } catch (error) {
                console.error('❌ Erro ao buscar dados do entrevistador:', error);
                this._entrevistadorCompleto = null;
            }
        });
        
        console.log('✅ Listener de entrevistador configurado');
    },
    
    // Armazena dados completos do entrevistador + instituição
    _entrevistadorCompleto: null,
    
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
        
        // ===== Q2 - FUNÇÃO: "Outro" =====
        const funcaoSelect = document.getElementById('funcao');
        const outraFuncaoContainer = document.getElementById('outra-funcao-container');
        
        const updateFuncaoVisibility = () => {
            const selectedOption = funcaoSelect?.selectedOptions[0];
            const selectedText = selectedOption?.text || '';
            
            // Verifica se o texto da opção selecionada contém "Outro"
            if (selectedText.includes('Outro')) {
                outraFuncaoContainer?.classList.remove('hidden-field');
            } else {
                outraFuncaoContainer?.classList.add('hidden-field');
                // Limpar valor quando oculto
                const outraFuncaoInput = document.getElementById('outra-funcao');
                if (outraFuncaoInput) outraFuncaoInput.value = '';
            }
        };
        
        funcaoSelect?.addEventListener('change', updateFuncaoVisibility);
        // Executar após listas carregadas (setTimeout para aguardar)
        setTimeout(updateFuncaoVisibility, 500);
        
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
        const checkboxes = document.querySelectorAll('input[name="modo"]');
        const configVeiculoContainer = document.getElementById('config-veiculo-container');
        
        const updateConfigVeiculoVisibility = () => {
            const rodoviarioChecked = document.querySelector('input[name="modo"][value="rodoviario"]')?.checked;
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
        
        console.log('✅ Campos condicionais configurados: tipo-responsavel, funcao (outro), tipo-empresa (outro), agrupamento-produto (outro), num-paradas, modo-rodoviario, frequencia (diaria/outra)');
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
        data.tipoResponsavel = tipoResponsavel ? tipoResponsavel.value : 'entrevistado'; // Default
        
        // ⭐ idResponsavel: OBRIGATÓRIO pelo backend
        // - Se 'entrevistador': usa valor do select 'id-entrevistador'
        // - Se 'entrevistado': será preenchido pelo backend após INSERT na tabela entrevistados
        if (data.tipoResponsavel === 'entrevistador') {
            const idEntrevistadorValue = this._getInteger('id-entrevistador');
            if (idEntrevistadorValue) {
                data.idResponsavel = idEntrevistadorValue;
                // ⭐ NOVO: Armazenar dados completos do entrevistador + instituição para o PDF
                // Esses dados são buscados pelo evento 'change' do select e armazenados em _entrevistadorCompleto
                if (this._entrevistadorCompleto) {
                    data.entrevistadorCompleto = this._entrevistadorCompleto;
                }
            } else {
                console.error('❌ ERRO: tipo_responsavel é "entrevistador" mas id-entrevistador não foi selecionado');
                data.idResponsavel = null; // Backend vai rejeitar
            }
        } else {
            // 'entrevistado': backend resolverá após INSERT
            data.idResponsavel = null; // Será preenchido pelo backend
        }
        
        // ==== SEÇÃO 1: Dados do Entrevistado ====
        data.nome = this._getValue('nome');
        // Função: código para banco + nome para PDF
        const funcaoData = this._getValueWithText('funcao');
        data.funcao = funcaoData.codigo;
        data.funcaoNome = funcaoData.nome;
        data.telefone = this._getValue('telefone');
        data.email = this._getValue('email');
        data.estadoCivil = this._getValue('estado-civil'); // Q5
        data.nacionalidade = this._getValue('nacionalidade'); // Q6
        data.ufNaturalidade = this._getValue('uf-naturalidade'); // Q7
        data.municipioNaturalidade = this._getValue('municipio-naturalidade'); // Q8
        
        // ==== SEÇÃO 2: Dados da Empresa ====
        // Tipo empresa: código para banco + nome para PDF
        const tipoEmpresaData = this._getValueWithText('tipo-empresa');
        data.tipoEmpresa = tipoEmpresaData.codigo;
        data.tipoEmpresaNome = tipoEmpresaData.nome;
        if (data.tipoEmpresa === 'outro') {
            data.outroTipo = this._getValue('outro-tipo');
        }
        data.razaoSocial = this._getValue('razao-social'); // Q6b - Nome da empresa
        data.nomeEmpresa = this._getValue('razao-social'); // Backend espera nomeEmpresa
        // Município da Empresa: código para banco + nome para PDF
        const municipioEmpresaData = this._getValueWithText('municipio-empresa');
        data.municipio = municipioEmpresaData.codigo; // Q7 - Código do Município
        data.municipioNome = municipioEmpresaData.nome; // Nome para PDF
        data.cnpj = this._getValue('cnpj-empresa');
        data.nomeFantasia = this._getValue('nome-fantasia');
        
        // ==== Q6c, Q6d, Q6e: Dados da Receita Federal (somente leitura) ====
        data.nomeFantasiaReceita = this._getValue('nome-fantasia-receita');
        data.situacaoCadastralReceita = this._getValue('situacao-cadastral-receita');
        data.atividadePrincipalReceita = this._getValue('atividade-principal-receita');
        
        data.logradouro = this._getValue('logradouro');
        data.numero = this._getValue('numero');
        data.complemento = this._getValue('complemento');
        data.bairro = this._getValue('bairro');
        data.cep = this._getValue('cep');
        
        // ==== SEÇÃO 3: Produtos Transportados (tabela) ====
        data.produtos = this._collectProdutos();
        
        // ==== SEÇÃO 4: Produto Principal ====
        data.produtoPrincipal = this._getValue('produto-principal');
        // Agrupamento: código para banco + nome para PDF
        const agrupamentoData = this._getValueWithText('agrupamento-produto');
        data.agrupamentoProduto = agrupamentoData.codigo;
        data.agrupamentoProdutoNome = agrupamentoData.nome;
        if (data.agrupamentoProduto === 'outro-produto') {
            data.outroProduto = this._getValue('outro-produto');
        }
        data.observacoesProdutoPrincipal = this._getValue('observacoes-produto-principal');
        
        // ==== SEÇÃO 5: Características do Transporte ====
        // Tipo de transporte: código para banco + nome para PDF
        const tipoTransporteData = this._getValueWithText('tipo-transporte');
        data.tipoTransporte = tipoTransporteData.codigo;
        data.tipoTransporteNome = tipoTransporteData.nome;
        
        // Origem: código para banco + nome para PDF
        const origemPaisData = this._getValueWithText('origem-pais');
        const origemEstadoData = this._getValueWithText('origem-estado');
        const origemMunicipioData = this._getValueWithText('origem-municipio');
        data.origemPais = origemPaisData.codigo;           // Código para banco
        data.origemPaisNome = origemPaisData.nome;         // Nome para PDF
        data.origemEstado = origemEstadoData.codigo;       // Código para banco
        data.origemEstadoNome = origemEstadoData.nome;     // Nome para PDF
        data.origemMunicipio = origemMunicipioData.codigo; // Código para banco
        data.origemMunicipioNome = origemMunicipioData.nome; // Nome para PDF
        
        // Destino: código para banco + nome para PDF
        const destinoPaisData = this._getValueWithText('destino-pais');
        const destinoEstadoData = this._getValueWithText('destino-estado');
        const destinoMunicipioData = this._getValueWithText('destino-municipio');
        data.destinoPais = destinoPaisData.codigo;           // Código para banco
        data.destinoPaisNome = destinoPaisData.nome;         // Nome para PDF
        data.destinoEstado = destinoEstadoData.codigo;       // Código para banco
        data.destinoEstadoNome = destinoEstadoData.nome;     // Nome para PDF
        data.destinoMunicipio = destinoMunicipioData.codigo; // Código para banco
        data.destinoMunicipioNome = destinoMunicipioData.nome; // Nome para PDF
        
        data.distancia = this._getNumeric('distancia');
        data.temParadas = this._getValue('tem-paradas');
        
        if (data.temParadas === 'sim') {
            data.numParadas = this._getInteger('num-paradas');
        }
        
        // Modos de transporte (checkboxes múltiplos)
        data.modos = this._getCheckedValues('modo');
        
        if (data.modos && data.modos.includes('rodoviario')) {
            // Config veículo: código para banco + nome para PDF
            const configVeiculoData = this._getValueWithText('config-veiculo');
            data.configVeiculo = configVeiculoData.codigo;
            data.configVeiculoNome = configVeiculoData.nome;
        }
        
        data.capacidadeUtilizada = this._getNumeric('capacidade-utilizada');
        data.pesoCarga = this._getNumeric('peso-carga');
        // Unidade de peso: código para banco + nome para PDF
        const unidadePesoData = this._getValueWithText('unidade-peso');
        data.unidadePeso = unidadePesoData.codigo;
        data.unidadePesoNome = unidadePesoData.nome;
        data.custoTransporte = this._getNumeric('custo-transporte');
        data.valorCarga = this._getNumeric('valor-carga');
        // Tipo de embalagem: código para banco + nome para PDF
        const tipoEmbalagemData = this._getValueWithText('tipo-embalagem');
        data.tipoEmbalagem = tipoEmbalagemData.codigo;
        data.tipoEmbalagemNome = tipoEmbalagemData.nome;
        data.cargaPerigosa = this._getValue('carga-perigosa');
        
        data.tempoDias = this._getInteger('tempo-dias');
        data.tempoHoras = this._getInteger('tempo-horas');
        data.tempoMinutos = this._getInteger('tempo-minutos');
        
        // Frequência: código para banco + nome para PDF
        const frequenciaData = this._getValueWithText('frequencia');
        data.frequencia = frequenciaData.codigo;
        data.frequenciaNome = frequenciaData.nome;
        if (data.frequencia === 'diaria') {
            data.frequenciaDiaria = this._getNumeric('frequencia-diaria');
        }
        if (data.frequencia === 'outra') {
            data.frequenciaOutra = this._getValue('frequencia-outra');
        }
        data.observacoesSazonalidade = this._getValue('observacoes-sazonalidade');
        
        // ==== SEÇÃO 6: Fatores de Decisão ====
        // Importância: código para banco + nome para PDF
        const importanciaCustoData = this._getValueWithText('importancia-custo');
        data.importanciaCusto = importanciaCustoData.codigo;
        data.importanciaCustoNome = importanciaCustoData.nome;
        data.variacaoCusto = this._getNumeric('variacao-custo');
        const importanciaTempoData = this._getValueWithText('importancia-tempo');
        data.importanciaTempo = importanciaTempoData.codigo;
        data.importanciaTempoNome = importanciaTempoData.nome;
        data.variacaoTempo = this._getNumeric('variacao-tempo');
        const importanciaConfiabilidadeData = this._getValueWithText('importancia-confiabilidade');
        data.importanciaConfiabilidade = importanciaConfiabilidadeData.codigo;
        data.importanciaConfiabilidadeNome = importanciaConfiabilidadeData.nome;
        data.variacaoConfiabilidade = this._getNumeric('variacao-confiabilidade');
        const importanciaSegurancaData = this._getValueWithText('importancia-seguranca');
        data.importanciaSeguranca = importanciaSegurancaData.codigo;
        data.importanciaSegurancaNome = importanciaSegurancaData.nome;
        data.variacaoSeguranca = this._getNumeric('variacao-seguranca');
        const importanciaCapacidadeData = this._getValueWithText('importancia-capacidade');
        data.importanciaCapacidade = importanciaCapacidadeData.codigo;
        data.importanciaCapacidadeNome = importanciaCapacidadeData.nome;
        data.variacaoCapacidade = this._getNumeric('variacao-capacidade');
        
        // ==== SEÇÃO 7: Análise Estratégica ====
        // Tipo de cadeia: código para banco + nome para PDF
        const tipoCadeiaData = this._getValueWithText('tipo-cadeia');
        data.tipoCadeia = tipoCadeiaData.codigo;
        data.tipoCadeiaNome = tipoCadeiaData.nome;
        data.modaisAlternativos = this._getCheckedValues('modal-alternativo');
        data.fatorAdicional = this._getValue('fator-adicional');
        
        // ==== SEÇÃO 8: Dificuldades ====
        data.dificuldades = this._getCheckedValues('dificuldade');
        data.detalheDificuldade = this._getValue('detalhe-dificuldade');
        
        // ==== SEÇÃO 9: Flags e Status ====
        data.transportaCarga = true; // Sempre true (formulário é para embarcadores)
        
        // ⭐ LIMPEZA: Remover campos vazios/null/undefined
        const dataLimpa = this._removeEmptyFields(data);
        
        console.log('📋 Dados coletados (após limpeza):', dataLimpa);
        return dataLimpa;
    },
    
    /**
     * Remove campos vazios, null, undefined, arrays vazios
     * Mantém apenas dados que foram realmente preenchidos
     */
    _removeEmptyFields(obj) {
        const cleaned = {};
        
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            
            // Verificar se o valor não é vazio
            if (value === null || value === undefined || value === '') {
                return; // pular este campo
            }
            
            // Se é array, manter apenas se tem elementos
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    cleaned[key] = value;
                }
                return;
            }
            
            // Se é número, manter (até 0 é válido)
            if (typeof value === 'number') {
                cleaned[key] = value;
                return;
            }
            
            // Se é booleano, manter
            if (typeof value === 'boolean') {
                cleaned[key] = value;
                return;
            }
            
            // Se é string e não é vazio, manter
            if (typeof value === 'string' && value.trim() !== '') {
                cleaned[key] = value;
                return;
            }
            
            // Se é objeto (produtos array de objetos), processar recursivamente
            if (typeof value === 'object' && !Array.isArray(value)) {
                const cleanedObj = this._removeEmptyFields(value);
                if (Object.keys(cleanedObj).length > 0) {
                    cleaned[key] = cleanedObj;
                }
                return;
            }
        });
        
        return cleaned;
    },
    
    /**
     * Coleta produtos da tabela - APENAS CONFIRMADOS (para JSON backend)
     */
    _collectProdutos() {
        const produtos = [];
        const rows = document.querySelectorAll('#produtos-tbody tr');

        rows.forEach((row) => {
            // ⭐ NOVO: Verificar se produto foi confirmado
            if (row.dataset.confirmado !== 'true') {
                console.log(`⏭️  Produto não confirmado, pulando: ${row.id}`);
                return; // Ignorar produtos não confirmados
            }

            // Exemplo de id do row: produto-row-1
            const idParts = (row.id || '').split('-');
            const rowNum = idParts[idParts.length - 1];
            if (!rowNum) return; // skip unexpected rows

            const cargaEl = row.querySelector(`[name="produto-carga-${rowNum}"]`);
            const movimentacaoEl = row.querySelector(`[name="produto-movimentacao-${rowNum}"]`);
            // Prefer selects (pais/estado/municipio) over free-text input when collecting product origin/destination
            const origemPaisSelect = row.querySelector(`[name="produto-origem-pais-${rowNum}"]`);
            const origemEstadoSelect = row.querySelector(`[name="produto-origem-estado-${rowNum}"]`);
            const origemMunicipioSelect = row.querySelector(`[name="produto-origem-municipio-${rowNum}"]`);
            const origemTextInput = row.querySelector(`[name="produto-origem-text-${rowNum}"]`);

            const destinoPaisSelect = row.querySelector(`[name="produto-destino-pais-${rowNum}"]`);
            const destinoEstadoSelect = row.querySelector(`[name="produto-destino-estado-${rowNum}"]`);
            const destinoMunicipioSelect = row.querySelector(`[name="produto-destino-municipio-${rowNum}"]`);
            const destinoTextInput = row.querySelector(`[name="produto-destino-text-${rowNum}"]`);
            const distanciaEl = row.querySelector(`[name="produto-distancia-${rowNum}"]`);
            const modalidadeEl = row.querySelector(`[name^="produto-modalidade-${rowNum}"]`);
            const acondEl = row.querySelector(`[name="produto-acondicionamento-${rowNum}"]`);
            const observacoesEl = row.querySelector(`[name="produto-observacoes-${rowNum}"]`);

            const carga = cargaEl ? cargaEl.value || '' : '';
            
            // Modalidade (multi-select): coleta múltiplas opções e converte para string separada por vírgula
            let modalidade = '';
            if (modalidadeEl) {
                if (modalidadeEl.multiple) {
                    const selected = Array.from(modalidadeEl.selectedOptions || []).map(o => o.value).filter(v => v && v !== '');
                    modalidade = selected.length > 0 ? selected.join(',') : '';
                } else {
                    modalidade = modalidadeEl.value || '';
                }
            }
            
            // Incluir a linha do produto se pelo menos um campo estiver preenchido
            const anyFilled = [
                carga,
                movimentacaoEl ? movimentacaoEl.value : '',
                origemPaisSelect ? origemPaisSelect.value : (origemTextInput ? origemTextInput.value : ''),
                destinoPaisSelect ? destinoPaisSelect.value : (destinoTextInput ? destinoTextInput.value : ''),
                distanciaEl ? distanciaEl.value : '',
                modalidade,
                acondEl ? acondEl.value : '',
                observacoesEl ? observacoesEl.value : ''
            ].some(v => v !== null && String(v).trim() !== '');
            if (!anyFilled) return; // ignore fully empty product rows

            const produto = {
                carga: carga,
                movimentacao: movimentacaoEl ? this._parseNumeric(movimentacaoEl.value) : null,
                // Origem: priorizar selects, fallback para texto
                origemPaisCodigo: origemPaisSelect ? origemPaisSelect.value || '' : '',
                origemPaisNome: origemPaisSelect ? (origemPaisSelect.selectedOptions[0]?.textContent || '') : (origemTextInput ? origemTextInput.value || '' : ''),
                origemEstadoUf: origemEstadoSelect ? origemEstadoSelect.value || '' : '',
                origemEstadoNome: origemEstadoSelect ? (origemEstadoSelect.selectedOptions[0]?.textContent || '') : '',
                origemMunicipioCodigo: origemMunicipioSelect ? origemMunicipioSelect.value || '' : '',
                origemMunicipioNome: origemMunicipioSelect ? (origemMunicipioSelect.selectedOptions[0]?.textContent || '') : '',
                origemText: origemTextInput ? origemTextInput.value || '' : '',
                // Destino: priorizar selects, fallback para texto
                destinoPaisCodigo: destinoPaisSelect ? destinoPaisSelect.value || '' : '',
                destinoPaisNome: destinoPaisSelect ? (destinoPaisSelect.selectedOptions[0]?.textContent || '') : (destinoTextInput ? destinoTextInput.value || '' : ''),
                destinoEstadoUf: destinoEstadoSelect ? destinoEstadoSelect.value || '' : '',
                destinoEstadoNome: destinoEstadoSelect ? (destinoEstadoSelect.selectedOptions[0]?.textContent || '') : '',
                destinoMunicipioCodigo: destinoMunicipioSelect ? destinoMunicipioSelect.value || '' : '',
                destinoMunicipioNome: destinoMunicipioSelect ? (destinoMunicipioSelect.selectedOptions[0]?.textContent || '') : '',
                destinoText: destinoTextInput ? destinoTextInput.value || '' : '',
                distancia: distanciaEl ? this._parseNumeric(distanciaEl.value) : null,
                modalidade: modalidade,
                acondicionamento: acondEl ? (acondEl.value || '') : '',
                observacoes: observacoesEl ? (observacoesEl.value || '') : ''
            };

            produtos.push(produto);
        });
        
        return produtos;
    },
    
    /**
     * Coleta TODOS os produtos (sem filtro de confirmação)
     * Usado APENAS para Excel/Rascunho - para mostrar tudo que foi preenchido
     */
    collectAllProdutos() {
        const produtos = [];
        const rows = document.querySelectorAll('#produtos-tbody tr');

        rows.forEach((row) => {
            // ⭐ DIFERENÇA: SEM FILTRO - coleta TODOS os produtos
            // Produtos não confirmados também são incluídos no Excel
            
            // Exemplo de id do row: produto-row-1
            const idParts = (row.id || '').split('-');
            const rowNum = idParts[idParts.length - 1];
            if (!rowNum) return; // skip unexpected rows

            const cargaEl = row.querySelector(`[name="produto-carga-${rowNum}"]`);
            const movimentacaoEl = row.querySelector(`[name="produto-movimentacao-${rowNum}"]`);
            const origemPaisSelect = row.querySelector(`[name="produto-origem-pais-${rowNum}"]`);
            const origemEstadoSelect = row.querySelector(`[name="produto-origem-estado-${rowNum}"]`);
            const origemMunicipioSelect = row.querySelector(`[name="produto-origem-municipio-${rowNum}"]`);
            const origemTextInput = row.querySelector(`[name="produto-origem-text-${rowNum}"]`);

            const destinoPaisSelect = row.querySelector(`[name="produto-destino-pais-${rowNum}"]`);
            const destinoEstadoSelect = row.querySelector(`[name="produto-destino-estado-${rowNum}"]`);
            const destinoMunicipioSelect = row.querySelector(`[name="produto-destino-municipio-${rowNum}"]`);
            const destinoTextInput = row.querySelector(`[name="produto-destino-text-${rowNum}"]`);
            const distanciaEl = row.querySelector(`[name="produto-distancia-${rowNum}"]`);
            const modalidadeEl = row.querySelector(`[name^="produto-modalidade-${rowNum}"]`);
            const acondEl = row.querySelector(`[name="produto-acondicionamento-${rowNum}"]`);
            const observacoesEl = row.querySelector(`[name="produto-observacoes-${rowNum}"]`);

            const carga = cargaEl ? cargaEl.value || '' : '';
            
            // Modalidade (multi-select)
            let modalidade = '';
            if (modalidadeEl) {
                if (modalidadeEl.multiple) {
                    const selected = Array.from(modalidadeEl.selectedOptions || []).map(o => o.value).filter(v => v && v !== '');
                    modalidade = selected.length > 0 ? selected.join(',') : '';
                } else {
                    modalidade = modalidadeEl.value || '';
                }
            }
            
            // ⭐ IMPORTANTE: Incluir TODOS os produtos, mesmo sem confirmação
            // Apenas verificar se tem algo preenchido
            const anyFilled = [
                carga,
                movimentacaoEl ? movimentacaoEl.value : '',
                origemPaisSelect ? origemPaisSelect.value : (origemTextInput ? origemTextInput.value : ''),
                destinoPaisSelect ? destinoPaisSelect.value : (destinoTextInput ? destinoTextInput.value : ''),
                distanciaEl ? distanciaEl.value : '',
                modalidade,
                acondEl ? acondEl.value : '',
                observacoesEl ? observacoesEl.value : ''
            ].some(v => v !== null && String(v).trim() !== '');
            if (!anyFilled) return; // ignore fully empty product rows

            const produto = {
                carga: carga,
                movimentacao: movimentacaoEl ? this._parseNumeric(movimentacaoEl.value) : null,
                origemPaisCodigo: origemPaisSelect ? origemPaisSelect.value || '' : '',
                origemPaisNome: origemPaisSelect ? (origemPaisSelect.selectedOptions[0]?.textContent || '') : (origemTextInput ? origemTextInput.value || '' : ''),
                origemEstadoUf: origemEstadoSelect ? origemEstadoSelect.value || '' : '',
                origemEstadoNome: origemEstadoSelect ? (origemEstadoSelect.selectedOptions[0]?.textContent || '') : '',
                origemMunicipioCodigo: origemMunicipioSelect ? origemMunicipioSelect.value || '' : '',
                origemMunicipioNome: origemMunicipioSelect ? (origemMunicipioSelect.selectedOptions[0]?.textContent || '') : '',
                origemText: origemTextInput ? origemTextInput.value || '' : '',
                destinoPaisCodigo: destinoPaisSelect ? destinoPaisSelect.value || '' : '',
                destinoPaisNome: destinoPaisSelect ? (destinoPaisSelect.selectedOptions[0]?.textContent || '') : (destinoTextInput ? destinoTextInput.value || '' : ''),
                destinoEstadoUf: destinoEstadoSelect ? destinoEstadoSelect.value || '' : '',
                destinoEstadoNome: destinoEstadoSelect ? (destinoEstadoSelect.selectedOptions[0]?.textContent || '') : '',
                destinoMunicipioCodigo: destinoMunicipioSelect ? destinoMunicipioSelect.value || '' : '',
                destinoMunicipioNome: destinoMunicipioSelect ? (destinoMunicipioSelect.selectedOptions[0]?.textContent || '') : '',
                destinoText: destinoTextInput ? destinoTextInput.value || '' : '',
                distancia: distanciaEl ? this._parseNumeric(distanciaEl.value) : null,
                modalidade: modalidade,
                acondicionamento: acondEl ? (acondEl.value || '') : '',
                observacoes: observacoesEl ? (observacoesEl.value || '') : '',
                confirmado: row.dataset.confirmado === 'true' ? '✅ SIM' : '❌ NÃO' // Mostrar no Excel se foi confirmado
            };

            produtos.push(produto);
        });
        
        return produtos;
    },
    
    // ============================================================
    // UTILITÁRIOS DE COLETA
    // ============================================================
    
    _getValue(id) {
        const el = document.getElementById(id);
        // Retornar string vazia ao invés de null para campos vazios
        return el ? (el.value || '') : '';
    },

    /**
     * Obtém valor E texto selecionado de um select
     * Retorna objeto { codigo: 'XX', nome: 'Nome Texto' }
     * Útil para campos que precisam mostrar nome no PDF mas salvar código no banco
     */
    _getValueWithText(id) {
        const el = document.getElementById(id);
        if (!el) return { codigo: '', nome: '' };
        const codigo = el.value || '';
        const nome = el.selectedOptions && el.selectedOptions[0] ? el.selectedOptions[0].textContent || '' : '';
        return { codigo, nome };
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
        // Retornar array vazio ao invés de null
        return checked;
    },
    
    _parseNumeric(value) {
        if (!value || value === '') return null;
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
            
            // ===== VALIDAÇÕES CONDICIONAIS (conforme backend @model_validator) =====
            
            // 1. configVeiculo obrigatório se rodoviário marcado
            if (formData.modos && formData.modos.includes('rodoviario')) {
                if (!formData.configVeiculo || formData.configVeiculo === '') {
                    UI.mostrarErroValidacao(
                        'O campo "Configuração do veículo rodoviário" é obrigatório quando o modo rodoviário está selecionado.',
                        [{ field: 'config-veiculo', message: 'Selecione uma configuração' }]
                    );
                    document.getElementById('config-veiculo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
            }
            
            // 2. numParadas obrigatório se temParadas = 'sim'
            if (formData.temParadas === 'sim') {
                if (!formData.numParadas || formData.numParadas === '') {
                    UI.mostrarErroValidacao(
                        'O campo "Número de paradas" é obrigatório quando você indicou que há paradas no percurso.',
                        [{ field: 'num-paradas', message: 'Selecione o número de paradas' }]
                    );
                    document.getElementById('num-paradas')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
            }
            
            // 3. outroTipo obrigatório se tipoEmpresa = 'outro'
            if (formData.tipoEmpresa === 'outro') {
                if (!formData.outroTipo || formData.outroTipo.trim() === '') {
                    UI.mostrarErroValidacao(
                        'O campo "Especificar outro tipo de empresa" é obrigatório quando você selecionou "Outro".',
                        [{ field: 'outro-tipo', message: 'Especifique o tipo de empresa' }]
                    );
                    document.getElementById('outro-tipo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
            }
            
            // 4. Tempo total deve ser maior que zero
            const tempoDias = parseInt(formData.tempoDias) || 0;
            const tempoHoras = parseInt(formData.tempoHoras) || 0;
            const tempoMinutos = parseInt(formData.tempoMinutos) || 0;
            
            if (tempoDias === 0 && tempoHoras === 0 && tempoMinutos === 0) {
                UI.mostrarErroValidacao(
                    'O tempo de transporte deve ser maior que zero. Informe pelo menos dias, horas ou minutos.',
                    [{ field: 'tempo-dias', message: 'Tempo total não pode ser zero' }]
                );
                document.getElementById('tempo-dias')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            
            // Gerar backup XLSX local (pré-envio) - Nativo, automático
            try {
                const backupFilename = `PLI2050_Resposta_BACKUP_${formData.razaoSocial || formData.nomeEmpresa || 'resposta'}_${new Date().toISOString().split('T')[0]}.xlsx`;
                console.log(`🧾 Gerando backup XLSX (pre-send) em memória: ${backupFilename}`);
                // ⭐ Para Excel: usar TODOS os produtos (não apenas confirmados)
                const backupDataForExcel = Object.assign({}, formData, {
                    produtos: this.collectAllProdutos()
                });
                // Gerar workbook em memória (ArrayBuffer), sem iniciar download
                const backupAb = window.ExcelGenerator.createWorkbookArrayBuffer(backupDataForExcel, { success: true, statusLabel: 'BACKUP', labels: window.ExcelLabels });
                // Armazenar backup em variável global temporária (somente em memória, sem baixar)
                window.__lastBackupXlsx = { arrayBuffer: backupAb, filename: backupFilename };
            } catch (err) {
                console.error('Erro ao gerar backup XLSX (pré-envio):', err);
            }

            // Mostrar loading
            UI.mostrarLoading('Enviando dados para o servidor...');
            
            // Enviar para backend
            const response = await CoreAPI.submitForm(formData);
            
            console.log('✅ Resposta do backend:', response);
            
            // Fechar loading
            UI.esconderLoading();
            
            // Verificar sucesso
            if (response.success) {
                // Gerar PDF estilizado e armazenar para download manual
                const pdfResult = window.PDFGenerator.generatePDF(formData, response);
                
                // Mostrar sucesso com botão de download
                UI.mostrarSucesso(formData.razaoSocial || formData.nomeEmpresa, pdfResult.nomeArquivo, pdfResult.pdfDoc);
                
                // Gerar 2 Excels: Técnico (backup) + Estilizado (oficial)
                try {
                    // Inclui IDs retornados pelo backend no arquivo final
                    // ⭐ Para Excel: usar TODOS os produtos (não apenas confirmados)
                    const finalFormData = Object.assign({}, formData, {
                        id_pesquisa: response.id_pesquisa,
                        id_empresa: response.id_empresa,
                        id_entrevistado: response.id_entrevistado,
                        produtos: this.collectAllProdutos()
                    });
                    const nomeBase = finalFormData.razaoSocial || finalFormData.nomeEmpresa || 'resposta';
                    const dataAtual = new Date().toISOString().split('T')[0];
                    
                    // 1️⃣ Excel Técnico (backup) - mantém estrutura original
                    const backupFilename = `PLI2050_Backup_Tecnico_${nomeBase}_${dataAtual}.xlsx`;
                    const backupAb = window.ExcelGenerator.createWorkbookArrayBuffer(finalFormData, { 
                        success: true, 
                        statusLabel: 'BACKUP TÉCNICO', 
                        labels: window.ExcelLabels 
                    });
                    window.ExcelGenerator.downloadArrayBuffer(backupAb, backupFilename);
                    
                    // 2️⃣ Excel Estilizado (oficial) - labels amigáveis, múltiplas abas
                    const oficialFilename = `PLI2050_Resposta_${nomeBase}_${dataAtual}.xlsx`;
                    const oficialAb = window.ExcelGenerator.createStyledWorkbook(finalFormData, response);
                    window.ExcelGenerator.downloadArrayBuffer(oficialAb, oficialFilename);
                    
                    console.log('✅ 2 arquivos Excel gerados: Backup Técnico + Oficial Estilizado');
                } catch (err) {
                    console.error('Erro ao gerar/baixar XLSX final após sucesso:', err);
                }

                // Aguardar 5s e resetar formulário (aumentado de 3s para 5s)
                setTimeout(() => {
                    UI.resetForm();
                    // Limpar auto-save local após envio bem-sucedido
                    if (window.AutoSave) {
                        window.AutoSave.clear();
                    }
                    // Limpando backup em memória
                    try { delete window.__lastBackupXlsx; } catch (e) { window.__lastBackupXlsx = null; }
                }, 5000);
            } else {
                // Erro retornado pelo backend
                UI.mostrarErroBanco(response.message || 'Erro desconhecido');

                try {
                    const errFilename = `PLI2050_Resposta_ERROR_${formData.razaoSocial || formData.nomeEmpresa || 'resposta'}_${new Date().toISOString().split('T')[0]}.xlsx`;
                    const errAb = window.ExcelGenerator.createWorkbookArrayBuffer(formData, { success: false, statusLabel: 'ERRO', errorDetails: response, labels: window.ExcelLabels });
                    window.ExcelGenerator.downloadArrayBuffer(errAb, errFilename);
                } catch (err) {
                    console.error('Erro ao gerar/baixar XLSX em caso de erro do backend:', err);
                }
                try { delete window.__lastBackupXlsx; } catch (e) { window.__lastBackupXlsx = null; }
            }
            
        } catch (error) {
            console.error('❌ Erro na submissão:', error);
            console.error('📋 Detalhes completos do erro:', JSON.stringify(error, null, 2));
            UI.esconderLoading();
            
            // Tratar diferentes tipos de erro
            if (error.status) {
                // Erro HTTP com status
                if (error.status === 422) {
                    // Erro de validação do backend
                    console.error('🔴 Erro 422 - Validação:', error.message);
                    console.error('🔴 Data:', error.data);
                    UI.mostrarErroBanco('Erro de validação: ' + (Array.isArray(error.message) ? error.message.join(', ') : error.message));
                } else if (error.status === 409) {
                    UI.mostrarErroBanco('Registro duplicado: ' + error.message);
                } else if (error.status >= 500) {
                    UI.mostrarErroBanco('Erro no servidor: ' + error.message);
                } else {
                    UI.mostrarErroBanco(error.message);
                }
            } else if (error.message && error.message.includes('fetch')) {
                // Erro de conexão
                UI.mostrarErroConexao(error.message);
                try {
                    const errFilename = `PLI2050_Resposta_ERROR_${formData.razaoSocial || formData.nomeEmpresa || 'resposta'}_${new Date().toISOString().split('T')[0]}.xlsx`;
                    const errAb = window.ExcelGenerator.createWorkbookArrayBuffer(formData, { success: false, statusLabel: 'ERRO', errorDetails: error.message, labels: window.ExcelLabels });
                    window.ExcelGenerator.downloadArrayBuffer(errAb, errFilename);
                } catch (errx) {
                    console.error('Erro ao gerar/baixar XLSX em caso de falha de conexão:', errx);
                }
                try { delete window.__lastBackupXlsx; } catch (e) { window.__lastBackupXlsx = null; }
            } else {
                // Erro genérico
                UI.mostrarErroBanco(JSON.stringify(error));
                try {
                    const errFilename = `PLI2050_Resposta_ERROR_${formData.razaoSocial || formData.nomeEmpresa || 'resposta'}_${new Date().toISOString().split('T')[0]}.xlsx`;
                    const errAb = window.ExcelGenerator.createWorkbookArrayBuffer(formData, { success: false, statusLabel: 'ERRO', errorDetails: error, labels: window.ExcelLabels });
                    window.ExcelGenerator.downloadArrayBuffer(errAb, errFilename);
                } catch (errx) {
                    console.error('Erro ao gerar/baixar XLSX em caso de exception:', errx);
                }
                try { delete window.__lastBackupXlsx; } catch (e) { window.__lastBackupXlsx = null; }
            }
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
    row.dataset.confirmado = 'false'; // Estado inicial: não confirmado
    row.innerHTML = `
        <td><input type="text" name="produto-carga-${currentCounter}" class="table-input" placeholder="Nome da carga"></td>
        <td><input type="number" name="produto-movimentacao-${currentCounter}" class="table-input" placeholder="Toneladas/ano" min="0"></td>
        <td>
            <div class="produto-origem-container">
                <select id="produto-origem-pais-select-${currentCounter}" name="produto-origem-pais-${currentCounter}" class="table-input produto-pais-select" data-row="${currentCounter}" data-tipo="origem" required>
                    <option value="">Selecione o país...</option>
                </select>
                <select id="produto-origem-estado-select-${currentCounter}" name="produto-origem-estado-${currentCounter}" class="table-input produto-estado-select" data-row="${currentCounter}" data-tipo="origem">
                    <option value="">Selecione o estado...</option>
                </select>
                <select id="produto-origem-municipio-select-${currentCounter}" name="produto-origem-municipio-${currentCounter}" class="table-input produto-municipio-select" data-row="${currentCounter}" data-tipo="origem">
                    <option value="">Município (opcional)...</option>
                </select>
                <input type="text" name="produto-origem-text-${currentCounter}" class="table-input produto-text-input" placeholder="Origem" style="display:none;">
            </div>
        </td>
        <td>
            <div class="produto-destino-container">
                <select id="produto-destino-pais-select-${currentCounter}" name="produto-destino-pais-${currentCounter}" class="table-input produto-pais-select" data-row="${currentCounter}" data-tipo="destino" required>
                    <option value="">Selecione o país...</option>
                </select>
                <select id="produto-destino-estado-select-${currentCounter}" name="produto-destino-estado-${currentCounter}" class="table-input produto-estado-select" data-row="${currentCounter}" data-tipo="destino">
                    <option value="">Selecione o estado...</option>
                </select>
                <select id="produto-destino-municipio-select-${currentCounter}" name="produto-destino-municipio-${currentCounter}" class="table-input produto-municipio-select" data-row="${currentCounter}" data-tipo="destino">
                    <option value="">Município (opcional)...</option>
                </select>
                <input type="text" name="produto-destino-text-${currentCounter}" class="table-input produto-text-input" placeholder="Destino" style="display:none;">
            </div>
        </td>
        <td><input type="number" name="produto-distancia-${currentCounter}" class="table-input" placeholder="km" min="0"></td>
        <td>
            <!-- Multi-select para Modalidade: permite selecionar mais de um modal -->
            <select name="produto-modalidade-${currentCounter}[]" class="table-input" multiple size="3" title="Segure Ctrl/Cmd para selecionar múltiplos">
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
        <td><input type="text" name="produto-observacoes-${currentCounter}" class="table-input" placeholder="Observações sobre este produto (opcional)"></td>
        <td>
            <div class="produto-acoes">
                <button type="button" class="btn-confirm" onclick="confirmarProduto('${rowId}')" title="Confirmar seleção deste produto">✅</button>
                <button type="button" class="btn-remove" onclick="removeProdutoRow('${rowId}')" title="Remover este produto">🗑️</button>
            </div>
        </td>
    `;
    
    tbody.appendChild(row);
    
    // Popular dropdowns via DropdownManager
    await DropdownManager.applyToProductRow(currentCounter);
    // Ajustar altura do select de modalidades para combinar com a altura dos 3 selects de origem
    setTimeout(() => setModalidadeHeight(currentCounter), 60);
}

/**
 * Confirma a seleção de um produto na tabela
 * Agora exibe uma prévia dos dados antes de confirmar
 */
function confirmarProduto(rowId) {
    const row = document.getElementById(rowId);
    if (!row) {
        console.error(`❌ Linha de produto não encontrada: ${rowId}`);
        return;
    }
    
    const confirmado = row.dataset.confirmado === 'true';
    
    if (!confirmado) {
        // Adicionar produto aos confirmados e mostrar container
        adicionarProdutoConfirmado(rowId);
        mostrarContainerProdutos();
    } else {
        // Remover produto dos confirmados
        removerProdutoConfirmado(rowId);
        
        // Atualizar botão
        const btnConfirm = row.querySelector('.btn-confirm');
        if (btnConfirm) {
            btnConfirm.classList.remove('btn-confirm-ativo');
            btnConfirm.title = 'Confirmar seleção deste produto';
        }
        
        console.log(`🔄 Confirmação removida: ${rowId}`);
    }
}

/**
 * Adiciona um produto à lista de confirmados
 */
function adicionarProdutoConfirmado(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    // Extrair o número da linha do rowId (ex: "produto-row-1" -> 1)
    const rowNumber = rowId.replace('produto-row-', '');
    
    // Coletar dados do produto
    const dadosProduto = coletarDadosProdutoParaPreview(row, rowNumber);
    
    // Mapear para o schema do banco
    const dadosBanco = mapearParaSchemaBanco(dadosProduto);
    
    // Adicionar aos produtos confirmados
    FormCollector.produtosConfirmados.set(rowId, {
        rowId,
        rowNumber,
        dadosProduto,
        dadosBanco,
        timestamp: new Date().toISOString()
    });
    
    // Marcar como confirmado visualmente
    row.dataset.confirmado = 'true';
    row.classList.add('produto-confirmado');
    
    // Atualizar botão
    const btnConfirm = row.querySelector('.btn-confirm');
    if (btnConfirm) {
        btnConfirm.classList.add('btn-confirm-ativo');
        btnConfirm.title = 'Produto confirmado (clique para remover)';
    }
    
    console.log(`✅ Produto adicionado aos confirmados: ${rowId}`);
}

/**
 * Remove um produto da lista de confirmados
 */
function removerProdutoConfirmado(rowId) {
    FormCollector.produtosConfirmados.delete(rowId);
    
    // Atualizar visual
    const row = document.getElementById(rowId);
    if (row) {
        row.dataset.confirmado = 'false';
        row.classList.remove('produto-confirmado');
    }
    
    console.log(`🗑️ Produto removido dos confirmados: ${rowId}`);
}

/**
 * Mostra o container de produtos confirmados
 */
function mostrarContainerProdutos() {
    const container = document.getElementById('produtos-confirmados-container');
    if (container) {
        renderizarProdutosConfirmados();
        container.classList.remove('hidden-field');
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log('📋 Container de produtos confirmados exibido');
    }
}

/**
 * Fecha o container de produtos confirmados
 */
function fecharContainerProdutos() {
    const container = document.getElementById('produtos-confirmados-container');
    if (container) {
        container.classList.add('hidden-field');
        console.log('🚪 Container de produtos confirmados fechado');
    }
}

/**
 * Coleta os dados de um produto da linha da tabela
 */
function coletarDadosProdutoParaPreview(row, rowNumber) {
    const getValue = (name) => {
        const el = row.querySelector(`[name="${name}"]`);
        if (!el) return null;
        return el.value || null;
    };
    
    const getMultiValue = (name) => {
        const el = row.querySelector(`[name="${name}"]`);
        if (!el) return [];
        return Array.from(el.selectedOptions || []).map(opt => opt.value);
    };
    
    const getSelectText = (name) => {
        const el = row.querySelector(`[name="${name}"]`);
        if (!el || !el.selectedOptions || !el.selectedOptions[0]) return null;
        const opt = el.selectedOptions[0];
        return opt.value ? opt.text : null;
    };
    
    return {
        carga: getValue(`produto-carga-${rowNumber}`),
        movimentacao: getValue(`produto-movimentacao-${rowNumber}`),
        origemPais: getValue(`produto-origem-pais-${rowNumber}`),
        origemPaisTexto: getSelectText(`produto-origem-pais-${rowNumber}`),
        origemEstado: getValue(`produto-origem-estado-${rowNumber}`),
        origemMunicipio: getValue(`produto-origem-municipio-${rowNumber}`),
        origemMunicipioTexto: getSelectText(`produto-origem-municipio-${rowNumber}`),
        destinoPais: getValue(`produto-destino-pais-${rowNumber}`),
        destinoPaisTexto: getSelectText(`produto-destino-pais-${rowNumber}`),
        destinoEstado: getValue(`produto-destino-estado-${rowNumber}`),
        destinoMunicipio: getValue(`produto-destino-municipio-${rowNumber}`),
        destinoMunicipioTexto: getSelectText(`produto-destino-municipio-${rowNumber}`),
        distancia: getValue(`produto-distancia-${rowNumber}`),
        modalidade: getMultiValue(`produto-modalidade-${rowNumber}[]`),
        acondicionamento: getValue(`produto-acondicionamento-${rowNumber}`),
        acondicionamentoOutro: getValue(`produto-acondicionamento-outro-${rowNumber}`),
        observacoes: getValue(`produto-observacoes-${rowNumber}`)
    };
}

/**
 * Mapeia os dados do formulário para o schema da tabela produtos_transportados
 */
function mapearParaSchemaBanco(dados) {
    // Determinar acondicionamento final
    let acondicionamentoFinal = dados.acondicionamento;
    if (dados.acondicionamento === 'outro' && dados.acondicionamentoOutro) {
        acondicionamentoFinal = dados.acondicionamentoOutro;
    }
    
    // Formatar origem legível
    let origemLegivel = '';
    if (dados.origemMunicipioTexto) {
        origemLegivel = `${dados.origemMunicipioTexto}/${dados.origemEstado || ''}`;
    } else if (dados.origemEstado) {
        origemLegivel = `${dados.origemEstado} (${dados.origemPaisTexto || 'Brasil'})`;
    } else if (dados.origemPaisTexto) {
        origemLegivel = dados.origemPaisTexto;
    }
    
    // Formatar destino legível
    let destinoLegivel = '';
    if (dados.destinoMunicipioTexto) {
        destinoLegivel = `${dados.destinoMunicipioTexto}/${dados.destinoEstado || ''}`;
    } else if (dados.destinoEstado) {
        destinoLegivel = `${dados.destinoEstado} (${dados.destinoPaisTexto || 'Brasil'})`;
    } else if (dados.destinoPaisTexto) {
        destinoLegivel = dados.destinoPaisTexto;
    }
    
    return [
        { campo: 'carga', valor: dados.carga, descricao: 'Nome da carga transportada' },
        { campo: 'movimentacao', valor: dados.movimentacao ? `${dados.movimentacao} ton/ano` : null, descricao: 'Movimentação anual' },
        { campo: 'origem_pais', valor: dados.origemPais, descricao: `ID do país (${dados.origemPaisTexto || 'N/A'})` },
        { campo: 'origem_estado', valor: dados.origemEstado, descricao: 'UF de origem' },
        { campo: 'origem_municipio', valor: dados.origemMunicipio, descricao: `Código IBGE (${dados.origemMunicipioTexto || 'N/A'})` },
        { campo: 'origem', valor: origemLegivel, descricao: 'Origem formatada' },
        { campo: 'destino_pais', valor: dados.destinoPais, descricao: `ID do país (${dados.destinoPaisTexto || 'N/A'})` },
        { campo: 'destino_estado', valor: dados.destinoEstado, descricao: 'UF de destino' },
        { campo: 'destino_municipio', valor: dados.destinoMunicipio, descricao: `Código IBGE (${dados.destinoMunicipioTexto || 'N/A'})` },
        { campo: 'destino', valor: destinoLegivel, descricao: 'Destino formatado' },
        { campo: 'distancia', valor: dados.distancia ? `${dados.distancia} km` : null, descricao: 'Distância percorrida' },
        { campo: 'modalidade', valor: dados.modalidade.length > 0 ? dados.modalidade.join(', ') : null, descricao: 'Modal(is) de transporte', isArray: true },
        { campo: 'acondicionamento', valor: acondicionamentoFinal, descricao: 'Tipo de acondicionamento' },
        { campo: 'observacoes', valor: dados.observacoes, descricao: 'Observações adicionais' }
    ];
}

/**
 * Renderiza todos os produtos confirmados no container
 */
function renderizarProdutosConfirmados() {
    const container = document.getElementById('produtos-confirmados-list');
    if (!container) return;
    
    if (FormCollector.produtosConfirmados.size === 0) {
        container.innerHTML = '<p class="produtos-confirmados-empty">Nenhum produto confirmado ainda.</p>';
        return;
    }
    
    const produtosHtml = Array.from(FormCollector.produtosConfirmados.values()).map((produto, index) => {
        const dadosBanco = produto.dadosBanco;
        
        const tabelaHtml = dadosBanco.map(item => {
            let valorFormatado;
            
            if (item.valor === null || item.valor === undefined || item.valor === '') {
                valorFormatado = '<span class="produto-confirmado-valor-vazio">(não informado)</span>';
            } else if (item.isArray) {
                valorFormatado = `<span class="produto-confirmado-valor-array">${item.valor}</span>`;
            } else {
                valorFormatado = `<strong>${item.valor}</strong>`;
            }
            
            return `
                <tr>
                    <td title="${item.descricao}">${item.campo}</td>
                    <td>${valorFormatado}</td>
                </tr>
            `;
        }).join('');
        
        return `
            <div class="produto-confirmado-item">
                <div class="produto-confirmado-header">
                    Produto ${index + 1}: ${produto.dadosProduto.carga || 'Sem nome'}
                </div>
                <div class="produto-confirmado-body">
                    <table class="produto-confirmado-table">
                        <thead>
                            <tr>
                                <th>Campo no Banco</th>
                                <th>Valor a Inserir</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tabelaHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = produtosHtml;
    console.log(`📋 Renderizados ${FormCollector.produtosConfirmados.size} produtos confirmados`);
}

/**
 * Remove uma linha da tabela de produtos
 */
function removeProdutoRow(rowId) {
    // Remover dos produtos confirmados se estiver lá
    removerProdutoConfirmado(rowId);
    
    // Remover a linha da tabela
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
    }
    
    console.log(`🗑️ Linha de produto removida: ${rowId}`);
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
window.confirmarProduto = confirmarProduto;
window.removeProdutoRow = removeProdutoRow;
window.handleProdutoAcondicionamentoChange = handleProdutoAcondicionamentoChange;

// Exportar para uso global
window.FormCollector = FormCollector;
// Compatibilidade com código antigo
window.FORM = FormCollector;

// Inicializar automaticamente
FormCollector.init();

/**
 * Ajusta a altura do select multiple (Modalidade) para ficar com a mesma altura
 * que a soma dos 3 selects empilhados da coluna Origem.
 *
 * @param {number} rowId - ID numérico da linha (ex: 1)
 */
function setModalidadeHeight(rowId) {
    try {
        const origemContainer = document.querySelector(`#produto-row-${rowId} .produto-origem-container`);
        const modalidadeSelect = document.querySelector(`#produto-row-${rowId} select[name^=\"produto-modalidade-${rowId}\"]`);
        if (!origemContainer || !modalidadeSelect) return;

        const origemRect = origemContainer.getBoundingClientRect();
        // Aplicar a altura total (removendo gap) — define o height em pixels
        modalidadeSelect.style.height = `${Math.max(origemRect.height, 48)}px`;
    } catch (err) {
        console.error('Erro em setModalidadeHeight()', err);
    }
}

// Recalcular altura ao redimensionar a janela (responsive)
window.addEventListener('resize', () => {
    document.querySelectorAll('#produtos-tbody tr').forEach(row => {
        const idParts = (row.id || '').split('-');
        const rowNum = idParts[idParts.length - 1];
        if (rowNum) setModalidadeHeight(rowNum);
    });
});

// Inicializar FormCollector automaticamente ao carregar a página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FormCollector.init());
} else {
    FormCollector.init();
}
