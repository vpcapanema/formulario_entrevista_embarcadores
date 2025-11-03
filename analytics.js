// Analytics e Exportação

// Carregar página de analytics
async function loadAnalytics() {
    try {
        const respostas = await dbManager.getAllRespostas();
        
        if (respostas.length === 0) {
            document.getElementById('kpi-container').innerHTML = '<div class="empty-state">📭 Nenhum dado disponível para análise.</div>';
            return;
        }
        
        // Calcular KPIs
        displayKPIs(respostas);
        
        // Criar gráficos
        createCharts(respostas);
        
    } catch (error) {
        console.error('Erro ao carregar analytics:', error);
    }
}

// Exibir KPIs
function displayKPIs(respostas) {
    const totalEmpresas = respostas.length;
    
    // Volume total transportado
    let volumeTotal = 0;
    respostas.forEach(r => {
        const peso = parseFloat(r.pesoCarga) || 0;
        const unidade = r.unidadePeso;
        const pesoEmToneladas = unidade === 'kg' ? peso / 1000 : peso;
        volumeTotal += pesoEmToneladas;
    });
    
    // Valor total movimentado
    const valorTotal = respostas.reduce((sum, r) => sum + (parseFloat(r.valorCarga) || 0), 0);
    
    // Distância média
    const distanciaMedia = respostas.reduce((sum, r) => sum + (parseFloat(r.distancia) || 0), 0) / totalEmpresas;
    
    // Taxa de multimodalidade
    const multimodais = respostas.filter(r => r.modos && r.modos.length > 1).length;
    const taxaMultimodal = (multimodais / totalEmpresas) * 100;
    
    const html = `
        <div class="kpi-card">
            <div class="kpi-icon">🏢</div>
            <div class="kpi-content">
                <div class="kpi-value">${totalEmpresas}</div>
                <div class="kpi-label">Empresas Entrevistadas</div>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon">📦</div>
            <div class="kpi-content">
                <div class="kpi-value">${volumeTotal.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</div>
                <div class="kpi-label">Toneladas Transportadas</div>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon">💰</div>
            <div class="kpi-content">
                <div class="kpi-value">R$ ${(valorTotal / 1000000).toLocaleString('pt-BR', {maximumFractionDigits: 1})}M</div>
                <div class="kpi-label">Valor Total Movimentado</div>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon">📏</div>
            <div class="kpi-content">
                <div class="kpi-value">${distanciaMedia.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</div>
                <div class="kpi-label">Distância Média (km)</div>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon">🔄</div>
            <div class="kpi-content">
                <div class="kpi-value">${taxaMultimodal.toFixed(1)}%</div>
                <div class="kpi-label">Taxa de Multimodalidade</div>
            </div>
        </div>
    `;
    
    document.getElementById('kpi-container').innerHTML = html;
}

// Criar todos os gráficos
function createCharts(respostas) {
    createModalChart(respostas);
    createProdutosChart(respostas);
    createFatoresChart(respostas);
    createEmbalagemChart(respostas);
    createDificuldadesChart(respostas);
    createSensibilidadeChart(respostas);
    createCustoModalChart(respostas);
    createOcupacaoChart(respostas);
    createFrequenciaChart(respostas);
    createCadeiaChart(respostas);
    createAlternativosChart(respostas);
    createDistanciaChart(respostas);
}

