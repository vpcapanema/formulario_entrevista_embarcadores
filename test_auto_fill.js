/**
 * Script de Teste Automatizado - Formulário PLI 2050
 * 
 * Este script preenche automaticamente todos os campos do formulário
 * para testar as funcionalidades de validação, salvamento e exportação.
 * 
 * COMO USAR:
 * 1. Abra a aplicação no navegador (index.html)
 * 2. Abra o Console do navegador (F12 → Console)
 * 3. Cole este script completo e pressione Enter
 * 4. O formulário será preenchido automaticamente
 * 5. Clique em "Salvar Respostas" para testar validação e exportação
 */

(function() {
    console.log('🚀 Iniciando preenchimento automático do formulário...');
    
    // Função auxiliar para definir valor de input
    function setInputValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
            // Dispara evento para ativar validações
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`✓ ${id}: ${value}`);
            return true;
        }
        console.warn(`⚠ Campo não encontrado: ${id}`);
        return false;
    }
    
    // Função auxiliar para marcar checkbox
    function checkCheckbox(id) {
        const element = document.getElementById(id);
        if (element && element.type === 'checkbox') {
            element.checked = true;
            element.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`✓ Checkbox marcado: ${id}`);
            return true;
        }
        return false;
    }
    
    // Função auxiliar para selecionar radio button
    function selectRadio(name, value) {
        const radios = document.querySelectorAll(`input[name="${name}"]`);
        for (let radio of radios) {
            if (radio.value === value) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`✓ Radio selecionado: ${name} = ${value}`);
                return true;
            }
        }
        return false;
    }
    
    console.log('\n📝 CARD 1: Dados do Entrevistado');
    setInputValue('nome', 'João Silva Santos');
    setInputValue('funcao', 'Gerente de Logística');
    setInputValue('telefone', '(11) 98765-4321');
    setInputValue('email', 'joao.silva@exemplo.com.br');
    
    console.log('\n🏢 CARD 2: Dados da Empresa');
    setInputValue('tipo-empresa', 'embarcador');
    setInputValue('nome-empresa', 'Transportes ABC Logística Ltda');
    setInputValue('municipio', 'São Paulo-SP');
    
    console.log('\n📦 CARD 3: Produtos Transportados');
    console.log('Adicionando produtos à tabela...');
    
    // Adiciona primeiro produto
    if (typeof addProdutoRow === 'function') {
        addProdutoRow();
        setTimeout(() => {
            const rows = document.querySelectorAll('#produtos-tbody tr');
            if (rows.length > 0) {
                const inputs = rows[0].querySelectorAll('input, select');
                if (inputs[0]) inputs[0].value = 'Soja em Grãos';
                if (inputs[1]) inputs[1].value = '50000';
                if (inputs[2]) inputs[2].value = 'Mato Grosso-MT';
                if (inputs[3]) inputs[3].value = 'Santos-SP';
                if (inputs[4]) inputs[4].value = '1850';
                if (inputs[5]) inputs[5].value = 'Rodoviário';
                if (inputs[6]) inputs[6].value = 'Granel';
                console.log('✓ Produto 1 adicionado');
            }
        }, 100);
        
        // Adiciona segundo produto
        setTimeout(() => {
            addProdutoRow();
            setTimeout(() => {
                const rows = document.querySelectorAll('#produtos-tbody tr');
                if (rows.length > 1) {
                    const inputs = rows[1].querySelectorAll('input, select');
                    if (inputs[0]) inputs[0].value = 'Milho';
                    if (inputs[1]) inputs[1].value = '30000';
                    if (inputs[2]) inputs[2].value = 'Goiás-GO';
                    if (inputs[3]) inputs[3].value = 'Campinas-SP';
                    if (inputs[4]) inputs[4].value = '920';
                    if (inputs[5]) inputs[5].value = 'Ferroviário';
                    if (inputs[6]) inputs[6].value = 'Container';
                    console.log('✓ Produto 2 adicionado');
                }
            }, 100);
        }, 300);
        
        // Adiciona terceiro produto
        setTimeout(() => {
            addProdutoRow();
            setTimeout(() => {
                const rows = document.querySelectorAll('#produtos-tbody tr');
                if (rows.length > 2) {
                    const inputs = rows[2].querySelectorAll('input, select');
                    if (inputs[0]) inputs[0].value = 'Fertilizantes';
                    if (inputs[1]) inputs[1].value = '15000';
                    if (inputs[2]) inputs[2].value = 'Uberaba-MG';
                    if (inputs[3]) inputs[3].value = 'Ribeirão Preto-SP';
                    if (inputs[4]) inputs[4].value = '350';
                    if (inputs[5]) inputs[5].value = 'Rodoviário';
                    if (inputs[6]) inputs[6].value = 'Ensacado';
                    console.log('✓ Produto 3 adicionado');
                }
            }, 100);
        }, 600);
    }
    
    console.log('\n🎯 CARD 4: Produto Principal');
    setTimeout(() => {
        setInputValue('produto-principal', 'Soja em Grãos');
        setInputValue('agrupamento-produto', 'cereais');
    }, 800);
    
    console.log('\n🚚 CARD 5: Características do Transporte');
    setTimeout(() => {
        setInputValue('volume-anual', '50000');
        setInputValue('unidade-volume', 'toneladas');
        
        setInputValue('origem-pais', 'Brasil');
        setInputValue('origem-estado', 'Mato Grosso');
        setInputValue('origem-municipio', 'Sorriso');
        
        setInputValue('destino-pais', 'Brasil');
        setInputValue('destino-estado', 'São Paulo');
        setInputValue('destino-municipio', 'Santos');
        
        setInputValue('distancia', '1850');
        
        // Modalidades (checkbox múltiplo)
        checkCheckbox('modal-rodoviario');
        checkCheckbox('modal-ferroviario');
        
        setInputValue('tempo-dias', '3');
        setInputValue('tempo-horas', '12');
        setInputValue('tempo-minutos', '0');
        
        setInputValue('custo-transporte', '125.50');
        setInputValue('valor-carga', '85000');
        setInputValue('tipo-frete', 'cif');
        
        selectRadio('responsavel-contratacao', 'propria');
        
        setInputValue('acondicionamento', 'Granel (caminhão graneleiro)');
        setInputValue('embalagem', 'Sem embalagem - transporte a granel');
        
        setInputValue('frequencia-anual', '120');
        setInputValue('sazonalidade', 'Maior movimentação entre março e agosto (período de safra)');
        
        selectRadio('armazenagem', 'sim');
        setInputValue('tempo-armazenagem', '15');
    }, 1000);
    
    console.log('\n⚖️ CARD 6: Fatores de Decisão Modal');
    setTimeout(() => {
        // Custo
        setInputValue('importancia-custo', 'muito-alta');
        setInputValue('variacao-custo', '8');
        
        // Tempo
        setInputValue('importancia-tempo', 'alta');
        setInputValue('variacao-tempo', '15');
        
        // Confiabilidade
        setInputValue('importancia-confiabilidade', 'muito-alta');
        setInputValue('variacao-confiabilidade', '5');
        
        // Segurança
        setInputValue('importancia-seguranca', 'alta');
        setInputValue('variacao-seguranca', '10');
        
        // Capacidade
        setInputValue('importancia-capacidade', 'media');
        setInputValue('variacao-capacidade', '20');
    }, 1200);
    
    console.log('\n📊 CARD 7: Análise Estratégica');
    setTimeout(() => {
        selectRadio('tipo-cadeia', 'distribuicao');
        
        // Modais alternativos (checkbox múltiplo)
        checkCheckbox('alternativo-ferroviario');
        checkCheckbox('alternativo-hidroviario');
        
        setInputValue('fator-adicional', 'Disponibilidade de infraestrutura portuária e questões ambientais relacionadas ao transporte');
    }, 1400);
    
    console.log('\n⚠️ CARD 8: Dificuldades Logísticas');
    setTimeout(() => {
        // Dificuldades (checkbox múltiplo)
        checkCheckbox('dif-infraestrutura');
        checkCheckbox('dif-custos');
        checkCheckbox('dif-confiabilidade');
        
        setInputValue('detalhamento-dificuldades', 'Principais desafios: estado precário das rodovias no trecho MT-SP, alto custo do frete rodoviário e baixa disponibilidade de vagões ferroviários. A infraestrutura portuária em Santos apresenta congestionamentos frequentes durante a safra.');
    }, 1600);
    
    console.log('\n✅ Formulário preenchido com sucesso!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Verifique visualmente os campos preenchidos');
    console.log('2. Role a página até o final');
    console.log('3. Clique no botão "💾 Salvar Respostas"');
    console.log('4. Teste a validação (todas as perguntas obrigatórias estão preenchidas)');
    console.log('5. Teste o download automático do Excel');
    console.log('6. Teste o popup de confirmação');
    console.log('\n🔍 Para testar a validação de campos vazios:');
    console.log('- Limpe alguns campos obrigatórios e tente salvar');
    console.log('- O sistema deve mostrar popup com lista de erros');
    console.log('\n📊 Para testar visualizações:');
    console.log('- Clique na aba "Respostas" para ver dados salvos');
    console.log('- Clique na aba "Analytics" para ver gráficos');
    console.log('- Clique na aba "Visualizador" para ver IndexedDB');
    
})();
