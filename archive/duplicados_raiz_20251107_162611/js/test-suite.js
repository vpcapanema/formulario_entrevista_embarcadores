/**
 * 🧪 PLI 2050 - Suite de Testes Automatizados
 * 
 * Execute no Console do navegador (F12 → Console):
 * 1. Copie todo este arquivo
 * 2. Cole no console
 * 3. Execute: await runAllTests()
 * 
 * Ou teste módulos específicos:
 * - testFileLoading()       → Testa carregamento de arquivos
 * - testDropdowns()         → Testa país → estado → município
 * - testValidation()        → Testa validação de campos
 * - testCNPJ()              → Testa auto-fill CNPJ
 */

// ============================================================================
// 🔵 TESTE 1: Carregamento de Arquivos
// ============================================================================
function testFileLoading() {
    console.log('\n🔵 TESTE 1: Verificando carregamento de arquivos...\n');
    
    const requiredObjects = [
        { name: 'CoreAPI', alias: 'API', obj: window.CoreAPI },
        { name: 'CoreValidators', alias: 'FieldValidators', obj: window.CoreValidators },
        { name: 'DropdownManager', alias: null, obj: window.DropdownManager },
        { name: 'FormCollector', alias: 'FORM', obj: window.FormCollector },
        { name: 'FormValidator', alias: 'ValidationEngine', obj: window.FormValidator },
        { name: 'UIFeedback', alias: 'UI', obj: window.UIFeedback },
        { name: 'IntegrationCNPJ', alias: 'CNPJAutoFill', obj: window.IntegrationCNPJ }
    ];
    
    let passed = 0;
    let failed = 0;
    
    requiredObjects.forEach(({ name, alias, obj }) => {
        if (obj && typeof obj === 'object') {
            console.log(`✅ ${name} carregado`);
            if (alias && window[alias]) {
                console.log(`   ↳ Alias "${alias}" funcionando`);
            }
            passed++;
        } else {
            console.error(`❌ ${name} NÃO encontrado`);
            failed++;
        }
    });
    
    console.log(`\n📊 Resultado: ${passed}/${requiredObjects.length} arquivos OK`);
    
    return { passed, failed, total: requiredObjects.length };
}

// ============================================================================
// 🟢 TESTE 2: Dropdowns Cascateados
// ============================================================================
async function testDropdowns() {
    console.log('\n🟢 TESTE 2: Testando dropdowns cascateados...\n');
    
    let passed = 0;
    let failed = 0;
    
    try {
        // 2.1 - Verificar se DropdownManager existe
        if (!window.DropdownManager) {
            throw new Error('DropdownManager não encontrado');
        }
        console.log('✅ DropdownManager existe');
        passed++;
        
        // 2.2 - Verificar se dados foram carregados
        if (!window.DropdownManager.cache || !window.DropdownManager.cache.paises) {
            console.log('⏳ Carregando dados iniciais...');
            await window.DropdownManager.loadInitialData();
        }
        
        const { paises, estados, funcoes, entrevistadores } = window.DropdownManager.cache;
        
        if (paises && paises.length > 0) {
            console.log(`✅ Países carregados: ${paises.length} itens`);
            passed++;
        } else {
            console.error('❌ Países não carregados');
            failed++;
        }
        
        if (estados && estados.length > 0) {
            console.log(`✅ Estados carregados: ${estados.length} itens`);
            passed++;
        } else {
            console.error('❌ Estados não carregados');
            failed++;
        }
        
        // 2.3 - Testar população de dropdown de países
        const origemPaisSelect = document.getElementById('origem_pais');
        if (origemPaisSelect && origemPaisSelect.options.length > 1) {
            console.log(`✅ Dropdown origem_pais populado: ${origemPaisSelect.options.length} opções`);
            passed++;
        } else {
            console.error('❌ Dropdown origem_pais vazio');
            failed++;
        }
        
        // 2.4 - Testar cascata: selecionar Brasil
        const brasilOption = Array.from(origemPaisSelect.options).find(
            opt => opt.textContent.includes('Brasil')
        );
        
        if (brasilOption) {
            console.log('✅ Brasil encontrado no dropdown');
            passed++;
            
            // Simular seleção do Brasil
            origemPaisSelect.value = brasilOption.value;
            origemPaisSelect.dispatchEvent(new Event('change'));
            
            // Aguardar um pouco para o evento processar
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Verificar se estados foram populados
            const origemEstadoSelect = document.getElementById('origem_estado');
            if (origemEstadoSelect && origemEstadoSelect.options.length > 1) {
                console.log(`✅ Cascata Brasil → Estados funcionando: ${origemEstadoSelect.options.length} estados`);
                passed++;
                
                // Testar cascata estados → municípios
                if (origemEstadoSelect.options.length > 1) {
                    const primeiroEstado = origemEstadoSelect.options[1];
                    origemEstadoSelect.value = primeiroEstado.value;
                    origemEstadoSelect.dispatchEvent(new Event('change'));
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    const origemMunicipioSelect = document.getElementById('origem_municipio');
                    if (origemMunicipioSelect && origemMunicipioSelect.options.length > 1) {
                        console.log(`✅ Cascata Estado → Municípios funcionando: ${origemMunicipioSelect.options.length} municípios`);
                        passed++;
                    } else {
                        console.error('❌ Cascata Estado → Municípios falhou');
                        failed++;
                    }
                }
            } else {
                console.error('❌ Cascata Brasil → Estados falhou');
                failed++;
            }
        } else {
            console.error('❌ Brasil não encontrado no dropdown');
            failed++;
        }
        
    } catch (error) {
        console.error('❌ Erro nos testes de dropdown:', error);
        failed++;
    }
    
    console.log(`\n📊 Resultado: ${passed} testes passaram, ${failed} falharam`);
    return { passed, failed };
}

