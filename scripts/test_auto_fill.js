/**
 * =====================================================
 * Script de Teste Automatizado - Formulário PLI 2050
 * =====================================================
 * 
 * Este script preenche automaticamente todos os campos do formulário
 * para testar as funcionalidades de validação, salvamento e exportação.
 * 
 * VERSÃO: 2.0 (Atualizado em 05/11/2025)
 * 
 * ATUALIZAÇÕES RECENTES:
 * - ✅ Nomes de pessoas em UPPERCASE (padrão corporativo)
 * - ✅ Municípios disponíveis para TODOS os estados
 * - ✅ Capacidade utilizada: campo numérico (0-100%)
 * - ✅ Frequência diária: campo numérico (0.5-100 viagens)
 * - ✅ Número de paradas: opção "Mais de 10" com campo exato
 * - ✅ CNPJ com auto-preenchimento via Receita Federal
 * - ✅ Validação visual com destaque de erros
 * - ✅ Países e municípios com dados reais (IBGE/MDIC)
 * 
 * COMO USAR:
 * 1. Abra a aplicação no navegador (index.html)
 * 2. Abra o Console do navegador (F12 → Console)
 * 3. Cole este script completo e pressione Enter
 * 4. O formulário será preenchido automaticamente
 * 5. Clique em "💾 Salvar Respostas" para testar
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
    
    console.log('\n📝 CARTÃO 0: Responsável pelo Preenchimento');
    selectRadio('tipo-responsavel', 'entrevistado');
    
    console.log('\n📝 CARD 1: Dados do Entrevistado');
    // Nome em UPPERCASE (padrão corporativo brasileiro)
    setInputValue('nome', 'JOÃO PEDRO DA SILVA SANTOS');
    setInputValue('funcao', 'Gerente de Logística');
    setInputValue('telefone', '(11) 98765-4321');
    setInputValue('email', 'joao.silva@exemplo.com.br');
    
    console.log('\n🏢 CARD 2: Dados da Empresa');
    setInputValue('tipo-empresa', 'embarcador');
    
    // CNPJ com auto-preenchimento (Receita Federal)
    setInputValue('cnpj', '33.683.111/0001-07');
    // Aguardar auto-preenchimento da razão social
    setTimeout(() => {
        console.log('⏳ Buscando dados da Receita Federal...');
    }, 100);
    
    // Pais e Município (agora disponível para todos os estados)
    setTimeout(() => {
        setInputValue('pais', 'Brasil');
        setTimeout(() => {
            setInputValue('estado', 'São Paulo');
            setTimeout(() => {
                setInputValue('municipio', 'São Paulo');
            }, 300);
        }, 200);
    }, 500);
    
    console.log('\n📦 CARD 3: Produtos Transportados');
    console.log('⚠️  Nota: Tabela de produtos deve ser preenchida manualmente');
    console.log('   (A função addProdutoRow pode não estar disponível no momento do carregamento)');
    
    // Tentar adicionar produtos se a função estiver disponível
    setTimeout(() => {
        if (typeof addProdutoRow === 'function') {
            console.log('✓ Função addProdutoRow encontrada, adicionando produtos...');
            
            // Produto 1: Soja em Grãos
            addProdutoRow();
            setTimeout(() => {
                const rows = document.querySelectorAll('#produtos-tbody tr');
                if (rows.length > 0) {
                    const inputs = rows[0].querySelectorAll('input, select');
                    if (inputs[0]) inputs[0].value = 'Soja em Grãos';
                    if (inputs[1]) inputs[1].value = '50000';
                    if (inputs[2]) inputs[2].value = 'Sorriso'; // Município MT
                    if (inputs[3]) inputs[3].value = 'Santos'; // Município SP
                    if (inputs[4]) inputs[4].value = '2150';
                    if (inputs[5]) inputs[5].value = 'rodoviario';
                    if (inputs[6]) inputs[6].value = 'granel';
                    console.log('✓ Produto 1: Soja em Grãos (MT → SP)');
                }
            }, 100);
            
            // Produto 2: Milho
            setTimeout(() => {
                addProdutoRow();
                setTimeout(() => {
                    const rows = document.querySelectorAll('#produtos-tbody tr');
                    if (rows.length > 1) {
                        const inputs = rows[1].querySelectorAll('input, select');
                        if (inputs[0]) inputs[0].value = 'Milho';
                        if (inputs[1]) inputs[1].value = '30000';
                        if (inputs[2]) inputs[2].value = 'Rio Verde'; // Município GO
                        if (inputs[3]) inputs[3].value = 'Campinas'; // Município SP
                        if (inputs[4]) inputs[4].value = '850';
                        if (inputs[5]) inputs[5].value = 'ferroviario';
                        if (inputs[6]) inputs[6].value = 'container';
                        console.log('✓ Produto 2: Milho (GO → SP)');
                    }
                }, 100);
            }, 400);
            
            // Produto 3: Fertilizantes
            setTimeout(() => {
                addProdutoRow();
                setTimeout(() => {
                    const rows = document.querySelectorAll('#produtos-tbody tr');
                    if (rows.length > 2) {
                        const inputs = rows[2].querySelectorAll('input, select');
                        if (inputs[0]) inputs[0].value = 'Fertilizantes NPK';
                        if (inputs[1]) inputs[1].value = '15000';
                        if (inputs[2]) inputs[2].value = 'Uberaba'; // Município MG
                        if (inputs[3]) inputs[3].value = 'Ribeirão Preto'; // Município SP
                        if (inputs[4]) inputs[4].value = '280';
                        if (inputs[5]) inputs[5].value = 'rodoviario';
                        if (inputs[6]) inputs[6].value = 'ensacado';
                        console.log('✓ Produto 3: Fertilizantes (MG → SP)');
                    }
                }, 100);
            }, 800);
        } else {
            console.warn('⚠️  Função addProdutoRow não encontrada - pule para o próximo card');
        }
    }, 2000);
    
    console.log('\n🎯 CARD 4: Produto Principal');
    setTimeout(() => {
        setInputValue('produto-principal', 'Soja em Grãos');
        setInputValue('agrupamento-produto', 'cereais');
    }, 800);
    
    console.log('\n🚚 CARD 5: Características do Transporte');
    setTimeout(() => {
        setInputValue('volume-anual', '50000');
        setInputValue('unidade-volume', 'toneladas');
        
        // Cascata País → Estado → Município (agora funciona para TODOS os estados)
        setInputValue('origem-pais', 'Brasil');
        setTimeout(() => {
            setInputValue('origem-estado', 'Mato Grosso');
            setTimeout(() => {
                setInputValue('origem-municipio', 'Sorriso');
                console.log('✓ Origem: Sorriso/MT');
            }, 300);
        }, 200);
        
        setTimeout(() => {
            setInputValue('destino-pais', 'Brasil');
            setTimeout(() => {
                setInputValue('destino-estado', 'São Paulo');
                setTimeout(() => {
                    setInputValue('destino-municipio', 'Santos');
                    console.log('✓ Destino: Santos/SP');
                }, 300);
            }, 200);
        }, 800);
        
        setInputValue('distancia', '2150.5');
        
        // Modalidades (checkbox múltiplo)
        checkCheckbox('modal-rodoviario');
        checkCheckbox('modal-ferroviario');
        
        setInputValue('tempo-dias', '4');
        setInputValue('tempo-horas', '18');
        setInputValue('tempo-minutos', '30');
        
        setInputValue('peso-carga', '28500.75');
        setInputValue('custo-transporte', '4250.80');
        setInputValue('valor-carga', '127500.00');
        setInputValue('tipo-frete', 'cif');
        
        selectRadio('responsavel-contratacao', 'propria');
        
        setInputValue('acondicionamento', 'granel');
        setInputValue('embalagem', 'sem-embalagem');
        
        // Frequência diária: NOVO campo numérico (0.5 a 100 viagens/dia)
        setInputValue('frequencia-diaria', '2.5');
        
        // Capacidade utilizada: NOVO campo numérico (0 a 100%)
        setInputValue('capacidade-utilizada', '87.5');
        
        // Número de paradas: NOVO com opção "Mais de 10"
        setInputValue('num-paradas', '4-5');
        
        setInputValue('sazonalidade', 'Maior movimentação entre março e agosto (período de safra da soja). Redução significativa entre dezembro e fevereiro.');
        
        selectRadio('armazenagem', 'sim');
        setInputValue('tempo-armazenagem', '15');
    }, 2500);
    
    console.log('\n⚖️ CARD 6: Fatores de Decisão Modal');
    setTimeout(() => {
        // Custo - Variação NUMÉRICA (0-100%)
        setInputValue('importancia-custo', 'muito-alta');
        setInputValue('variacao-custo', '8.5');
        
        // Tempo - Variação NUMÉRICA (0-100%)
        setInputValue('importancia-tempo', 'alta');
        setInputValue('variacao-tempo', '15.2');
        
        // Confiabilidade - Variação NUMÉRICA (0-100%)
        setInputValue('importancia-confiabilidade', 'muito-alta');
        setInputValue('variacao-confiabilidade', '5.8');
        
        // Segurança - Variação NUMÉRICA (0-100%)
        setInputValue('importancia-seguranca', 'alta');
        setInputValue('variacao-seguranca', '10.3');
        
        // Capacidade - Variação NUMÉRICA (0-100%)
        setInputValue('importancia-capacidade', 'media');
        setInputValue('variacao-capacidade', '22.7');
    }, 3500);
    
    console.log('\n📊 CARD 7: Análise Estratégica');
    setTimeout(() => {
        selectRadio('tipo-cadeia', 'distribuicao');
        
        // Modais alternativos (checkbox múltiplo)
        checkCheckbox('alternativo-ferroviario');
        checkCheckbox('alternativo-hidroviario');
        
        setInputValue('fator-adicional', 'Disponibilidade de infraestrutura portuária em Santos, capacidade de armazenagem em terminais, questões ambientais relacionadas ao transporte de grãos e custos de transbordo entre modalidades.');
    }, 4000);
    
    console.log('\n⚠️ CARD 8: Dificuldades Logísticas');
    setTimeout(() => {
        // Dificuldades (checkbox múltiplo)
        checkCheckbox('dif-infraestrutura');
        checkCheckbox('dif-custos');
        checkCheckbox('dif-confiabilidade');
        
        setInputValue('detalhamento-dificuldades', 'PRINCIPAIS DESAFIOS IDENTIFICADOS:\n\n1. INFRAESTRUTURA: Estado precário das rodovias no trecho MT-SP (BR-163 e BR-364), com buracos e trechos sem duplicação. Falta de balanças adequadas e postos de fiscalização.\n\n2. CUSTOS: Alto custo do frete rodoviário devido à dependência do modal e volatilidade do diesel. Pedágios elevados no trajeto.\n\n3. DISPONIBILIDADE: Baixa disponibilidade de vagões ferroviários durante a safra. Dificuldade em agendar slots portuários em Santos.\n\n4. TEMPO: Congestionamentos frequentes na entrada de Santos durante pico de safra (março-junho). Filas de até 48h para descarga.\n\n5. PERDAS: Risco de perdas por umidade e contaminação durante transporte e armazenagem temporária.');
    }, 4500);
    
    console.log('\n✅ Formulário preenchido com sucesso!');
    console.log('\n═══════════════════════════════════════════════');
    console.log('📋 PRÓXIMOS PASSOS - TESTE COMPLETO');
    console.log('═══════════════════════════════════════════════\n');
    
    console.log('🔍 1. VERIFICAÇÃO VISUAL');
    console.log('   • Role a página do início ao fim');
    console.log('   • Verifique se todos os cards foram preenchidos');
    console.log('   • Observe os campos numéricos (capacidade, frequência, variações)');
    console.log('   • Confirme cascatas País→Estado→Município\n');
    
    console.log('✅ 2. TESTE DE VALIDAÇÃO POSITIVA');
    console.log('   • Role até o final da página');
    console.log('   • Clique em "💾 Salvar Respostas"');
    console.log('   • Deve salvar com sucesso (todos os campos obrigatórios preenchidos)');
    console.log('   • Verifique download automático do Excel');
    console.log('   • Confirme mensagem de sucesso\n');
    
    console.log('❌ 3. TESTE DE VALIDAÇÃO NEGATIVA');
    console.log('   • Limpe 2-3 campos obrigatórios (ex: nome, email, município)');
    console.log('   • Clique em "� Salvar Respostas"');
    console.log('   • Deve mostrar:');
    console.log('     - Card vermelho flutuante com contador de erros');
    console.log('     - Campos vazios destacados em vermelho');
    console.log('     - Scroll automático para primeiro erro');
    console.log('     - Campo centralizado na tela\n');
    
    console.log('🔄 4. TESTE DE CASCATAS');
    console.log('   • Mude País de "Brasil" para "China"');
    console.log('   • Estado e Município devem ficar desabilitados');
    console.log('   • Volte para "Brasil"');
    console.log('   • Selecione "Mato Grosso" → municípios de MT carregam');
    console.log('   • Selecione "Rio de Janeiro" → municípios de RJ carregam\n');
    
    console.log('🧪 5. TESTE DE CAMPOS CONDICIONAIS');
    console.log('   • Mude "Número de paradas" para "Mais de 10"');
    console.log('   • Campo "Quantidade exata" deve aparecer');
    console.log('   • Digite um número ≥ 11');
    console.log('   • Validação deve aceitar\n');
    
    console.log('📊 6. TESTE DE DADOS NUMÉRICOS');
    console.log('   • Capacidade utilizada: deve aceitar 0-100%');
    console.log('   • Frequência diária: deve aceitar 0.5-100 viagens');
    console.log('   • Variações: devem aceitar decimais (ex: 8.5%)');
    console.log('   • Tente valores inválidos (ex: 150% ou -5)\n');
    
    console.log('💾 7. TESTE DE SALVAMENTO');
    console.log('   • Após salvar, vá para aba "Respostas"');
    console.log('   • Verifique se os dados aparecem na tabela');
    console.log('   • Clique em "👁 Ver detalhes"');
    console.log('   • Confirme todos os campos salvos corretamente\n');
    
    console.log('📈 8. TESTE DE VISUALIZAÇÕES');
    console.log('   • Aba "Analytics": veja gráficos de distribuição');
    console.log('   • Aba "Visualizador": veja dados no IndexedDB');
    console.log('   • Aba "Instruções": verifique documentação\n');
    
    console.log('🔧 9. TESTE DE CNPJ (Receita Federal)');
    console.log('   • Limpe o campo CNPJ');
    console.log('   • Digite: 33.683.111/0001-07');
    console.log('   • Aguarde 2-3 segundos');
    console.log('   • Razão Social deve preencher automaticamente');
    console.log('   • Tente CNPJ inválido: deve mostrar erro\n');
    
    console.log('🌍 10. TESTE DE DADOS REAIS');
    console.log('   • Estados: 27 UF (todos capitalizados corretamente)');
    console.log('   • Países: 61 países (China em 1º por relevância)');
    console.log('   • Municípios: 645 em SP (disponíveis para todos estados)');
    console.log('   • Nomes formatados: "Aparecida D\'Oeste" (D\' maiúsculo)\n');
    
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 SCRIPT DE TESTE ATUALIZADO - VERSÃO 2.0');
    console.log('═══════════════════════════════════════════════\n');
    
})();