// Gráfico de Distribuição Modal
function createModalChart(respostas) {
    const modoCount = {};
    
    respostas.forEach(r => {
        if (r.modos) {
            r.modos.forEach(modo => {
                modoCount[modo] = (modoCount[modo] || 0) + 1;
            });
        }
    });
    
    const ctx = document.getElementById('chart-modal');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(modoCount),
            datasets: [{
                data: Object.values(modoCount),
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
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Gráfico de Top 10 Produtos
function createProdutosChart(respostas) {
    const produtoCount = {};
    
    respostas.forEach(r => {
        const produto = r.agrupamentoProduto || 'Não informado';
        produtoCount[produto] = (produtoCount[produto] || 0) + 1;
    });
    
    // Ordenar e pegar top 10
    const sorted = Object.entries(produtoCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const ctx = document.getElementById('chart-produtos');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(x => x[0]),
            datasets: [{
                label: 'Quantidade',
                data: sorted.map(x => x[1]),
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Gráfico de Fatores de Decisão
function createFatoresChart(respostas) {
    const fatores = ['Custo', 'Tempo', 'Confiabilidade', 'Segurança', 'Capacidade'];
    const importanciaMap = {
        'muito-alta': 5,
        'alta': 4,
        'media': 3,
        'baixa': 2,
        'muito-baixa': 1
    };
    
    const medias = fatores.map((fator, i) => {
        const campo = ['importanciaCusto', 'importanciaTempo', 'importanciaConfiabilidade', 
                       'importanciaSeguranca', 'importanciaCapacidade'][i];
        
        const valores = respostas.map(r => importanciaMap[r[campo]] || 0);
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        return media;
    });
    
    const ctx = document.getElementById('chart-fatores');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: fatores,
            datasets: [{
                label: 'Importância Média',
                data: medias,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: '#36A2EB',
                pointBackgroundColor: '#36A2EB',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Gráfico de Tipo de Embalagem
function createEmbalagemChart(respostas) {
    const embalagemCount = {};
    
    respostas.forEach(r => {
        const embalagem = r.tipoEmbalagem || 'Não informado';
        embalagemCount[embalagem] = (embalagemCount[embalagem] || 0) + 1;
    });
    
    const ctx = document.getElementById('chart-embalagem');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(embalagemCount),
            datasets: [{
                data: Object.values(embalagemCount),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FF6384',
                    '#C9CBCF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Gráfico de Dificuldades
function createDificuldadesChart(respostas) {
    const dificuldadeCount = {};
    
    respostas.forEach(r => {
        if (r.dificuldades) {
            r.dificuldades.forEach(dif => {
                dificuldadeCount[dif] = (dificuldadeCount[dif] || 0) + 1;
            });
        }
    });
    
    // Ordenar por quantidade
    const sorted = Object.entries(dificuldadeCount)
        .sort((a, b) => b[1] - a[1]);
    
    const ctx = document.getElementById('chart-dificuldades');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(x => x[0]),
            datasets: [{
                label: 'Citações',
                data: sorted.map(x => x[1]),
                backgroundColor: '#FF6384'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Gráfico de Sensibilidade a Mudanças
function createSensibilidadeChart(respostas) {
    const fatores = ['Custo', 'Tempo', 'Confiabilidade', 'Segurança', 'Capacidade'];
    
    const medias = fatores.map((fator, i) => {
        const campo = ['variacaoCusto', 'variacaoTempo', 'variacaoConfiabilidade', 
                       'variacaoSeguranca', 'variacaoCapacidade'][i];
        
        const valores = respostas.map(r => parseFloat(r[campo]) || 0);
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        return media;
    });
    
    const ctx = document.getElementById('chart-sensibilidade');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: fatores,
            datasets: [{
                label: 'Variação % Média',
                data: medias,
                backgroundColor: '#4BC0C0'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de Custo por Modalidade
function createCustoModalChart(respostas) {
    const custosPorModal = {};
    const pesosPorModal = {};
    
    respostas.forEach(r => {
        if (r.modos && r.custoTransporte && r.pesoCarga) {
            const custo = parseFloat(r.custoTransporte);
            let peso = parseFloat(r.pesoCarga);
            if (r.unidadePeso === 'kg') peso = peso / 1000;
            
            r.modos.forEach(modo => {
                if (!custosPorModal[modo]) {
                    custosPorModal[modo] = [];
                    pesosPorModal[modo] = [];
                }
                custosPorModal[modo].push(custo);
                pesosPorModal[modo].push(peso);
            });
        }
    });
    
    const labels = Object.keys(custosPorModal);
    const custoMedio = labels.map(modo => {
        const custos = custosPorModal[modo];
        const pesos = pesosPorModal[modo];
        
        let totalCustoPorTon = 0;
        for (let i = 0; i < custos.length; i++) {
            if (pesos[i] > 0) {
                totalCustoPorTon += custos[i] / pesos[i];
            }
        }
        return totalCustoPorTon / custos.length;
    });
    
    const ctx = document.getElementById('chart-custo-modal');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'R$/tonelada',
                data: custoMedio,
                backgroundColor: '#9966FF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de Taxa de Ocupação
function createOcupacaoChart(respostas) {
    const ocupacaoPorModal = {};
    
    respostas.forEach(r => {
        if (r.modos && r.capacidadeUtilizada) {
            const ocupacao = parseFloat(r.capacidadeUtilizada);
            
            r.modos.forEach(modo => {
                if (!ocupacaoPorModal[modo]) {
                    ocupacaoPorModal[modo] = [];
                }
                ocupacaoPorModal[modo].push(ocupacao);
            });
        }
    });
    
    const labels = Object.keys(ocupacaoPorModal);
    const ocupacaoMedia = labels.map(modo => {
        const valores = ocupacaoPorModal[modo];
        return valores.reduce((a, b) => a + b, 0) / valores.length;
    });
    
    const ctx = document.getElementById('chart-ocupacao');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ocupação Média (%)',
                data: ocupacaoMedia,
                backgroundColor: '#FFCE56'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de Frequência
function createFrequenciaChart(respostas) {
    const frequenciaCount = {};
    
    respostas.forEach(r => {
        const freq = r.frequencia || 'Não informado';
        frequenciaCount[freq] = (frequenciaCount[freq] || 0) + 1;
    });
    
    const ctx = document.getElementById('chart-frequencia');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(frequenciaCount),
            datasets: [{
                data: Object.values(frequenciaCount),
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
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Gráfico de Tipo de Cadeia
function createCadeiaChart(respostas) {
    const cadeiaCount = {};
    
    respostas.forEach(r => {
        const cadeia = r.tipoCadeia || 'Não informado';
        cadeiaCount[cadeia] = (cadeiaCount[cadeia] || 0) + 1;
    });
    
    const ctx = document.getElementById('chart-cadeia');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(cadeiaCount),
            datasets: [{
                data: Object.values(cadeiaCount),
                backgroundColor: [
                    '#4BC0C0',
                    '#FF9F40',
                    '#C9CBCF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Gráfico de Modais Alternativos
function createAlternativosChart(respostas) {
    const alternativoCount = {};
    
    respostas.forEach(r => {
        if (r.modaisAlternativos) {
            r.modaisAlternativos.forEach(modal => {
                alternativoCount[modal] = (alternativoCount[modal] || 0) + 1;
            });
        }
    });
    
    const ctx = document.getElementById('chart-alternativos');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(alternativoCount),
            datasets: [{
                label: 'Quantidade',
                data: Object.values(alternativoCount),
                backgroundColor: '#FF9F40'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Gráfico de Distância Média por Modalidade
function createDistanciaChart(respostas) {
    const distanciaPorModal = {};
    
    respostas.forEach(r => {
        if (r.modos && r.distancia) {
            const distancia = parseFloat(r.distancia);
            
            r.modos.forEach(modo => {
                if (!distanciaPorModal[modo]) {
                    distanciaPorModal[modo] = [];
                }
                distanciaPorModal[modo].push(distancia);
            });
        }
    });
    
    const labels = Object.keys(distanciaPorModal);
    const distanciaMedia = labels.map(modo => {
        const valores = distanciaPorModal[modo];
        return valores.reduce((a, b) => a + b, 0) / valores.length;
    });
    
    const ctx = document.getElementById('chart-distancia');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distância Média (km)',
                data: distanciaMedia,
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Continua no próximo arquivo com exportações...