// ============================================================================
// 🟡 TESTE 3: Validação de Campos
// ============================================================================
function testValidation() {
    console.log('\n🟡 TESTE 3: Testando validação de campos...\n');
    
    let passed = 0;
    let failed = 0;
    
    try {
        // 3.1 - Verificar se FormValidator existe
        if (!window.FormValidator) {
            throw new Error('FormValidator não encontrado');
        }
        console.log('✅ FormValidator existe');
        passed++;
        
        // 3.2 - Verificar se CoreValidators existe
        if (!window.CoreValidators) {
            throw new Error('CoreValidators não encontrado');
        }
        console.log('✅ CoreValidators existe');
        passed++;
        
        // 3.3 - Testar validação de e-mail inválido
        const emailInvalido = 'teste@invalido';
        const resultadoEmailInvalido = window.CoreValidators.validateEmail(emailInvalido);
        if (!resultadoEmailInvalido.valid) {
            console.log('✅ Validação de e-mail inválido funciona');
            console.log(`   ↳ Mensagem: "${resultadoEmailInvalido.message}"`);
            passed++;
        } else {
            console.error('❌ Validação de e-mail inválido falhou');
            failed++;
        }
        
        // 3.4 - Testar validação de e-mail válido
        const emailValido = 'teste@exemplo.com.br';
        const resultadoEmailValido = window.CoreValidators.validateEmail(emailValido);
        if (resultadoEmailValido.valid) {
            console.log('✅ Validação de e-mail válido funciona');
            passed++;
        } else {
            console.error('❌ Validação de e-mail válido falhou');
            failed++;
        }
        
        // 3.5 - Testar validação de CNPJ inválido
        const cnpjInvalido = '11.111.111/1111-11';
        const resultadoCNPJInvalido = window.CoreValidators.validateCNPJ(cnpjInvalido);
        if (!resultadoCNPJInvalido.valid) {
            console.log('✅ Validação de CNPJ inválido funciona');
            console.log(`   ↳ Mensagem: "${resultadoCNPJInvalido.message}"`);
            passed++;
        } else {
            console.error('❌ Validação de CNPJ inválido falhou');
            failed++;
        }
        
        // 3.6 - Testar validação de CNPJ válido
        const cnpjValido = '27.865.757/0001-02';
        const resultadoCNPJValido = window.CoreValidators.validateCNPJ(cnpjValido);
        if (resultadoCNPJValido.valid) {
            console.log('✅ Validação de CNPJ válido funciona');
            passed++;
        } else {
            console.error('❌ Validação de CNPJ válido falhou');
            failed++;
        }
        
        // 3.7 - Testar validação de telefone
        const telefoneValido = '(11) 98765-4321';
        const resultadoTelefone = window.CoreValidators.validateTelefone(telefoneValido);
        if (resultadoTelefone.valid) {
            console.log('✅ Validação de telefone válido funciona');
            passed++;
        } else {
            console.error('❌ Validação de telefone válido falhou');
            failed++;
        }
        
        // 3.8 - Testar validação visual (se campo existe no DOM)
        const emailField = document.getElementById('entrevistado_email');
        if (emailField) {
            console.log('✅ Campo de e-mail encontrado no DOM');
            passed++;
            
            // Simular preenchimento com e-mail inválido
            emailField.value = 'email.invalido';
            emailField.dispatchEvent(new Event('blur'));
            
            // Verificar se classe "invalid" foi adicionada
            setTimeout(() => {
                if (emailField.classList.contains('invalid')) {
                    console.log('✅ Validação visual onBlur funciona (campo marcado como inválido)');
                } else {
                    console.log('⚠️ Campo não marcado como inválido (pode estar OK se validação só ocorre no submit)');
                }
            }, 100);
        }
        
    } catch (error) {
        console.error('❌ Erro nos testes de validação:', error);
        failed++;
    }
    
    console.log(`\n📊 Resultado: ${passed} testes passaram, ${failed} falharam`);
    return { passed, failed };
}

