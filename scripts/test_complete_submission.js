/**
 * TESTE COMPLETO DE SUBMISSÃO DO FORMULÁRIO
 * Simula preenchimento e validação de todos os campos obrigatórios
 */

const BASE_URL = 'http://localhost:8000';

// Gerar CNPJ semi-aleatório válido (usa timestamp como sufixo)
function generateUniqueCNPJ() {
    // Usa base fixa + contador baseado em timestamp
    const suffix = (Date.now() % 9999).toString().padStart(4, '0');
    // CNPJ fictício mas com formato válido
    return `11.222.333/00${suffix}-01`;
}

// Payload de teste completo com TODOS os campos obrigatórios
const testPayload = {
    // SEÇÃO 1: Dados do Entrevistado
    nome: "João Silva",
    funcao: "Gerente de Logística",
    telefone: "(11) 98765-4321",
    email: "joao.silva@empresa.com.br",
    
    // SEÇÃO 2: Dados da Empresa
    tipoEmpresa: "industria",
    nomeEmpresa: "Empresa Teste Logística LTDA",
    razaoSocial: "Empresa Teste Logística LTDA",
    municipio: "São Paulo",
    cnpj: null,  // Sem CNPJ para este teste (campo opcional)
    nomeFantasia: "Teste Log",
    logradouro: "Rua Teste",
    numero: "123",
    complemento: "Sala 1",
    bairro: "Centro",
    cep: "01310-100",
    
    // SEÇÃO 3: Produtos Transportados
    produtos: [
        {
            carga: "Soja",
            movimentacao: 50000,
            origem: "Ribeirão Preto",
            destino: "Santos",
            distancia: 450.5,
            modalidade: "rodoviario",
            acondicionamento: "granel"
        }
    ],
    
    // SEÇÃO 4: Produto Principal
    produtoPrincipal: "Soja",
    agrupamentoProduto: "agricultura",
    
    // SEÇÃO 5: Características do Transporte
    tipoTransporte: "exportacao",
    origemPais: "Brasil",
    origemEstado: "SP",
    origemMunicipio: "3543402", // Ribeirão Preto
    destinoPais: "Brasil",
    destinoEstado: "SP",
    destinoMunicipio: "3548500", // Santos
    distancia: 450.5,
    temParadas: "sim",
    numParadas: 2,
    
    // Modais e configuração
    modos: ["rodoviario"],
    configVeiculo: "cavalo-mecanico-carreta",
    
    // Capacidade e peso
    capacidadeUtilizada: 85.5,
    pesoCarga: 28000,
    unidadePeso: "kg",
    
    // Custos
    custoTransporte: 5000.00,
    valorCarga: 150000.00,
    
    // Embalagem
    tipoEmbalagem: "granel",
    cargaPerigosa: "nao",
    
    // Tempo (VALIDAÇÃO CRÍTICA: deve ser > 0)
    tempoDias: 0,
    tempoHoras: 8,
    tempoMinutos: 30,
    
    // Frequência
    frequencia: "semanal",
    
    // SEÇÃO 6: Fatores de Decisão
    importanciaCusto: "muito-importante",
    variacaoCusto: 15.0,
    importanciaTempo: "importante",
    variacaoTempo: 10.0,
    importanciaConfiabilidade: "muito-importante",
    variacaoConfiabilidade: 5.0,
    importanciaSeguranca: "importante",
    variacaoSeguranca: 8.0,
    importanciaCapacidade: "moderado",
    variacaoCapacidade: 12.0,
    
    // SEÇÃO 7: Análise Estratégica
    tipoCadeia: "just-in-time",
    modaisAlternativos: ["ferroviario", "hidroviario"],
    fatorAdicional: "Disponibilidade de infraestrutura portuária",
    
    // SEÇÃO 8: Dificuldades
    dificuldades: ["infraestrutura", "custo"],
    detalheDificuldade: "Estradas em más condições no interior",
    
    // SEÇÃO 9: Outros
    observacoes: "Teste completo de validação do sistema",
    consentimento: true,
    transportaCarga: true,
    
    // METADADOS
    tipoResponsavel: "entrevistado",
    idResponsavel: null
};

