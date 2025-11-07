/**
 * ============================================================
 * PAGE-ANALYTICS - Análise de Dados com Gráficos
 * ============================================================
 * Consome endpoints de analytics e renderiza KPIs + gráficos
 */

const PageAnalytics = {
    charts: {},
    
    /**
     * Inicializa a página de analytics
     */
    async init() {
        console.log('📊 Inicializando página de analytics...');
        await this.carregarTodosDados();
    },
    
    /**
     * Carrega todos os dados de analytics
     */
    async carregarTodosDados() {
        try {
            // Carregar KPIs
            await this.carregarKPIs();
            
            // Carregar gráficos em paralelo
            await Promise.all([
                this.carregarGraficoModal(),
                this.carregarGraficoProdutos(),
                this.carregarGraficoTipoTransporte(),
                this.carregarGraficoImportancias(),
                this.carregarGraficoFrequencia(),
                this.carregarGraficoDificuldades()
            ]);
            
            console.log('✅ Todos os dados de analytics carregados');
            
        } catch (error) {
            console.error('❌ Erro ao carregar analytics:', error);
        }
    },
    
    /**
     * Carrega e renderiza KPIs
     */
    async carregarKPIs() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/kpis');
            const kpis = response.data;
            
            const container = document.getElementById('kpi-container');
            if (!container) return;
            
            container.innerHTML = `
                <div class="kpi-card">
                    <div class="kpi-icon">📋</div>
                    <div class="kpi-content">
                        <div class="kpi-label">Total de Pesquisas</div>
                        <div class="kpi-value">${kpis.total_pesquisas || 0}</div>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-icon">🏢</div>
                    <div class="kpi-content">
                        <div class="kpi-label">Empresas Cadastradas</div>
                        <div class="kpi-value">${kpis.total_empresas || 0}</div>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-icon">📦</div>
                    <div class="kpi-content">
                        <div class="kpi-label">Produtos Diferentes</div>
                        <div class="kpi-value">${kpis.total_produtos_unicos || 0}</div>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-icon">🚚</div>
                    <div class="kpi-content">
                        <div class="kpi-label">Distância Média (km)</div>
                        <div class="kpi-value">${kpis.distancia_media ? kpis.distancia_media.toFixed(1) : '0'}</div>
                    </div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-icon">💰</div>
                    <div class="kpi-content">
                        <div class="kpi-label">Custo Médio (R$)</div>
                        <div class="kpi-value">${kpis.custo_medio ? 'R$ ' + kpis.custo_medio.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 0,00'}</div>
                    </div>
                </div>
            `;
            
            console.log('✅ KPIs renderizados');
            
        } catch (error) {
            console.error('❌ Erro ao carregar KPIs:', error);
        }
    },
    
    /**
     * Carrega gráfico de distribuição modal
     */
    async carregarGraficoModal() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/distribuicao-modal');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico modal');
                return;
            }
            
            const ctx = document.getElementById('chart-modal');
            if (!ctx) return;
            
            // Destruir gráfico anterior se existir
            if (this.charts.modal) {
                this.charts.modal.destroy();
            }
            
            this.charts.modal = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Distribuição Modal',
                        data: data.values,
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Distribuição por Modal de Transporte'
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico modal renderizado');
            
        } catch (error) {
            console.error('❌ Erro ao carregar gráfico modal:', error);
        }
    },
    
    /**
     * Carrega gráfico de produtos top
     */
    async carregarGraficoProdutos() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/produtos-top?limit=10');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico de produtos');
                return;
            }
            
            const ctx = document.getElementById('chart-produtos');
            if (!ctx) return;
            
            if (this.charts.produtos) {
                this.charts.produtos.destroy();
            }
            
            this.charts.produtos = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Número de Pesquisas',
                        data: data.values,
                        backgroundColor: '#36A2EB'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Top 10 Produtos Mais Transportados'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico produtos renderizado');
            
        } catch (error) {
            console.error('❌ Erro ao carregar gráfico de produtos:', error);
        }
    },
    
    /**
     * Carrega gráfico de tipo de transporte
     */
    async carregarGraficoTipoTransporte() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/tipo-transporte');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico tipo transporte');
                return;
            }
            
            const ctx = document.getElementById('chart-embalagem'); // Reutilizando canvas
            if (!ctx) return;
            
            if (this.charts.tipoTransporte) {
                this.charts.tipoTransporte.destroy();
            }
            
            this.charts.tipoTransporte = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Tipo de Transporte',
                        data: data.values,
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Tipo de Transporte (Importação/Exportação/Local)'
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico tipo transporte renderizado');
            
        } catch (error) {
            console.error('❌ Erro ao carregar gráfico tipo transporte:', error);
        }
    },
    
    /**
     * Carrega gráfico de importâncias
     */
    async carregarGraficoImportancias() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/importancias');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico importâncias');
                return;
            }
            
            const ctx = document.getElementById('chart-fatores');
            if (!ctx) return;
            
            if (this.charts.importancias) {
                this.charts.importancias.destroy();
            }
            
            this.charts.importancias = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Muito Importante (%)',
                        data: data.muito_importante,
                        borderColor: '#FF6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)'
                    }, {
                        label: 'Importante (%)',
                        data: data.importante,
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Importância dos Fatores de Decisão'
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico importâncias renderizado');
            
        } catch (error) {
            console.error('❌ Erro ao carregar gráfico importâncias:', error);
        }
    },
    
    /**
     * Carrega gráfico de frequência
     */
    async carregarGraficoFrequencia() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/frequencia');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico frequência');
                return;
            }
            
            const ctx = document.getElementById('chart-frequencia');
            if (!ctx) return;
            
            if (this.charts.frequencia) {
                this.charts.frequencia.destroy();
            }
            
            this.charts.frequencia = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Número de Pesquisas',
                        data: data.values,
                        backgroundColor: '#9966FF'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Frequência de Transporte'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico frequência renderizado');
            
        } catch (error) {
            console.error('❌ Erro ao carregar gráfico frequência:', error);
        }
    },
    
    /**
     * Carrega gráfico de dificuldades
     */
    async carregarGraficoDificuldades() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/dificuldades');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico dificuldades');
                return;
            }
            
            const ctx = document.getElementById('chart-dificuldades');
            if (!ctx) return;
            
            if (this.charts.dificuldades) {
                this.charts.dificuldades.destroy();
            }
            
            this.charts.dificuldades = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Número de Menções',
                        data: data.values,
                        backgroundColor: '#FF9F40'
                    }]
                },
                options: {
                    responsive: true,
                    indexAxis: 'y', // Barras horizontais
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Principais Dificuldades Logísticas'
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico dificuldades renderizado');
            
        } catch (error) {
            console.error('❌ Erro ao carregar gráfico dificuldades:', error);
        }
    }
};

// Exportar para uso global
window.PageAnalytics = PageAnalytics;

console.log('✅ PageAnalytics carregado');

