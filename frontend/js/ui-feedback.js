/**
 * ============================================================
 * UI-FEEDBACK - Sistema de Mensagens e Modais
 * ============================================================
 * Gerencia TODA a interface visual do sistema
 * Modais, mensagens, navegação, feedback
 * 
 * NÃO MANIPULA DADOS DO BANCO DIRETAMENTE
 * 
 * Responsável por:
 * - Exibir modais de sucesso/erro/loading
 * - Mostrar mensagens de validação
 * - Navegação entre páginas (formulário, analytics, instruções)
 * - Carregar analytics
 * 
 * Recebe dados de:
 * - FormCollector → após submit bem-sucedido
 * - FormValidator → após validação com erros
 * - IntegrationCNPJ → após consulta CNPJ
 * - CoreAPI → após erro de conexão/banco
 */

const UIFeedback = {
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
                            <p>� <strong>Relatório PDF gerado:</strong> ${arquivo}</p>
                            <p>💾 O download começará automaticamente em instantes.</p>
                            <p>🎨 O relatório contém o cabeçalho padrão PLI e todas as respostas formatadas.</p>
                        </div>
                        <button onclick="fecharFeedback()" class="btn-primary">OK, Entendi</button>
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
                        <button onclick="fecharFeedback(); UIFeedback.scrollToFirstError()" class="btn-primary">Ver Primeiro Erro</button>
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
                            <button onclick="fecharFeedback()" class="btn-primary">Fechar</button>
                        </div>
                    `
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
        
        // Adicionar event listeners aos botões após inserir no DOM
        this.adicionarEventListenersBotoes(modal);
    },
    
    /**
     * Adiciona event listeners aos botões do modal
     */
    adicionarEventListenersBotoes(modal) {
        // Encontrar todos os botões que devem fechar o modal
        const botoes = modal.querySelectorAll('button[onclick*="fecharFeedback"], button[onclick*="fecharModal"]');
        
        botoes.forEach(botao => {
            // Remover onclick inline para evitar conflitos
            const onclickAttr = botao.getAttribute('onclick');
            botao.removeAttribute('onclick');
            
            // Adicionar event listener
            botao.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🖱️ Botão clicado:', botao.textContent.trim());
                
                // Executar ações especiais se houver
                if (onclickAttr && onclickAttr.includes('scrollToFirstError')) {
                    this.scrollToFirstError();
                }
                
                // Fechar modal
                this.fecharModal();
            });
        });
        
        console.log(`✅ ${botoes.length} botões configurados com event listeners`);
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
    // SCROLL TO ERROR (migrado de FormValidator)
    // ============================================================
    
    /**
     * Rola até o primeiro campo com erro
     */
    scrollToFirstError() {
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
            const kpis = await CoreAPI.getKPIs();
            
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
window.UIFeedback = UIFeedback;
// Compatibilidade com código antigo
window.UI = UIFeedback;

// Atalhos para funções legadas (compatibilidade)
window.mostrarFeedback = (html) => UIFeedback.mostrarModal(html);
window.fecharFeedback = () => UIFeedback.fecharModal();

/**
 * ============================================================
 * NAVEGAÇÃO ENTRE PÁGINAS
 * ============================================================
 * Função global para alternar entre as 5 páginas do sistema
 */
window.showPage = function(pageId) {
    console.log(`🔄 Navegando para: ${pageId}`);
    
    // Esconder todas as páginas
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Mostrar página selecionada
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
        console.log(`✅ Página ${pageId} ativada`);
    } else {
        console.error(`❌ Página não encontrada: page-${pageId}`);
    }
    
    // Atualizar botões de navegação
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Ativar botão correspondente
    const activeBtn = document.querySelector(`.nav-btn[onclick="showPage('${pageId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Inicializar página específica se necessário
    if (pageId === 'respostas' && window.PageRespostas) {
        setTimeout(() => window.PageRespostas.init(), 100);
    } else if (pageId === 'analytics' && window.PageAnalytics) {
        setTimeout(() => window.PageAnalytics.init(), 100);
    }
};

console.log('✅ UIFeedback + showPage carregados');
