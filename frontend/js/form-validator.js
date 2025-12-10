/**
 * ============================================================================
 * FORM-VALIDATOR - Motor de Validação Visual INSTANTÂNEA
 * ============================================================================
 * 
 * CAMPOS VALIDADOS (66 campos mapeados para colunas PostgreSQL):
 * 
 * CAMPOS OBRIGATÓRIOS (NOT NULL):
 * - empresas: nome_empresa, tipo_empresa, municipio
 * - entrevistados: nome, funcao, telefone, email
 * - pesquisas: 47 campos NOT NULL (produto_principal, origem_pais, etc)
 * 
 * CAMPOS OPCIONAIS (NULL):
 * - empresas: outro_tipo, cnpj, razao_social, logradouro, etc
 * - pesquisas: outro_produto, config_veiculo, num_paradas, etc
 * 
 * VALIDAÇÕES DE FORMATO (constraints PostgreSQL):
 * - cnpj: VARCHAR(18) formato XX.XXX.XXX/XXXX-XX
 * - email: VARCHAR(100) formato RFC 5322
 * - telefone: VARCHAR(15) formato (XX) XXXXX-XXXX
 * - distancia: NUMERIC(10,2) min=0
 * - peso_carga: NUMERIC(12,3) min=0
 * - custo_transporte: NUMERIC(15,2) min=0
 * - valor_carga: NUMERIC(15,2) min=0
 * - capacidade_utilizada: NUMERIC(5,2) min=0 max=100
 * - tempo_dias: INTEGER min=0
 * - tempo_horas: INTEGER min=0 max=23
 * - tempo_minutos: INTEGER min=0 max=59
 * - variacao_*: NUMERIC(5,2) min=0 (sem limite máximo)
 * 
 * ARRAYS (checkboxes):
 * - modos[] → modos de transporte (obrigatório, min: 1)
 * - dificuldades[] → dificuldades (opcional)
 * - modais_alternativos[] → modais alternativos (opcional)
 * 
 * Responsável por:
 * 1. Validação INSTANTÂNEA (onChange/onInput após 3 chars) - APENAS FORMATO
 * 2. Validação onSubmit (ao salvar) - FORMATO + OBRIGATÓRIO
 * 3. Gerenciar classes CSS (required-empty, invalid-format, valid-input)
 * 4. Exibir mensagens de validação
 * 5. Scroll automático para primeiro erro
 * 
 * LÓGICA DE DISPARO:
 * - SELECTs: onChange imediato
 * - INPUTs/TEXTAREAs: onInput após 3 caracteres
 * - RADIO/CHECKBOXes: onChange imediato
 * - SUBMIT: Validação completa (formato + obrigatório)
 */

