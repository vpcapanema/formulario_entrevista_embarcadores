#!/usr/bin/env node

/**
 * TESTE COMPLETO - Enviar formulário com modo RODOVIÁRIO
 * Valida se todos os campos aparecem e submit funciona
 */

const baseUrl = 'http://localhost:8000'; // FastAPI

async function testarFormulario() {
    console.log('\n📋 TESTE COMPLETO DO FORMULÁRIO COM MODO RODOVIÁRIO\n');
    console.log('═'.repeat(60));
    
    // 1. Testar Health Check
    console.log('\n✅ 1. Verificando API...');
    try {
        const health = await fetch(`${baseUrl}/health`).then(r => r.json());
        console.log(`   Status: ${health.status}`);
    } catch (e) {
        console.log(`   ❌ API indisponível em ${baseUrl}`);
        console.log(`   Erro: ${e.message}`);
        console.log('\n   💡 Tente iniciar: python backend-fastapi/main.py');
        return;
    }
    
    // 2. Testar GET /lists/
    console.log('\n✅ 2. Buscando listas de dados...');
    try {
        const [paises, estados, funcoes, instituicoes, municipios] = await Promise.all([
            fetch(`${baseUrl}/lists/paises.json`).then(r => r.json()),
            fetch(`${baseUrl}/lists/estados.json`).then(r => r.json()),
            fetch(`${baseUrl}/lists/funcoes.json`).then(r => r.json()),
            fetch(`${baseUrl}/lists/instituicoes.json`).then(r => r.json()),
            fetch(`${baseUrl}/lists/municipios.json`).then(r => r.json()),
        ]);
        
        console.log(`   ✓ Países: ${paises.length}`);
        console.log(`   ✓ Estados: ${estados.length}`);
        console.log(`   ✓ Funções: ${funcoes.length}`);
        console.log(`   ✓ Instituições: ${instituicoes.length}`);
        console.log(`   ✓ Municípios: ${municipios.length}`);
    } catch (e) {
        console.log(`   ❌ Erro ao buscar listas: ${e.message}`);
        return;
    }
    
    // 3. Criar payload de teste
    console.log('\n✅ 3. Criando payload de teste...');
    const payloadTeste = {
        // BÁSICO
        tipo_responsavel: 'entrevistador',
        entrevistador_id: 1,
        empresa_cnpj: '11444777000161',
        empresa_razao_social: 'EMPRESA TESTE RODOVIÁRIO',
        empresa_endereco: 'Rua Test, 123',
        
        // ENTREVISTADO
        entrevistado_nome: 'João Silva',
        entrevistado_funcao: 1,
        entrevistado_email: 'joao@test.com',
        
        // DADOS DA PESQUISA
        data_pesquisa: new Date().toISOString().split('T')[0],
        
        // Q1-Q7: Empresa
        instituicao_id: 1,
        tipo_empresa: 'transportadora',
        anos_operacao: '5-10',
        total_colaboradores: 'de_50_a_100',
        total_veiculos: 'de_10_a_20',
        
        // Q8: Produtos (tabela)
        produtos_transportados: [
            {
                produto: 'Soja',
                movimentacao_anual: 50000,
                origem: 'Ribeirão Preto',
                destino: 'Porto Santos',
                distancia: 450,
                frequencia: 'diaria'
            }
        ],
        
        // Q9-Q16: Origem/Destino
        origem_pais: '31', // Brasil
        origem_estado: '35', // SP
        origem_municipio: '4106902', // Ribeirão Preto
        destino_pais: '31', // Brasil
        destino_estado: '35', // SP
        destino_municipio: '3550308', // São Paulo
        tem_paradas: 'sim',
        num_paradas: '3-5',
        
        // Q17-Q18: ⭐ MODOS - COM RODOVIÁRIO
        modos: ['rodoviario'],  // ✅ RODOVIÁRIO SELECIONADO
        config_veiculo: 'semirreboque',  // ✅ CAMPO CONDICIONAL PREENCHIDO
        observacoes_produto: 'Transporte refrigerado recomendado',
        
        // Campos restantes
        documento_entrevistado: '12345678901',
        natural_uf: 'SP',
        formacao_educacional: 'superior',
        email_secundario: 'joao.silva@empresa.com',
        telefone_secundario: '1133334444'
    };
    
    console.log(`   ✓ Payload criado com ${Object.keys(payloadTeste).length} campos`);
    console.log(`   ✓ Modo RODOVIÁRIO: ${payloadTeste.modos.includes('rodoviario') ? '✅' : '❌'}`);
    console.log(`   ✓ Config Veículo: ${payloadTeste.config_veiculo ? '✅' : '❌'}`);
    
    // 4. Enviar formulário
    console.log('\n✅ 4. Enviando formulário...');
    try {
        const response = await fetch(`${baseUrl}/api/submit-form`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadTeste)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log(`   ✅ SUCESSO! Status: ${response.status}`);
            console.log(`   ✓ ID Pesquisa: ${data.data?.id_pesquisa}`);
            console.log(`   ✓ ID Empresa: ${data.data?.id_empresa}`);
            console.log(`   ✓ ID Entrevistado: ${data.data?.id_entrevistado}`);
            console.log(`   ✓ Produtos: ${data.data?.produtos_inseridos}`);
        } else {
            console.log(`   ❌ ERRO ${response.status}`);
            console.log(`   Mensagem: ${data.message}`);
            if (data.details) {
                console.log(`   Detalhes: ${data.details}`);
            }
        }
        
        console.log('\n═'.repeat(60));
        console.log('✅ TESTE CONCLUÍDO\n');
        
    } catch (e) {
        console.log(`   ❌ Erro ao enviar: ${e.message}`);
    }
}

testarFormulario();