// Teste das 4 validações condicionais do @model_validator
const validationTests = [
    {
        name: "1. temParadas='sim' → numParadas obrigatório",
        payload: { ...testPayload, temParadas: 'sim', numParadas: null },
        shouldFail: true,
        expectedError: "Número de paradas"
    },
    {
        name: "2. rodoviario in modos → configVeiculo obrigatório",
        payload: { ...testPayload, modos: ['rodoviario'], configVeiculo: null },
        shouldFail: true,
        expectedError: "Configuração do veículo"
    },
    {
        name: "3. tipoEmpresa='outro' → outroTipo obrigatório",
        payload: { ...testPayload, tipoEmpresa: 'outro', outroTipo: null },
        shouldFail: true,
        expectedError: "Especificar outro tipo"
    },
    {
        name: "4. Tempo total deve ser > 0",
        payload: { ...testPayload, tempoDias: 0, tempoHoras: 0, tempoMinutos: 0 },
        shouldFail: true,
        expectedError: "Tempo de transporte deve ser maior que zero"
    },
    {
        name: "5. Payload válido completo",
        payload: testPayload,
        shouldFail: false
    }
];

async function testSubmission(testCase) {
    console.log(`\n🧪 Teste: ${testCase.name}`);
    console.log('─'.repeat(80));
    
    try {
        const response = await fetch(`${BASE_URL}/api/submit-form`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(testCase.payload)
        });
        
        const data = await response.json();
        
        if (testCase.shouldFail) {
            if (!response.ok) {
                console.log(`✅ PASSOU - Erro esperado capturado`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Mensagem: ${data.detail || data.message}`);
                
                // Verifica se a mensagem contém o texto esperado
                const errorMsg = JSON.stringify(data);
                if (errorMsg.includes(testCase.expectedError)) {
                    console.log(`   ✓ Mensagem de erro correta`);
                } else {
                    console.log(`   ⚠ Mensagem de erro diferente do esperado`);
                    console.log(`   Esperado: "${testCase.expectedError}"`);
                }
                return true;
            } else {
                console.log(`❌ FALHOU - Deveria ter dado erro mas passou`);
                console.log(`   Response:`, JSON.stringify(data, null, 2));
                return false;
            }
        } else {
            if (response.ok) {
                console.log(`✅ PASSOU - Submissão bem-sucedida`);
                console.log(`   ID Pesquisa: ${data.id_pesquisa}`);
                console.log(`   ID Empresa: ${data.id_empresa}`);
                console.log(`   Produtos inseridos: ${data.produtos_inseridos}`);
                return true;
            } else {
                console.log(`❌ FALHOU - Deveria ter passado mas deu erro`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Erro:`, JSON.stringify(data, null, 2));
                return false;
            }
        }
    } catch (error) {
        console.log(`❌ ERRO DE REDE:`, error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
    console.log('║         TESTE COMPLETO DE VALIDAÇÃO DO FORMULÁRIO PLI 2050              ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
    
    // Verificar se backend está online
    console.log('\n🔍 Verificando conexão com backend...');
    try {
        const healthCheck = await fetch(`${BASE_URL}/health`);
        if (healthCheck.ok) {
            const health = await healthCheck.json();
            console.log(`✅ Backend online: ${health.status}`);
            console.log(`   Database: ${health.database}`);
        } else {
            console.log('❌ Backend não está respondendo');
            return;
        }
    } catch (error) {
        console.log('❌ Não foi possível conectar ao backend');
        console.log(`   URL testada: ${BASE_URL}/health`);
        console.log(`   Erro: ${error.message}`);
        return;
    }
    
    // Executar testes
    const results = [];
    for (const test of validationTests) {
        const result = await testSubmission(test);
        results.push({ test: test.name, passed: result });
        
        // Aguardar 500ms entre testes
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Resumo
    console.log('\n' + '═'.repeat(80));
    console.log('📊 RESUMO DOS TESTES');
    console.log('═'.repeat(80));
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    results.forEach((r, i) => {
        const icon = r.passed ? '✅' : '❌';
        console.log(`${icon} Teste ${i + 1}: ${r.test}`);
    });
    
    console.log('\n' + '─'.repeat(80));
    console.log(`Resultado: ${passed}/${total} testes passaram (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
        console.log('🎉 TODOS OS TESTES PASSARAM! Sistema funcionando corretamente.');
    } else {
        console.log('⚠️  Alguns testes falharam. Revisar validações.');
    }
}

// Executar
runAllTests().catch(console.error);
