/**
 * ════════════════════════════════════════════════════════════
 * 🧪 TESTE DE INSERT COM PAYLOAD COMPLETO
 * ════════════════════════════════════════════════════════════
 * 
 * Teste completo do fluxo:
 * 1. Criar payload estruturado (empresa, entrevistado, pesquisa)
 * 2. Enviar POST /api/submit-form
 * 3. Verificar INSERT nas 3 tabelas
 * 4. Exibir resultados
 */

const fetch = require('node-fetch');

// ════════════════════════════════════════════════════════════
// 📦 PAYLOAD DE TESTE COMPLETO (ESTRUTURA REAL DO BANCO)
// ════════════════════════════════════════════════════════════

const payloadTeste = {
    // ══════════════════════════════════════════════
    // 🏢 TABELA: empresas (ESTRUTURA REAL)
    // ══════════════════════════════════════════════
    empresa: {
        nome_empresa: "PETRÓLEO BRASILEIRO S.A. - PETROBRAS",  // VARCHAR(255) NOT NULL
        tipo_empresa: "Embarcador",                             // VARCHAR(50) NOT NULL
        outro_tipo: null,                                       // VARCHAR(255) NULL
        municipio: "Rio de Janeiro",                            // VARCHAR(255) NOT NULL
        estado: "Rio de Janeiro",                               // VARCHAR(100) NULL
        cnpj: "33.000.167/0001-01"                             // VARCHAR(18) NULL
    },

    // ══════════════════════════════════════════════
    // 👤 TABELA: entrevistados (ESTRUTURA REAL)
    // ══════════════════════════════════════════════
    entrevistado: {
        nome: "João da Silva Santos",                           // VARCHAR(255) NOT NULL
        funcao: "Gerente de Logística",                         // VARCHAR(255) NOT NULL
        telefone: "11987654321",                                // VARCHAR(20) NOT NULL
        email: "joao.silva@petrobras.com.br",                  // VARCHAR(255) NOT NULL
        principal: true                                         // BOOLEAN NULL
    },

    // ══════════════════════════════════════════════
    // 📋 TABELA: pesquisas (ESTRUTURA REAL)
    // ══════════════════════════════════════════════
    pesquisa: {
        tipo_responsavel: "entrevistador",                      // VARCHAR(20) NOT NULL
        id_responsavel: 1,                                      // INTEGER NOT NULL
        status: "completo",                                     // VARCHAR(20) NULL
        
        // Produto
        produto_principal: "Diesel S10",                        // VARCHAR(255) NOT NULL
        agrupamento_produto: "Combustível",                     // VARCHAR(100) NOT NULL
        outro_produto: null,                                    // VARCHAR(255) NULL
        
        // Transporte
        tipo_transporte: "Carga Própria",                       // VARCHAR(50) NOT NULL
        
        // Origem
        origem_pais: "Brasil",                                  // VARCHAR(100) NOT NULL
        origem_estado: "Rio de Janeiro",                        // VARCHAR(100) NOT NULL
        origem_municipio: "Rio de Janeiro",                     // VARCHAR(255) NOT NULL
        
        // Destino
        destino_pais: "Brasil",                                 // VARCHAR(100) NOT NULL
        destino_estado: "São Paulo",                            // VARCHAR(100) NOT NULL
        destino_municipio: "São Paulo",                         // VARCHAR(255) NOT NULL
        
        // Logística
        distancia: 429.5,                                       // NUMERIC NOT NULL
        tem_paradas: "não",                                     // VARCHAR(3) NOT NULL
        num_paradas: null,                                      // INTEGER NULL
        modos: ["Rodoviário", "Ferroviário"],                   // ARRAY NOT NULL
        config_veiculo: "Caminhão tanque",                      // VARCHAR(100) NULL
        
        // Carga
        peso_carga: 30.0,                                       // NUMERIC NOT NULL
        unidade_peso: "toneladas",                              // VARCHAR(20) NOT NULL
        custo_transporte: 125.50,                               // NUMERIC NOT NULL
        valor_carga: 85000.00,                                  // NUMERIC NOT NULL
        tipo_embalagem: "Tanque",                               // VARCHAR(100) NOT NULL
        carga_perigosa: "sim",                                  // VARCHAR(3) NOT NULL
        capacidade_utilizada: 85.5,                             // NUMERIC NULL
        
        // Tempo
        tempo_dias: 0,                                          // INTEGER NOT NULL
        tempo_horas: 8,                                         // INTEGER NOT NULL
        tempo_minutos: 30,                                      // INTEGER NOT NULL
        
        // Frequência
        frequencia: "diária",                                   // VARCHAR(50) NOT NULL
        frequencia_outra: null,                                 // VARCHAR(255) NULL
        frequencia_diaria: 5.0,                                 // NUMERIC NULL
        
        // Importâncias e Variações
        importancia_custo: "muito importante",                  // VARCHAR(20) NOT NULL
        variacao_custo: 15.0,                                   // NUMERIC NOT NULL
        importancia_tempo: "importante",                        // VARCHAR(20) NOT NULL
        variacao_tempo: 20.0,                                   // NUMERIC NOT NULL
        importancia_confiabilidade: "muito importante",         // VARCHAR(20) NOT NULL
        variacao_confiabilidade: 10.0,                          // NUMERIC NOT NULL
        importancia_seguranca: "muito importante",              // VARCHAR(20) NOT NULL
        variacao_seguranca: 5.0,                                // NUMERIC NOT NULL
        importancia_capacidade: "importante",                   // VARCHAR(20) NOT NULL
        variacao_capacidade: 25.0,                              // NUMERIC NOT NULL
        
        // Cadeia
        tipo_cadeia: "porta a porta",                           // VARCHAR(50) NOT NULL
        modais_alternativos: ["Hidroviário"],                   // ARRAY NULL
        
        // Observações
        fator_adicional: "Necessário melhorar infraestrutura portuária", // TEXT NULL
        dificuldades: ["Infraestrutura precária", "Pedágios caros"],     // ARRAY NULL
        detalhe_dificuldade: "Estradas em más condições aumentam custos de manutenção", // TEXT NULL
        observacoes: "Empresa tem interesse em diversificar modais de transporte" // TEXT NULL
    }
};

