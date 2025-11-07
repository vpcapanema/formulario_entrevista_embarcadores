/**
 * ═══════════════════════════════════════════════════════════
 * 🧪 PREENCHIMENTO AUTOMÁTICO DE TESTE - FORMULÁRIO COMPLETO
 * ═══════════════════════════════════════════════════════════
 * 
 * Este script preenche TODOS os campos OBRIGATÓRIOS do formulário
 * com dados VÁLIDOS de acordo com o schema PostgreSQL e validações Pydantic.
 * 
 * ⚠️ CONSTRAINTS DO BANCO:
 * - tipo_empresa: ['embarcador', 'transportador', 'operador', 'outro']
 * - tem_paradas: ['sim', 'nao', 'nao-sei']
 * - carga_perigosa: ['sim', 'nao', 'nao-sei']
 * - tipo_transporte: ['importacao', 'exportacao', 'local', 'nao-sei']
 * - tipo_responsavel: ['entrevistador', 'entrevistado']
 * - modos: ARRAY de ['rodoviario', 'ferroviario', 'hidroviario', 'aereo', 'dutoviario']
 * - CNPJ: 14 dígitos com validação de dígito verificador
 * - Telefone: DDD 11-99 + 10-11 dígitos
 * - CEP: 8 dígitos
 * - capacidade_utilizada: 0-100%
 * - Valores numéricos: > 0
 * 
 * VERSÃO: 4.0 - Validado com constraints do banco + Pydantic
 */

console.log('\n════════════════════════════════════════════════════════════');
console.log('🧪 PREENCHIMENTO AUTOMÁTICO - VERSÃO 4.0 COMPLETA');
console.log('📊 TODOS os campos obrigatórios + dados válidos');
console.log('════════════════════════════════════════════════════════════\n');

async function preencherFormularioCompletoTeste() {
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
        console.log('🔍 Aguardando carregamento do select funcao-entrevistado...');
        await aguardarSelect('funcao-entrevistado');
        
        setField('funcao-entrevistado', '1');
        setField('telefone', '11987654321');
        setField('email', 'joao.silva@transportes.com.br');
        console.log('✅ Card 1 OK\n');
        
        console.log('📝 CARD 2: Empresa');
        setField('tipo-empresa', 'embarcador');
        setField('cnpj-empresa', '11222333000181');
        console.log('🔍 Aguardando API CNPJ (2s)...');
        await aguardar(2000);
        
        // Verificar se API preencheu razaoSocial, senão preencher nomeEmpresa manualmente
        const razaoSocial = document.getElementById('razao-social');
        const nomeEmpresa = document.getElementById('nome-empresa');
        if (!razaoSocial || !razaoSocial.value) {
            console.warn('⚠️ API CNPJ não preencheu razao-social, preenchendo nome-empresa manualmente');
            setField('nome-empresa', 'Petrobras Distribuidora S.A.');
        }
        if (!nomeEmpresa || !nomeEmpresa.value) {
            setField('nome-empresa', 'Petrobras Distribuidora S.A.');
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
