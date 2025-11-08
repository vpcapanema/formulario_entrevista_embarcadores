/**
 * ============================================================
 * PAGE-RESPOSTAS - Listagem de Pesquisas Salvas
 * ============================================================
 * Gerencia a exibição, filtro e exportação de pesquisas
 */

const PageRespostas = {
    pesquisas: [],
    filteredPesquisas: [],
    
    /**
     * Inicializa a página de respostas
     */
    async init() {
        console.log('📋 Inicializando página de respostas...');
        await this.carregarPesquisas();
        this.setupEventListeners();
    },
    
    /**
     * Carrega todas as pesquisas do backend
     */
    async carregarPesquisas() {
        try {
            const container = document.getElementById('respostas-list');
            if (!container) {
                console.error('❌ Container respostas-list não encontrado');
                return;
            }
            
            container.innerHTML = '<div class="loading">⏳ Carregando pesquisas...</div>';
            
            // Buscar pesquisas do backend
            const response = await window.CoreAPI.get('/api/pesquisas/listar?limit=1000');
            
            if (!response || !response.data) {
                throw new Error('Resposta inválida do servidor');
            }
            
            this.pesquisas = response.data;
            this.filteredPesquisas = [...this.pesquisas];
            
            console.log(`✅ ${this.pesquisas.length} pesquisas carregadas`);
            this.renderizarPesquisas();
            
        } catch (error) {
            console.error('❌ Erro ao carregar pesquisas:', error);
            const container = document.getElementById('respostas-list');
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        <h3>❌ Erro ao carregar pesquisas</h3>
                        <p>${error.message}</p>
                        <button onclick="PageRespostas.carregarPesquisas()" class="btn-primary">
                            🔄 Tentar novamente
                        </button>
                    </div>
                `;
            }
        }
    },
    
    /**
     * Renderiza a lista de pesquisas
     */
    renderizarPesquisas() {
        const container = document.getElementById('respostas-list');
        if (!container) return;
        
        if (this.filteredPesquisas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>📭 Nenhuma pesquisa encontrada</h3>
                    <p>Ainda não há pesquisas cadastradas ou os filtros não retornaram resultados.</p>
                    <button onclick="showPage('formulario')" class="btn-primary">
                        ➕ Cadastrar primeira pesquisa
                    </button>
                </div>
            `;
            return;
        }
        
        // Criar tabela de pesquisas
        const html = `
            <div class="pesquisas-summary">
                <p>Total: <strong>${this.filteredPesquisas.length}</strong> pesquisa(s)</p>
            </div>
            
            <div class="table-responsive">
                <table class="pesquisas-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Data</th>
                            <th>Empresa</th>
                            <th>Entrevistado</th>
                            <th>Produto</th>
                            <th>Origem</th>
                            <th>Destino</th>
                            <th>Distância (km)</th>
                            <th>Tipo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.filteredPesquisas.map(p => this.renderizarLinhaPesquisa(p)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = html;
    },
    
    /**
     * Renderiza uma linha da tabela de pesquisas
     */
    renderizarLinhaPesquisa(pesquisa) {
        const data = new Date(pesquisa.data_entrevista).toLocaleDateString('pt-BR');
        const distancia = pesquisa.distancia ? pesquisa.distancia.toFixed(1) : '-';
        
        return `
            <tr class="pesquisa-row" data-id="${pesquisa.id_pesquisa}">
                <td class="id-cell">#${pesquisa.id_pesquisa}</td>
                <td>${data}</td>
                <td class="empresa-cell">${this.truncate(pesquisa.empresa_razao_social, 30)}</td>
                <td>${this.truncate(pesquisa.entrevistado_nome, 25)}</td>
                <td>${this.truncate(pesquisa.produto_principal, 20)}</td>
                <td class="cidade-cell">
                    ${pesquisa.origem_municipio}/${pesquisa.origem_estado}
                </td>
                <td class="cidade-cell">
                    ${pesquisa.destino_municipio}/${pesquisa.destino_estado}
                </td>
                <td class="number-cell">${distancia}</td>
                <td>
                    <span class="badge badge-${this.getTipoTransporteColor(pesquisa.tipo_transporte)}">
                        ${this.getTipoTransporteLabel(pesquisa.tipo_transporte)}
                    </span>
                </td>
                <td class="actions-cell">
                    <button 
                        class="btn-icon" 
                        onclick="PageRespostas.visualizarPesquisa(${pesquisa.id_pesquisa})"
                        title="Visualizar detalhes">
                        👁️
                    </button>
                    <button 
                        class="btn-icon" 
                        onclick="PageRespostas.exportarPesquisa(${pesquisa.id_pesquisa})"
                        title="Exportar Excel">
                        📊
                    </button>
                    <button 
                        class="btn-icon btn-danger" 
                        onclick="PageRespostas.deletarPesquisa(${pesquisa.id_pesquisa})"
                        title="Deletar">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    },
    
    /**
     * Visualiza detalhes de uma pesquisa
     */
    async visualizarPesquisa(idPesquisa) {
        try {
            console.log(`👁️ Visualizando pesquisa ${idPesquisa}...`);
            
            // Buscar detalhes da pesquisa
            const response = await window.CoreAPI.get(`/api/pesquisas/${idPesquisa}`);
            const pesquisa = response.data;
            
            // Buscar produtos
            const produtosResponse = await window.CoreAPI.get(`/api/pesquisas/${idPesquisa}/produtos`);
            const produtos = produtosResponse.data;
            
            // Abrir modal com detalhes
            this.mostrarModalDetalhes(pesquisa, produtos);
            
        } catch (error) {
            console.error('❌ Erro ao visualizar pesquisa:', error);
            alert('Erro ao carregar detalhes da pesquisa: ' + error.message);
        }
    },
    
    /**
     * Mostra modal com detalhes da pesquisa
     */
    mostrarModalDetalhes(pesquisa, produtos) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>📋 Pesquisa #${pesquisa.id_pesquisa}</h2>
                    <button class="btn-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                
                <div class="modal-body">
                    <!-- Empresa -->
                    <div class="detail-section">
                        <h3>🏢 Empresa</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Razão Social:</label>
                                <span>${pesquisa.empresa_razao_social}</span>
                            </div>
                            <div class="detail-item">
                                <label>Tipo:</label>
                                <span>${pesquisa.empresa_tipo}</span>
                            </div>
                            <div class="detail-item">
                                <label>CNPJ:</label>
                                <span>${pesquisa.empresa_cnpj || 'Não informado'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Município:</label>
                                <span>${pesquisa.empresa_municipio}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Entrevistado -->
                    <div class="detail-section">
                        <h3>👤 Entrevistado</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Nome:</label>
                                <span>${pesquisa.entrevistado_nome}</span>
                            </div>
                            <div class="detail-item">
                                <label>Função:</label>
                                <span>${pesquisa.entrevistado_funcao}</span>
                            </div>
                            <div class="detail-item">
                                <label>Telefone:</label>
                                <span>${pesquisa.entrevistado_telefone}</span>
                            </div>
                            <div class="detail-item">
                                <label>Email:</label>
                                <span>${pesquisa.entrevistado_email}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Produtos -->
                    ${produtos.length > 0 ? `
                    <div class="detail-section">
                        <h3>📦 Produtos Transportados (${produtos.length})</h3>
                        <table class="produtos-detalhes-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Movimentação (ton/ano)</th>
                                    <th>Origem</th>
                                    <th>Destino</th>
                                    <th>Distância (km)</th>
                                    <th>Modal</th>
                                    <th>Acondicionamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${produtos.map(p => `
                                <tr>
                                    <td>${p.carga}</td>
                                    <td class="number-cell">${p.movimentacao ? p.movimentacao.toLocaleString('pt-BR') : '-'}</td>
                                    <td>${p.origem || '-'}</td>
                                    <td>${p.destino || '-'}</td>
                                    <td class="number-cell">${p.distancia ? p.distancia.toFixed(1) : '-'}</td>
                                    <td>${p.modalidade || '-'}</td>
                                    <td>${p.acondicionamento || '-'}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ` : ''}
                    
                    <!-- Transporte -->
                    <div class="detail-section">
                        <h3>🚚 Transporte</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Produto Principal:</label>
                                <span>${pesquisa.produto_principal}</span>
                            </div>
                            <div class="detail-item">
                                <label>Tipo:</label>
                                <span>${this.getTipoTransporteLabel(pesquisa.tipo_transporte)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Origem:</label>
                                <span>${pesquisa.origem_municipio}/${pesquisa.origem_estado} - ${pesquisa.origem_pais}</span>
                            </div>
                            <div class="detail-item">
                                <label>Destino:</label>
                                <span>${pesquisa.destino_municipio}/${pesquisa.destino_estado} - ${pesquisa.destino_pais}</span>
                            </div>
                            <div class="detail-item">
                                <label>Distância:</label>
                                <span>${pesquisa.distancia.toFixed(1)} km</span>
                            </div>
                            <div class="detail-item">
                                <label>Modais:</label>
                                <span>${pesquisa.modos.join(', ')}</span>
                            </div>
                            <div class="detail-item">
                                <label>Peso da Carga:</label>
                                <span>${pesquisa.peso_carga.toLocaleString('pt-BR')} ${pesquisa.unidade_peso}</span>
                            </div>
                            <div class="detail-item">
                                <label>Custo:</label>
                                <span>R$ ${pesquisa.custo_transporte.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Fechar</button>
                    <button class="btn-primary" onclick="PageRespostas.exportarPesquisa(${pesquisa.id_pesquisa})">
                        📊 Exportar Excel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    /**
     * Exporta pesquisa para Excel
     */
    async exportarPesquisa(idPesquisa) {
        try {
            console.log(`📊 Exportando pesquisa ${idPesquisa}...`);
            
            // Buscar detalhes da pesquisa
            const response = await window.CoreAPI.get(`/api/pesquisas/${idPesquisa}`);
            const pesquisa = response.data;
            
            // Buscar produtos
            const produtosResponse = await window.CoreAPI.get(`/api/pesquisas/${idPesquisa}/produtos`);
            const produtos = produtosResponse.data;
            
            // Gerar Excel usando XLSX
            const wb = XLSX.utils.book_new();
            
            // Aba 1: Dados principais
            const dadosPrincipais = [[
                'Campo', 'Valor'
            ]];
            
            // Adicionar todos os campos
            Object.keys(pesquisa).forEach(key => {
                const value = pesquisa[key];
                if (value !== null && value !== undefined) {
                    dadosPrincipais.push([key, String(value)]);
                }
            });
            
            const ws1 = XLSX.utils.aoa_to_sheet(dadosPrincipais);
            XLSX.utils.book_append_sheet(wb, ws1, "Dados Principais");
            
            // Aba 2: Produtos
            if (produtos.length > 0) {
                const ws2 = XLSX.utils.json_to_sheet(produtos);
                XLSX.utils.book_append_sheet(wb, ws2, "Produtos");
            }
            
            // Download
            const filename = `PLI2050_Pesquisa_${idPesquisa}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            console.log(`✅ Excel gerado: ${filename}`);
            
        } catch (error) {
            console.error('❌ Erro ao exportar pesquisa:', error);
            alert('Erro ao exportar pesquisa: ' + error.message);
        }
    },
    
    /**
     * Deleta uma pesquisa
     */
    async deletarPesquisa(idPesquisa) {
        if (!confirm(`Tem certeza que deseja deletar a pesquisa #${idPesquisa}?\n\nEsta ação não pode ser desfeita.`)) {
            return;
        }
        
        try {
            console.log(`🗑️ Deletando pesquisa ${idPesquisa}...`);
            
            await window.CoreAPI.delete(`/api/pesquisas/${idPesquisa}`);
            
            console.log(`✅ Pesquisa ${idPesquisa} deletada com sucesso`);
            alert('Pesquisa deletada com sucesso!');
            
            // Recarregar lista
            await this.carregarPesquisas();
            
        } catch (error) {
            console.error('❌ Erro ao deletar pesquisa:', error);
            alert('Erro ao deletar pesquisa: ' + error.message);
        }
    },
    
    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Implementar filtros futuramente
    },
    
    /**
     * Utilitários
     */
    truncate(text, maxLength) {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },
    
    getTipoTransporteLabel(tipo) {
        const labels = {
            'importacao': 'Importação',
            'exportacao': 'Exportação',
            'local': 'Local',
            'nao-sei': 'Não sei'
        };
        return labels[tipo] || tipo;
    },
    
    getTipoTransporteColor(tipo) {
        const colors = {
            'importacao': 'blue',
            'exportacao': 'green',
            'local': 'orange',
            'nao-sei': 'gray'
        };
        return colors[tipo] || 'gray';
    }
};

// Exportar para uso global
window.PageRespostas = PageRespostas;

console.log('✅ PageRespostas carregado');

