/**
 * ============================================================
 * UI MANAGER - PLI 2050
 * ============================================================
 * Gerencia TODA a interface visual do sistema
 * Modais, mensagens, navegação, feedback, validação visual
 * 
 * PRINCÍPIO: UI pura - NÃO faz validação de negócio
 * Backend valida, frontend apenas exibe resultados
 */

const UI = {
    // ============================================================
    // MENSAGENS DE FEEDBACK
    // ============================================================
    
    MENSAGENS: {
        sucesso: {
            salvamento: {
                titulo: '✅ Resposta Salva com Sucesso!',
                corpo: (nomeEmpresa, arquivo) => `
                    <div class="feedback-success">
                        <div class="feedback-icon">✅</div>
                        <h3>✅ Resposta Salva com Sucesso!</h3>
                        <p>A resposta da empresa <strong>${nomeEmpresa}</strong> foi salva no banco de dados PostgreSQL.</p>
                        <div class="feedback-details">
                            <p>📊 <strong>Arquivo gerado:</strong> ${arquivo}</p>
                            <p>💾 O download começará automaticamente em instantes.</p>
                        </div>
                        <button onclick="UI.fecharModal()" class="btn-primary">OK, Entendi</button>
                    </div>
                `
            }
        },
        erro: {
            validacao: {
                titulo: '⚠️ Campos Obrigatórios Não Preenchidos',
                corpo: (quantidade) => `
                    <div class="feedback-warning">
                        <div class="feedback-icon">⚠️</div>
                        <h3>⚠️ Campos Obrigatórios Não Preenchidos</h3>
                        <p>Foram encontrados <strong>${quantidade} ${quantidade === 1 ? 'campo' : 'campos'}</strong> obrigatório(s) não preenchido(s).</p>
                        <div class="feedback-instrucoes">
                            <p>📋 <strong>O que fazer:</strong></p>
                            <ul>
                                <li>Os campos com erro estão destacados em <span class="error-highlight">vermelho</span></li>
                                <li>Role a página até o primeiro campo marcado</li>
                                <li>Preencha todos os campos obrigatórios (marcados com *)</li>
                                <li>Tente salvar novamente</li>
                            </ul>
                        </div>
                        <button onclick="UI.fecharModal(); UI.scrollToFirstError()" class="btn-primary">Ver Primeiro Erro</button>
                    </div>
                `
            },
            conexao: {
                titulo: '❌ Erro de Conexão',
                corpo: (detalhes) => `
                    <div class="feedback-error">
                        <div class="feedback-icon">❌</div>
                        <h3>❌ Erro de Conexão</h3>
                        <p>Não foi possível conectar ao servidor de dados.</p>
                        <div class="feedback-details">
                            <p><strong>Detalhes técnicos:</strong></p>
                            <pre>${detalhes}</pre>
                            <p><strong>Possíveis causas:</strong></p>
                            <ul>
                                <li>Servidor backend não está rodando (porta 8000)</li>
                                <li>Problema na conexão com o banco de dados PostgreSQL</li>
                                <li>Firewall bloqueando a conexão</li>
                            </ul>
                            <p><strong>Solução:</strong></p>
                            <p>1. Verifique se o backend está rodando: <code>uvicorn main:app --reload</code></p>
                            <p>2. Verifique a conexão com o PostgreSQL (RDS AWS)</p>
                            <p>3. Tente novamente</p>
                        </div>
                        <button onclick="UI.fecharModal()" class="btn-primary">Fechar</button>
                    </div>
                `
            },
            banco: {
                titulo: '❌ Erro ao Salvar no Banco de Dados',
                corpo: (erro) => {
                    let mensagemAmigavel = '';
                    let solucao = '';
                    
                    if (erro.includes('duplicate key') || erro.includes('unique') || erro.includes('409')) {
                        mensagemAmigavel = 'Já existe um registro com estes dados (CNPJ ou email duplicado).';
                        solucao = 'Verifique se esta resposta já foi cadastrada anteriormente.';
                    } else if (erro.includes('foreign key') || erro.includes('violates') || erro.includes('FK')) {
                        mensagemAmigavel = 'Há um problema com os dados selecionados nas listas.';
                        solucao = 'Tente selecionar novamente o país, estado ou município.';
                    } else if (erro.includes('null value') || erro.includes('not-null') || erro.includes('required')) {
                        mensagemAmigavel = 'Faltam dados obrigatórios para salvar.';
                        solucao = 'Verifique se todos os campos obrigatórios estão preenchidos.';
                    } else if (erro.includes('connection') || erro.includes('timeout') || erro.includes('503')) {
                        mensagemAmigavel = 'Tempo de conexão excedido com o banco de dados.';
                        solucao = 'Verifique a conexão de rede e tente novamente.';
                    } else {
                        mensagemAmigavel = 'Ocorreu um erro inesperado ao salvar.';
                        solucao = 'Entre em contato com o suporte técnico informando o erro abaixo.';
                    }
                    
                    return `
                        <div class="feedback-error">
                            <div class="feedback-icon">❌</div>
                            <h3>❌ Erro ao Salvar no Banco de Dados</h3>
                            <p><strong>${mensagemAmigavel}</strong></p>
                            <div class="feedback-solucao">
                                <p>💡 <strong>Solução sugerida:</strong></p>
                                <p>${solucao}</p>
                            </div>
                            <details class="feedback-technical">
                                <summary>🔧 Detalhes técnicos (para suporte)</summary>
                                <pre>${JSON.stringify(erro, null, 2)}</pre>
                            </details>
                            <button onclick="UI.fecharModal()" class="btn-primary">Fechar</button>
                        </div>
                    `;
                }
            }
        }
    },
    
    // ============================================================
    // MODAL DE FEEDBACK
    // ============================================================
    
    /**
     * Exibe modal com mensagem HTML
     */
    mostrarModal(html) {
        let modal = document.getElementById('feedback-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'feedback-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        modal.innerHTML = html;
        modal.classList.add('active');
    },
    
    /**
     * Fecha modal de feedback
     */
    fecharModal() {
        const modal = document.getElementById('feedback-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    /**
     * Exibe mensagem de sucesso
     */
    mostrarSucesso(nomeEmpresa, arquivo) {
        this.mostrarModal(this.MENSAGENS.sucesso.salvamento.corpo(nomeEmpresa, arquivo));
    },
    
    /**
     * Exibe erro de validação
     */
    mostrarErroValidacao(quantidade) {
        this.mostrarModal(this.MENSAGENS.erro.validacao.corpo(quantidade));
    },
    
    /**
     * Exibe erro de conexão
     */
    mostrarErroConexao(detalhes) {
        this.mostrarModal(this.MENSAGENS.erro.conexao.corpo(detalhes));
    },
    
    /**
     * Exibe erro do banco
     */
    mostrarErroBanco(erro) {
        this.mostrarModal(this.MENSAGENS.erro.banco.corpo(erro));
    },
    
    // ============================================================
    // VALIDAÇÃO VISUAL
    // ============================================================
    
    /**
     * Destaca campos inválidos com borda vermelha
     */
    highlightInvalidFields(fieldIds) {
        // Limpar highlights anteriores
        document.querySelectorAll('.invalid').forEach(el => {
            el.classList.remove('invalid');
        });
        
        // Adicionar highlight aos campos inválidos
        fieldIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('invalid');
                
                // Adicionar listener para remover highlight ao corrigir
                element.addEventListener('input', function handler() {
                    element.classList.remove('invalid');
                    element.removeEventListener('input', handler);
                }, { once: true });
            }
        });
    },
    
    /**
     * Rola até o primeiro campo com erro
     */
    scrollToFirstError() {
        const firstInvalid = document.querySelector('.invalid');
        if (firstInvalid) {
            firstInvalid.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            firstInvalid.focus();
        }
    },
    
    /**
     * Valida visualmente campos obrigatórios vazios
     * ATENÇÃO: Validação apenas visual - backend faz validação real
     */
    validateRequiredFields() {
        const requiredFields = document.querySelectorAll('[required]');
        const invalidIds = [];
        
        requiredFields.forEach(field => {
            if (!field.value || field.value.trim() === '') {
                invalidIds.push(field.id);
            }
        });
        
        if (invalidIds.length > 0) {
            this.highlightInvalidFields(invalidIds);
            this.mostrarErroValidacao(invalidIds.length);
            return false;
        }
        
        return true;
    },
    
    // ============================================================
    // LOADING INDICATOR
    // ============================================================
    
    /**
     * Mostra indicador de carregamento
     */
    mostrarLoading(mensagem = 'Enviando dados...') {
        const html = `
            <div class="feedback-loading">
                <div class="spinner"></div>
                <p>${mensagem}</p>
            </div>
        `;
        this.mostrarModal(html);
    },
    
    /**
     * Esconde loading
     */
    esconderLoading() {
        this.fecharModal();
    },
    
    // ============================================================
    // POPULAÇÃO DE DROPDOWNS
    // ============================================================
    
    /**
     * Popula dropdown com opções
     */
    populateDropdown(selectId, items, valueKey, labelKey) {
        const select = document.getElementById(selectId);
        if (!select) {
            console.error(`Select ${selectId} não encontrado`);
            return;
        }
        
        // Limpar opções existentes (exceto a primeira - placeholder)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Adicionar novas opções
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = item[labelKey];
            select.appendChild(option);
        });
        
        console.log(`✅ ${items.length} opções carregadas em ${selectId}`);
    },
    
    /**
     * Carrega todas as listas auxiliares do backend
     * OTIMIZADO: Municípios carregados SOB DEMANDA quando UF é selecionada
     */
    async carregarListas() {
        try {
            // Carregar apenas listas fixas (sem municípios ainda)
            const [estados, paises, funcoes, entrevistadores] = await Promise.all([
                API.getEstados(),
                API.getPaises(),
                API.getFuncoes(),
                API.getEntrevistadores()
            ]);
            
            // Popular dropdowns de origem e destino (Q12 e Q13)
            this.populateDropdown('origem-pais', paises, 'id_pais', 'nm_pais', 31); // Brasil pré-selecionado
            this.populateDropdown('destino-pais', paises, 'id_pais', 'nm_pais', 31); // Brasil pré-selecionado
            
            // Popular dropdown de função
            this.populateDropdown('funcao-entrevistado', funcoes, 'id_funcao', 'nome_funcao');
            this.populateDropdown('id-entrevistador', entrevistadores, 'id_entrevistador', 'nome_completo');
            
            // Configurar listeners para Q12 e Q13 (origem/destino)
            this.setupOrigemDestinoFilters();
            
            console.log('✅ Todas as listas auxiliares carregadas');
        } catch (error) {
            console.error('❌ Erro ao carregar listas:', error);
            this.mostrarErroConexao(error.message);
        }
    },
    
    /**
     * Configura filtros dinâmicos para Q12 (Origem) e Q13 (Destino)
     * REGRAS:
     * - País: OBRIGATÓRIO
     * - Se Brasil: Estado OBRIGATÓRIO, Município OPCIONAL
     * - Se outro país: Ocultar Estado e Município
     */
    setupOrigemDestinoFilters() {
        // ===== Q12: ORIGEM =====
        const origemPaisSelect = document.getElementById('origem-pais');
        const origemEstadoGroup = document.getElementById('origem-estado')?.closest('.form-group');
        const origemEstadoSelect = document.getElementById('origem-estado');
        const origemMunicipioGroup = document.getElementById('origem-municipio')?.closest('.form-group');
        const origemMunicipioSelect = document.getElementById('origem-municipio');
        
        if (origemPaisSelect) {
            origemPaisSelect.addEventListener('change', async (e) => {
                const idPais = parseInt(e.target.value);
                
                if (idPais === 31) { // Brasil
                    // Mostrar estado (obrigatório) e município (opcional)
                    if (origemEstadoGroup) origemEstadoGroup.style.display = 'block';
                    if (origemEstadoSelect) {
                        origemEstadoSelect.setAttribute('required', 'required');
                        // Carregar estados
                        const estados = await API.getEstados();
                        this.populateDropdown('origem-estado', estados, 'sigla_uf', 'nm_uf');
                    }
                    if (origemMunicipioGroup) origemMunicipioGroup.style.display = 'block';
                } else {
                    // Outro país: ocultar estado e município
                    if (origemEstadoGroup) origemEstadoGroup.style.display = 'none';
                    if (origemEstadoSelect) {
                        origemEstadoSelect.removeAttribute('required');
                        origemEstadoSelect.value = '';
                    }
                    if (origemMunicipioGroup) origemMunicipioGroup.style.display = 'none';
                    if (origemMunicipioSelect) origemMunicipioSelect.value = '';
                }
            });
            
            // Executar na inicialização (Brasil pré-selecionado)
            origemPaisSelect.dispatchEvent(new Event('change'));
        }
        
        // Estado → Municípios (Origem)
        if (origemEstadoSelect && origemMunicipioSelect) {
            origemEstadoSelect.addEventListener('change', async (e) => {
                const uf = e.target.value;
                if (uf) {
                    console.log(`🔍 Carregando municípios de ${uf} (origem)...`);
                    try {
                        const municipios = await API.getMunicipiosByUF(uf);
                        this.populateDropdown('origem-municipio', municipios, 'cd_mun', 'nm_mun');
                        console.log(`✅ ${municipios.length} municípios de ${uf} carregados (origem)`);
                    } catch (error) {
                        console.error('❌ Erro ao carregar municípios:', error);
                    }
                } else {
                    origemMunicipioSelect.innerHTML = '<option value="">Primeiro selecione o estado</option>';
                }
            });
        }
        
        // ===== Q13: DESTINO =====
        const destinoPaisSelect = document.getElementById('destino-pais');
        const destinoEstadoGroup = document.getElementById('destino-estado')?.closest('.form-group');
        const destinoEstadoSelect = document.getElementById('destino-estado');
        const destinoMunicipioGroup = document.getElementById('destino-municipio')?.closest('.form-group');
        const destinoMunicipioSelect = document.getElementById('destino-municipio');
        
        if (destinoPaisSelect) {
            destinoPaisSelect.addEventListener('change', async (e) => {
                const idPais = parseInt(e.target.value);
                
                if (idPais === 31) { // Brasil
                    // Mostrar estado (obrigatório) e município (opcional)
                    if (destinoEstadoGroup) destinoEstadoGroup.style.display = 'block';
                    if (destinoEstadoSelect) {
                        destinoEstadoSelect.setAttribute('required', 'required');
                        // Carregar estados
                        const estados = await API.getEstados();
                        this.populateDropdown('destino-estado', estados, 'sigla_uf', 'nm_uf');
                    }
                    if (destinoMunicipioGroup) destinoMunicipioGroup.style.display = 'block';
                } else {
                    // Outro país: ocultar estado e município
                    if (destinoEstadoGroup) destinoEstadoGroup.style.display = 'none';
                    if (destinoEstadoSelect) {
                        destinoEstadoSelect.removeAttribute('required');
                        destinoEstadoSelect.value = '';
                    }
                    if (destinoMunicipioGroup) destinoMunicipioGroup.style.display = 'none';
                    if (destinoMunicipioSelect) destinoMunicipioSelect.value = '';
                }
            });
            
            // Executar na inicialização (Brasil pré-selecionado)
            destinoPaisSelect.dispatchEvent(new Event('change'));
        }
        
        // Estado → Municípios (Destino)
        if (destinoEstadoSelect && destinoMunicipioSelect) {
            destinoEstadoSelect.addEventListener('change', async (e) => {
                const uf = e.target.value;
                if (uf) {
                    console.log(`🔍 Carregando municípios de ${uf} (destino)...`);
                    try {
                        const municipios = await API.getMunicipiosByUF(uf);
                        this.populateDropdown('destino-municipio', municipios, 'cd_mun', 'nm_mun');
                        console.log(`✅ ${municipios.length} municípios de ${uf} carregados (destino)`);
                    } catch (error) {
                        console.error('❌ Erro ao carregar municípios:', error);
                    }
                } else {
                    destinoMunicipioSelect.innerHTML = '<option value="">Primeiro selecione o estado</option>';
                }
            });
        }
    },
    
    /**
     * Configura filtros dinâmicos de municípios por UF (DEPRECATED - usar setupOrigemDestinoFilters)
     */
    setupMunicipioFilters() {
        // Mantido para compatibilidade, mas não é mais usado
        console.warn('⚠️ setupMunicipioFilters() está deprecated. Use setupOrigemDestinoFilters()');
    },
    
    // ============================================================
    // NAVEGAÇÃO ENTRE PÁGINAS
    // ============================================================
    
    /**
     * Mostra página específica e esconde as outras
     */
    showPage(pageName) {
        // Esconder todas as páginas
        document.querySelectorAll('.page-content').forEach(page => {
            page.style.display = 'none';
        });
        
        // Mostrar página selecionada
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.style.display = 'block';
        }
        
        // Atualizar menu ativo
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeMenuItem = document.querySelector(`[onclick*="${pageName}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
        
        // Se for página de analytics, carregar dados
        if (pageName === 'analytics') {
            this.loadAnalytics();
        }
    },
    
    // ============================================================
    // ANALYTICS (PLACEHOLDER - SERÁ IMPLEMENTADO)
    // ============================================================
    
    /**
     * Carrega dados de analytics do backend
     */
    async loadAnalytics() {
        try {
            this.mostrarLoading('Carregando analytics...');
            
            // Buscar KPIs do backend
            const kpis = await API.getKPIs();
            
            // Atualizar DOM com KPIs
            if (kpis.success) {
                document.getElementById('total-pesquisas').textContent = kpis.data.total_pesquisas;
                document.getElementById('total-empresas').textContent = kpis.data.total_empresas;
                document.getElementById('volume-total').textContent = kpis.data.volume_total.toLocaleString('pt-BR');
                document.getElementById('valor-total').textContent = kpis.data.valor_total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });
                document.getElementById('distancia-media').textContent = kpis.data.distancia_media.toFixed(0);
            }
            
            this.esconderLoading();
            console.log('✅ Analytics carregados');
        } catch (error) {
            this.esconderLoading();
            console.error('❌ Erro ao carregar analytics:', error);
        }
    },
    
    // ============================================================
    // RESET DE FORMULÁRIO
    // ============================================================
    
    /**
     * Limpa formulário após salvamento bem-sucedido
     */
    resetForm() {
        const form = document.getElementById('formulario-pesquisa');
        if (form) {
            form.reset();
            // Limpar highlights
            document.querySelectorAll('.invalid').forEach(el => {
                el.classList.remove('invalid');
            });
            console.log('✅ Formulário resetado');
        }
    }
};

// Exportar para uso global
window.UI = UI;

// Atalhos para funções legadas (compatibilidade)
window.mostrarFeedback = (html) => UI.mostrarModal(html);
window.fecharFeedback = () => UI.fecharModal();
