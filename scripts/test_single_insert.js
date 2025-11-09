/**
 * Teste de inserção única com CNPJ válido
 * CNPJ usado: 11.222.333/0001-81 (formato válido)
 */

const BASE_URL = 'http://localhost:8000';

const payloadCompleto = {
    // SEÇÃO 1: Dados do Entrevistado
    nome: "Maria Santos",
    funcao: "Coordenadora de Transportes",
    telefone: "(11) 99876-5432",
    email: "maria.santos@logistica-teste.com.br",
    
    // SEÇÃO 2: Dados da Empresa
    tipoEmpresa: "embarcador",
    nomeEmpresa: "Logística Moderna Transportes S.A.",
    razaoSocial: "Logística Moderna Transportes S.A.",
    municipio: "Campinas",
    cnpj: "11.222.333/0001-81",  // CNPJ válido único
    nomeFantasia: "Log Moderna",
    logradouro: "Av. Paulista",
    numero: "1500",
    complemento: "Torre A - 10º andar",
    bairro: "Bela Vista",
    cep: "01310-200",
    
    // SEÇÃO 3: Produtos Transportados
    produtos: [
        {
            carga: "Açúcar Refinado",
            movimentacao: 120000,
            origem: "Piracicaba",
            destino: "Santos",
            distancia: 180.5,
            modalidade: "rodoviario",
            acondicionamento: "big-bag"
        },
        {
            carga: "Etanol",
            movimentacao: 45000,
            origem: "Ribeirão Preto",
            destino: "São Paulo",
            distancia: 315.0,
            modalidade: "rodoviario",
            acondicionamento: "granel-liquido"
        }
    ],
    
    // SEÇÃO 4: Produto Principal
    produtoPrincipal: "Açúcar Refinado",
    agrupamentoProduto: "agricultura",
    
    // SEÇÃO 5: Características do Transporte
    tipoTransporte: "exportacao",
    origemPais: "Brasil",
    origemEstado: "SP",
    origemMunicipio: "3538709", // Piracicaba
    destinoPais: "Brasil",
    destinoEstado: "SP",
    destinoMunicipio: "3548500", // Santos
    distancia: 180.5,
    temParadas: "sim",
    numParadas: 1,
    
    // Modais e configuração
    modos: ["rodoviario"],
    configVeiculo: "cavalo-mecanico-carreta",
    
    // Capacidade e peso
    capacidadeUtilizada: 92.5,
    pesoCarga: 32000,
    unidadePeso: "kg",
    
    // Custos
    custoTransporte: 6500.00,
    valorCarga: 280000.00,
    
    // Embalagem
    tipoEmbalagem: "big-bag",
    cargaPerigosa: "nao",
    
    // Tempo
    tempoDias: 0,
    tempoHoras: 4,
    tempoMinutos: 30,
    
    // Frequência
    frequencia: "diaria",
    frequenciaDiaria: 3.5,
    
    // SEÇÃO 6: Fatores de Decisão
    importanciaCusto: "muito-importante",
    variacaoCusto: 18.0,
    importanciaTempo: "muito-importante",
    variacaoTempo: 15.0,
    importanciaConfiabilidade: "muito-importante",
    variacaoConfiabilidade: 8.0,
    importanciaSeguranca: "importante",
    variacaoSeguranca: 10.0,
    importanciaCapacidade: "importante",
    variacaoCapacidade: 12.0,
    
    // SEÇÃO 7: Análise Estratégica
    tipoCadeia: "just-in-time",
    modaisAlternativos: ["ferroviario"],
    fatorAdicional: "Proximidade com o porto de Santos é crucial para exportação",
    
    // SEÇÃO 8: Dificuldades
    dificuldades: ["infraestrutura", "custo", "tempo"],
    detalheDificuldade: "Congestionamentos frequentes na Via Anchieta e Rodovia dos Imigrantes. Necessidade de janelas de entrega específicas no porto.",
    
    // SEÇÃO 9: Outros
    observacoes: "Empresa exporta para Europa e Ásia. Processo logístico crítico para competitividade internacional.",
    consentimento: true,
    transportaCarga: true,
    
    // METADADOS
    tipoResponsavel: "entrevistado",
    idResponsavel: null
};

async function inserirRegistro() {
    console.log('═'.repeat(80));
    console.log('🚀 INSERÇÃO DE REGISTRO COMPLETO COM CNPJ VÁLIDO');
    console.log('═'.repeat(80));
    console.log(`CNPJ: ${payloadCompleto.cnpj}`);
    console.log(`Empresa: ${payloadCompleto.nomeEmpresa}`);
    console.log(`Entrevistado: ${payloadCompleto.nome}`);
    console.log(`Produtos: ${payloadCompleto.produtos.length} itens`);
    console.log('─'.repeat(80));
    
    try {
        const response = await fetch(`${BASE_URL}/api/submit-form`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payloadCompleto)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('\n✅ SUCESSO! Registro inserido no banco de dados\n');
            console.log('📊 Detalhes da inserção:');
            console.log(`   ID Pesquisa: ${data.id_pesquisa}`);
            console.log(`   ID Empresa: ${data.id_empresa}`);
            console.log(`   ID Entrevistado: ${data.id_entrevistado}`);
            console.log(`   Produtos inseridos: ${data.produtos_inseridos}`);
            console.log('\n📋 Dados salvos:');
            console.log(JSON.stringify(data.data, null, 2));
            console.log('\n' + '═'.repeat(80));
            console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
            console.log('═'.repeat(80));
        } else {
            console.log('\n❌ ERRO na inserção\n');
            console.log(`Status: ${response.status}`);
            console.log(`Mensagem: ${data.detail || data.message || 'Erro desconhecido'}`);
            
            if (response.status === 422) {
                console.log('\n📝 Erros de validação:');
                if (data.detail && Array.isArray(data.detail)) {
                    data.detail.forEach((err, i) => {
                        console.log(`   ${i + 1}. Campo: ${err.loc.join(' → ')}`);
                        console.log(`      Erro: ${err.msg}`);
                    });
                }
            } else if (response.status === 409) {
                console.log('\n⚠️  CNPJ já existe no banco. Para testar novamente, altere o CNPJ no script.');
            }
            
            console.log('\n🔍 Resposta completa:');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('\n❌ ERRO DE CONEXÃO\n');
        console.log(`Erro: ${error.message}`);
        console.log('\n💡 Verifique se o backend está rodando em http://localhost:8000');
    }
}

// Executar
inserirRegistro();
