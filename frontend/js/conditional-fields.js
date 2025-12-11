/**
 * ============================================================
 * CONDITIONAL-FIELDS - Gerenciamento de Campos Condicionais
 * ============================================================
 * Controla visibilidade de campos baseado em seleções do usuário
 * 
 * REGRAS IMPLEMENTADAS:
 * 1. Q17 (modo rodoviário) → Q18 (config-veiculo)
 * 2. Q16 (tem-paradas = "sim") → Q16a (num-paradas)
 * 3. Q2 (funcao = "Outro") → campo de texto para especificar
 * 4. Q6 (tipo-empresa = "outro") → campo de texto para especificar
 * 5. Q11 (agrupamento-produto = "outro-produto") → campo de texto
 * 6. Q23 (frequencia = "diaria") → campo para nº viagens/dia
 * 7. Q23 (frequencia = "outra") → campo para especificar
 */

const ConditionalFields = {
    /**
     * Inicializa todos os campos condicionais
     */
    init() {
        console.log('🔧 ConditionalFields: Inicializando campos condicionais...');
        
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
        // Q17 → Q18: Modo rodoviário mostra configuração de veículo
        this._setupModoRodoviario();
        
        // Q16 → Q16a: Tem paradas? → Número de paradas
        this._setupParadas();
        
        // Q2: Função "Outro" → Campo de texto
        this._setupFuncaoOutro();
        
        // Q6: Tipo empresa "Outro" → Campo de texto
        this._setupTipoEmpresaOutro();
        
        // Q11: Agrupamento produto "Outro" → Campo de texto
        this._setupAgrupamentoProdutoOutro();
        
        // Q23: Frequência diária/outra → Campos específicos
        this._setupFrequencia();
        
        console.log('✅ Campos condicionais configurados');
    },

    /**
     * Q17: Modo Rodoviário → Configuração de Veículo
     */
    _setupModoRodoviario() {
        const checkboxes = document.querySelectorAll('input[name="modo"]');
        const container = document.getElementById('config-veiculo-container');
        const select = document.getElementById('config-veiculo');
        
        if (!checkboxes.length || !container) {
            console.warn('⚠️ Elementos de modo/config-veiculo não encontrados');
            return;
        }

        const updateVisibility = () => {
            const rodoviarioChecked = document.querySelector('input[name="modo"][value="rodoviario"]')?.checked;
            
            if (rodoviarioChecked) {
                container.classList.remove('hidden-field');
                console.log('✅ Config veículo mostrado (rodoviário selecionado)');
            } else {
                container.classList.add('hidden-field');
                if (select) select.value = ''; // Limpar valor
                console.log('🔒 Config veículo escondido (rodoviário desmarcado)');
            }
        };

        // Adicionar listener em todos os checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateVisibility);
        });

        // Executar na inicialização
        updateVisibility();
    },

    /**
     * Q16: Tem Paradas → Número de Paradas
     */
    _setupParadas() {
        const select = document.getElementById('tem-paradas');
        const container = document.getElementById('num-paradas-container');
        const numParadasSelect = document.getElementById('num-paradas');
        const numParadasExatoContainer = document.getElementById('num-paradas-exato-container');
        
        if (!select || !container) return;

        const updateVisibility = () => {
            if (select.value === 'sim') {
                container?.classList.remove('hidden-field');
            } else {
                container?.classList.add('hidden-field');
                if (numParadasSelect) numParadasSelect.value = '';
                numParadasExatoContainer?.classList.add('hidden-field');
            }
        };

        select.addEventListener('change', updateVisibility);
        updateVisibility();

        // Sub-condicional: Se num-paradas = "6-ou-mais" → campo de número exato
        if (numParadasSelect && numParadasExatoContainer) {
            const updateNumParadasExato = () => {
                if (numParadasSelect.value === '6-ou-mais') {
                    numParadasExatoContainer.classList.remove('hidden-field');
                } else {
                    numParadasExatoContainer.classList.add('hidden-field');
                    const input = document.getElementById('num-paradas-exato');
                    if (input) input.value = '';
                }
            };

            numParadasSelect.addEventListener('change', updateNumParadasExato);
            updateNumParadasExato();
        }
    },

    /**
     * Q2: Função "Outro" → Campo de texto
     */
    _setupFuncaoOutro() {
        const select = document.getElementById('funcao');
        const container = document.getElementById('outra-funcao-container');
        
        if (!select || !container) return;

        const updateVisibility = () => {
            const selectedOption = select.selectedOptions[0];
            const text = selectedOption?.text || '';
            
            if (text.includes('Outro')) {
                container.classList.remove('hidden-field');
            } else {
                container.classList.add('hidden-field');
                const input = document.getElementById('outra-funcao');
                if (input) input.value = '';
            }
        };

        select.addEventListener('change', updateVisibility);
        // Aguardar dropdowns carregarem
        setTimeout(updateVisibility, 500);
    },

    /**
     * Q6: Tipo Empresa "Outro" → Campo de texto
     */
    _setupTipoEmpresaOutro() {
        const select = document.getElementById('tipo-empresa');
        const container = document.getElementById('outro-tipo-container');
        
        if (!select || !container) return;

        const updateVisibility = () => {
            if (select.value === 'outro') {
                container.classList.remove('hidden-field');
            } else {
                container.classList.add('hidden-field');
                const input = document.getElementById('outro-tipo');
                if (input) input.value = '';
            }
        };

        select.addEventListener('change', updateVisibility);
        updateVisibility();
    },

    /**
     * Q11: Agrupamento Produto "Outro" → Campo de texto
     */
    _setupAgrupamentoProdutoOutro() {
        const select = document.getElementById('agrupamento-produto');
        const container = document.getElementById('outro-produto-container');
        
        if (!select || !container) return;

        const updateVisibility = () => {
            if (select.value === 'outro-produto') {
                container.classList.remove('hidden-field');
            } else {
                container.classList.add('hidden-field');
                const input = document.getElementById('outro-produto');
                if (input) input.value = '';
            }
        };

        select.addEventListener('change', updateVisibility);
        updateVisibility();
    },

    /**
     * Q23: Frequência (diária/outra) → Campos específicos
     */
    _setupFrequencia() {
        const select = document.getElementById('frequencia');
        const diariaContainer = document.getElementById('frequencia-diaria-container');
        const outraContainer = document.getElementById('frequencia-outra-container');
        
        if (!select || !diariaContainer || !outraContainer) return;

        const updateVisibility = () => {
            const value = select.value;
            
            // Frequência diária
            if (value === 'diaria') {
                diariaContainer.classList.remove('hidden-field');
            } else {
                diariaContainer.classList.add('hidden-field');
                const input = document.getElementById('frequencia-diaria');
                if (input) input.value = '';
            }
            
            // Frequência outra
            if (value === 'outra') {
                outraContainer.classList.remove('hidden-field');
            } else {
                outraContainer.classList.add('hidden-field');
                const input = document.getElementById('frequencia-outra');
                if (input) input.value = '';
            }
        };

        select.addEventListener('change', updateVisibility);
        updateVisibility();
    }
};

// Auto-inicializar quando o script carregar
ConditionalFields.init();

// Expor globalmente para debug
window.ConditionalFields = ConditionalFields;

console.log('✅ ConditionalFields carregado');
