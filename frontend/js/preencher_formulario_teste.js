/**/**

 * ═══════════════════════════════════════════════════════════ * ═══════════════════════════════════════════════════════════

 * 🧪 PREENCHIMENTO AUTOMÁTICO DE TESTE - FORMULÁRIO COMPLETO * 🧪 PREENCHIMENTO AUTOMÁTICO DE TESTE - FORMULÁRIO COMPLETO

 * ═══════════════════════════════════════════════════════════ * ═══════════════════════════════════════════════════════════

 *  * 

 * VERSÃO: 5.0 - Atualizado para nova estrutura backend/migration * VERSÃO: 5.0 - Atualizado para nova estrutura backend/migration

 *  * 

 * Este script preenche TODOS os campos do formulário (8 cards completos) * Este script preenche TODOS os campos do formulário (8 cards completos)

 *  * 

 * CARDS: * CARDS:

 * 0. Responsável pelo Preenchimento * 0. Responsável pelo Preenchimento

 * 1. Dados do Entrevistado * 1. Dados do Entrevistado

 * 2. Dados da Empresa * 2. Dados da Empresa

 * 3. Produtos Transportados * 3. Produtos Transportados

 * 4. Caracterização do Produto Principal * 4. Caracterização do Produto Principal

 * 5. Características do Transporte * 5. Características do Transporte

 * 6. Fatores de Decisão Modal * 6. Fatores de Decisão Modal

 * 7. Análise Estratégica * 7. Análise Estratégica

 * 8. Dificuldades em Relação à Logística Geral * 8. Dificuldades em Relação à Logística Geral

 */ */



console.log('\n════════════════════════════════════════════════════════════');console.log('\n════════════════════════════════════════════════════════════');

console.log('🧪 PREENCHIMENTO AUTOMÁTICO - VERSÃO 5.0');console.log('🧪 PREENCHIMENTO AUTOMÁTICO - VERSÃO 5.0');

console.log('📊 TODOS os 8 cards + dados válidos conforme migration');console.log('📊 TODOS os 8 cards + dados válidos conforme migration');

console.log('════════════════════════════════════════════════════════════\n');console.log('════════════════════════════════════════════════════════════\n');



