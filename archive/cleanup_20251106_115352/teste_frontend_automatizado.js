/**
 * TESTE AUTOMATIZADO VIA FRONTEND
 * 
 * Este script simula o preenchimento completo do formulário
 * e envia os dados para o servidor.
 */

console.log('\n════════════════════════════════════════════════════════════');
console.log('🧪 INICIANDO TESTE AUTOMATIZADO VIA FRONTEND');
console.log('════════════════════════════════════════════════════════════\n');

// Aguardar página carregar
async function executarTeste() {
    try {
        console.log('📋 PASSO 1: Preenchendo Card 1 - Informações do Entrevistado\n');
        
        // Card 1: Informações do Entrevistado
        document.getElementById('nomeEntrevistado').value = 'João da Silva Santos';
        document.getElementById('cargoEntrevistado').value = 'Gerente de Logística';
        document.getElementById('telefoneEntrevistado').value = '(11) 98765-4321';
        document.getElementById('emailEntrevistado').value = 'joao.silva@teste.com.br';
        
        console.log('✅ Card 1 preenchido');
        console.log('   ├─ Nome: João da Silva Santos');
        console.log('   ├─ Cargo: Gerente de Logística');
        console.log('   ├─ Telefone: (11) 98765-4321');
        console.log('   └─ Email: joao.silva@teste.com.br\n');
        
        console.log('📋 PASSO 2: Preenchendo Card 2 - Informações da Empresa\n');
        
        // Card 2: Informações da Empresa
        document.getElementById('tipoOrganizacao').value = 'embarcador';
        document.getElementById('cnpj').value = '33.000.167/0001-01';
        
        console.log('✅ Card 2 preenchido');
        console.log('   ├─ Tipo: Embarcador');
        console.log('   └─ CNPJ: 33.000.167/0001-01\n');
        
        console.log('📋 PASSO 3: Buscando dados do CNPJ via API\n');
        
        // Buscar dados do CNPJ
        const btnBuscarCNPJ = document.querySelector('button[onclick*="buscarDadosCNPJ"]');
        if (btnBuscarCNPJ) {
            btnBuscarCNPJ.click();
            
            // Aguardar resposta da API (3 segundos)
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('✅ Dados do CNPJ carregados');
            console.log('   ├─ Razão Social: ' + document.getElementById('razaoSocial')?.value);
            console.log('   ├─ Nome Fantasia: ' + document.getElementById('nomeFantasia')?.value);
            console.log('   ├─ Telefone: ' + document.getElementById('telefoneEmpresa')?.value);
            console.log('   ├─ Email: ' + document.getElementById('emailEmpresa')?.value);
            console.log('   └─ CEP: ' + document.getElementById('cep')?.value + '\n');
        }
        
        console.log('📋 PASSO 4: Preenchendo demais campos do formulário\n');
        
        // Card 3: Endereço - Complemento
        const complemento = document.getElementById('complemento');
        if (complemento) {
            complemento.value = 'Torre Executiva';
        }
        
        // Card 4: Produto Principal
        const produto = document.querySelector('select[name*="produto"]');
        if (produto) {
            produto.value = 'Diesel';
        }
        
        console.log('✅ Campos adicionais preenchidos\n');
        
        console.log('📋 PASSO 5: Verificando dados antes do envio\n');
        
        // Verificar se payload-manager está disponível
        if (typeof PayloadManager !== 'undefined') {
            console.log('✅ PayloadManager detectado');
            
            // Tentar montar o payload
            const payload = PayloadManager.montarPayload();
            
            console.log('\n📊 PAYLOAD MONTADO:');
            console.log('─────────────────────────────────────────────────────────────');
            console.log('Empresa:', payload.empresa);
            console.log('Entrevistado:', payload.entrevistado);
            console.log('Pesquisa:', payload.pesquisa);
            console.log('─────────────────────────────────────────────────────────────\n');
            
            console.log('📋 PASSO 6: Enviando formulário para o servidor\n');
            
            // Enviar dados
            const response = await fetch('http://localhost:3000/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                const resultado = await response.json();
                
                console.log('✅ FORMULÁRIO ENVIADO COM SUCESSO!\n');
                console.log('════════════════════════════════════════════════════════════');
                console.log('📊 RESULTADO DO SERVIDOR:');
                console.log('════════════════════════════════════════════════════════════');
                console.log(JSON.stringify(resultado, null, 2));
                console.log('════════════════════════════════════════════════════════════\n');
                
                console.log('✅ TESTE COMPLETO - SUCESSO!');
                console.log('   ├─ Empresa ID:', resultado.empresa?.id_empresa);
                console.log('   ├─ Entrevistado ID:', resultado.entrevistado?.id_entrevistado);
                console.log('   └─ Pesquisa ID:', resultado.pesquisa?.id_pesquisa);
                
            } else {
                const erro = await response.text();
                console.error('❌ ERRO AO ENVIAR FORMULÁRIO:', response.status);
                console.error('Detalhes:', erro);
            }
            
        } else {
            console.warn('⚠️ PayloadManager não encontrado - não é possível enviar o formulário automaticamente');
            console.log('💡 Execute este script no console do navegador (F12) após carregar a página');
        }
        
        console.log('\n════════════════════════════════════════════════════════════');
        console.log('🏁 TESTE FINALIZADO');
        console.log('════════════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar teste
if (typeof window !== 'undefined' && window.document) {
    // Executando no navegador
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executarTeste);
    } else {
        executarTeste();
    }
} else {
    console.log('⚠️ Este script deve ser executado no console do navegador (F12)');
    console.log('💡 Passos:');
    console.log('   1. Abra http://localhost:3000');
    console.log('   2. Pressione F12');
    console.log('   3. Vá na aba Console');
    console.log('   4. Cole este código e pressione Enter');
}
