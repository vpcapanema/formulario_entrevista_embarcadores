/**
 * ============================================================
 * DROPDOWN-MANAGER - Gestão Centralizada de Listas Cascateadas
 * ============================================================
 * 
 * CAMPOS DO BANCO MANIPULADOS (PostgreSQL):
 * 
 * TABELA: empresas
 * - municipio (VARCHAR NOT NULL)
 * - estado (VARCHAR NULL)
 * - id_municipio (INTEGER NULL FK)
 * 
 * TABELA: pesquisas
 * - origem_pais (VARCHAR NOT NULL)
 * - origem_estado (VARCHAR NOT NULL)
 * - origem_municipio (VARCHAR NOT NULL)
 * - destino_pais (VARCHAR NOT NULL)
 * - destino_estado (VARCHAR NOT NULL)
 * - destino_municipio (VARCHAR NOT NULL)
 * 
 * TABELA: produtos_transportados
 * - origem_pais (VARCHAR)
 * - origem_estado (VARCHAR)
 * - origem_municipio (VARCHAR)
 * - destino_pais (VARCHAR)
 * - destino_estado (VARCHAR)
 * - destino_municipio (VARCHAR)
 */

const DropdownManager = {
    // Cache de listas carregadas
    _cache: {
        paises: null,
        estados: null,
        funcoes: null,
        entrevistadores: null
    },

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================

    /**
     * Carrega listas iniciais (países, estados, funções, entrevistadores)
     */
    async loadInitialData() {
        try {
            console.log('🔄 DropdownManager: Carregando listas iniciais...');
            
            // Carregar em paralelo usando CoreAPI
            const [paises, estados, funcoes, entrevistadores] = await Promise.all([
                CoreAPI.getPaises(),
                CoreAPI.getEstados(),
                CoreAPI.getFuncoes(),
                CoreAPI.getEntrevistadores()
            ]);

            // Salvar no cache
            this._cache.paises = paises;
            this._cache.estados = estados;
            this._cache.funcoes = funcoes;
            this._cache.entrevistadores = entrevistadores;

            console.log('✅ DropdownManager: Listas carregadas:', {
                paises: paises.length,
                estados: estados.length,
                funcoes: funcoes.length,
                entrevistadores: entrevistadores.length
            });

            return true;
        } catch (error) {
            console.error('❌ DropdownManager: Erro ao carregar listas:', error);
            throw error;
        }
    },

    // ============================================================
    // POPULAR DROPDOWNS GENÉRICOS
    // ============================================================

    /**
     * Popula qualquer dropdown com lista de itens
     * @param {string} selectId - ID do elemento select
     * @param {Array} items - Array de objetos
     * @param {string} valueKey - Chave para value do option
     * @param {string} labelKey - Chave para texto do option
     * @param {*} defaultValue - Valor pré-selecionado (opcional)
     */
    populate(selectId, items, valueKey, labelKey, defaultValue = null) {
        const select = document.getElementById(selectId);
        if (!select) {
            console.error(`❌ Select "${selectId}" não encontrado`);
            return false;
        }

        // Limpar opções existentes (mantém apenas a primeira - placeholder)
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Adicionar novas opções
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = item[labelKey];
            
            // Pré-selecionar se for valor default
            if (defaultValue && item[valueKey] == defaultValue) {
                option.selected = true;
            }
            
            select.appendChild(option);
        });

        console.log(`✅ ${items.length} opções carregadas em "${selectId}"`);
        return true;
    },

    /**
     * Limpa um dropdown (remove todas as opções exceto placeholder)
     */
    clearDropdown(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return false;

        select.innerHTML = '<option value="">Selecione...</option>';
        select.value = '';
        return true;
    },

    /**
     * Habilita um dropdown
     */
    enableDropdown(selectId, placeholder = null) {
        const select = document.getElementById(selectId);
        if (!select) return false;

        select.disabled = false;
        if (placeholder) {
            select.options[0].textContent = placeholder;
        }
        return true;
    },

    /**
     * Desabilita um dropdown com mensagem
     */
    disableDropdown(selectId, message = 'Indisponível') {
        const select = document.getElementById(selectId);
        if (!select) return false;

        select.disabled = true;
        select.innerHTML = `<option value="">${message}</option>`;
        select.value = '';
        return true;
    },

    // ============================================================
    // CASCATA BRASIL → ESTADOS → MUNICÍPIOS
    // ============================================================

    /**
     * Configura cascata Brasil (id_pais=68) → Estados → Municípios
     * @param {string} paisSelectId - ID do select de país
     * @param {string} estadoSelectId - ID do select de estado
     * @param {string} municipioSelectId - ID do select de município (opcional)
     */
    setupBrasilCascade(paisSelectId, estadoSelectId, municipioSelectId = null) {
        const paisSelect = document.getElementById(paisSelectId);
        const estadoSelect = document.getElementById(estadoSelectId);
        const municipioSelect = municipioSelectId ? document.getElementById(municipioSelectId) : null;

        if (!paisSelect || !estadoSelect) {
            console.error('❌ Selects de país/estado não encontrados');
            return false;
        }

        // Listener: Mudança de País
        paisSelect.addEventListener('change', async (e) => {
            const idPais = parseInt(e.target.value);

            // Brasil = id_pais 68 (conforme JSON: paises.json)
            if (idPais === 68) {
                // Mostrar dropdown de estado (Brasil)
                estadoSelect.style.display = 'block';
                
                // Habilitar estado (obrigatório)
                this.enableDropdown(estadoSelectId, 'Selecione o estado...');
                estadoSelect.setAttribute('required', 'required');
                
                // Popular estados
                if (this._cache.estados) {
                    this.populate(estadoSelectId, this._cache.estados, 'uf', 'nome_estado');
                } else {
                    const estados = await CoreAPI.getEstados();
                    this._cache.estados = estados;
                    this.populate(estadoSelectId, estados, 'uf', 'nome_estado');
                }

                // Município fica desabilitado até selecionar estado (mas escondido)
                if (municipioSelect) {
                    // manter visível, mas desabilitado até selecionar estado
                    municipioSelect.style.display = 'block';
                    this.disableDropdown(municipioSelectId, 'Primeiro selecione o estado');
                }
            } else if (idPais) {
                // Outro país: manter visíveis, mas desabilitados (UX: sempre mostrar os 3 selects)
                estadoSelect.style.display = 'block';
                this.disableDropdown(estadoSelectId, 'País não é Brasil');
                estadoSelect.removeAttribute('required');
                
                if (municipioSelect) {
                    municipioSelect.style.display = 'block';
                    this.disableDropdown(municipioSelectId, 'País não é Brasil');
                }
            } else {
                // Nenhum país selecionado: mostrar selects, mas desabilitar (melhor UX: sempre visível)
                estadoSelect.style.display = 'block';
                this.disableDropdown(estadoSelectId, 'Primeiro selecione o país');
                estadoSelect.removeAttribute('required');
                
                if (municipioSelect) {
                    municipioSelect.style.display = 'block';
                    this.disableDropdown(municipioSelectId, 'Primeiro selecione o país');
                }
            }
        });

        // Listener: Mudança de Estado → Carregar Municípios
        if (municipioSelect) {
            estadoSelect.addEventListener('change', async (e) => {
                const uf = e.target.value;

                if (!uf) {
                    // Mostrar município, mas desativado até selecionar estado
                    municipioSelect.style.display = 'block';
                    this.disableDropdown(municipioSelectId, 'Primeiro selecione o estado');
                    return;
                }

                console.log(`🔍 Carregando municípios de ${uf}...`);

                try {
                    // Mostrar dropdown de município e habilitar
                    municipioSelect.style.display = 'block';
                    
                    // Habilitar dropdown
                    this.enableDropdown(municipioSelectId, 'Carregando...');
                    
                    // Carregar municípios da UF
                    const municipios = await CoreAPI.getMunicipiosByUF(uf);
                    
                    // Popular dropdown (colunas: cd_mun, nm_mun conforme JSON)
                    this.populate(municipioSelectId, municipios, 'cd_mun', 'nm_mun');
                    
                    console.log(`✅ ${municipios.length} municípios de ${uf} carregados`);
                } catch (error) {
                    console.error('❌ Erro ao carregar municípios:', error);
                    // Mostrar município, mas desabilitado em caso de erro
                    municipioSelect.style.display = 'block';
                    this.disableDropdown(municipioSelectId, 'Erro ao carregar municípios');
                }
            });
        }

        console.log(`✅ Cascata Brasil configurada: ${paisSelectId} → ${estadoSelectId}${municipioSelect ? ' → ' + municipioSelectId : ''}`);
        return true;
    },

    // ============================================================
    // APLICAÇÃO EM SEÇÕES ESPECÍFICAS DO FORMULÁRIO
    // ============================================================

    /**
     * Aplica dropdowns e cascatas em Q12 (Origem) e Q13 (Destino)
     */
    async applyToOrigemDestino() {
        console.log('🔄 Aplicando dropdowns em Q12 (Origem) e Q13 (Destino)...');

        // Popular países (Brasil pré-selecionado = id_pais 68)
        if (this._cache.paises) {
            this.populate('origem-pais', this._cache.paises, 'id_pais', 'nome_pais', 68);
            this.populate('destino-pais', this._cache.paises, 'id_pais', 'nome_pais', 68);
        }

        // Configurar cascatas Brasil → Estados → Municípios
        this.setupBrasilCascade('origem-pais', 'origem-estado', 'origem-municipio');
        this.setupBrasilCascade('destino-pais', 'destino-estado', 'destino-municipio');

        // Disparar evento change para carregar estados do Brasil (pré-selecionado)
        document.getElementById('origem-pais')?.dispatchEvent(new Event('change'));
        document.getElementById('destino-pais')?.dispatchEvent(new Event('change'));

        console.log('✅ Q12 e Q13 configurados');
    },

    /**
     * Aplica dropdowns em Q7 (Município da Empresa)
     */
    async applyToEmpresa() {
        console.log('🔄 Aplicando dropdown em Q7 (Município da Empresa)...');
        
        // Q7 tem apenas município direto (sem cascata país → estado)
        // Será populado dinamicamente quando houver auto-fill do CNPJ
        
        console.log('✅ Q7 configurado (populado sob demanda)');
    },

    /**
     * Aplica dropdowns em linha de produto da tabela Q8
     * @param {number} rowId - ID da linha (produto-row-N)
     */
    async applyToProductRow(rowId) {
        console.log(`🔄 Aplicando dropdowns em produto row ${rowId}...`);

        // IDs dos selects da linha
        const origemPaisId = `produto-origem-pais-select-${rowId}`;
        const origemEstadoId = `produto-origem-estado-select-${rowId}`;
        const origemMunicipioId = `produto-origem-municipio-select-${rowId}`;
        const destinoPaisId = `produto-destino-pais-select-${rowId}`;
        const destinoEstadoId = `produto-destino-estado-select-${rowId}`;
        const destinoMunicipioId = `produto-destino-municipio-select-${rowId}`;

        // Popular países (Brasil pré-selecionado)
        if (this._cache.paises) {
            this.populate(origemPaisId, this._cache.paises, 'id_pais', 'nome_pais', 68);
            this.populate(destinoPaisId, this._cache.paises, 'id_pais', 'nome_pais', 68);
        }

        // Configurar cascatas
        this.setupBrasilCascade(origemPaisId, origemEstadoId, origemMunicipioId);
        this.setupBrasilCascade(destinoPaisId, destinoEstadoId, destinoMunicipioId);

        // Disparar evento change (Brasil pré-selecionado)
        document.getElementById(origemPaisId)?.dispatchEvent(new Event('change'));
        document.getElementById(destinoPaisId)?.dispatchEvent(new Event('change'));

        console.log(`✅ Produto row ${rowId} configurado`);
    },

    /**
     * Aplica dropdown de funções (Q2 - Função do Entrevistado)
     */
    async applyToFuncao() {
        console.log('🔄 Aplicando dropdown de funções em Q2...');

        if (this._cache.funcoes) {
            // Colunas: id_funcao, nome_funcao (conforme funcoes.json)
            this.populate('funcao', this._cache.funcoes, 'id_funcao', 'nome_funcao');
        }

        console.log('✅ Q2 (Função) configurado');
    },

    /**
     * Aplica dropdown de entrevistadores (Q0 - Responsável)
     */
    async applyToEntrevistador() {
        console.log('🔄 Aplicando dropdown de entrevistadores em Q0...');

        if (this._cache.entrevistadores) {
            // Colunas: id_entrevistador, nome_completo (conforme entrevistadores.json)
            this.populate('id-entrevistador', this._cache.entrevistadores, 'id_entrevistador', 'nome_completo');
        }

        console.log('✅ Q0 (Entrevistador) configurado');
    }
};

// Exportar para uso global
window.DropdownManager = DropdownManager;

console.log('✅ DropdownManager carregado');