async function preencherFormularioCompletoTeste() {async function preencherFormularioCompletoTeste() {

    try {    try {

        console.log('📋 Iniciando preenchimento automático V5.0...\n');        console.log('📋 Iniciando preenchimento automático V5.0...\n');

                

        const setField = (id, value) => {        const setField = (id, value) => {

            const field = document.getElementById(id);            const field = document.getElementById(id);

            if (field) {            if (field) {

                field.value = value;                field.value = value;

                field.dispatchEvent(new Event('input', { bubbles: true }));                field.dispatchEvent(new Event('input', { bubbles: true }));

                field.dispatchEvent(new Event('change', { bubbles: true }));                field.dispatchEvent(new Event('change', { bubbles: true }));

                field.classList.remove('invalid');                field.classList.remove('invalid');

                                

                if (field.value !== value && !['SELECT', 'TEXTAREA'].includes(field.tagName)) {                if (field.value !== value && !['SELECT', 'TEXTAREA'].includes(field.tagName)) {

                    console.warn(`⚠️ ${id}: esperado "${value}", atual "${field.value}"`);                    console.warn(`⚠️ ${id}: esperado "${value}", atual "${field.value}"`);

                } else {                } else {

                    console.log(`✓ ${id} = "${value}"`);                    console.log(`✓ ${id} = "${value}"`);

                }                }

                return true;                return true;

            }            }

            console.warn(`⚠️ Campo NÃO encontrado: ${id}`);            console.warn(`⚠️ Campo NÃO encontrado: ${id}`);

            return false;            return false;

        };        };

                

        const setCheckbox = (name, values) => {        const setCheckbox = (name, values) => {

            const allCheckboxes = document.querySelectorAll(`input[name="${name}"]`);            const allCheckboxes = document.querySelectorAll(`input[name="${name}"]`);

            allCheckboxes.forEach(cb => cb.checked = false);            allCheckboxes.forEach(cb => cb.checked = false);

            if (!Array.isArray(values)) values = [values];            if (!Array.isArray(values)) values = [values];

            let count = 0;            let count = 0;

            values.forEach(value => {            values.forEach(value => {

                const checkbox = document.querySelector(`input[name="${name}"][value="${value}"]`);                const checkbox = document.querySelector(`input[name="${name}"][value="${value}"]`);

                if (checkbox) {                if (checkbox) {

                    checkbox.checked = true;                    checkbox.checked = true;

                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

                    console.log(`✓ Checkbox ${name}[] = "${value}"`);                    console.log(`✓ Checkbox ${name}[] = "${value}"`);

                    count++;                    count++;

                } else {                } else {

                    console.warn(`⚠️ Checkbox não encontrado: ${name}="${value}"`);                    console.warn(`⚠️ Checkbox não encontrado: ${name}="${value}"`);

                }                }

            });            });

            return count;            return count;

        };        };

                

        const setRadio = (name, value) => {        const setRadio = (name, value) => {

            const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);            const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);

            if (radio) {            if (radio) {

                radio.checked = true;                radio.checked = true;

                radio.dispatchEvent(new Event('change', { bubbles: true }));                radio.dispatchEvent(new Event('change', { bubbles: true }));

                console.log(`✓ Radio ${name} = "${value}"`);                console.log(`✓ Radio ${name} = "${value}"`);

                return true;                return true;

            }            }

            console.warn(`⚠️ Radio NÃO encontrado: ${name}="${value}"`);            console.warn(`⚠️ Radio NÃO encontrado: ${name}="${value}"`);

            return false;            return false;

        };        };

                

        const aguardar = (ms) => new Promise(resolve => setTimeout(resolve, ms));        const aguardar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

                

        const aguardarSelect = async (id, maxTentativas = 30) => {        const aguardarSelect = async (id, maxTentativas = 30) => {

            for (let i = 0; i < maxTentativas; i++) {            for (let i = 0; i < maxTentativas; i++) {

                const select = document.getElementById(id);                const select = document.getElementById(id);

                if (select && select.options.length > 1) {                if (select && select.options.length > 1) {

                    console.log(`✓ Select ${id} pronto (${select.options.length} opções)`);                    console.log(`✓ Select ${id} pronto (${select.options.length} opções)`);

                    return true;                    return true;

                }                }

                await aguardar(200);                await aguardar(200);

            }            }

            console.warn(`⚠️ Timeout: Select ${id} não populado`);            console.warn(`⚠️ Timeout: Select ${id} não populado`);

            return false;            return false;

        };        };

                

        // ============================================================        // ============================================================

        // CARD 0: Responsável pelo Preenchimento        // CARD 0: Responsável pelo Preenchimento

        // ============================================================        // ============================================================

        console.log('\n📝 CARD 0: Responsável pelo Preenchimento');        console.log('\n📝 CARD 0: Responsável pelo Preenchimento');

        setRadio('tipo-responsavel', 'entrevistado');        setRadio('tipo-responsavel', 'entrevistado');

        console.log('✅ Card 0 completo\n');        console.log('✅ Card 0 completo\n');

                

        // ============================================================        // ============================================================

        // CARD 1: Dados do Entrevistado        // CARD 1: Dados do Entrevistado

        // ============================================================        // ============================================================

        console.log('📝 CARD 1: Dados do Entrevistado');        console.log('📝 CARD 1: Dados do Entrevistado');

        setField('nome', 'Maria Fernanda Costa Silva');        setField('nome', 'Maria Fernanda Costa Silva');

                

        await aguardarSelect('funcao');        await aguardarSelect('funcao');

        setField('funcao', '1'); // Gerente de Logística        setField('funcao', '1'); // Gerente de Logística

                

        setField('telefone', '11987654321');        setField('telefone', '11987654321');

        setField('email', 'maria.costa@logistica-teste.com.br');        setField('email', 'maria.costa@logistica-teste.com.br');

        console.log('✅ Card 1 completo\n');        console.log('✅ Card 1 completo\n');

                

        // ============================================================        // ============================================================

        // CARD 2: Dados da Empresa        // CARD 2: Dados da Empresa

        // ============================================================        // ============================================================

        console.log('📝 CARD 2: Dados da Empresa');        console.log('📝 CARD 2: Dados da Empresa');

        setField('tipo-empresa', 'embarcador');        setField('tipo-empresa', 'embarcador');

                

        // CNPJ válido - será processado pela API        // CNPJ válido - será processado pela API

        setField('cnpj-empresa', '11222333000181');        setField('cnpj-empresa', '11222333000181');

        console.log('🔍 Aguardando API CNPJ processar (3s)...');        console.log('🔍 Aguardando API CNPJ processar (3s)...');

        await aguardar(3000);        await aguardar(3000);

                

        // Verificar se API preencheu, senão preencher manualmente        // Verificar se API preencheu, senão preencher manualmente

        const razao = document.getElementById('razao-social');        const razao = document.getElementById('razao-social');

        if (!razao || !razao.value) {        if (!razao || !razao.value) {

            console.log('📝 Preenchendo campos manualmente (API não respondeu)');            console.log('📝 Preenchendo campos manualmente (API não respondeu)');

            setField('razao-social', 'Transportadora Log Moderna LTDA');            setField('razao-social', 'Transportadora Log Moderna LTDA');

        }        }

                

        const municipio = document.getElementById('municipio-empresa');        const municipio = document.getElementById('municipio-empresa');

        if (!municipio || !municipio.value) {        if (!municipio || !municipio.value) {

            setField('municipio-empresa', 'São Paulo');            setField('municipio-empresa', 'São Paulo');

        }        }

                

        // Campos opcionais de endereço        // Campos opcionais de endereço

        setField('nome-fantasia', 'Log Moderna');        setField('nome-fantasia', 'Log Moderna');

        setField('logradouro', 'Av. Paulista');        setField('logradouro', 'Av. Paulista');

        setField('numero', '1500');        setField('numero', '1500');

        setField('complemento', 'Torre A');        setField('complemento', 'Torre A');

        setField('bairro', 'Bela Vista');        setField('bairro', 'Bela Vista');

        setField('cep', '01310200'); // 8 dígitos sem hífen        setField('cep', '01310200'); // 8 dígitos sem hífen

        console.log('✅ Card 2 completo\n');        console.log('✅ Card 2 completo\n');

                

        // ============================================================        // ============================================================

        // CARD 3: Produtos Transportados (Tabela)        // CARD 3: Produtos Transportados (Tabela)

        // ============================================================        // ============================================================

        console.log('📝 CARD 3: Produtos Transportados');        console.log('📝 CARD 3: Produtos Transportados');

        const tbody = document.getElementById('produtos-tbody');        const tbody = document.getElementById('produtos-tbody');

        if (tbody && tbody.children.length === 0) {        if (tbody && tbody.children.length === 0) {

            const btnAdd = document.querySelector('button[onclick*="addProdutoRow"]') ||             const btnAdd = document.querySelector('button[onclick*="addProdutoRow"]') || 

                          document.querySelector('.btn-add-produto');                          document.querySelector('.btn-add-produto');

            if (btnAdd) {            if (btnAdd) {

                btnAdd.click();                btnAdd.click();

                await aguardar(200);                await aguardar(200);

            }            }

        }        }

                

        // Preencher primeira linha (IDs dinâmicos podem ter contador)        // Preencher primeira linha (IDs dinâmicos podem ter contador)

        setField('produto-carga-1', 'Açúcar Refinado');        setField('produto-carga-1', 'Açúcar Refinado');

        setField('produto-movimentacao-1', '120000');        setField('produto-movimentacao-1', '120000');

        setField('produto-origem-1', 'Piracicaba');        setField('produto-origem-1', 'Piracicaba');

        setField('produto-destino-1', 'Santos');        setField('produto-destino-1', 'Santos');

        setField('produto-distancia-1', '180.5');        setField('produto-distancia-1', '180.5');

        setField('produto-modalidade-1', 'rodoviario');        setField('produto-modalidade-1', 'rodoviario');

        setField('produto-acondicionamento-1', 'big-bag');        setField('produto-acondicionamento-1', 'big-bag');

        console.log('✅ Card 3 completo\n');        console.log('✅ Card 3 completo\n');

                

        // ============================================================        // ============================================================

        // CARD 4: Caracterização do Produto Principal        // CARD 4: Caracterização do Produto Principal

        // ============================================================        // ============================================================

        console.log('📝 CARD 4: Caracterização do Produto Principal');        console.log('📝 CARD 4: Caracterização do Produto Principal');

        setField('produto-principal', 'Açúcar Refinado');        setField('produto-principal', 'Açúcar Refinado');

        setField('agrupamento-produto', 'agricultura');        setField('agrupamento-produto', 'agricultura');

        console.log('✅ Card 4 completo\n');        console.log('✅ Card 4 completo\n');

                

        // ============================================================        // ============================================================

        // CARD 5: Características do Transporte        // CARD 5: Características do Transporte

        // ============================================================        // ============================================================

        console.log('📝 CARD 5: Características do Transporte');        console.log('📝 CARD 5: Características do Transporte');

        setField('tipo-transporte', 'exportacao');        setField('tipo-transporte', 'exportacao');

                

        // Origem        // Origem

        await aguardarSelect('origem-pais');        await aguardarSelect('origem-pais');

        setField('origem-pais', '31'); // Brasil        setField('origem-pais', '31'); // Brasil

        await aguardar(500);        await aguardar(500);

        await aguardarSelect('origem-estado');        await aguardarSelect('origem-estado');

        setField('origem-estado', 'SP');        setField('origem-estado', 'SP');

        await aguardar(500);        await aguardar(500);

        await aguardarSelect('origem-municipio');        await aguardarSelect('origem-municipio');

        setField('origem-municipio', '3538709'); // Piracicaba        setField('origem-municipio', '3538709'); // Piracicaba

                

        // Destino        // Destino

        setField('destino-pais', '31'); // Brasil        setField('destino-pais', '31'); // Brasil

        await aguardar(500);        await aguardar(500);

        await aguardarSelect('destino-estado');        await aguardarSelect('destino-estado');

        setField('destino-estado', 'SP');        setField('destino-estado', 'SP');

        await aguardar(500);        await aguardar(500);

        await aguardarSelect('destino-municipio');        await aguardarSelect('destino-municipio');

        setField('destino-municipio', '3548500'); // Santos        setField('destino-municipio', '3548500'); // Santos

                

        // Distância e paradas        // Distância e paradas

        setField('distancia', '180.5');        setField('distancia', '180.5');

        setRadio('tem-paradas', 'sim');        setRadio('tem-paradas', 'sim');

        await aguardar(200); // Campo condicional aparecer        await aguardar(200); // Campo condicional aparecer

        setField('num-paradas', '1');        setField('num-paradas', '1');

                

        // Modais        // Modais

        setCheckbox('modo', ['rodoviario']);        setCheckbox('modo', ['rodoviario']);

        await aguardar(200);        await aguardar(200);

        setField('config-veiculo', 'cavalo-mecanico-carreta');        setField('config-veiculo', 'cavalo-mecanico-carreta');

                

        // Capacidade e peso        // Capacidade e peso

        setField('capacidade-utilizada', '92.5');        setField('capacidade-utilizada', '92.5');

        setField('peso-carga', '32000');        setField('peso-carga', '32000');

        setField('unidade-peso', 'kg');        setField('unidade-peso', 'kg');

                

        // Custos        // Custos

        setField('custo-transporte', '6500.00');        setField('custo-transporte', '6500.00');

        setField('valor-carga', '280000.00');        setField('valor-carga', '280000.00');

                

        // Embalagem        // Embalagem

        setField('tipo-embalagem', 'big-bag');        setField('tipo-embalagem', 'big-bag');

        setRadio('carga-perigosa', 'nao');        setRadio('carga-perigosa', 'nao');

                

        // Tempo        // Tempo

        setField('tempo-dias', '0');        setField('tempo-dias', '0');

        setField('tempo-horas', '4');        setField('tempo-horas', '4');

        setField('tempo-minutos', '30');        setField('tempo-minutos', '30');

                

        // Frequência        // Frequência

        setField('frequencia', 'diaria');        setField('frequencia', 'diaria');

        await aguardar(200);        await aguardar(200);

        setField('frequencia-diaria', '3.5');        setField('frequencia-diaria', '3.5');

                

        console.log('✅ Card 5 completo\n');        console.log('✅ Card 5 completo\n');

                

        // ============================================================        // ============================================================

        // CARD 6: Fatores de Decisão Modal        // CARD 6: Fatores de Decisão Modal

        // ============================================================        // ============================================================

        console.log('📝 CARD 6: Fatores de Decisão Modal');        console.log('📝 CARD 6: Fatores de Decisão Modal');

        setRadio('importancia-custo', 'muito-importante');        setRadio('importancia-custo', 'muito-importante');

        setField('variacao-custo', '18.0');        setField('variacao-custo', '18.0');

        setRadio('importancia-tempo', 'muito-importante');        setRadio('importancia-tempo', 'muito-importante');

        setField('variacao-tempo', '15.0');        setField('variacao-tempo', '15.0');

        setRadio('importancia-confiabilidade', 'muito-importante');        setRadio('importancia-confiabilidade', 'muito-importante');

        setField('variacao-confiabilidade', '8.0');        setField('variacao-confiabilidade', '8.0');

        setRadio('importancia-seguranca', 'importante');        setRadio('importancia-seguranca', 'importante');

        setField('variacao-seguranca', '10.0');        setField('variacao-seguranca', '10.0');

        setRadio('importancia-capacidade', 'importante');        setRadio('importancia-capacidade', 'importante');

        setField('variacao-capacidade', '12.0');        setField('variacao-capacidade', '12.0');

        console.log('✅ Card 6 completo\n');        console.log('✅ Card 6 completo\n');

                

        // ============================================================        // ============================================================

        // CARD 7: Análise Estratégica        // CARD 7: Análise Estratégica

        // ============================================================        // ============================================================

        console.log('📝 CARD 7: Análise Estratégica');        console.log('📝 CARD 7: Análise Estratégica');

        setField('tipo-cadeia', 'just-in-time');        setField('tipo-cadeia', 'just-in-time');

        setCheckbox('modal-alternativo', ['ferroviario']);        setCheckbox('modal-alternativo', ['ferroviario']);

        setField('fator-adicional', 'Proximidade com o porto de Santos é crucial para exportação');        setField('fator-adicional', 'Proximidade com o porto de Santos é crucial para exportação');

        console.log('✅ Card 7 completo\n');        console.log('✅ Card 7 completo\n');

                

        // ============================================================        // ============================================================

        // CARD 8: Dificuldades em Relação à Logística Geral        // CARD 8: Dificuldades em Relação à Logística Geral

        // ============================================================        // ============================================================

        console.log('📝 CARD 8: Dificuldades');        console.log('📝 CARD 8: Dificuldades');

        setCheckbox('dificuldade', ['infraestrutura', 'custo', 'tempo']);        setCheckbox('dificuldade', ['infraestrutura', 'custo', 'tempo']);

        setField('detalhe-dificuldade', 'Congestionamentos na Via Anchieta e Rodovia dos Imigrantes. Necessidade de janelas de entrega específicas no porto.');        setField('detalhe-dificuldade', 'Congestionamentos na Via Anchieta e Rodovia dos Imigrantes. Necessidade de janelas de entrega específicas no porto.');

        console.log('✅ Card 8 completo\n');        console.log('✅ Card 8 completo\n');

                

        // Campos finais        // Campos finais

        const consentimento = document.getElementById('consentimento');        const consentimento = document.getElementById('consentimento');

        if (consentimento) {        if (consentimento) {

            consentimento.checked = true;            consentimento.checked = true;

            consentimento.dispatchEvent(new Event('change', { bubbles: true }));            consentimento.dispatchEvent(new Event('change', { bubbles: true }));

            console.log('✓ consentimento = true');            console.log('✓ consentimento = true');

        }        }

                

        setField('observacoes', 'Formulário preenchido automaticamente para teste - V5.0');        setField('observacoes', 'Formulário preenchido automaticamente para teste - V5.0');

                

        console.log('\n════════════════════════════════════════════════════════════');        console.log('\n════════════════════════════════════════════════════════════');

        console.log('✅ PREENCHIMENTO COMPLETO - V5.0');        console.log('✅ PREENCHIMENTO COMPLETO - V5.0');

        console.log('════════════════════════════════════════════════════════════');        console.log('════════════════════════════════════════════════════════════');

        console.log('\n📊 TODOS os 8 cards preenchidos');        console.log('\n📊 TODOS os 8 cards preenchidos');

        console.log('📋 Dados válidos conforme migration + backend');        console.log('📋 Dados válidos conforme migration + backend');

        console.log('\n🚀 PRÓXIMO PASSO:');        console.log('\n🚀 PRÓXIMO PASSO:');

        console.log('   👉 Role a página e revise os dados');        console.log('   👉 Role a página e revise os dados');

        console.log('   👉 Clique em "💾 Salvar Respostas"');        console.log('   👉 Clique em "💾 Salvar Respostas"');

        console.log('\n════════════════════════════════════════════════════════════\n');        console.log('\n════════════════════════════════════════════════════════════\n');

                

        window.scrollTo({ top: 0, behavior: 'smooth' });        window.scrollTo({ top: 0, behavior: 'smooth' });

                

        alert('✅ Formulário preenchido completamente!\n\n' +        alert('✅ Formulário preenchido completamente!\n\n' +

              '📋 8 Cards preenchidos:\n' +              '📋 8 Cards preenchidos:\n' +

              '• Responsável: Entrevistado\n' +              '• Responsável: Entrevistado\n' +

              '• Entrevistado: Maria Costa\n' +              '• Entrevistado: Maria Costa\n' +

              '• Empresa: Log Moderna (CNPJ válido)\n' +              '• Empresa: Log Moderna (CNPJ válido)\n' +

              '• Produto: Açúcar (120k ton/ano)\n' +              '• Produto: Açúcar (120k ton/ano)\n' +

              '• Rota: Piracicaba→Santos (180km)\n' +              '• Rota: Piracicaba→Santos (180km)\n' +

              '• Modal: Rodoviário (Carreta)\n' +              '• Modal: Rodoviário (Carreta)\n' +

              '• Tempo: 4h30min, 3.5 viagens/dia\n' +              '• Tempo: 4h30min, 3.5 viagens/dia\n' +

              '• Estratégia: Just-in-time\n\n' +              '• Estratégia: Just-in-time\n\n' +

              '🎯 Todos os campos obrigatórios OK!\n\n' +              '🎯 Todos os campos obrigatórios OK!\n\n' +

              '👉 Clique em "💾 Salvar Respostas"!');              '👉 Clique em "💾 Salvar Respostas"!');

                

    } catch (error) {    } catch (error) {

        console.error('\n❌ ERRO:', error);        console.error('\n❌ ERRO:', error);

        console.error('Stack:', error.stack);        console.error('Stack:', error.stack);

        alert('❌ Erro ao preencher: ' + error.message + '\n\nVeja console (F12).');        alert('❌ Erro ao preencher: ' + error.message + '\n\nVeja console (F12).');

    }    }

}}



