// ==================================================
// SCRIPT DE TESTE - Preencher Formulário Completo
// PLI 2050 v7.0 - 08/11/2025
// TODOS os 55 campos + 3 grupos de checkboxes + tabela
// ATUALIZADO: Dispara eventos para acionar validação
// ==================================================

/**
 * Função auxiliar para preencher campo e disparar validação
 * @param {string} fieldId - ID do campo
 * @param {string} value - Valor a ser preenchido
 * @param {string} eventType - Tipo de evento ('input', 'change')
 */
function preencherCampoComValidacao(fieldId, value, eventType = 'input') {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value;
        // Disparar evento para acionar validação
        field.dispatchEvent(new Event(eventType, { bubbles: true }));
    }
}

function preencherFormularioCompletoTeste() {
    console.log('🧪 Iniciando preenchimento COMPLETO do formulário de teste...');

    // CARD 0 - Responsável pelo Preenchimento
    const radioEntrevistador = document.querySelector('input[name="tipo-responsavel"][value="entrevistador"]');
    if (radioEntrevistador) {
        radioEntrevistador.checked = true;
        radioEntrevistador.dispatchEvent(new Event('change', {bubbles: true}));
    }
    setTimeout(() => {
        const entrevistadorSelect = document.getElementById('id-entrevistador');
        if (entrevistadorSelect && entrevistadorSelect.options.length > 1) {
            entrevistadorSelect.selectedIndex = 1;
            entrevistadorSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 200);

    // CARD 1 - Dados do Entrevistado
    preencherCampoComValidacao('nome', 'João Silva Teste V7', 'input');
    
    setTimeout(() => {
        const funcaoSelect = document.getElementById('funcao');
        if (funcaoSelect && funcaoSelect.options.length > 1) {
            funcaoSelect.selectedIndex = 1;
            funcaoSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 100);
    
    preencherCampoComValidacao('telefone', '(11) 98765-4321', 'input');
    preencherCampoComValidacao('email', 'teste.v7@pli2050.com.br', 'input');

    // CARD 2 - Dados da Empresa
    setTimeout(() => {
        const tipoEmpresaSelect = document.getElementById('tipo-empresa');
        if (tipoEmpresaSelect && tipoEmpresaSelect.options.length > 1) {
            tipoEmpresaSelect.selectedIndex = 1;
            tipoEmpresaSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 150);
    
    preencherCampoComValidacao('cnpj-empresa', '11222333000181', 'input'); // CNPJ válido para teste
    preencherCampoComValidacao('razao-social', 'EMPRESA TESTE LTDA V7', 'input');
    preencherCampoComValidacao('municipio-empresa', 'São Paulo', 'input');

    // CARD 3 - Produtos Transportados (Tabela)
    setTimeout(() => {
        const tbody = document.getElementById('produtos-tbody');
        if (tbody) {
            tbody.innerHTML = '';
            const produtoRow = document.createElement('tr');
            produtoRow.innerHTML = `
                <td><input type="text" class="table-input" name="produto[]" value="Soja em Grãos" required></td>
                <td><input type="number" class="table-input" name="movimentacao[]" value="50000" min="0" required></td>
                <td><input type="text" class="table-input" name="origem-prod[]" value="Ribeirão Preto" required></td>
                <td><input type="text" class="table-input" name="destino-prod[]" value="Santos" required></td>
                <td><input type="text" class="table-input" name="tipo-veic[]" value="Caminhão"></td>
                <td><select class="table-select" name="unid-prod[]" required>
                    <option value="toneladas" selected>Toneladas</option>
                </select></td>
                <td><input type="number" class="table-input" name="valor-prod[]" value="150000" min="0" step="0.01"></td>
                <td><button type="button" class="btn-remove-row" onclick="removerLinhaProduto(this)">🗑️</button></td>
            `;
            tbody.appendChild(produtoRow);
        }
    }, 300);

    // CARD 4 - Produto Principal
    preencherCampoComValidacao('produto-principal', 'Soja em Grãos', 'input');
    
    setTimeout(() => {
        const agrupSelect = document.getElementById('agrupamento-produto');
        if (agrupSelect && agrupSelect.options.length > 1) {
            agrupSelect.selectedIndex = 2;
            agrupSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 350);

    // CARD 5 - Caracterização do Transporte
    setTimeout(() => {
        const tipoTranspSelect = document.getElementById('tipo-transporte');
        if (tipoTranspSelect && tipoTranspSelect.options.length > 1) {
            tipoTranspSelect.selectedIndex = 1;
            tipoTranspSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 400);

    // Origem e Destino
    setTimeout(() => {
        const origemPaisSelect = document.getElementById('origem-pais');
        if (origemPaisSelect && origemPaisSelect.options.length > 31) {
            origemPaisSelect.selectedIndex = 31; // Brasil
            origemPaisSelect.dispatchEvent(new Event('change', {bubbles: true}));
        }
    }, 450);
    
    setTimeout(() => {
        const origemEstadoSelect = document.getElementById('origem-estado');
        if (origemEstadoSelect && origemEstadoSelect.options.length > 26) {
            origemEstadoSelect.selectedIndex = 26; // SP
            origemEstadoSelect.dispatchEvent(new Event('change', {bubbles: true}));
        }
    }, 600);

    setTimeout(() => {
        const destinoPaisSelect = document.getElementById('destino-pais');
        if (destinoPaisSelect && destinoPaisSelect.options.length > 31) {
            destinoPaisSelect.selectedIndex = 31;
            destinoPaisSelect.dispatchEvent(new Event('change', {bubbles: true}));
        }
    }, 500);
    
    setTimeout(() => {
        const destinoEstadoSelect = document.getElementById('destino-estado');
        if (destinoEstadoSelect && destinoEstadoSelect.options.length > 26) {
            destinoEstadoSelect.selectedIndex = 26;
            destinoEstadoSelect.dispatchEvent(new Event('change', {bubbles: true}));
        }
    }, 650);

    setTimeout(() => {
        preencherCampoComValidacao('distancia', '450', 'input');
    }, 700);
    
    setTimeout(() => {
        const temParadasSelect = document.getElementById('tem-paradas');
        if (temParadasSelect && temParadasSelect.options.length > 1) {
            temParadasSelect.selectedIndex = 1; // Sim
            temParadasSelect.dispatchEvent(new Event('change', {bubbles: true}));
        }
    }, 750);
    
    setTimeout(() => {
        const numParadasSelect = document.getElementById('num-paradas');
        if (numParadasSelect && numParadasSelect.options.length > 1) {
            numParadasSelect.selectedIndex = 2; // 3-5
            numParadasSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 800);

    // Checkboxes de Modo de Transporte
    setTimeout(() => {
        const modoCheckboxes = document.querySelectorAll('input[name="modo"]');
        modoCheckboxes.forEach((cb, idx) => {
            if (idx < 2) {
                cb.checked = true; // Rodoviário + Ferroviário
                cb.dispatchEvent(new Event('change', {bubbles: true}));
            }
        });
    }, 850);

    setTimeout(() => {
        const configSelect = document.getElementById('config-veiculo');
        if (configSelect && configSelect.options.length > 1) {
            configSelect.selectedIndex = 1;
            configSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 900);

    setTimeout(() => {
        preencherCampoComValidacao('capacidade-utilizada', '85', 'input');
        preencherCampoComValidacao('peso-carga', '28000', 'input');
    }, 950);
    
    setTimeout(() => {
        const unidPesoSelect = document.getElementById('unidade-peso');
        if (unidPesoSelect && unidPesoSelect.options.length > 1) {
            unidPesoSelect.selectedIndex = 1;
            unidPesoSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 1000);
    
    setTimeout(() => {
        preencherCampoComValidacao('custo-transporte', '5000', 'input');
        preencherCampoComValidacao('valor-carga', '150000', 'input');
    }, 1050);
    
    setTimeout(() => {
        const embalagemSelect = document.getElementById('tipo-embalagem');
        if (embalagemSelect && embalagemSelect.options.length > 1) {
            embalagemSelect.selectedIndex = 1;
            embalagemSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        const cargaPerigosaSelect = document.getElementById('carga-perigosa');
        if (cargaPerigosaSelect && cargaPerigosaSelect.options.length > 1) {
            cargaPerigosaSelect.selectedIndex = 2;
            cargaPerigosaSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 1100);

    setTimeout(() => {
        preencherCampoComValidacao('tempo-dias', '2', 'input');
        preencherCampoComValidacao('tempo-horas', '8', 'input');
        preencherCampoComValidacao('tempo-minutos', '30', 'input');
    }, 1150);
    
    setTimeout(() => {
        const frequenciaSelect = document.getElementById('frequencia');
        if (frequenciaSelect && frequenciaSelect.options.length > 1) {
            frequenciaSelect.selectedIndex = 1;
            frequenciaSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 1200);

    // CARD 6 - Importância dos Fatores
    const fatores = ['custo', 'tempo', 'confiabilidade', 'seguranca', 'capacidade'];
    fatores.forEach((fator, idx) => {
        setTimeout(() => {
            const importanciaSelect = document.getElementById(`importancia-${fator}`);
            if (importanciaSelect && importanciaSelect.options.length > 1) {
                importanciaSelect.selectedIndex = (idx % 5) + 1;
                importanciaSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
            preencherCampoComValidacao(`variacao-${fator}`, (10 + idx * 5).toString(), 'input');
        }, 1250 + (idx * 50));
    });

    // CARD 7 - Tipo de Cadeia e Modal Alternativo
    setTimeout(() => {
        const cadeiaSelect = document.getElementById('tipo-cadeia');
        if (cadeiaSelect && cadeiaSelect.options.length > 1) {
            cadeiaSelect.selectedIndex = 1;
            cadeiaSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 1500);

    // Checkboxes de Modal Alternativo
    setTimeout(() => {
        const modalCheckboxes = document.querySelectorAll('input[name="modal-alternativo"]');
        modalCheckboxes.forEach((cb, idx) => {
            if (idx < 2) {
                cb.checked = true; // Ferrovia + Hidrovia
                cb.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }, 1550);

    setTimeout(() => {
        preencherCampoComValidacao('fator-adicional', 'Este é um texto de teste para o campo de fatores adicionais do formulário PLI 2050 v7.0.', 'input');
    }, 1600);

    // CARD 8 - Dificuldades
    setTimeout(() => {
        const dificuldadeCheckboxes = document.querySelectorAll('input[name="dificuldade"]');
        dificuldadeCheckboxes.forEach((cb, idx) => {
            if (idx < 3) {
                cb.checked = true; // Primeiras 3 opções
                cb.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }, 1650);

    setTimeout(() => {
        preencherCampoComValidacao('detalhe-dificuldade', 'Detalhes das dificuldades encontradas no transporte de mercadorias - Teste V7.0 PLI 2050.', 'input');
        
        console.log('✅ Formulário preenchido com TODOS os campos! Total: 55 campos + 3 grupos de checkboxes + tabela de produtos');
        console.log('⚡ Todos os eventos de validação foram disparados corretamente!');
    }, 1700);
}

// Auto-executar ao carregar
if (typeof window !== 'undefined') {
    window.preencherFormularioCompletoTeste = preencherFormularioCompletoTeste;
    console.log('✅ Função preencherFormularioCompletoTeste() registrada globalmente');
}