// =====================================================
// SCRIPT DE TESTE DA API
// =====================================================

const API_URL = 'http://localhost:3000';

async function testarAPI() {
    console.log('═'.repeat(60));
    console.log('🧪 TESTANDO API DO SISTEMA PLI 2050');
    console.log('═'.repeat(60));
    console.log(`📡 URL: ${API_URL}\n`);
    
    const testes = [
        {
            nome: 'Health Check',
            metodo: 'GET',
            endpoint: '/health',
            esperado: { status: 'OK', database: 'Connected' }
        },
        {
            nome: 'Listar Instituições',
            metodo: 'GET',
            endpoint: '/api/instituicoes',
            validacao: (data) => Array.isArray(data) && data.length > 0
        },
        {
            nome: 'Listar Estados',
            metodo: 'GET',
            endpoint: '/api/estados',
            validacao: (data) => Array.isArray(data) && data.length === 27
        },
        {
            nome: 'Listar Países',
            metodo: 'GET',
            endpoint: '/api/paises',
            validacao: (data) => Array.isArray(data) && data.length > 0
        },
        {
            nome: 'Listar Municípios SP',
            metodo: 'GET',
            endpoint: '/api/municipios',
            validacao: (data) => Array.isArray(data) && data.length > 0
        },
        {
            nome: 'Listar Funções',
            metodo: 'GET',
            endpoint: '/api/funcoes',
            validacao: (data) => Array.isArray(data) && data.length > 0
        },
        {
            nome: 'Listar Entrevistadores',
            metodo: 'GET',
            endpoint: '/api/entrevistadores',
            validacao: (data) => Array.isArray(data)
        },
        {
            nome: 'Listar Empresas',
            metodo: 'GET',
            endpoint: '/api/empresas',
            validacao: (data) => Array.isArray(data)
        },
        {
            nome: 'Listar Pesquisas',
            metodo: 'GET',
            endpoint: '/api/pesquisas',
            validacao: (data) => Array.isArray(data)
        },
        {
            nome: 'KPIs Analytics',
            metodo: 'GET',
            endpoint: '/api/analytics/kpis',
            validacao: (data) => typeof data === 'object'
        }
    ];
    
    let sucessos = 0;
    let falhas = 0;
    
    for (const teste of testes) {
        try {
            const response = await fetch(`${API_URL}${teste.endpoint}`, {
                method: teste.metodo
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            let passou = true;
            if (teste.validacao) {
                passou = teste.validacao(data);
            } else if (teste.esperado) {
                passou = data.status === teste.esperado.status;
            }
            
            if (passou) {
                console.log(`✅ ${teste.nome}`);
                if (Array.isArray(data)) {
                    console.log(`   → ${data.length} registro(s) encontrado(s)`);
                }
                sucessos++;
            } else {
                console.log(`❌ ${teste.nome} - Validação falhou`);
                falhas++;
            }
            
        } catch (error) {
            console.log(`❌ ${teste.nome} - ${error.message}`);
            falhas++;
        }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESULTADO DOS TESTES');
    console.log('═'.repeat(60));
    console.log(`✅ Sucessos: ${sucessos}/${testes.length}`);
    console.log(`❌ Falhas: ${falhas}/${testes.length}`);
    console.log(`📈 Taxa de Sucesso: ${Math.round((sucessos/testes.length)*100)}%`);
    console.log('═'.repeat(60));
    
    if (falhas === 0) {
        console.log('🎉 TODOS OS TESTES PASSARAM! API FUNCIONANDO PERFEITAMENTE!\n');
    } else {
        console.log('⚠️  Alguns testes falharam. Verifique os erros acima.\n');
    }
}

// Executar testes
testarAPI().catch(error => {
    console.error('❌ Erro fatal ao executar testes:', error);
    process.exit(1);
});