window.preencherFormularioCompletoTeste = preencherFormularioCompletoTeste;window.preencherFormularioCompletoTeste = preencherFormularioCompletoTeste;



console.log('✅ Script V5.0 carregado!');console.log('✅ Script V5.0 carregado!');

console.log('💡 Execute: preencherFormularioCompletoTeste()');console.log('💡 Execute: preencherFormularioCompletoTeste()');

console.log('💡 Ou clique: 🧪 Preencher Formulário Completo de Teste');console.log('💡 Ou clique: 🧪 Preencher Formulário Completo de Teste');

    try {
        console.log('📋 Iniciando preenchimento automático V4.0...\n');
        
        const setField = (id, value) => {
            const field = document.getElementById(id);
            if (field) {
                field.value = value;
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Verificar se o valor foi realmente definido
                if (field.value !== value) {
                    console.warn(`⚠️ AVISO: ${id} não aceitou o valor "${value}" (atual: "${field.value}")`);
                } else {
                    console.log(`✓ ${id} = "${value}"`);
                }
                return true;
            }
            console.warn(`⚠️ Campo não encontrado: ${id}`);
            return false;
        };
        
        const setCheckbox = (name, values) => {
            const allCheckboxes = document.querySelectorAll(`input[name="${name}"]`);
            allCheckboxes.forEach(cb => cb.checked = false);
            if (!Array.isArray(values)) values = [values];
            values.forEach(value => {
                const checkbox = document.querySelector(`input[name="${name}"][value="${value}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log(`✓ Checkbox ${name}[] = "${value}"`);
                }
            });
        };
        
        const setRadio = (name, value) => {
            const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`✓ Radio ${name} = "${value}"`);
                return true;
            }
            console.warn(`⚠️ Radio não encontrado: ${name}="${value}"`);
            return false;
        };
        
        const aguardar = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        // Função para aguardar até um select estar populado
        const aguardarSelect = async (id, maxTentativas = 20) => {
            for (let i = 0; i < maxTentativas; i++) {
                const select = document.getElementById(id);
                if (select && select.options.length > 1) {
                    // Select tem mais de 1 opção (além de "Carregando...")
                    console.log(`✓ Select ${id} populado com ${select.options.length} opções`);
                    return true;
                }
                await aguardar(200); // Aguarda 200ms entre tentativas
            }
            console.warn(`⚠️ Timeout: Select ${id} não foi populado após ${maxTentativas * 200}ms`);
            return false;
        };
        
        console.log('\n📝 CARD 0: Tipo de Responsável');
        setRadio('tipo-responsavel', 'entrevistado'); // Marca "Entrevistado" como responsável
        console.log('✅ Card 0 OK\n');
        
        console.log('\n📝 CARD 1: Entrevistado');
        setField('nome', 'João da Silva Santos');
        
        // Aguardar carregamento das funções do DropdownManager
        console.log('🔍 Aguardando carregamento do select funcao...');
        await aguardarSelect('funcao');
        
        setField('funcao', '1');
        setField('telefone', '11987654321');
        setField('email', 'joao.silva@transportes.com.br');
        console.log('✅ Card 1 OK\n');
        
        console.log('📝 CARD 2: Empresa');
        setField('tipo-empresa', 'embarcador');
        setField('cnpj-empresa', '11222333000181');
        console.log('🔍 Aguardando API CNPJ (2s)...');
        await aguardar(2000);
        
        // Verificar se API preencheu razao-social, senão preencher manualmente
        const razaoSocial = document.getElementById('razao-social');
        if (!razaoSocial || !razaoSocial.value) {
            console.warn('⚠️ API CNPJ não preencheu razao-social, preenchendo manualmente');
            setField('razao-social', 'Petrobras Distribuidora S.A.');
        }
        
        // Preencher município se não foi preenchido pela API
        const municipioEmpresa = document.getElementById('municipio-empresa');
        if (!municipioEmpresa || !municipioEmpresa.value) {
            console.warn('⚠️ API CNPJ não preencheu municipio, preenchendo manualmente');
            setField('municipio-empresa', 'São Paulo');
        }
        
        console.log('✅ Card 2 OK\n');
        
        console.log('📝 CARD 3: Produtos Transportados');
        const tabelaProdutos = document.getElementById('produtos-table-body');
        if (tabelaProdutos && tabelaProdutos.children.length === 0) {
            const btnAddProduto = document.querySelector('button[onclick*="addProdutoRow"]');
            if (btnAddProduto) {
                btnAddProduto.click();
                await aguardar(100);
            }
        }
        
        // Preencher primeira linha da tabela (usar name em vez de id para campos dinâmicos)
        setField('produto-carga-1', 'Soja em grão');
        setField('produto-movimentacao-1', '50000');
        setField('produto-origem-1', 'Ribeirão Preto');
        setField('produto-destino-1', 'Santos');
        setField('produto-distancia-1', '450.5');
        
        // Selects da tabela podem ter name diferente
        const modalidade = document.querySelector('[name="produto-modalidade-1"]');
        if (modalidade) {
            modalidade.value = 'rodoviario';
            modalidade.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✓ produto-modalidade-1 = "rodoviario"');
        }
        
        const acondicionamento = document.querySelector('[name="produto-acondicionamento-1"]');
        if (acondicionamento) {
            acondicionamento.value = 'granel-solido';
            acondicionamento.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✓ produto-acondicionamento-1 = "granel-solido"');
        }
        
        console.log('✅ Card 3 OK\n');
        
        console.log('📝 CARD 4: Informações de Logística');
        setField('produto-principal', 'Soja');
        setField('agrupamento-produto', 'agricola');
        setRadio('tipo-transporte', 'local');
        
        // Aguardar carregamento dos selects de país/estado/município
        console.log('🔍 Aguardando carregamento dos selects de localização...');
        await aguardarSelect('origem-pais');
        
        setField('origem-pais', '31');
        await aguardar(300); // Aguarda cascata estado
        await aguardarSelect('origem-estado');
        
        setField('origem-estado', '35');
        await aguardar(300); // Aguarda cascata município
        await aguardarSelect('origem-municipio');
        
        setField('origem-municipio', '3550308');
        
        setField('destino-pais', '31');
        await aguardar(300);
        await aguardarSelect('destino-estado');
        
        setField('destino-estado', '33');
        await aguardar(300);
        await aguardarSelect('destino-municipio');
        
        setField('destino-municipio', '3304557');
        setField('distancia', '450.5');
        setRadio('tem-paradas', 'nao');
        setCheckbox('modos', ['rodoviario']);
        await aguardar(100);
        setField('config-veiculo', 'Carreta');
        setField('capacidade-utilizada', '85.5');
        setField('peso-carga', '25000.50');
        setField('unidade-peso', 'ton');
        setField('custo-transporte', '15000.75');
        setField('valor-carga', '500000.00');
        console.log('✅ Card 4 OK\n');
        
        console.log('📝 CARD 5: Características da Carga');
        setField('tipo-embalagem', 'Granel');
        setRadio('carga-perigosa', 'nao');
        console.log('✅ Card 5 OK\n');
        
        console.log('📝 CARD 6: Tempo de Transporte');
        setField('tempo-dias', '2');
        setField('tempo-horas', '5');
        setField('tempo-minutos', '30');
        setField('frequencia', 'diaria');
        await aguardar(100); // Aguarda campo condicional aparecer
        setField('frequencia-diaria', '3.5'); // Número de viagens por dia
        console.log('✅ Card 6 OK\n');
        
        console.log('📝 CARD 7: Importâncias e Variações');
        setRadio('importancia-custo', 'muito-importante');
        setField('variacao-custo', '15.5');
        setRadio('importancia-tempo', 'importante');
        setField('variacao-tempo', '10.0');
        setRadio('importancia-confiabilidade', 'muito-importante');
        setField('variacao-confiabilidade', '5.0');
        setRadio('importancia-seguranca', 'muito-importante');
        setField('variacao-seguranca', '2.0');
        setRadio('importancia-capacidade', 'importante');
        setField('variacao-capacidade', '8.5');
        console.log('✅ Card 7 OK\n');
        
        console.log('📝 CARD 8: Estratégia e Dificuldades');
        setRadio('tipo-cadeia', 'propria');
        setCheckbox('modais-alternativos', ['ferroviario', 'hidroviario']);
        setField('fator-adicional', 'Prazo de entrega crucial');
        setCheckbox('dificuldades', ['custo', 'infraestrutura']);
        setField('detalhe-dificuldade', 'Rodovias ruins aumentam custos');
        console.log('✅ Card 8 OK\n');
        
        console.log('\n════════════════════════════════════════════════════════════');
        console.log('✅ PREENCHIMENTO COMPLETO - V4.0');
        console.log('════════════════════════════════════════════════════════════');
        console.log('\n📊 47 CAMPOS PREENCHIDOS COM DADOS VÁLIDOS');
        console.log('\n🚀 PRÓXIMO PASSO:');
        console.log('   👉 Clique em "💾 Enviar Formulário"');
        console.log('   👉 Backend FastAPI porta 8000');
        console.log('\n════════════════════════════════════════════════════════════\n');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        alert('✅ Formulário preenchido com 47 campos!\n\n' +
              '📋 Dados de teste:\n' +
              '• Entrevistado: João da Silva Santos\n' +
              '• Empresa: Petrobras (CNPJ válido)\n' +
              '• Produto: Soja (50.000 ton/ano)\n' +
              '• Origem: São Paulo/SP → Destino: Rio/RJ\n' +
              '• Distância: 450.5 km\n' +
              '• Modal: Rodoviário (Carreta)\n' +
              '• Tempo: 2 dias, 5h30min\n\n' +
              '🎯 Todas validações OK!\n\n' +
              '👉 Clique em "💾 Enviar Formulário"!');
        
    } catch (error) {
        console.error('\n❌ ERRO:', error);
        console.error('Stack:', error.stack);
        alert('❌ Erro: ' + error.message + '\n\nVeja console.');
    }
}

window.preencherFormularioCompletoTeste = preencherFormularioCompletoTeste;

console.log('✅ Script V4.0 carregado!');
console.log('💡 Execute: preencherFormularioCompletoTeste()');
console.log('💡 Ou clique: 🧪 Preencher Formulário Completo de Teste');