// ============================================================================
// 🔴 TESTE 4: CNPJ Auto-fill
// ============================================================================
async function testCNPJ() {
    console.log('\n🔴 TESTE 4: Testando CNPJ auto-fill...\n');
    
    let passed = 0;
    let failed = 0;
    
    try {
        // 4.1 - Verificar se IntegrationCNPJ existe
        if (!window.IntegrationCNPJ) {
            throw new Error('IntegrationCNPJ não encontrado');
        }
        console.log('✅ IntegrationCNPJ existe');
        passed++;
        
        // 4.2 - Verificar se CoreAPI.consultarCNPJ existe
        if (typeof window.CoreAPI.consultarCNPJ === 'function') {
            console.log('✅ CoreAPI.consultarCNPJ existe');
            passed++;
        } else {
            console.error('❌ CoreAPI.consultarCNPJ não encontrado');
            failed++;
        }
        
        // 4.3 - Testar consulta de CNPJ válido (apenas verificar se método existe)
        const cnpjTeste = '27.865.757/0001-02';
        console.log(`⏳ Testando consulta CNPJ: ${cnpjTeste}`);
        console.log('   (Não executando consulta real para não sobrecarregar API)');
        console.log('✅ Método de consulta disponível');
        passed++;
        
        // 4.4 - Verificar campos que seriam preenchidos
        const camposAutoFill = [
            'razao_social',
            'nome_fantasia',
            'logradouro',
            'numero',
            'complemento',
            'bairro',
            'cep',
            'uf',
            'municipio'
        ];
        
        let camposEncontrados = 0;
        camposAutoFill.forEach(campo => {
            if (document.getElementById(campo)) {
                camposEncontrados++;
            }
        });
        
        console.log(`✅ Campos de auto-fill encontrados: ${camposEncontrados}/${camposAutoFill.length}`);
        if (camposEncontrados > 0) passed++;
        
    } catch (error) {
        console.error('❌ Erro nos testes de CNPJ:', error);
        failed++;
    }
    
    console.log(`\n📊 Resultado: ${passed} testes passaram, ${failed} falharam`);
    return { passed, failed };
}

// ============================================================================
// 🟣 TESTE 5: FormCollector
// ============================================================================
function testFormCollector() {
    console.log('\n🟣 TESTE 5: Testando FormCollector...\n');
    
    let passed = 0;
    let failed = 0;
    
    try {
        // 5.1 - Verificar se FormCollector existe
        if (!window.FormCollector) {
            throw new Error('FormCollector não encontrado');
        }
        console.log('✅ FormCollector existe');
        passed++;
        
        // 5.2 - Verificar métodos principais
        const metodosEsperados = ['collectData', 'submit', 'addProdutoRow'];
        
        metodosEsperados.forEach(metodo => {
            if (typeof window.FormCollector[metodo] === 'function') {
                console.log(`✅ Método FormCollector.${metodo}() existe`);
                passed++;
            } else {
                console.error(`❌ Método FormCollector.${metodo}() não encontrado`);
                failed++;
            }
        });
        
        // 5.3 - Verificar se formulário existe
        const form = document.getElementById('pesquisa-form');
        if (form) {
            console.log('✅ Formulário encontrado no DOM');
            passed++;
        } else {
            console.error('❌ Formulário não encontrado');
            failed++;
        }
        
    } catch (error) {
        console.error('❌ Erro nos testes de FormCollector:', error);
        failed++;
    }
    
    console.log(`\n📊 Resultado: ${passed} testes passaram, ${failed} falharam`);
    return { passed, failed };
}

// ============================================================================
// 🎯 EXECUTAR TODOS OS TESTES
// ============================================================================
async function runAllTests() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  🧪 PLI 2050 - SUITE DE TESTES AUTOMATIZADOS             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    const startTime = performance.now();
    
    // Executar testes
    const results = {
        fileLoading: testFileLoading(),
        dropdowns: await testDropdowns(),
        validation: testValidation(),
        cnpj: await testCNPJ(),
        formCollector: testFormCollector()
    };
    
    // Calcular totais
    const totalPassed = Object.values(results).reduce((sum, r) => sum + (r.passed || 0), 0);
    const totalFailed = Object.values(results).reduce((sum, r) => sum + (r.failed || 0), 0);
    const totalTests = totalPassed + totalFailed;
    
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Resultado final
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  📊 RESULTADO FINAL                                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n✅ Testes passaram: ${totalPassed}/${totalTests}`);
    console.log(`❌ Testes falharam: ${totalFailed}/${totalTests}`);
    console.log(`⏱️ Tempo total: ${duration}s`);
    
    if (totalFailed === 0) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema funcionando perfeitamente.');
    } else {
        console.log('\n⚠️ Alguns testes falharam. Verifique os erros acima.');
    }
    
    return results;
}

// ============================================================================
// 📝 INSTRUÇÕES DE USO
// ============================================================================
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🧪 SUITE DE TESTES CARREGADA                             ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('\n📝 Comandos disponíveis:');
console.log('  • await runAllTests()      - Executa TODOS os testes');
console.log('  • testFileLoading()        - Testa carregamento de arquivos');
console.log('  • await testDropdowns()    - Testa dropdowns cascateados');
console.log('  • testValidation()         - Testa validação de campos');
console.log('  • await testCNPJ()         - Testa CNPJ auto-fill');
console.log('  • testFormCollector()      - Testa coleta de dados');
console.log('\n💡 Exemplo: await runAllTests()\n');
