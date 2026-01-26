/**
 * ============================================================
 * PAGE-ANALYTICS - Análise de Dados com Gráficos
 * ============================================================
 * Consome endpoints de analytics e renderiza KPIs + gráficos
 * FOCO: Variáveis NUMÉRICAS (custo, distância, peso, capacidade)
 * Paleta de cores: Azul Escuro (#1e3a5f, #2563eb, #3b82f6)
 */

const PageAnalytics = {
    charts: {},
    
    // Paleta de cores azul escuro
    cores: {
        primaria: '#1e3a5f',
        secundaria: '#2563eb',
        terciaria: '#3b82f6',
        quaternaria: '#60a5fa',
        paleta: [
            '#0d1b2a', '#1e3a5f', '#1e4976', '#2563eb', 
            '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd',
            '#1e3a8a', '#1e40af', '#dbeafe', '#eff6ff'
        ],
        gradient: ['#1e3a5f', '#0d1b2a']
    },
    
    /**
     * Inicializa a página de analytics
     */
    async init() {
        console.log('📊 Inicializando página de analytics (NUMÉRICO)...');
        await this.carregarTodosDados();
    },
    
    /**
     * Carrega todos os dados de analytics - FOCO NUMÉRICO
     */
    async carregarTodosDados() {
        try {
            // Carregar KPIs
            await this.carregarKPIs();
            
            // Carregar gráficos em paralelo - Todos com variáveis NUMÉRICAS
            await Promise.all([
                this.carregarGraficoVolumePorProduto(),     // 1: Peso (kg) por produto
                this.carregarGraficoCustoPorEstado(),       // 2: Custo (R$) por estado origem
                this.carregarGraficoDistribuicaoDistancia(),// 3: Histograma distância (km)
                this.carregarGraficoImportanciaFatores(),   // 4: Spider - Importância fatores
                this.carregarGraficoCapacidadePorModal(),   // 5: Capacidade (%) por modal
                this.carregarGraficoCustoDistancia(),       // 6: Scatter custo x distância
                this.carregarGraficoValorPorTipo(),         // 7: Valor (R$) por tipo transporte
                this.carregarGraficoDistribuicaoModal()     // 8: Doughnut - Distribuição por modal
            ]);
            
            console.log('✅ Todos os dados de analytics carregados');
            
        } catch (error) {
            console.error('❌ Erro ao carregar analytics:', error);
        }
    },
    
    /**
     * Formata número como moeda brasileira
     */
    formatarMoeda(valor) {
        if (!valor || isNaN(valor)) return 'R$ 0';
        return 'R$ ' + valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    },
    
    /**
     * Formata número com sufixo (mil, mi)
     */
    formatarNumero(valor) {
        if (!valor || isNaN(valor)) return '0';
        if (valor >= 1000000) return (valor / 1000000).toFixed(1) + ' mi';
        if (valor >= 1000) return (valor / 1000).toFixed(1) + ' mil';
        return valor.toLocaleString('pt-BR');
    },
    
    /**
     * Carrega e renderiza KPIs - Métricas NUMÉRICAS
     */
    async carregarKPIs() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/kpis');
            const kpis = response.data;
            
            const container = document.getElementById('kpi-container');
            if (!container) return;
            
            container.innerHTML = `
                <div class="kpi-card">
                    <div class="kpi-icon"><i class="fas fa-clipboard-list"></i></div>
                    <div class="kpi-label">Total de Pesquisas</div>
                    <div class="kpi-value">${kpis.total_pesquisas || 0}</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-icon"><i class="fas fa-box"></i></div>
                    <div class="kpi-label">Volume Total</div>
                    <div class="kpi-value">${this.formatarNumero(kpis.volume_total_kg)} kg</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-icon"><i class="fas fa-dollar-sign"></i></div>
                    <div class="kpi-label">Custo Total</div>
                    <div class="kpi-value">${this.formatarMoeda(kpis.custo_total)}</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-icon"><i class="fas fa-truck"></i></div>
                    <div class="kpi-label">Distância Média</div>
                    <div class="kpi-value">${kpis.distancia_media ? kpis.distancia_media.toFixed(0) + ' km' : '0 km'}</div>
                </div>
                
                <div class="kpi-card">
                    <div class="kpi-icon"><i class="fas fa-tachometer-alt"></i></div>
                    <div class="kpi-label">Capacidade Média</div>
                    <div class="kpi-value">${kpis.capacidade_media ? kpis.capacidade_media.toFixed(0) + '%' : '0%'}</div>
                </div>
            `;
            
            console.log('✅ KPIs renderizados');
            
        } catch (error) {
            console.error('❌ Erro ao carregar KPIs:', error);
            const container = document.getElementById('kpi-container');
            if (container) {
                container.innerHTML = '<div class="error-message">❌ Erro ao carregar KPIs</div>';
            }
        }
    },
    
    /**
     * GRÁFICO 1: Volume (Peso) por Produto - Barras Horizontais
     * Mostra SUM(peso_carga) agrupado por produto_principal
     */
    async carregarGraficoVolumePorProduto() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/volume-por-produto?limit=10');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico volume por produto');
                return;
            }
            
            const ctx = document.getElementById('chart-modal');
            if (!ctx) return;
            
            if (this.charts.volumeProduto) this.charts.volumeProduto.destroy();
            
            this.charts.volumeProduto = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Volume (kg)',
                        data: data.volumes,
                        backgroundColor: this.cores.paleta,
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const idx = ctx.dataIndex;
                                    return [
                                        `Volume: ${this.formatarNumero(ctx.raw)} kg`,
                                        `Viagens: ${data.viagens[idx]}`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: { display: true, text: 'Peso Total (kg)', color: '#374151' },
                            grid: { color: '#f3f4f6' },
                            ticks: {
                                callback: (v) => this.formatarNumero(v)
                            }
                        },
                        y: { grid: { display: false } }
                    }
                }
            });
            
            console.log('✅ Gráfico Volume por Produto renderizado');
            
        } catch (error) {
            console.error('❌ Erro gráfico volume por produto:', error);
        }
    },
    
    /**
     * GRÁFICO 2: Custo Total por Estado de Origem - Barras Verticais
     * Mostra SUM(custo_transporte) agrupado por origem_estado_nome
     */
    async carregarGraficoCustoPorEstado() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/custo-por-estado?limit=10');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico custo por estado');
                return;
            }
            
            const ctx = document.getElementById('chart-produtos');
            if (!ctx) return;
            
            if (this.charts.custoPorEstado) this.charts.custoPorEstado.destroy();
            
            this.charts.custoPorEstado = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Custo Total (R$)',
                        data: data.custos,
                        backgroundColor: '#1e3a5f',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const idx = ctx.dataIndex;
                                    return [
                                        `Custo Total: ${this.formatarMoeda(ctx.raw)}`,
                                        `Custo Médio: ${this.formatarMoeda(data.medios[idx])}`,
                                        `Viagens: ${data.viagens[idx]}`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Custo Total (R$)', color: '#374151' },
                            grid: { color: '#f3f4f6' },
                            ticks: {
                                callback: (v) => this.formatarMoeda(v)
                            }
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico Custo por Estado renderizado');
            
        } catch (error) {
            console.error('❌ Erro gráfico custo por estado:', error);
        }
    },
    
    /**
     * GRÁFICO 3: Distribuição de Distância - Histograma
     * Mostra quantidade de viagens por faixa de distância (km)
     */
    async carregarGraficoDistribuicaoDistancia() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/distribuicao-distancia');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para histograma de distância');
                return;
            }
            
            const ctx = document.getElementById('chart-estados');
            if (!ctx) return;
            
            if (this.charts.distanciaHistograma) this.charts.distanciaHistograma.destroy();
            
            this.charts.distanciaHistograma = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Número de Viagens',
                        data: data.quantidades,
                        backgroundColor: '#2563eb',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const idx = ctx.dataIndex;
                                    return [
                                        `Viagens: ${ctx.raw}`,
                                        `Média: ${data.medias[idx]} km`,
                                        `Custo Faixa: ${this.formatarMoeda(data.custos[idx])}`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Faixa de Distância', color: '#374151' },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Quantidade de Viagens', color: '#374151' },
                            grid: { color: '#f3f4f6' }
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico Distribuição de Distância renderizado');
            
        } catch (error) {
            console.error('❌ Erro gráfico distribuição distância:', error);
        }
    },
    
    /**
     * GRÁFICO 4: Capacidade Utilizada por Modal - Barras Horizontais
     * Mostra AVG(capacidade_utilizada) por modal de transporte
     */
    async carregarGraficoCapacidadePorModal() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/capacidade-por-modal');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico capacidade por modal');
                return;
            }
            
            const ctx = document.getElementById('chart-fatores');
            if (!ctx) return;
            
            if (this.charts.capacidadeModal) this.charts.capacidadeModal.destroy();
            
            this.charts.capacidadeModal = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Capacidade Média (%)',
                        data: data.capacidades,
                        backgroundColor: this.cores.paleta.slice(0, data.labels.length),
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const idx = ctx.dataIndex;
                                    return [
                                        `Capacidade Média: ${ctx.raw.toFixed(1)}%`,
                                        `Viagens: ${data.viagens[idx]}`,
                                        `Volume: ${this.formatarNumero(data.volumes[idx])} kg`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            max: 100,
                            title: { display: true, text: 'Capacidade Utilizada (%)', color: '#374151' },
                            grid: { color: '#f3f4f6' },
                            ticks: {
                                callback: (v) => v + '%'
                            }
                        },
                        y: { grid: { display: false } }
                    }
                }
            });
            
            console.log('✅ Gráfico Capacidade por Modal renderizado');
            
        } catch (error) {
            console.error('❌ Erro gráfico capacidade por modal:', error);
        }
    },
    
    /**
     * GRÁFICO 5: Custo vs Distância - Scatter Plot
     * Mostra a relação entre custo_transporte e distancia
     */
    async carregarGraficoCustoDistancia() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/custo-distancia');
            const data = response.data;
            
            const ctx = document.getElementById('chart-dificuldades');
            if (!ctx) return;
            
            if (this.charts.custoDistancia) this.charts.custoDistancia.destroy();
            
            const pontos = data.pontos || [];
            
            if (pontos.length === 0) {
                ctx.parentElement.innerHTML += '<p style="text-align:center;color:#6b7280;margin-top:1rem;">Sem dados suficientes para este gráfico</p>';
                return;
            }
            
            this.charts.custoDistancia = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Custo x Distância',
                        data: pontos,
                        backgroundColor: 'rgba(30, 58, 95, 0.6)',
                        borderColor: '#1e3a5f',
                        pointRadius: 8,
                        pointHoverRadius: 12
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const ponto = ctx.raw;
                                    return [
                                        `Empresa: ${ponto.empresa || 'N/A'}`,
                                        `Produto: ${ponto.produto || 'N/A'}`,
                                        `Distância: ${ponto.x.toFixed(0)} km`,
                                        `Custo: ${this.formatarMoeda(ponto.y)}`,
                                        `Custo/km: ${this.formatarMoeda(ponto.custo_km)}`
                                    ];
                                }
                            }
                        },
                        subtitle: {
                            display: true,
                            text: `Custo médio: ${this.formatarMoeda(data.custo_medio_por_km || 0)}/km`,
                            color: '#6b7280',
                            padding: { bottom: 10 }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Distância (km)', color: '#374151' },
                            grid: { color: '#f3f4f6' }
                        },
                        y: {
                            title: { display: true, text: 'Custo (R$)', color: '#374151' },
                            grid: { color: '#f3f4f6' },
                            ticks: {
                                callback: (v) => this.formatarMoeda(v)
                            }
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico Custo vs Distância renderizado');
            
        } catch (error) {
            console.error('❌ Erro gráfico custo-distância:', error);
        }
    },
    
    /**
     * GRÁFICO 6: Valor de Carga por Tipo de Transporte - Barras
     * Mostra SUM(valor_carga) por tipo_transporte (local/importação/exportação)
     */
    async carregarGraficoValorPorTipo() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/valor-por-tipo');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico valor por tipo');
                return;
            }
            
            const ctx = document.getElementById('chart-custo-distancia');
            if (!ctx) return;
            
            if (this.charts.valorTipo) this.charts.valorTipo.destroy();
            
            this.charts.valorTipo = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Valor de Carga (R$)',
                        data: data.valores,
                        backgroundColor: ['#1e3a5f', '#2563eb', '#3b82f6'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const idx = ctx.dataIndex;
                                    return [
                                        `Valor Total: ${this.formatarMoeda(ctx.raw)}`,
                                        `Valor Médio: ${this.formatarMoeda(data.medios[idx])}`,
                                        `Viagens: ${data.viagens[idx]}`,
                                        `Volume: ${this.formatarNumero(data.volumes[idx])} kg`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Tipo de Transporte', color: '#374151' },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Valor de Carga (R$)', color: '#374151' },
                            grid: { color: '#f3f4f6' },
                            ticks: {
                                callback: (v) => this.formatarMoeda(v)
                            }
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico Valor por Tipo renderizado');
            
        } catch (error) {
            console.error('❌ Erro gráfico valor por tipo:', error);
        }
    },
    
    /**
     * GRÁFICO SPIDER: Importância dos Fatores Logísticos
     * Mostra % de respondentes que consideram cada fator "muito importante"
     */
    async carregarGraficoImportanciaFatores() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/importancias');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico spider de importâncias');
                return;
            }
            
            const ctx = document.getElementById('chart-spider');
            if (!ctx) return;
            
            if (this.charts.spider) this.charts.spider.destroy();
            
            this.charts.spider = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Muito Importante (%)',
                        data: data.muito_importante,
                        backgroundColor: 'rgba(30, 58, 95, 0.3)',  // #1e3a5f com 30% opacidade
                        borderColor: '#1e3a5f',
                        borderWidth: 2,
                        pointBackgroundColor: '#2563eb',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#1e3a5f',
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => `${ctx.raw.toFixed(1)}% consideram muito importante`
                            }
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                callback: (v) => v + '%'
                            },
                            pointLabels: {
                                font: { size: 12, weight: 'bold' },
                                color: '#374151'
                            },
                            grid: {
                                color: '#e5e7eb'
                            },
                            angleLines: {
                                color: '#e5e7eb'
                            }
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico Spider de Importâncias renderizado');
            
        } catch (error) {
            console.error('❌ Erro gráfico spider importâncias:', error);
        }
    },
    
    /**
     * GRÁFICO 8: Distribuição por Modal de Transporte - Doughnut
     * Mostra a quantidade de viagens por modal (Rodoviário, Ferroviário, etc.)
     */
    async carregarGraficoDistribuicaoModal() {
        try {
            const response = await window.CoreAPI.get('/api/analytics/capacidade-por-modal');
            const data = response.data;
            
            if (!data.labels || data.labels.length === 0) {
                console.warn('⚠️ Sem dados para gráfico distribuição modal');
                return;
            }
            
            const ctx = document.getElementById('chart-modal-dist');
            if (!ctx) return;
            
            if (this.charts.modalDist) this.charts.modalDist.destroy();
            
            this.charts.modalDist = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.labels,
                    datasets: [{
                        data: data.viagens,
                        backgroundColor: [
                            '#0d1b2a', '#1e3a5f', '#1e4976', '#2563eb', 
                            '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            display: true,
                            position: 'right',
                            labels: {
                                font: { size: 12 },
                                padding: 15
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                    const pct = ((ctx.raw / total) * 100).toFixed(1);
                                    return `${ctx.label}: ${ctx.raw} viagens (${pct}%)`;
                                }
                            }
                        }
                    },
                    cutout: '50%'
                }
            });
            
            console.log('✅ Gráfico Distribuição Modal renderizado');
            
        } catch (error) {
            console.error('❌ Erro gráfico distribuição modal:', error);
        }
    }
};

// Exportar para uso global
window.PageAnalytics = PageAnalytics;

console.log('✅ PageAnalytics carregado (NUMÉRICO)');