const FormValidator = {
    
    // ⭐ Flag para desabilitar validação durante restauração de rascunho
    _validationDisabled: false,
    
    // Mapeamento de campos para validadores (TODOS os 70 campos do formulário)
    fieldValidators: {
        // ========================================
        // BLOCO 1: DADOS DO ENTREVISTADO (12 campos)
        // ========================================
        'id-entrevistador': { validator: 'select', required: true },
        'nome': { validator: 'varchar', required: true, maxLength: 100 },
        'funcao': { validator: 'select', required: true },
        'outra-funcao': { validator: 'varchar', required: false, maxLength: 100 },
        'telefone': { validator: 'telefone', required: false },
        'email': { validator: 'email', required: false },
        'estado-civil': { validator: 'select', required: false },
        'nacionalidade': { validator: 'select', required: false },
        'uf-naturalidade': { validator: 'select', required: false },
        'municipio-naturalidade': { validator: 'select', required: false },
        
        // ========================================
        // BLOCO 2: DADOS DA EMPRESA (5 campos)
        // ========================================
        'tipo-empresa': { validator: 'select', required: true },
        'outro-tipo': { validator: 'varchar', required: false, maxLength: 100 },
        'cnpj-empresa': { validator: 'cnpj', required: false },
        'razao-social': { validator: 'varchar', required: true, maxLength: 200 },
        'municipio-empresa': { validator: 'varchar', required: true, maxLength: 100 },
        
        // ========================================
        // BLOCO 3: PRODUTO PRINCIPAL (3 campos)
        // ========================================
        'produto-principal': { validator: 'varchar', required: true, maxLength: 200 },
        'agrupamento-produto': { validator: 'select', required: true },
        'outro-produto': { validator: 'varchar', required: false, maxLength: 100 },
        
        // ========================================
        // BLOCO 4: ORIGEM E DESTINO (7 campos)
        // ========================================
        'tipo-transporte': { validator: 'select', required: true },
        'origem-pais': { validator: 'select', required: true },
        'origem-estado': { validator: 'select', required: false }, // Condicional (se Brasil)
        'origem-municipio': { validator: 'select', required: false }, // Condicional (se Brasil)
        'destino-pais': { validator: 'select', required: true },
        'destino-estado': { validator: 'select', required: false }, // Condicional (se Brasil)
        'destino-municipio': { validator: 'select', required: false }, // Condicional (se Brasil)
        
        // ========================================
        // BLOCO 5: DETALHES DO TRANSPORTE (9 campos)
        // ========================================
        'distancia': { validator: 'integer', required: true, min: 0 },
        'tem-paradas': { validator: 'select', required: true },
        'num-paradas': { validator: 'select', required: false }, // Condicional (se tem-paradas = sim)
        'num-paradas-exato': { validator: 'integer', required: false, min: 11 }, // Condicional (se num-paradas = mais-10)
        // 'modo' - checkboxes validados separadamente
        'config-veiculo': { validator: 'select', required: false }, // Condicional (se modo = rodoviario)
        'capacidade-utilizada': { validator: 'integer', required: true, min: 0, max: 100 },
        'peso-carga': { validator: 'numeric', required: true, min: 0 },
        'unidade-peso': { validator: 'select', required: true },
        
        // ========================================
        // BLOCO 6: CUSTOS E VALORES (4 campos)
        // ========================================
        'custo-transporte': { validator: 'numeric', required: true, min: 0 },
        'valor-carga': { validator: 'numeric', required: true, min: 0 },
        'tipo-embalagem': { validator: 'select', required: true },
        'carga-perigosa': { validator: 'select', required: true },
        
        // ========================================
        // BLOCO 7: TEMPO E FREQUÊNCIA (6 campos)
        // ========================================
        'tempo-dias': { validator: 'integer', required: true, min: 0 },
        'tempo-horas': { validator: 'integer', required: true, min: 0, max: 23 },
        'tempo-minutos': { validator: 'integer', required: true, min: 0, max: 59 },
        'frequencia': { validator: 'select', required: true },
        'frequencia-diaria': { validator: 'integer', required: false, min: 1 }, // Condicional (se frequencia = diaria)
        'frequencia-outra': { validator: 'varchar', required: false, maxLength: 100 }, // Condicional (se frequencia = outra)
        
        // ========================================
        // BLOCO 8: IMPORTÂNCIA DOS FATORES (10 campos)
        // ========================================
        'importancia-custo': { validator: 'select', required: true },
        'variacao-custo': { validator: 'numeric', required: true, min: 0},
        'importancia-tempo': { validator: 'select', required: true },
        'variacao-tempo': { validator: 'numeric', required: true, min: 0 },
        'importancia-confiabilidade': { validator: 'select', required: true },
        'variacao-confiabilidade': { validator: 'numeric', required: true, min: 0 },
        'importancia-seguranca': { validator: 'select', required: true },
        'variacao-seguranca': { validator: 'numeric', required: true, min: 0},
        'importancia-capacidade': { validator: 'select', required: true },
        'variacao-capacidade': { validator: 'numeric', required: true, min: 0 },
        
        // ========================================
        // BLOCO 9: CADEIA LOGÍSTICA (3 campos)
        // ========================================
        'tipo-cadeia': { validator: 'select', required: true },
        // 'modal-alternativo' - checkboxes validados separadamente
        'fator-adicional': { validator: 'varchar', required: false, maxLength: 500 },
        
        // ========================================
        // BLOCO 10: DIFICULDADES (2 campos)
        // ========================================
        // 'dificuldade' - checkboxes validados separadamente
        'detalhe-dificuldade': { validator: 'varchar', required: false, maxLength: 1000 }
    },

    /**
     * Grupos de checkboxes (todos mostram validação visual)
     * Apenas 'modo' é obrigatório, mas todos mostram feedback verde quando marcados
     */
    checkboxGroups: {
        'modo': { 
            name: 'modo', 
            required: true, 
            label: 'Modos de Transporte',
            min: 1 
        },
        'modal-alternativo': {
            name: 'modal-alternativo',
            required: false,
            label: 'Modais Alternativos',
            min: 0  // Opcional, mas mostra validação visual
        },
        'dificuldade': {
            name: 'dificuldade',
            required: false,
            label: 'Dificuldades no Transporte',
            min: 0  // Opcional, mas mostra validação visual
        }
    },

    /**
     * Inicializa o motor de validação
     */
    init: function() {
        console.log('🔍 FormValidator: Inicializando...');
        console.log(`📋 Total de campos configurados: ${Object.keys(this.fieldValidators).length}`);
        
        // Debug: verificar quais campos não foram encontrados
        let notFound = [];
        for (const fieldId in this.fieldValidators) {
            const field = document.getElementById(fieldId);
            if (!field) {
                notFound.push(fieldId);
            }
        }
        if (notFound.length > 0) {
            console.warn(`⚠️ ${notFound.length} campos NÃO encontrados no HTML:`, notFound);
        } else {
            console.log('✅ Todos os campos foram encontrados no HTML!');
        }
        
        this.attachBlurListeners();
        this.attachSubmitListener();
        console.log('✅ FormValidator: Pronto!');
    },

    /**
     * Adiciona listeners de validação instantânea em TODOS os campos
     * VALIDAÇÃO AUTOMÁTICA: onChange (SELECTs) ou onInput após 3 chars (INPUTs)
     */
    attachBlurListeners: function() {
        let listenersAdded = 0;
        let listenersSkipped = [];
        
        for (const fieldId in this.fieldValidators) {
            const field = document.getElementById(fieldId);
            if (field) {
                // ============================================================
                // VALIDAÇÃO INSTANTÂNEA PARA TODOS OS TIPOS DE CAMPO
                // ============================================================
                
                // 1. SELECTs: Validação IMEDIATA ao selecionar opção
                if (field.tagName === 'SELECT') {
                    field.addEventListener('change', (e) => {
                        console.log(`⚡ Validação instantânea (onChange) do campo: ${fieldId}`);
                        this.validateFieldFormat(fieldId);
                    });
                }
                
                // 2. INPUTs (text, email, tel, number): Validação após 3 caracteres
                else if (field.tagName === 'INPUT' && (field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number')) {
                    field.addEventListener('input', (e) => {
                        const value = field.value.trim();
                        // Para type="number", validar imediatamente se tiver algum valor
                        const minLength = field.type === 'number' ? 1 : 3;
                        if (value.length >= minLength) {
                            console.log(`⚡ Validação instantânea (onInput ${minLength}+ chars) do campo: ${fieldId}`);
                            this.validateFieldFormat(fieldId);
                        } else if (value.length === 0) {
                            // Limpa validação quando campo é esvaziado
                            this.clearValidation(fieldId);
                        }
                    });
                }
                
                // 3. RADIO BUTTONS: Validação IMEDIATA ao marcar
                else if (field.tagName === 'INPUT' && field.type === 'radio') {
                    field.addEventListener('change', (e) => {
                        console.log(`⚡ Validação instantânea (onChange) do radio: ${field.name}`);
                        this.validateFieldFormat(fieldId);
                    });
                }
                
                // 4. TEXTAREAS: Validação após 3 caracteres
                else if (field.tagName === 'TEXTAREA') {
                    field.addEventListener('input', (e) => {
                        const value = field.value.trim();
                        if (value.length >= 3) {
                            console.log(`⚡ Validação instantânea (onInput 3+ chars) do textarea: ${fieldId}`);
                            this.validateFieldFormat(fieldId);
                        } else if (value.length === 0) {
                            this.clearValidation(fieldId);
                        }
                    });
                }
                
                listenersAdded++;
            } else {
                listenersSkipped.push(fieldId);
            }
        }
        
        console.log(`✅ ${listenersAdded} listeners de validação INSTANTÂNEA adicionados`);
        if (listenersSkipped.length > 0) {
            console.warn(`⚠️ ${listenersSkipped.length} campos sem listener:`, listenersSkipped);
        }

        // Validação INSTANTÂNEA para grupos de checkboxes: Imediatamente ao marcar/desmarcar
        for (const groupName in this.checkboxGroups) {
            const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    console.log(`⚡ Validação instantânea (onChange) do checkbox group: ${groupName}`);
                    this.validateCheckboxGroupFormat(groupName);
                });
            });
        }
    },

    /**
     * Adiciona listener onSubmit no formulário
     */
    attachSubmitListener: function() {
        const form = document.getElementById('formulario-pesquisa');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const isValid = this.validateAllFields();
                
                if (isValid) {
                    console.log('✅ Formulário válido! Prosseguindo com envio...');
                    // Aqui chama a função original de handleFormSubmit
                    if (typeof handleFormSubmit === 'function') {
                        handleFormSubmit(e);
                    }
                } else {
                    console.log('❌ Formulário com erros. Corrija os campos destacados.');
                    this.scrollToFirstError();
                }
            });
        }
    },

    /**
     * Valida APENAS FORMATO do campo (onChange/onInput)
     * NÃO verifica se campo obrigatório está vazio
     * Chamada por: onChange (SELECTs/RADIO) ou onInput após 3 chars (INPUTs/TEXTAREAs)
     */
    validateFieldFormat: function(fieldId) {
        // ⭐ Se validação está desabilitada, não fazer nada
        if (this._validationDisabled) {
            return true;
        }
        
        const field = document.getElementById(fieldId);
        if (!field) return true;

        const config = this.fieldValidators[fieldId];
        if (!config) return true;

        const value = field.value.trim();
        
        // Se campo está VAZIO, NÃO valida (ignora obrigatório no blur)
        if (!value) {
            this.clearValidation(fieldId);
            return true;
        }

        // Campo TEM VALOR: valida APENAS o FORMATO
        let result;

        switch (config.validator) {
            case 'cnpj':
                result = CoreValidators.cnpj(value);
                break;
            case 'email':
                result = CoreValidators.email(value, false); // false = NÃO verifica obrigatório
                break;
            case 'telefone':
                result = CoreValidators.telefone(value, false);
                break;
            case 'integer':
                result = CoreValidators.integer(value, false, config.min, config.max);
                break;
            case 'numeric':
                result = CoreValidators.numeric(value, false, config.min, config.max);
                break;
            case 'varchar':
                result = CoreValidators.varchar(value, false, config.maxLength);
                break;
            case 'date':
                result = CoreValidators.date(value, false);
                break;
            case 'select':
                result = CoreValidators.select(value, false);
                break;
            case 'url':
                result = CoreValidators.url(value, false);
                break;
            default:
                return true;
        }

        this.applyValidationResult(fieldId, result);
        return result.isValid;
    },

    /**
     * Valida campo COMPLETO (onSubmit)
     * Verifica obrigatório + formato
     */
    validateField: function(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) {
            console.warn(`Campo ${fieldId} não encontrado`);
            return true;
        }

        const config = this.fieldValidators[fieldId];
        if (!config) {
            console.warn(`Configuração de validação não encontrada para ${fieldId}`);
            return true;
        }

        const value = field.value;
        let result;

        // Chama o validador apropriado COM verificação de obrigatório
        switch (config.validator) {
            case 'cnpj':
                result = CoreValidators.cnpj(value);
                break;
            case 'email':
                result = CoreValidators.email(value, config.required); // true = verifica obrigatório
                break;
            case 'telefone':
                result = CoreValidators.telefone(value, config.required);
                break;
            case 'integer':
                result = CoreValidators.integer(value, config.required, config.min, config.max);
                break;
            case 'numeric':
                result = CoreValidators.numeric(value, config.required, config.min, config.max);
                break;
            case 'varchar':
                result = CoreValidators.varchar(value, config.required, config.maxLength);
                break;
            case 'date':
                result = CoreValidators.date(value, config.required);
                break;
            case 'select':
                result = CoreValidators.select(value, config.required);
                break;
            case 'url':
                result = CoreValidators.url(value, config.required);
                break;
            default:
                console.warn(`Validador ${config.validator} não implementado`);
                return true;
        }

        // Aplica o resultado da validação
        this.applyValidationResult(fieldId, result);

        return result.isValid;
    },

    /**
     * Valida APENAS FORMATO de grupo de checkboxes (onChange)
     */
    /**
     * Valida formato de grupo de checkboxes (onChange em tempo real)
     * Aplica validação visual instantânea ao marcar/desmarcar
     * SEMPRE mostra feedback verde quando houver itens marcados (obrigatório ou opcional)
     */
    validateCheckboxGroupFormat: function(groupName) {
        // ⭐ Se validação está desabilitada, não fazer nada
        if (this._validationDisabled) {
            return true;
        }
        
        const config = this.checkboxGroups[groupName];
        if (!config) {
            console.warn(`Grupo de checkbox ${groupName} não configurado`);
            return true;
        }

        const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
        const checked = Array.from(checkboxes).filter(cb => cb.checked);
        const container = document.querySelector(`input[name="${groupName}"]`)?.closest('.form-group, .checkbox-group');
        
        if (!container) return true;

        // Remove validação anterior
        this.removeCheckboxGroupValidation(groupName);

        // Se nenhum item está marcado
        if (checked.length === 0) {
            container.classList.remove('checkbox-group-error', 'checkbox-group-success');
            // Se é obrigatório e está vazio, não mostra nada (só vai mostrar erro no submit)
            // Se é opcional e está vazio, também não mostra nada
            return true;
        }

        // Se tem itens marcados mas é obrigatório e ainda não atingiu o mínimo
        if (config.required && checked.length < config.min) {
            container.classList.remove('checkbox-group-success');
            container.classList.add('checkbox-group-error');
            
            // Mensagem de feedback em tempo real
            const messageDiv = document.createElement('div');
            messageDiv.className = 'validation-message warning';
            messageDiv.id = `validation-msg-${groupName}`;
            messageDiv.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-alert-circle">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div class="validation-message-content">
                    <span class="validation-badge warning">Selecione mais opções</span>
                    <div class="validation-message-title">${checked.length}/${config.min} selecionado(s)</div>
                </div>
            `;
            container.appendChild(messageDiv);
            return false;
        }

        // Se tem pelo menos 1 item marcado (independente de ser obrigatório ou opcional)
        // SEMPRE mostra sucesso visual
        if (checked.length > 0) {
            container.classList.remove('checkbox-group-error');
            container.classList.add('checkbox-group-success');
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'validation-message success';
            messageDiv.id = `validation-msg-${groupName}`;
            messageDiv.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-check-circle">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div class="validation-message-content">
                    <span class="validation-badge success">✓ ${checked.length} selecionado(s)</span>
                </div>
            `;
            container.appendChild(messageDiv);
            return true;
        }

        return true;
    },

    /**
     * Valida grupo de checkboxes COMPLETO (onSubmit)
     * Verifica obrigatório (min seleções)
     */
    validateCheckboxGroup: function(groupName) {
        const field = document.getElementById(fieldId);
        if (!field) {
            console.warn(`Campo ${fieldId} não encontrado`);
            return true;
        }

        const config = this.fieldValidators[fieldId];
        if (!config) {
            console.warn(`Configuração de validação não encontrada para ${fieldId}`);
            return true;
        }

        const value = field.value;
        let result;

        // Chama o validador apropriado
        switch (config.validator) {
            case 'cnpj':
                result = FieldValidators.cnpj(value);
                break;
            case 'email':
                result = FieldValidators.email(value, config.required);
                break;
            case 'telefone':
                result = FieldValidators.telefone(value, config.required);
                break;
            case 'integer':
                result = FieldValidators.integer(value, config.required, config.min, config.max);
                break;
            case 'numeric':
                result = FieldValidators.numeric(value, config.required, config.min, config.max);
                break;
            case 'varchar':
                result = FieldValidators.varchar(value, config.required, config.maxLength);
                break;
            case 'date':
                result = FieldValidators.date(value, config.required);
                break;
            case 'select':
                result = FieldValidators.select(value, config.required);
                break;
            case 'url':
                result = FieldValidators.url(value, config.required);
                break;
            default:
                console.warn(`Validador ${config.validator} não implementado`);
                return true;
        }

        // Aplica o resultado da validação
        this.applyValidationResult(fieldId, result);

        return result.isValid;
    },

    /**
     * Limpa validação de um campo (remove classes e mensagens)
     */
    clearValidation: function(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Remove todas as classes de validação
        field.classList.remove('required-empty', 'invalid-format', 'valid-input');

        // Remove mensagem
        this.removeValidationMessage(fieldId);
    },

    /**
     * Aplica o resultado da validação (classes CSS + mensagem)
     */
    applyValidationResult: function(fieldId, result) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Remove todas as classes de validação anteriores
        field.classList.remove('required-empty', 'invalid-format', 'valid-input');

        // Remove mensagem anterior
        this.removeValidationMessage(fieldId);

        // Se o campo está vazio e não é obrigatório, não aplica estilo
        if (!result.isValid && result.type === 'success') {
            return;
        }

        // Aplica a classe apropriada
        if (result.type === 'error') {
            field.classList.add('required-empty');
        } else if (result.type === 'warning') {
            field.classList.add('invalid-format');
        } else if (result.type === 'success') {
            field.classList.add('valid-input');
        }

        // Exibe a mensagem
        if (result.badge) {
            this.showValidationMessage(fieldId, result);
        }
    },

    /**
     * Exibe mensagem de validação abaixo do campo
     */
    showValidationMessage: function(fieldId, result) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Cria o elemento de mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `validation-message ${result.type}`;
        messageDiv.id = `validation-msg-${fieldId}`;

        // Ícone SVG
        let iconSVG = '';
        if (result.type === 'error') {
            iconSVG = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-alert-triangle">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
            `;
        } else if (result.type === 'warning') {
            iconSVG = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-alert-circle">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            `;
        } else if (result.type === 'success') {
            iconSVG = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-check-circle">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            `;
        }

        // Monta o HTML da mensagem
        let messageHTML = iconSVG;
        
        if (result.type === 'success') {
            // Mensagem simplificada para sucesso (só badge)
            messageHTML += `
                <div class="validation-message-content">
                    <span class="validation-badge ${result.type}">${result.badge}</span>
                </div>
            `;
        } else {
            // Mensagem completa para erro/warning
            messageHTML += `
                <div class="validation-message-content">
                    <span class="validation-badge ${result.type}">${result.badge}</span>
                    <div class="validation-message-title">${result.title}</div>
                    <div class="validation-message-details">${result.details}</div>
                </div>
            `;
        }

        messageDiv.innerHTML = messageHTML;

        // Insere a mensagem após o campo
        field.parentNode.insertBefore(messageDiv, field.nextSibling);
    },

    /**
     * Remove mensagem de validação
     */
    removeValidationMessage: function(fieldId) {
        const existingMessage = document.getElementById(`validation-msg-${fieldId}`);
        if (existingMessage) {
            existingMessage.classList.add('removing');
            setTimeout(() => {
                existingMessage.remove();
            }, 200);
        }
    },

    /**
     * Valida todos os campos do formulário
     */
    validateAllFields: function() {
        let allValid = true;
        const invalidFields = [];

        // Valida campos normais
        for (const fieldId in this.fieldValidators) {
            const isValid = this.validateField(fieldId);
            if (!isValid) {
                allValid = false;
                invalidFields.push(fieldId);
            }
        }

        // Valida grupos de checkboxes
        for (const groupName in this.checkboxGroups) {
            const isValid = this.validateCheckboxGroup(groupName);
            if (!isValid) {
                allValid = false;
                invalidFields.push(groupName);
            }
        }

        if (!allValid) {
            console.log(`❌ ${invalidFields.length} campo(s) inválido(s):`, invalidFields);
        }

        return allValid;
    },

    /**
     * Valida um grupo de checkboxes (pelo menos X selecionados)
     */
    validateCheckboxGroup: function(groupName) {
        const config = this.checkboxGroups[groupName];
        if (!config) {
            console.warn(`Grupo de checkbox ${groupName} não configurado`);
            return true;
        }

        const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
        const checked = Array.from(checkboxes).filter(cb => cb.checked);

        // Remove validação anterior
        this.removeCheckboxGroupValidation(groupName);

        // Se não é obrigatório e nenhum está marcado, está OK
        if (!config.required && checked.length === 0) {
            return true;
        }

        // Valida quantidade mínima
        if (checked.length < config.min) {
            this.showCheckboxGroupError(groupName, config);
            return false;
        }

        // Sucesso
        this.showCheckboxGroupSuccess(groupName);
        return true;
    },

    /**
     * Mostra erro em grupo de checkboxes
     */
    showCheckboxGroupError: function(groupName, config) {
        const container = document.querySelector(`input[name="${groupName}"]`)?.closest('.form-group, .checkbox-group');
        if (!container) return;

        // Adiciona classe de erro no container
        container.classList.add('checkbox-group-error');

        // Cria mensagem de erro
        const messageDiv = document.createElement('div');
        messageDiv.className = 'validation-message error';
        messageDiv.id = `validation-msg-${groupName}`;
        messageDiv.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-alert-triangle">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div class="validation-message-content">
                <span class="validation-badge error">Obrigatório</span>
                <div class="validation-message-title">Selecione pelo menos ${config.min} opção</div>
                <div class="validation-message-details">${config.label} é obrigatório</div>
            </div>
        `;

        container.appendChild(messageDiv);
    },

    /**
     * Mostra sucesso em grupo de checkboxes
     */
    showCheckboxGroupSuccess: function(groupName) {
        const container = document.querySelector(`input[name="${groupName}"]`)?.closest('.form-group, .checkbox-group');
        if (!container) return;

        // Remove classe de erro
        container.classList.remove('checkbox-group-error');

        // Mensagem de sucesso simplificada
        const messageDiv = document.createElement('div');
        messageDiv.className = 'validation-message success';
        messageDiv.id = `validation-msg-${groupName}`;
        messageDiv.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-check-circle">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div class="validation-message-content">
                <span class="validation-badge success">Validado</span>
            </div>
        `;

        container.appendChild(messageDiv);
    },

    /**
     * Remove validação de grupo de checkboxes
     */
    removeCheckboxGroupMessage: function(groupName) {
        const existingMessage = document.getElementById(`validation-msg-${groupName}`);
        if (existingMessage) {
            existingMessage.remove();
        }

        const container = document.querySelector(`input[name="${groupName}"]`)?.closest('.form-group, .checkbox-group');
        if (container) {
            container.classList.remove('checkbox-group-error');
        }
    },

    removeCheckboxGroupValidation: function(groupName) {
        this.removeCheckboxGroupMessage(groupName);
    },

    /**
     * Scroll automático para o primeiro campo com erro
     */
    scrollToFirstError: function() {
        const firstError = document.querySelector('.required-empty, .invalid-format');
        if (firstError) {
            // Adiciona animação de shake
            firstError.classList.add('shake-error');
            setTimeout(() => {
                firstError.classList.remove('shake-error');
            }, 500);

            // Scroll suave até o campo
            firstError.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // Foca no campo
            setTimeout(() => {
                firstError.focus();
            }, 300);
        }
    },

    /**
     * Remove todas as validações (útil para resetar formulário)
     */
    clearAllValidations: function() {
        // Remove classes de todos os campos
        for (const fieldId in this.fieldValidators) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.remove('required-empty', 'invalid-format', 'valid-input');
                this.removeValidationMessage(fieldId);
            }
        }
    },

    /**
     * Adiciona um novo campo para validação (útil para campos dinâmicos)
     */
    addFieldValidator: function(fieldId, config) {
        this.fieldValidators[fieldId] = config;
        
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', (e) => {
                this.validateField(fieldId);
            });

            if (field.tagName === 'SELECT') {
                field.addEventListener('change', (e) => {
                    this.validateField(fieldId);
                });
            }
        }
    }
};

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        FormValidator.init();
    });
} else {
    FormValidator.init();
}

// Exporta para uso global
window.FormValidator = FormValidator;
// Compatibilidade com código antigo
window.ValidationEngine = FormValidator;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}
