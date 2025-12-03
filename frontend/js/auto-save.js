/**
 * ============================================================
 * AUTO-SAVE - Salvamento Automático Local
 * ============================================================
 * Salva respostas do formulário no localStorage automaticamente
 * para recuperação em caso de queda de conexão ou fechamento acidental
 * 
 * FUNCIONALIDADES:
 * - Salva automaticamente a cada alteração de campo
 * - Restaura dados ao carregar a página
 * - Limpa dados após envio bem-sucedido
 * - Indicador visual de status do auto-save
 * - Debounce para evitar salvamentos excessivos
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
        
        // Criar indicador visual
        this._createStatusIndicator();
        
        // Verificar se há dados salvos e perguntar se deseja restaurar
        this._checkAndRestore();
        
        // Adicionar listeners para todos os campos do formulário
        this._attachFieldListeners(form);
        
        // Salvar antes de fechar a página
        window.addEventListener('beforeunload', (e) => {
            if (this._hasUnsavedData()) {
                this._saveNow();
                // Não mostra confirmação se já salvou
            }
        });
        
        this._initialized = true;
        console.log('✅ AutoSave inicializado');
    },
    
    // ============================================================
    // INDICADOR VISUAL
    // ============================================================
    
    /**
     * Cria o indicador visual de status do auto-save
     */
    _createStatusIndicator() {
        // Verificar se já existe
        if (document.getElementById('autosave-indicator')) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'autosave-indicator';
        indicator.innerHTML = `
            <span class="autosave-icon">💾</span>
            <span class="autosave-text">Auto-save ativo</span>
        `;
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(40, 167, 69, 0.95);
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            opacity: 0.9;
        `;
        
        document.body.appendChild(indicator);
    },
    
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
        
        // Coletar inputs de texto/número
        form.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"]').forEach(input => {
            if (input.name && input.value) {
                data.fields[input.name] = input.value;
            }
        });
        
        // Coletar textareas
        form.querySelectorAll('textarea').forEach(textarea => {
            if (textarea.name && textarea.value) {
                data.fields[textarea.name] = textarea.value;
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
        
        // Coletar selects
        form.querySelectorAll('select').forEach(select => {
            if (select.name) {
                if (select.multiple) {
                    // Select múltiplo: salvar array de valores
                    data.selects[select.name] = Array.from(select.selectedOptions).map(opt => opt.value);
                } else {
                    // Select simples
                    data.selects[select.name] = select.value;
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
    // RESTAURAÇÃO
    // ============================================================
    
    /**
     * Verifica se há dados salvos e pergunta se deseja restaurar
     */
    _checkAndRestore() {
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        const savedTimestamp = localStorage.getItem(this.TIMESTAMP_KEY);
        
        if (!savedData) return;
        
        try {
            const data = JSON.parse(savedData);
            const timestamp = savedTimestamp ? new Date(savedTimestamp) : null;
            
            // Verificar se os dados são recentes (menos de 7 dias)
            if (timestamp) {
                const daysDiff = (new Date() - timestamp) / (1000 * 60 * 60 * 24);
                if (daysDiff > 7) {
                    console.log('⏰ AutoSave: Dados expirados (> 7 dias), removendo...');
                    this.clear();
                    return;
                }
            }
            
            // Verificar se há dados significativos
            const hasData = Object.keys(data.fields || {}).length > 0 ||
                           Object.keys(data.radios || {}).length > 0 ||
                           Object.keys(data.selects || {}).length > 0;
            
            if (!hasData) return;
            
            // Formatar data/hora para exibição
            const formattedDate = timestamp ? timestamp.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'data desconhecida';
            
            // Mostrar modal de confirmação
            this._showRestoreModal(formattedDate, () => {
                this._restoreData(data);
            });
            
        } catch (error) {
            console.error('❌ AutoSave: Erro ao verificar dados salvos', error);
            this.clear();
        }
    },
    
    /**
     * Mostra modal perguntando se deseja restaurar dados
     */
    _showRestoreModal(timestamp, onConfirm) {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.id = 'autosave-restore-modal';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                text-align: center;
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                <h3 style="margin: 0 0 12px 0; color: #333; font-size: 20px;">
                    Rascunho Encontrado
                </h3>
                <p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">
                    Você tem respostas não enviadas salvas em:
                </p>
                <p style="color: #333; font-weight: 600; margin: 0 0 24px 0; font-size: 15px;">
                    ${timestamp}
                </p>
                <p style="color: #666; margin: 0 0 24px 0; font-size: 14px;">
                    Deseja restaurar essas respostas?
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button id="autosave-restore-yes" style="
                        background: #28a745;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background 0.2s;
                    ">
                        ✅ Sim, restaurar
                    </button>
                    <button id="autosave-restore-no" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background 0.2s;
                    ">
                        🗑️ Não, começar novo
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Event listeners
        document.getElementById('autosave-restore-yes').addEventListener('click', () => {
            overlay.remove();
            onConfirm();
        });
        
        document.getElementById('autosave-restore-no').addEventListener('click', () => {
            overlay.remove();
            this.clear();
            this._updateIndicator('cleared');
        });
    },
    
    /**
     * Restaura dados no formulário
     */
    _restoreData(data) {
        this._isRestoring = true;
        const form = document.getElementById('entrevista-form');
        if (!form) return;
        
        try {
            console.log('🔄 AutoSave: Restaurando dados...');
            
            // Restaurar campos de texto
            Object.entries(data.fields || {}).forEach(([name, value]) => {
                const field = form.querySelector(`[name="${name}"]`);
                if (field) {
                    field.value = value;
                    // Disparar evento para atualizar campos dependentes
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            
            // Restaurar radios
            Object.entries(data.radios || {}).forEach(([name, value]) => {
                const radio = form.querySelector(`input[type="radio"][name="${name}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            
            // Restaurar checkboxes
            Object.entries(data.checkboxes || {}).forEach(([name, values]) => {
                // Primeiro, desmarcar todos
                form.querySelectorAll(`input[type="checkbox"][name="${name}"]`).forEach(cb => {
                    cb.checked = false;
                });
                // Depois, marcar os salvos
                values.forEach(value => {
                    const checkbox = form.querySelector(`input[type="checkbox"][name="${name}"][value="${value}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            });
            
            // Restaurar selects (com delay para garantir que options foram carregadas)
            setTimeout(() => {
                Object.entries(data.selects || {}).forEach(([name, value]) => {
                    const select = form.querySelector(`select[name="${name}"]`);
                    if (select) {
                        if (Array.isArray(value)) {
                            // Select múltiplo
                            Array.from(select.options).forEach(opt => {
                                opt.selected = value.includes(opt.value);
                            });
                        } else {
                            select.value = value;
                        }
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
                
                this._isRestoring = false;
                this._updateIndicator('restored');
                console.log('✅ AutoSave: Dados restaurados com sucesso');
                
            }, 500); // Aguardar dropdowns carregarem
            
        } catch (error) {
            console.error('❌ AutoSave: Erro ao restaurar dados', error);
            this._isRestoring = false;
        }
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
    }
};

// Exportar para uso global
window.AutoSave = AutoSave;

// Inicializar automaticamente
AutoSave.init();
