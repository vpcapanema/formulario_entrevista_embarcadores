/**
 * ============================================================
 * AUTO-SAVE - Salvamento Automático Local com Carregamento Automático
 * ============================================================
 * 
 * Gerencia o salvamento automático de respostas do formulário
 * no localStorage com carregamento automático de rascunhos.
 * 
 * RECURSOS:
 * ✅ Salvamento automático com debounce (500ms)
 * ✅ Carregamento automático de rascunhos válidos (< 7 dias)
 * ✅ Restauração de dados SEM validação visual
 * ✅ Botão "Nova Pesquisa" sempre disponível quando há rascunho
 * ✅ Limpeza completa do localStorage apenas quando solicitado
 * ✅ Indicador visual de status (saving, saved, restored, cleared, error)
 * ✅ Exportação de rascunho para Excel (botão manual)
 * ✅ Observador de novos campos (suporta tabelas dinâmicas)
 * ✅ Salvamento automático ao fechar página (beforeunload)
 * 
 * FLUXO PRINCIPAL:
 * 1. Página carrega → _setup() verifica localStorage
 * 2. Se rascunho válido → _restoreData() carrega automaticamente
 * 3. Usuário pode clicar "Nova Pesquisa" para limpar quando quiser
 * 4. Durante edição → _scheduleAutoSave() salva a cada mudança
 * 5. Ao exportar → exportarRascunho() gera Excel com _convertCodesToNames()
 * 
 * PADRÕES IMPORTANTES:
 * - FormValidator._validationDisabled = true durante restauração
 * - localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
 * - Todos os IDs de elementos começam com 'autosave-' ou 'draft-'
 * - Async/await usado apenas em exportarRascunho()
 */