// ════════════════════════════════════════════════════════════
// 🧪 FUNÇÃO DE TESTE
// ════════════════════════════════════════════════════════════

async function testarInsertPayload() {
    console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    🧪 TESTE DE INSERT - PAYLOAD COMPLETO                  ║');
    console.log('╠═══════════════════════════════════════════════════════════════════════════╣\n');

    try {
        // ────────────────────────────────────────────────────────
        // 1️⃣ EXIBIR PAYLOAD
        // ────────────────────────────────────────────────────────
        console.log('📦 PAYLOAD DE TESTE:');
        console.log('─────────────────────────────────────────────────────────────\n');
        console.log('🏢 EMPRESA:');
        console.log(`   Nome: ${payloadTeste.empresa.nome_empresa}`);
        console.log(`   Tipo: ${payloadTeste.empresa.tipo_empresa}`);
        console.log(`   CNPJ: ${payloadTeste.empresa.cnpj}`);
        console.log(`   Município: ${payloadTeste.empresa.municipio}`);
        console.log('');
        console.log('👤 ENTREVISTADO:');
        console.log(`   Nome: ${payloadTeste.entrevistado.nome}`);
        console.log(`   Função: ${payloadTeste.entrevistado.funcao}`);
        console.log(`   Email: ${payloadTeste.entrevistado.email}`);
        console.log('');
        console.log('📋 PESQUISA:');
        console.log(`   Responsável: ${payloadTeste.pesquisa.tipo_responsavel} (ID ${payloadTeste.pesquisa.id_responsavel})`);
        console.log(`   Produto: ${payloadTeste.pesquisa.produto_principal}`);
        console.log(`   Agrupamento: ${payloadTeste.pesquisa.agrupamento_produto}`);
        console.log(`   Origem: ${payloadTeste.pesquisa.origem_municipio}/${payloadTeste.pesquisa.origem_estado}`);
        console.log(`   Destino: ${payloadTeste.pesquisa.destino_municipio}/${payloadTeste.pesquisa.destino_estado}`);
        console.log(`   Distância: ${payloadTeste.pesquisa.distancia} km`);
        console.log(`   Modos: ${payloadTeste.pesquisa.modos.join(', ')}`);
        console.log('');

        // ────────────────────────────────────────────────────────
        // 2️⃣ ENVIAR POST REQUEST
        // ────────────────────────────────────────────────────────
        console.log('╠═══════════════════════════════════════════════════════════════════════════╣');
        console.log('║                           📡 ENVIANDO REQUISIÇÃO                          ║');
        console.log('╠═══════════════════════════════════════════════════════════════════════════╣\n');
        
        const url = 'http://localhost:3000/api/submit-form';
        console.log(`🌐 URL: ${url}`);
        console.log(`📤 Method: POST`);
        console.log(`📋 Content-Type: application/json`);
        console.log(`📦 Payload Size: ${JSON.stringify(payloadTeste).length} bytes\n`);

        const startTime = Date.now();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadTeste)
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // ────────────────────────────────────────────────────────
        // 3️⃣ PROCESSAR RESPOSTA
        // ────────────────────────────────────────────────────────
        console.log('╠═══════════════════════════════════════════════════════════════════════════╣');
        console.log('║                             📥 RESPOSTA RECEBIDA                          ║');
        console.log('╠═══════════════════════════════════════════════════════════════════════════╣\n');

        console.log(`⏱️  Tempo de Resposta: ${responseTime}ms`);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        console.log('');

        const data = await response.json();

        if (response.ok) {
            console.log('✅ INSERT REALIZADO COM SUCESSO!\n');
            console.log('🎯 IDs GERADOS:');
            console.log(`   └─ id_empresa: ${data.data?.id_empresa || 'N/A'}`);
            console.log(`   └─ id_entrevistado: ${data.data?.id_entrevistado || 'N/A'}`);
            console.log(`   └─ id_pesquisa: ${data.data?.id_pesquisa || 'N/A'}`);
            console.log('');
            
            if (data.message) {
                console.log(`💬 Mensagem: ${data.message}`);
            }
            
            console.log('\n📄 RESPOSTA COMPLETA:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('❌ ERRO NO INSERT!\n');
            console.log(`⚠️  Erro: ${data.error || 'Erro desconhecido'}`);
            
            if (data.details) {
                console.log('\n🔍 Detalhes:');
                console.log(JSON.stringify(data.details, null, 2));
            }
        }

        console.log('\n╚═══════════════════════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.log('\n╠═══════════════════════════════════════════════════════════════════════════╣');
        console.log('║                              ❌ ERRO FATAL                                ║');
        console.log('╠═══════════════════════════════════════════════════════════════════════════╣\n');
        
        console.error('💥 Erro:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n⚠️  SERVIDOR NÃO ESTÁ RODANDO!');
            console.log('   Execute: cd backend-api && node server.js');
        }
        
        console.log('\n╚═══════════════════════════════════════════════════════════════════════════╝\n');
        process.exit(1);
    }
}

// ════════════════════════════════════════════════════════════
// 🚀 EXECUTAR TESTE
// ════════════════════════════════════════════════════════════

testarInsertPayload();
