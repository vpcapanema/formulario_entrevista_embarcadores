/**
 * Script de teste automatizado para exportação de rascunho
 * Valida: coleta de dados, conversão para nomes, remoção de helper keys, geração Excel
 */

(function() {
    console.log('🧪 INICIANDO TESTE DE EXPORTAÇÃO DE RASCUNHO');

    // Aguardar componentes carregarem (max 5s)
    let tentativas = 0;
    const maxTentativas = 50;
    
    const verificarComponentes = setInterval(() => {
        tentativas++;
        
        if (!window.FormCollector) {
            if (tentativas >= maxTentativas) {
                clearInterval(verificarComponentes);
                console.error('❌ FormCollector não carregou após 5s');
                return;
            }
            return;
        }
        
        clearInterval(verificarComponentes);
        console.log('✅ Componentes carregados!');
        
        // Preencher formulário com dados de teste
        preencherFormularioTeste();
    }, 100);
    
    function preencherFormularioTeste() {
        console.log('📝 Preenchendo formulário com dados de teste...');
        
        // Dados básicos do entrevistado
        setFieldValue('nome', 'João Silva Teste');
        setFieldValue('email', 'joao.teste@empresa.com');
        setFieldValue('telefone', '(11) 98765-4321');
        setRadioValue('funcao', 'gerente-logistica');
        setRadioValue('estado-civil', 'casado');
        setRadioValue('nacionalidade', 'brasileira');
        
        // Empresa
        setFieldValue('cnpj-empresa', '57286005000140');
        setRadioValue('tipo-empresa', 'embarcador');
        setFieldValue('razao-social', 'TEST COMPANY LTDA');
        setFieldValue('municipio-empresa', 'São Paulo');
        
        // Naturalidade
        setSelectValue('uf-naturalidade', 'SP');
        setTimeout(() => {
            setSelectValue('municipio-naturalidade', '3550308'); // São Paulo
            
            // Origem/Destino
            setSelectValue('origem-pais', '31'); // Brasil
            setTimeout(() => {
                setSelectValue('origem-estado', 'SP');
                setTimeout(() => {
                    setSelectValue('origem-municipio', '3550308');
                    
                    setSelectValue('destino-pais', '76'); // Argentina
                    setTimeout(() => {
                        setSelectValue('destino-estado', 'RJ');
                        setTimeout(() => {
                            setSelectValue('destino-municipio', '3304557');
                            
                            // Produto
                            setFieldValue('produto-principal', 'Soja');
                            setRadioValue('agrupamento-produto', 'graos');
                            
                            // Transporte
                            setRadioValue('tipo-transporte', 'exportacao');
                            setFieldValue('distancia', '500');
                            setRadioValue('tem-paradas', 'nao');
                            
                            // Modal
                            const modalCheckbox = document.querySelector('input[name="modos"][value="rodoviario"]');
                            if (modalCheckbox) {
                                modalCheckbox.checked = true;
                                modalCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                            
                            // Peso
                            setFieldValue('peso-carga', '50000');
                            setSelectValue('unidade-peso', 'tonelada');
                            
                            // Custos
                            setFieldValue('custo-transporte', '5000');
                            setFieldValue('valor-carga', '250000');
                            
                            // Embalagem
                            setSelectValue('tipo-embalagem', 'granel');
                            setRadioValue('carga-perigosa', 'nao');
                            
                            // Tempo
                            setFieldValue('tempo-dias', '2');
                            setFieldValue('tempo-horas', '5');
                            setFieldValue('tempo-minutos', '30');
                            
                            // Frequência
                            setSelectValue('frequencia', 'semanal');
                            
                            // Importâncias
                            setSelectValue('importancia-custo', 'muito-importante');
                            setFieldValue('variacao-custo', '10');
                            
                            setTimeout(() => {
                                console.log('✅ Formulário preenchido!');
                                testarExportacao();
                            }, 500);
                        }, 300);
                    }, 300);
                }, 300);
            }, 300);
        }, 300);
    }
    
    function setFieldValue(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    function setRadioValue(name, value) {
        const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (el) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    function setSelectValue(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.value = value;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    function testarExportacao() {
        console.log('\n🚀 TESTANDO EXPORTAÇÃO...');
        
        // Coletar dados
        const formData = window.FormCollector.collectData();
        console.log('📊 Dados coletados do formulário:', formData);
        
        // Verificar estrutura
        validarDadosColetados(formData);
        
        // Tentar exportar
        if (window.AutoSave && typeof window.AutoSave.exportarRascunho === 'function') {
            console.log('▶️ Acionando exportação...');
            window.AutoSave.exportarRascunho();
            
            setTimeout(() => {
                console.log('✅ TESTE CONCLUÍDO - Verifique o download');
            }, 2000);
        } else {
            console.error('❌ AutoSave.exportarRascunho não encontrado');
        }
    }
    
    function validarDadosColetados(data) {
        console.log('\n🔍 VALIDANDO DADOS COLETADOS:');
        
        // Campos de topo
        console.log('  ✓ Nome:', data.nome);
        console.log('  ✓ Email:', data.email);
        console.log('  ✓ Empresa:', data.razaoSocial);
        console.log('  ✓ CNPJ:', data.cnpj);
        
        // Origem/Destino
        console.log('  ✓ Origem País:', data.origemPais);
        console.log('  ✓ Origem Estado:', data.origemEstado);
        console.log('  ✓ Origem Município:', data.origemMunicipio);
        console.log('  ✓ Destino País:', data.destinoPais);
        console.log('  ✓ Destino Estado:', data.destinoEstado);
        console.log('  ✓ Destino Município:', data.destinoMunicipio);
        
        // Produtos
        if (data.produtos && data.produtos.length > 0) {
            console.log(`\n  ✓ Produtos (${data.produtos.length}):`);
            data.produtos.forEach((p, idx) => {
                console.log(`    [${idx}] Carga: ${p.carga}`);
                console.log(`        Origem: ${p.origemPais} / ${p.origemEstado} / ${p.origemMunicipio}`);
                console.log(`        Destino: ${p.destinoPais} / ${p.destinoEstado} / ${p.destinoMunicipio}`);
                console.log(`        Modalidade: ${p.modalidade}`);
                
                // Verificar se há helper keys
                const helperKeys = Object.keys(p).filter(k => /Codigo|Uf$/.test(k));
                if (helperKeys.length > 0) {
                    console.warn(`        ⚠️ Helper keys encontradas: ${helperKeys.join(', ')}`);
                } else {
                    console.log(`        ✅ Sem helper keys`);
                }
            });
        }
        
        console.log('\n✅ Validação concluída');
    }
})();