const AutoSave = {
    // ============================================================
    // CONFIGURAÇÃO
    // ============================================================
    
    STORAGE_KEY: 'pli2050_formulario_autosave',
    TIMESTAMP_KEY: 'pli2050_formulario_autosave_timestamp',
    DEBOUNCE_MS: 500, // Aguardar 500ms após última alteração para salvar
    
    _debounceTimer: null,
    _isRestoring: false, // Flag para evitar salvar durante restauração
    _initialized: false,
    
    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    
    /**
     * Inicializa o sistema de auto-save
     */
    init() {
        if (this._initialized) return;
        
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
            console.warn('⚠️ AutoSave: Formulário não encontrado');
            return;
        }
        
        // ⭐ MELHORADO: Carregar rascunho automaticamente se existir
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        const savedTimestamp = localStorage.getItem(this.TIMESTAMP_KEY);
        
        if (savedData && savedTimestamp) {
            try {
                const data = JSON.parse(savedData);
                const timestamp = new Date(savedTimestamp);
                
                // Verificar se os dados são recentes (menos de 7 dias)
                const daysDiff = (new Date() - timestamp) / (1000 * 60 * 60 * 24);
                if (daysDiff <= 7) {
                    // Há um rascunho válido - CARREGAR AUTOMATICAMENTE
                    console.log('🔄 Rascunho encontrado - carregando automaticamente...');
                    this._restoreData(data);
                    this._createStatusIndicator();
                    this._attachFieldListeners(form);
                    this._initialized = true;
                    
                    // Adicionar botão "Nova Pesquisa" na interface
                    this._addNewResearchButton();
                    
                    // Salvar antes de fechar a página
                    window.addEventListener('beforeunload', (e) => {
                        if (this._hasUnsavedData()) {
                            this._saveNow();
                        }
                    });
                    
                    console.log('✅ AutoSave inicializado - Rascunho carregado');
                    return;
                }
            } catch (error) {
                console.error('❌ AutoSave: Erro ao verificar rascunho', error);
            }
        }
        
        // Nenhum rascunho válido - começar novo
        this._clearFormFields(form);
        this.clear();
        
        // Criar indicador visual
        this._createStatusIndicator();
        
        // Adicionar listeners para todos os campos do formulário
        this._attachFieldListeners(form);
        
        // Salvar antes de fechar a página
        window.addEventListener('beforeunload', (e) => {
            if (this._hasUnsavedData()) {
                this._saveNow();
            }
        });
        
        this._initialized = true;
        console.log('✅ AutoSave inicializado - Nova pesquisa');
    },
    
    /**
     * Adiciona botão "Nova Pesquisa" quando há rascunho carregado
     */
    _addNewResearchButton() {
        // Verificar se já existe
        if (document.getElementById('new-research-btn')) return;
        
        const container = document.querySelector('.page-header') || document.querySelector('.container');
        if (!container) return;
        
        const button = document.createElement('button');
        button.id = 'new-research-btn';
        button.innerHTML = '🆕 Nova Pesquisa';
        button.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            padding: 8px 16px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(231, 76, 60, 0.2);
            z-index: 1000;
        `;
        
        button.onmouseover = () => {
            button.style.background = '#c0392b';
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 4px 8px rgba(231, 76, 60, 0.3)';
        };
        
        button.onmouseout = () => {
            button.style.background = '#e74c3c';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 4px rgba(231, 76, 60, 0.2)';
        };
        
        button.onclick = () => {
            if (confirm('⚠️ Tem certeza que deseja iniciar uma nova pesquisa?\n\nTodos os dados atuais serão perdidos.')) {
                const form = document.getElementById('entrevista-form');
                this.clear();
                this._clearFormFields(form);
                button.remove();
                console.log('🆕 Nova pesquisa iniciada pelo usuário');
            }
        };
        
        // Tornar container relativo se não for
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        
        container.appendChild(button);
    },
    
    /**
     * Limpa todos os campos do formulário
     */
    _clearFormFields(form) {
        // Limpar inputs de texto
        form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], textarea').forEach(el => {
            el.value = '';
        });
        
        // Limpar selects
        form.querySelectorAll('select').forEach(el => {
            el.value = '';
            el.selectedIndex = 0;
        });
        
        // Desmarcar checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach(el => {
            el.checked = false;
        });
        
        // Desmarcar radio buttons
        form.querySelectorAll('input[type="radio"]').forEach(el => {
            el.checked = false;
        });
        
        // Remover classes de validação
        form.querySelectorAll('.invalid').forEach(el => {
            el.classList.remove('invalid');
        });
    },
    

    
    // ============================================================
    // INDICADOR VISUAL
    // ============================================================
    
    /**
     * Cria o indicador visual de status do auto-save
     */
    _createStatusIndicator() {
        // Verificar se já existe
        if (document.getElementById('autosave-container')) return;
        
        const container = document.createElement('div');
        container.id = 'autosave-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
        `;
        
        // Indicador de status
        const indicator = document.createElement('div');
        indicator.id = 'autosave-indicator';
        indicator.innerHTML = `
            <span class="autosave-icon">💾</span>
            <span class="autosave-text">Auto-save ativo</span>
        `;
        indicator.style.cssText = `
            background: rgba(40, 167, 69, 0.95);
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            opacity: 0.9;
        `;
        
        // Botão de exportar rascunho
        const exportBtn = document.createElement('button');
        exportBtn.id = 'autosave-export-btn';
        exportBtn.innerHTML = '📥 Exportar Rascunho';
        exportBtn.title = 'Exportar respostas parciais para Excel';
        exportBtn.style.cssText = `
            background: rgba(52, 152, 219, 0.95);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            opacity: 0.9;
        `;
        exportBtn.addEventListener('mouseenter', () => {
            exportBtn.style.background = 'rgba(41, 128, 185, 0.95)';
            exportBtn.style.transform = 'translateY(-2px)';
        });
        exportBtn.addEventListener('mouseleave', () => {
            exportBtn.style.background = 'rgba(52, 152, 219, 0.95)';
            exportBtn.style.transform = 'translateY(0)';
        });
        exportBtn.addEventListener('click', () => this.exportarRascunho());
        
        container.appendChild(indicator);
        container.appendChild(exportBtn);
        document.body.appendChild(container);
    },
    
    // ============================================================
    // INDICADOR VISUAL - ATUALIZAÇÃO
    // ============================================================
    
    /**
     * Atualiza o indicador visual
     */
    _updateIndicator(status, message) {
        const indicator = document.getElementById('autosave-indicator');
        if (!indicator) return;
        
        const icon = indicator.querySelector('.autosave-icon');
        const text = indicator.querySelector('.autosave-text');
        
        switch (status) {
            case 'saving':
                icon.textContent = '⏳';
                text.textContent = 'Salvando...';
                indicator.style.background = 'rgba(255, 193, 7, 0.95)';
                indicator.style.color = '#333';
                break;
            case 'saved':
                icon.textContent = '✅';
                text.textContent = message || 'Salvo localmente';
                indicator.style.background = 'rgba(40, 167, 69, 0.95)';
                indicator.style.color = 'white';
                // Voltar ao estado normal após 2s
                setTimeout(() => {
                    if (indicator.querySelector('.autosave-icon').textContent === '✅') {
                        icon.textContent = '💾';
                        text.textContent = 'Auto-save ativo';
                    }
                }, 2000);
                break;
            case 'restored':
                icon.textContent = '🔄';
                text.textContent = 'Dados restaurados';
                indicator.style.background = 'rgba(23, 162, 184, 0.95)';
                indicator.style.color = 'white';
                setTimeout(() => {
                    icon.textContent = '💾';
                    text.textContent = 'Auto-save ativo';
                    indicator.style.background = 'rgba(40, 167, 69, 0.95)';
                }, 3000);
                break;
            case 'cleared':
                icon.textContent = '🗑️';
                text.textContent = 'Rascunho limpo';
                indicator.style.background = 'rgba(108, 117, 125, 0.95)';
                indicator.style.color = 'white';
                setTimeout(() => {
                    icon.textContent = '💾';
                    text.textContent = 'Auto-save ativo';
                    indicator.style.background = 'rgba(40, 167, 69, 0.95)';
                }, 2000);
                break;
            case 'error':
                icon.textContent = '⚠️';
                text.textContent = message || 'Erro ao salvar';
                indicator.style.background = 'rgba(220, 53, 69, 0.95)';
                indicator.style.color = 'white';
                break;
            default:
                icon.textContent = '💾';
                text.textContent = 'Auto-save ativo';
                indicator.style.background = 'rgba(40, 167, 69, 0.95)';
                indicator.style.color = 'white';
        }
    },
    
    /**
     * Restaura dados salvos nos campos do formulário
     * SEM disparar validação visual
     */
    _restoreData(data) {
        const form = document.getElementById('entrevista-form');
        if (!form) {
            console.error('❌ AutoSave: Formulário não encontrado');
            return;
        }
        
        this._isRestoring = true;
        
        console.log('🔄 Iniciando restauração de dados...');
        console.log('Dados completos a restaurar:', data);
        
        // ⭐ Desabilitar validação visual durante restauração
        if (window.FormValidator) {
            window.FormValidator._validationDisabled = true;
            console.log('✅ Validação desabilitada');
        }
        
        try {
            let camposRestaurados = 0;
            let camposNaoEncontrados = [];
            
            // ⭐ IMPORTANTE: Criar produtos na tabela antes de restaurar dados
            // Isso é essencial pois os campos dos produtos estão fora do DOM inicialmente
            if (data.produtos && Array.isArray(data.produtos) && data.produtos.length > 0) {
                console.log(`🛒 PRÉ-REQUISITO: Criando ${data.produtos.length} linhas de produto na tabela...`);
                
                // Chamar função global para adicionar produtos (se existir)
                if (typeof adicionarProduto === 'function') {
                    for (let i = 0; i < data.produtos.length; i++) {
                        try {
                            adicionarProduto();
                            console.log(`   ✅ Linha de produto ${i + 1} criada`);
                        } catch (err) {
                            console.error(`   ❌ Erro ao criar linha ${i + 1}:`, err);
                        }
                    }
                    // Aguardar um pouco para as linhas renderizarem
                    console.log('   ⏳ Aguardando renderização das linhas...');
                } else {
                    console.warn('   ⚠️ Função adicionarProduto não encontrada - produtos podem não ser restaurados');
                }
            }
            
            // Restaurar campos simples (text, number, email, tel, textarea)
            if (data.fields) {
                console.log(`📝 Restaurando ${Object.keys(data.fields).length} campos...`);
                
                Object.keys(data.fields).forEach(name => {
                    // Pular labels (não são campos reais, só para export)
                    if (name.endsWith('-label')) return;
                    
                    // Procura por name, fallback para id e variações com '-' / '_'
                    let element = form.querySelector(`[name="${name}"]`);
                    if (!element) element = form.querySelector(`#${name}`);
                    if (!element) element = form.querySelector(`[name="${name.replace(/_/g,'-')}"]`);
                    if (!element) element = form.querySelector(`#${name.replace(/_/g,'-')}`);
                    if (!element) element = form.querySelector(`[name="${name.replace(/-/g,'_')}"]`);
                    if (!element) element = form.querySelector(`#${name.replace(/-/g,'_')}`);
                    if (element && element.tagName !== 'SELECT' && element.tagName !== 'TEXTAREA') {
                        const oldValue = element.value;
                        element.value = data.fields[name] || '';
                        
                        // Disparar eventos de change para validação/cascata
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        console.log(`✅ Campo restaurado: ${name} = "${element.value}" (era: "${oldValue}")`);
                        camposRestaurados++;
                    } else if (element && element.tagName === 'TEXTAREA') {
                        const oldValue = element.value;
                        element.value = data.fields[name] || '';
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        console.log(`✅ Textarea restaurado: ${name} = "${element.value}" (era: "${oldValue}")`);
                        camposRestaurados++;
                    } else if (!element) {
                        console.warn(`⚠️ Campo não encontrado: ${name}`);
                        camposNaoEncontrados.push(name);
                    }
                });
            }
            
            // Restaurar radio buttons
            if (data.radios) {
                console.log(`📻 Restaurando ${Object.keys(data.radios).length} radios...`);
                
                Object.keys(data.radios).forEach(name => {
                    const value = data.radios[name];
                    const selector = `input[type="radio"][name="${name}"][value="${value}"]`;
                    const radioElement = form.querySelector(selector);
                    
                    if (radioElement) {
                        radioElement.checked = true;
                        radioElement.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log(`✅ Radio restaurado: ${name} = ${value}`);
                        camposRestaurados++;
                    } else {
                        console.warn(`⚠️ Radio não encontrado: ${name} = ${value} (seletor: ${selector})`);
                        camposNaoEncontrados.push(`${name}[radio]`);
                    }
                });
            }
            
            // Restaurar checkboxes
            if (data.checkboxes) {
                console.log(`☑️ Restaurando ${Object.keys(data.checkboxes).length} grupos de checkboxes...`);
                
                Object.keys(data.checkboxes).forEach(name => {
                    const checkboxes = form.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
                    
                    if (checkboxes.length > 0) {
                        let checkouCount = 0;
                        checkboxes.forEach(checkbox => {
                            const shouldCheck = Array.isArray(data.checkboxes[name]) && data.checkboxes[name].includes(checkbox.value);
                            const wasChecked = checkbox.checked;
                            checkbox.checked = shouldCheck;
                            
                            if (shouldCheck !== wasChecked) {
                                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                            if (shouldCheck) checkouCount++;
                        });
                        console.log(`✅ Checkboxes restaurados: ${name} = [${data.checkboxes[name].join(', ')}] (${checkouCount}/${checkboxes.length} marcados)`);
                        camposRestaurados++;
                    } else {
                        console.warn(`⚠️ Grupo de checkboxes não encontrado: ${name}`);
                        camposNaoEncontrados.push(`${name}[checkboxes]`);
                    }
                });
            }
            
            // Restaurar selects
            if (data.selects) {
                console.log(`🔽 Restaurando ${Object.keys(data.selects).length} selects...`);
                
                Object.keys(data.selects).forEach(name => {
                    const element = form.querySelector(`select[name="${name}"]`);
                    if (element) {
                        if (element.multiple) {
                            const values = Array.isArray(data.selects[name]) ? data.selects[name] : [data.selects[name]];
                            Array.from(element.options).forEach(option => {
                                option.selected = values.includes(option.value);
                            });
                            console.log(`✅ Select múltiplo restaurado: ${name} = [${values.join(', ')}]`);
                        } else {
                            const oldValue = element.value;
                            element.value = data.selects[name] || '';
                            console.log(`✅ Select restaurado: ${name} = "${element.value}" (era: "${oldValue}")`);
                        }
                        // Disparar change para cascata funcionar
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        camposRestaurados++;
                    } else {
                        console.warn(`⚠️ Select não encontrado: ${name}`);
                        camposNaoEncontrados.push(`${name}[select]`);
                    }
                });
            }
            
            // Restaurar produtos - COM TRATAMENTO ESPECIAL
            let produtosRestaurados = 0;
            if (data.produtos && Array.isArray(data.produtos) && data.produtos.length > 0) {
                console.log(`🛒 Restaurando ${data.produtos.length} produtos...`);
                
                data.produtos.forEach((produto, idx) => {
                    console.log(`  \n📦 Produto ${idx + 1}/${data.produtos.length}:`);
                    
                    // Restaurar campos do produto
                    if (produto.fields) {
                        Object.keys(produto.fields).forEach(fieldName => {
                            // Pular labels
                            if (fieldName.endsWith('-label')) return;
                            
                            // Tentar encontrar o campo em toda a tabela
                            let element = form.querySelector(`[name="${fieldName}"]`);
                            
                            if (!element) {
                                // Tentar encontro dentro de tbody especificamente
                                const tbody = form.querySelector('#produtos-tbody');
                                if (tbody) {
                                    element = tbody.querySelector(`[name="${fieldName}"]`);
                                }
                            }
                            
                            if (element && element.tagName !== 'SELECT') {
                                element.value = produto.fields[fieldName] || '';
                                element.dispatchEvent(new Event('input', { bubbles: true }));
                                element.dispatchEvent(new Event('change', { bubbles: true }));
                                console.log(`    ✅ ${fieldName} = "${element.value}"`);
                                camposRestaurados++;
                            } else if (!element) {
                                console.warn(`    ⚠️ Campo não encontrado: ${fieldName}`);
                                camposNaoEncontrados.push(`produto[${idx}].${fieldName}`);
                            }
                        });
                    }
                    
                    // Restaurar selects do produto
                    if (produto.selects) {
                        Object.keys(produto.selects).forEach(selectName => {
                            let element = form.querySelector(`select[name="${selectName}"]`);
                            
                            if (!element) {
                                const tbody = form.querySelector('#produtos-tbody');
                                if (tbody) {
                                    element = tbody.querySelector(`select[name="${selectName}"]`);
                                }
                            }
                            
                            if (element) {
                                if (element.multiple) {
                                    const values = Array.isArray(produto.selects[selectName]) ? produto.selects[selectName] : [produto.selects[selectName]];
                                    Array.from(element.options).forEach(option => {
                                        option.selected = values.includes(option.value);
                                    });
                                } else {
                                    element.value = produto.selects[selectName] || '';
                                }
                                element.dispatchEvent(new Event('change', { bubbles: true }));
                                console.log(`    ✅ ${selectName} = "${produto.selects[selectName]}"`);
                                camposRestaurados++;
                            } else {
                                console.warn(`    ⚠️ Select não encontrado: ${selectName}`);
                                camposNaoEncontrados.push(`produto[${idx}].${selectName}`);
                            }
                        });
                    }
                    
                    produtosRestaurados++;
                });
            }
            
            // ⭐ RESUMO DETALHADO FINAL
            console.log('\n' + '='.repeat(70));
            console.log('📊 RESUMO DA RESTAURAÇÃO');
            console.log('='.repeat(70));
            console.log(`✅ Total de campos restaurados: ${camposRestaurados}`);
            console.log(`✅ Total de produtos restaurados: ${produtosRestaurados}`);
            
            if (camposNaoEncontrados.length > 0) {
                console.warn(`⚠️ Campos NÃO encontrados: ${camposNaoEncontrados.length}`);
                camposNaoEncontrados.forEach(campo => {
                    console.warn(`   - ${campo}`);
                });
            } else {
                console.log('✅ Todos os campos foram encontrados e restaurados!');
            }
            console.log('='.repeat(70) + '\n');
            
        } catch (error) {
            console.error('❌ AutoSave: Erro ao restaurar dados', error);
            console.error('Stack trace:', error.stack);
        } finally {
            // ⭐ Reabilitar validação após restauração
            if (window.FormValidator) {
                window.FormValidator._validationDisabled = false;
                console.log('✅ Validação reabilitada');
            }
            
            this._updateIndicator('restored');
            this._isRestoring = false;
            console.log('✅✅✅ Rascunho restaurado com sucesso! ✅✅✅');
        }
    },
    
    // ============================================================
    // LISTENERS DE CAMPOS
    // ============================================================
    
    /**
     * Adiciona listeners em todos os campos do formulário
     */
    _attachFieldListeners(form) {
        // Inputs de texto, número, email, tel
        form.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"]').forEach(input => {
            input.addEventListener('input', () => this._scheduleAutoSave());
            input.addEventListener('change', () => this._scheduleAutoSave());
        });
        
        // Selects
        form.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', () => this._scheduleAutoSave());
        });
        
        // Radio buttons
        form.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => this._scheduleAutoSave());
        });
        
        // Checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this._scheduleAutoSave());
        });
        
        // Textareas
        form.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', () => this._scheduleAutoSave());
            textarea.addEventListener('change', () => this._scheduleAutoSave());
        });
        
        // Observer para novos campos (tabela de produtos dinâmica)
        this._observeNewFields(form);
    },
    
    /**
     * Observa adição de novos campos (ex: linhas na tabela de produtos)
     */
    _observeNewFields(form) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Adicionar listeners nos novos inputs
                        node.querySelectorAll?.('input, select, textarea')?.forEach(field => {
                            field.addEventListener('input', () => this._scheduleAutoSave());
                            field.addEventListener('change', () => this._scheduleAutoSave());
                        });
                    }
                });
            });
        });
        
        observer.observe(form, { childList: true, subtree: true });
    },
    
    // ============================================================
    // SALVAMENTO
    // ============================================================
    
    /**
     * Agenda salvamento com debounce
     */
    _scheduleAutoSave() {
        if (this._isRestoring) return;
        
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
            this._saveNow();
        }, this.DEBOUNCE_MS);
    },
    
    /**
     * Salva dados imediatamente
     */
    _saveNow() {
        if (this._isRestoring) return;
        
        try {
            this._updateIndicator('saving');
            
            const formData = this._collectFormData();
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formData));
            localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
            
            const timestamp = new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this._updateIndicator('saved', `Salvo às ${timestamp}`);
            
            console.log(`💾 AutoSave: Dados salvos às ${timestamp}`);
        } catch (error) {
            console.error('❌ AutoSave: Erro ao salvar', error);
            this._updateIndicator('error', 'Erro ao salvar');
        }
    },
    
    /**
     * Coleta todos os dados do formulário
     */
    _collectFormData() {
        const form = document.getElementById('entrevista-form');
        if (!form) return {};
        
        const data = {
            // Metadados
            _savedAt: new Date().toISOString(),
            _version: '1.0',
            
            // Campos simples
            fields: {},
            
            // Radio buttons
            radios: {},
            
            // Checkboxes
            checkboxes: {},
            
            // Selects (incluindo múltiplos)
            selects: {},
            
            // Tabela de produtos
            produtos: []
        };
        
        // Coletar inputs - salvar TODOS os campos relevantes (mesmo vazios)
        // Excluir apenas controles que não representam dados do usuário
        form.querySelectorAll('input').forEach(input => {
            const excludeTypes = ['submit','button','reset','file'];
            if (!input.name) return;
            if (excludeTypes.includes(String(input.type).toLowerCase())) return;
            try {
                data.fields[input.name] = input.value == null ? '' : String(input.value);
            } catch (err) {
                data.fields[input.name] = '';
            }
        });

        // Coletar textareas (salvar mesmo vazios)
        form.querySelectorAll('textarea').forEach(textarea => {
            if (textarea.name) {
                data.fields[textarea.name] = textarea.value == null ? '' : String(textarea.value);
            }
        });
        
        // Coletar radios (apenas os selecionados)
        form.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            data.radios[radio.name] = radio.value;
        });
        
        // Coletar checkboxes marcados
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            if (!data.checkboxes[checkbox.name]) {
                data.checkboxes[checkbox.name] = [];
            }
            if (checkbox.checked) {
                data.checkboxes[checkbox.name].push(checkbox.value);
            }
        });
        
        // Coletar selects - salvar todos (inclusive valores vazios)
        form.querySelectorAll('select').forEach(select => {
            if (select.name) {
                if (select.multiple) {
                    data.selects[select.name] = Array.from(select.selectedOptions).map(opt => opt.value);
                } else {
                    data.selects[select.name] = select.value == null ? '' : String(select.value);
                }
            }
        });
        
        // Coletar tabela de produtos
        const produtosRows = document.querySelectorAll('#produtos-tbody tr[id^="produto-row-"]');
        produtosRows.forEach(row => {
            const rowId = row.id.replace('produto-row-', '');
            const produto = {
                rowId: rowId,
                fields: {},
                selects: {}
            };
            
            row.querySelectorAll('input, select, textarea').forEach(field => {
                if (field.name) {
                    if (field.tagName === 'SELECT') {
                        if (field.multiple) {
                            produto.selects[field.name] = Array.from(field.selectedOptions).map(opt => opt.value);
                        } else {
                            produto.selects[field.name] = field.value;
                            // Salvar também o rótulo exibido no select para export (texto do option)
                            const labelName = `${field.name}-label`;
                            produto.fields[labelName] = (field.selectedOptions[0]?.textContent || '');
                        }
                    } else {
                        produto.fields[field.name] = field.value;
                    }
                }
            });
            
            data.produtos.push(produto);
        });
        
        return data;
    },
    
    // ============================================================
    // UTILITÁRIOS
    // ============================================================
    
    /**
     * Verifica se há dados não salvos
     */
    _hasUnsavedData() {
        const form = document.getElementById('entrevista-form');
        if (!form) return false;
        
        // Verificar se há algum campo preenchido
        const inputs = form.querySelectorAll('input, select, textarea');
        for (const input of inputs) {
            if (input.type === 'radio' || input.type === 'checkbox') {
                if (input.checked) return true;
            } else if (input.value && input.value.trim() !== '') {
                return true;
            }
        }
        return false;
    },
    
    /**
     * Limpa dados salvos (chamar após envio bem-sucedido)
     */
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.TIMESTAMP_KEY);
        this._updateIndicator('cleared');
        console.log('🗑️ AutoSave: Dados limpos');
    },
    
    /**
     * Força salvamento manual
     */
    saveManual() {
        this._saveNow();
    },
    
    /**
     * Retorna dados salvos (para debug)
     */
    getSavedData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },
    
    /**
     * Retorna timestamp do último salvamento
     */
    getLastSaveTime() {
        const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);
        return timestamp ? new Date(timestamp) : null;
    },

    /**
     * Converte kebab-case (ex: origem-pais) em camelCase (origemPais)
     */
    _toCamelCase(str) {
        if (!str || typeof str !== 'string') return str;
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    },
    
    // ============================================================
    // EXPORTAÇÃO DE RASCUNHO
    // ============================================================
    
    /**
     * Exporta o rascunho atual para Excel
     */
    async exportarRascunho() {
        try {
            // Salvar dados atuais primeiro
            this._saveNow();
            
            // Coletar dados do formulário usando FormCollector se disponível
            let formData;
            if (window.FormCollector && typeof window.FormCollector.collectData === 'function') {
                formData = window.FormCollector.collectData();
                // Converter códigos (ids) para nomes legíveis – usar somente fontes reais (DropdownManager/_cache ou CoreAPI)
                formData = await this._convertCodesToNames(formData);
            } else {
                // Fallback: usar dados do auto-save
                const savedData = this.getSavedData();
                if (!savedData) {
                    this._showExportMessage('warning', 'Nenhum dado para exportar. Preencha alguns campos primeiro.');
                    return;
                }
                formData = this._convertSavedDataToFormData(savedData);
                formData = await this._convertCodesToNames(formData);
            }
            
            // Verificar se há dados para exportar
            if (!formData || Object.keys(formData).length === 0) {
                this._showExportMessage('warning', 'Nenhum dado para exportar. Preencha alguns campos primeiro.');
                return;
            }
            
            // Checar se conversion success (convertCodesToNames pode lançar se os dados nao estiverem carregados)
            if (formData.__conversionError) {
                this._showExportMessage('error', 'Não foi possível carregar dados auxiliares para exportar. Recarregue a página e tente novamente.');
                return;
            }
            
            // Gerar nome do arquivo
            const empresa = formData.razaoSocial || formData.nomeEmpresa || 'rascunho';
            const timestamp = new Date().toISOString().split('T')[0];
            const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
            const filename = `PLI2050_RASCUNHO_${empresa}_${timestamp}_${hora}.xlsx`;
            
            // Gerar Excel usando ExcelGenerator se disponível
            if (window.ExcelGenerator && typeof window.ExcelGenerator.createWorkbookArrayBuffer === 'function') {
                const arrayBuffer = window.ExcelGenerator.createWorkbookArrayBuffer(formData, {
                    success: false,
                    statusLabel: 'RASCUNHO',
                    labels: window.ExcelLabels
                });
                window.ExcelGenerator.downloadArrayBuffer(arrayBuffer, filename);
                this._showExportMessage('success', `Rascunho exportado: ${filename}`);
            } else {
                // Fallback: gerar Excel básico com SheetJS
                this._generateBasicExcel(formData, filename);
            }
            
            console.log(`📥 AutoSave: Rascunho exportado como ${filename}`);
            
        } catch (error) {
            console.error('❌ AutoSave: Erro ao exportar rascunho', error);
            this._showExportMessage('error', 'Erro ao exportar rascunho. Veja o console para detalhes.');
        }
    },

    /**
     * Converte ids de selects para nomes (paises, estados, municipios) no object formData
     * Retorna uma nova cópia do objeto com valores legíveis para export
     */
    async _convertCodesToNames(formData) {
        const copy = JSON.parse(JSON.stringify(formData));

        // Helper functions
        const getPaisNome = async (idPais) => {
            if (!idPais) return '';
            try {
                // Tentar usar cache do DropdownManager
                const cache = window.DropdownManager?._cache?.paises;
                if (cache && cache.length > 0) {
                    const item = cache.find(p => String(p.id_pais) === String(idPais));
                    if (item) return item.nome_pais || '';
                }
                // Requisitar via CoreAPI (forma 'real' de obter dados)
                if (window.CoreAPI && typeof window.CoreAPI.getPaises === 'function') {
                    const paises = await window.CoreAPI.getPaises();
                    if (Array.isArray(paises)) {
                        // Atualizar cache se disponível
                        if (window.DropdownManager && window.DropdownManager._cache) window.DropdownManager._cache.paises = paises;
                        const match = paises.find(p => String(p.id_pais) === String(idPais));
                        return match ? match.nome_pais || '' : '';
                    }
                }
                // Se não foi possível obter o nome, abortar export (sem fallback)
                throw new Error('Dados de países não carregados');
            } catch (err) {
                throw err;
            }
        };

        const getEstadoNome = async (uf) => {
            if (!uf) return '';
            try {
                const cache = window.DropdownManager?._cache?.estados;
                if (cache && cache.length > 0) {
                    const item = cache.find(e => String(e.uf) === String(uf));
                    if (item) return item.nome_estado || '';
                }
                if (window.CoreAPI && typeof window.CoreAPI.getEstados === 'function') {
                    const estados = await window.CoreAPI.getEstados();
                    if (Array.isArray(estados)) {
                        if (window.DropdownManager && window.DropdownManager._cache) window.DropdownManager._cache.estados = estados;
                        const match = estados.find(e => String(e.uf) === String(uf));
                        return match ? match.nome_estado || '' : '';
                    }
                }
                throw new Error('Dados de estados não carregados');
            } catch (err) { throw err; }
        };

        const getMunicipioNome = async (cdMun, uf) => {
            if (!cdMun) return '';
            if (!uf) throw new Error('UF requerido para recuperar municípios');
            try {
                if (window.CoreAPI && typeof window.CoreAPI.getMunicipiosByUF === 'function') {
                    const municipios = await window.CoreAPI.getMunicipiosByUF(uf);
                    if (Array.isArray(municipios)) {
                        const match = municipios.find(m => String(m.cd_mun) === String(cdMun));
                        return match ? match.nm_mun || '' : '';
                    }
                }
                throw new Error('Dados de municípios não carregados');
            } catch (err) { throw err; }
        };

        // ==== Top-level fields (camelCase keys expected from FormCollector.collectData) ====
        // Preservar códigos originais antes da conversão para nomes
        const origemPaisCodigo = (copy.origemPais !== undefined && copy.origemPais !== null && copy.origemPais !== '') ? String(copy.origemPais) : '';
        const destinoPaisCodigo = (copy.destinoPais !== undefined && copy.destinoPais !== null && copy.destinoPais !== '') ? String(copy.destinoPais) : '';
        const origemEstadoCodigo = (copy.origemEstado !== undefined && copy.origemEstado !== null && copy.origemEstado !== '') ? String(copy.origemEstado) : '';
        const destinoEstadoCodigo = (copy.destinoEstado !== undefined && copy.destinoEstado !== null && copy.destinoEstado !== '') ? String(copy.destinoEstado) : '';
        const origemMunicipioCodigo = (copy.origemMunicipio !== undefined && copy.origemMunicipio !== null && copy.origemMunicipio !== '') ? String(copy.origemMunicipio) : '';
        const destinoMunicipioCodigo = (copy.destinoMunicipio !== undefined && copy.destinoMunicipio !== null && copy.destinoMunicipio !== '') ? String(copy.destinoMunicipio) : '';

        // Sempre garantir três campos legíveis para origem/destino (preencher com '' se ausente)
        try {
            copy.origemEstado = origemEstadoCodigo ? await getEstadoNome(origemEstadoCodigo) || '' : '';
            copy.destinoEstado = destinoEstadoCodigo ? await getEstadoNome(destinoEstadoCodigo) || '' : '';
            copy.origemPais = origemPaisCodigo ? await getPaisNome(origemPaisCodigo) : '';
            copy.destinoPais = destinoPaisCodigo ? await getPaisNome(destinoPaisCodigo) : '';
        } catch (err) {
            console.error('AutoSave: erro ao converter codes to names (país/estado top-level)', err);
            copy.__conversionError = true;
        }
        copy.origemMunicipio = (origemMunicipioCodigo && origemEstadoCodigo) ? await getMunicipioNome(origemMunicipioCodigo, origemEstadoCodigo) : '';
        copy.destinoMunicipio = (destinoMunicipioCodigo && destinoEstadoCodigo) ? await getMunicipioNome(destinoMunicipioCodigo, destinoEstadoCodigo) : '';

        // Naturalidade (usar sempre dados reais via API/cache)
        const naturalidadeUfCodigo = (copy.ufNaturalidade !== undefined && copy.ufNaturalidade !== null && copy.ufNaturalidade !== '') ? String(copy.ufNaturalidade) : '';
        const naturalidadeMunicipioCodigo = (copy.municipioNaturalidade !== undefined && copy.municipioNaturalidade !== null && copy.municipioNaturalidade !== '') ? String(copy.municipioNaturalidade) : '';

        if (copy.ufNaturalidade !== undefined) {
            try {
                copy.ufNaturalidade = naturalidadeUfCodigo ? await getEstadoNome(naturalidadeUfCodigo) || '' : '';
            } catch (err) {
                console.error('AutoSave: erro ao obter nome do estado para naturalidade', err);
                copy.__conversionError = true;
            }
        }
        if (copy.municipioNaturalidade !== undefined) {
            try {
                copy.municipioNaturalidade = (naturalidadeMunicipioCodigo && naturalidadeUfCodigo) ? await getMunicipioNome(naturalidadeMunicipioCodigo, naturalidadeUfCodigo) || '' : '';
            } catch (err) {
                console.error('AutoSave: erro ao obter nome do municipio para naturalidade', err);
                copy.__conversionError = true;
            }
        }

        // Empresa municipality
        if (copy.municipio !== undefined) {
            // municipio-empresa é um campo de texto; assume-se que já contém o nome (não usar fallback)
            copy.municipio = String(copy.municipio || '');
        }

        // Produtos
        if (Array.isArray(copy.produtos)) {
            for (const p of copy.produtos) {
                const origemPaisCodigoProduto = p.origemPaisCodigo ? String(p.origemPaisCodigo) : '';
                const destinoPaisCodigoProduto = p.destinoPaisCodigo ? String(p.destinoPaisCodigo) : '';
                const origemEstadoCodigoProduto = p.origemEstadoUf ? String(p.origemEstadoUf) : '';
                const destinoEstadoCodigoProduto = p.destinoEstadoUf ? String(p.destinoEstadoUf) : '';
                const origemMunicipioCodigoProduto = p.origemMunicipioCodigo ? String(p.origemMunicipioCodigo) : '';
                const destinoMunicipioCodigoProduto = p.destinoMunicipioCodigo ? String(p.destinoMunicipioCodigo) : '';
                const origemPaisNomeProduto = p.origemPaisNome ? String(p.origemPaisNome) : '';
                const destinoPaisNomeProduto = p.destinoPaisNome ? String(p.destinoPaisNome) : '';
                const origemEstadoNomeProduto = p.origemEstadoNome ? String(p.origemEstadoNome) : '';
                const destinoEstadoNomeProduto = p.destinoEstadoNome ? String(p.destinoEstadoNome) : '';
                const origemMunicipioNomeProduto = p.origemMunicipioNome ? String(p.origemMunicipioNome) : '';
                const destinoMunicipioNomeProduto = p.destinoMunicipioNome ? String(p.destinoMunicipioNome) : '';

                // If product contains 'origemPaisNome' or 'origemPaisCodigo' -> prefer label fields
                // Origem - País
                try {
                    if (origemPaisNomeProduto && origemPaisNomeProduto.trim() !== '') p.origemPais = origemPaisNomeProduto || '';
                    else if (origemPaisCodigoProduto) p.origemPais = await getPaisNome(origemPaisCodigoProduto) || '';
                    else p.origemPais = p.origemPais || '';
                } catch (err) { p.__conversionError = true; }
                // Destino - País
                try {
                    if (destinoPaisNomeProduto && destinoPaisNomeProduto.trim() !== '') p.destinoPais = destinoPaisNomeProduto || '';
                    else if (destinoPaisCodigoProduto) p.destinoPais = await getPaisNome(destinoPaisCodigoProduto) || '';
                    else p.destinoPais = p.destinoPais || '';
                } catch (err) { p.__conversionError = true; }

                // Estados (UF)
                try {
                    if (origemEstadoNomeProduto && origemEstadoNomeProduto.trim() !== '') p.origemEstado = origemEstadoNomeProduto || '';
                    else if (origemEstadoCodigoProduto) p.origemEstado = await getEstadoNome(origemEstadoCodigoProduto) || '';
                    else p.origemEstado = p.origemEstado || '';
                } catch (err) { p.__conversionError = true; }
                try {
                    if (destinoEstadoNomeProduto && destinoEstadoNomeProduto.trim() !== '') p.destinoEstado = destinoEstadoNomeProduto || '';
                    else if (destinoEstadoCodigoProduto) p.destinoEstado = await getEstadoNome(destinoEstadoCodigoProduto) || '';
                    else p.destinoEstado = p.destinoEstado || '';
                } catch (err) { p.__conversionError = true; }

                // Municípios (async)
                try {
                    if (origemMunicipioNomeProduto && origemMunicipioNomeProduto.trim() !== '') p.origemMunicipio = origemMunicipioNomeProduto || '';
                    else if (origemMunicipioCodigoProduto && origemEstadoCodigoProduto) p.origemMunicipio = await getMunicipioNome(origemMunicipioCodigoProduto, origemEstadoCodigoProduto) || '';
                    else p.origemMunicipio = p.origemMunicipio || '';
                } catch (err) { p.__conversionError = true; }
                try {
                    if (destinoMunicipioNomeProduto && destinoMunicipioNomeProduto.trim() !== '') p.destinoMunicipio = destinoMunicipioNomeProduto || '';
                    else if (destinoMunicipioCodigoProduto && destinoEstadoCodigoProduto) p.destinoMunicipio = await getMunicipioNome(destinoMunicipioCodigoProduto, destinoEstadoCodigoProduto) || '';
                    else p.destinoMunicipio = p.destinoMunicipio || '';
                } catch (err) { p.__conversionError = true; }

                // Remover helper keys para evitar exportar códigos auxiliares
                [
                    'origemPaisCodigo', 'destinoPaisCodigo',
                    'origemEstadoUf', 'destinoEstadoUf',
                    'origemMunicipioCodigo', 'destinoMunicipioCodigo',
                    'origemPaisNome', 'destinoPaisNome',
                    'origemEstadoNome', 'destinoEstadoNome',
                    'origemMunicipioNome', 'destinoMunicipioNome',
                    '__conversionError'
                ].forEach(key => delete p[key]);
            }
        }

        // Garantir que campos de código no objeto principal não sigam para exportação
        [
            '__conversionError',
            'origemPaisCodigo', 'destinoPaisCodigo',
            'origemEstadoCodigo', 'destinoEstadoCodigo',
            'origemEstadoUf', 'destinoEstadoUf',
            'origemMunicipioCodigo', 'destinoMunicipioCodigo',
            'naturalidadeUfCodigo', 'naturalidadeMunicipioCodigo'
        ].forEach(key => delete copy[key]);

        return copy;
    },
    
    /**
     * Converte dados salvos do localStorage para formato de formData
     */
    _convertSavedDataToFormData(savedData) {
        const formData = {};
        
        // Campos simples: normalizar chaves com hífen em camelCase
        if (savedData.fields) {
            Object.entries(savedData.fields).forEach(([name, value]) => {
                const camel = this._toCamelCase(name);
                formData[camel] = value;
            });
        }
        
        // Radios (normalizar também)
        if (savedData.radios) {
            Object.entries(savedData.radios).forEach(([name, value]) => {
                const camel = this._toCamelCase(name);
                formData[camel] = value;
            });
        }
        
        // Selects
        if (savedData.selects) {
            Object.entries(savedData.selects).forEach(([name, value]) => {
                const camel = this._toCamelCase(name);
                formData[camel] = value;
            });
        }
        
        // Checkboxes (converter arrays para string separada por vírgula)
        if (savedData.checkboxes) {
            Object.entries(savedData.checkboxes).forEach(([name, values]) => {
                if (values && values.length > 0) {
                    formData[this._toCamelCase(name)] = values.join(', ');
                }
            });
        }
        
        // Produtos
        if (savedData.produtos && savedData.produtos.length > 0) {
            formData.produtos = savedData.produtos.map(p => {
                const produtoObj = {};
                // fields são como produto-carga-1, produto-movimentacao-1, etc - mapear para chaves limpas
                Object.entries(p.fields || {}).forEach(([k, v]) => {
                    // remover sufixo -<rowid>
                    const base = k.replace(/-\d+$/, '');
                    switch (true) {
                        case /produto-carga/.test(base): produtoObj.carga = v; break;
                        case /produto-movimentacao/.test(base): produtoObj.movimentacao = v; break;
                        case /produto-origem-text/.test(base): produtoObj.origemText = v; break;
                        case /produto-origem-pais-label/.test(base): produtoObj.origemPaisNome = v; break;
                        case /produto-origem-estado-label/.test(base): produtoObj.origemEstadoNome = v; break;
                        case /produto-origem-municipio-label/.test(base): produtoObj.origemMunicipioNome = v; break;
                        case /produto-destino-text/.test(base): produtoObj.destinoText = v; break;
                        case /produto-destino-pais-label/.test(base): produtoObj.destinoPaisNome = v; break;
                        case /produto-destino-estado-label/.test(base): produtoObj.destinoEstadoNome = v; break;
                        case /produto-destino-municipio-label/.test(base): produtoObj.destinoMunicipioNome = v; break;
                        case /produto-distancia/.test(base): produtoObj.distancia = v; break;
                        case /produto-acondicionamento/.test(base): produtoObj.acondicionamento = v; break;
                        case /produto-observacoes/.test(base): produtoObj.observacoes = v; break;
                        default:
                            // manter caso desconhecido
                            produtoObj[base] = v;
                    }
                });
                // selects: produto-origem-pais-1, produto-origem-estado-1, produto-origem-municipio-1, produto-modalidade-1
                Object.entries(p.selects || {}).forEach(([k, v]) => {
                    const base = k.replace(/-\d+$/, '');
                    switch (true) {
                            case /produto-origem-pais/.test(base): produtoObj.origemPaisCodigo = v; break;
                        case /produto-origem-estado/.test(base): produtoObj.origemEstadoUf = v; break;
                        case /produto-origem-municipio/.test(base): produtoObj.origemMunicipioCodigo = v; break;
                        case /produto-destino-pais/.test(base): produtoObj.destinoPaisCodigo = v; break;
                        case /produto-destino-estado/.test(base): produtoObj.destinoEstadoUf = v; break;
                        case /produto-destino-municipio/.test(base): produtoObj.destinoMunicipioCodigo = v; break;
                        case /produto-modalidade/.test(base): produtoObj.modalidade = Array.isArray(v) ? v.join(',') : v; break;
                        default:
                            produtoObj[base] = v;
                    }
                });

                return produtoObj;
            });
        }
        
        return formData;
    },
    
    /**
     * Gera Excel básico usando SheetJS (fallback)
     */
    _generateBasicExcel(formData, filename) {
        if (typeof XLSX === 'undefined') {
            this._showExportMessage('error', 'Biblioteca XLSX não disponível.');
            return;
        }
        
        // Criar workbook
        const wb = XLSX.utils.book_new();
        
        // Preparar dados para a planilha principal
        const mainData = [];
        const metaRow = {
            'Status': 'RASCUNHO',
            'Data Exportação': new Date().toLocaleString('pt-BR'),
            'Observação': 'Este é um rascunho parcial - ainda não foi enviado ao servidor'
        };
        mainData.push(metaRow);
        
        // Adicionar campos do formulário
        const fieldsRow = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'produtos' && value !== null && value !== undefined && value !== '') {
                fieldsRow[key] = Array.isArray(value) ? value.join(', ') : value;
            }
        });
        mainData.push(fieldsRow);
        
        // Criar sheet principal
        const wsMain = XLSX.utils.json_to_sheet(mainData);
        XLSX.utils.book_append_sheet(wb, wsMain, 'Rascunho');
        
        // Se houver produtos, criar sheet separada
        if (formData.produtos && formData.produtos.length > 0) {
            const wsProdutos = XLSX.utils.json_to_sheet(formData.produtos);
            XLSX.utils.book_append_sheet(wb, wsProdutos, 'Produtos');
        }
        
        // Download
        XLSX.writeFile(wb, filename);
        this._showExportMessage('success', `Rascunho exportado: ${filename}`);
    },
    
    /**
     * Mostra mensagem de exportação temporária
     */
    _showExportMessage(type, message) {
        // Usar UIFeedback se disponível
        if (window.UI && typeof window.UI.mostrarMensagem === 'function') {
            window.UI.mostrarMensagem(message, type);
            return;
        }
        
        // Fallback: criar toast temporário
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        
        switch (type) {
            case 'success':
                toast.style.background = 'rgba(40, 167, 69, 0.95)';
                toast.style.color = 'white';
                toast.innerHTML = `✅ ${message}`;
                break;
            case 'warning':
                toast.style.background = 'rgba(255, 193, 7, 0.95)';
                toast.style.color = '#333';
                toast.innerHTML = `⚠️ ${message}`;
                break;
            case 'error':
                toast.style.background = 'rgba(220, 53, 69, 0.95)';
                toast.style.color = 'white';
                toast.innerHTML = `❌ ${message}`;
                break;
        }
        
        document.body.appendChild(toast);
        
        // Remover após 4 segundos
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

// Exportar para uso global
window.AutoSave = AutoSave;

// Inicializar automaticamente
AutoSave.init();
