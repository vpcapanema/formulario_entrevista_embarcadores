// ==================================================
// SCRIPT DE TESTE - Preencher Formulário Completo
// PLI 2050 v7.0 - 08/11/2025
// TODOS os 55 campos + 3 grupos de checkboxes + tabela
// ==================================================

function preencherFormularioCompletoTeste() {
    console.log('🧪 Iniciando preenchimento COMPLETO do formulário de teste...');

    // CARD 0 - Responsável pelo Preenchimento
    document.querySelector('input[name="tipo-responsavel"][value="entrevistador"]').checked = true;
    document.getElementById('tipo-responsavel').dispatchEvent(new Event('change', {bubbles: true}));
    setTimeout(() => {
        const entrevistadorSelect = document.getElementById('id-entrevistador');
        if (entrevistadorSelect && entrevistadorSelect.options.length > 1) {
            entrevistadorSelect.selectedIndex = 1;
        }
    }, 200);

    // CARD 1 - Dados do Entrevistado
    document.getElementById('nome').value = 'João Silva Teste V7';
    const funcaoSelect = document.getElementById('funcao');
    if (funcaoSelect.options.length > 1) funcaoSelect.selectedIndex = 1;
    document.getElementById('telefone').value = '(11) 98765-4321';
    document.getElementById('email').value = 'teste.v7@pli2050.com.br';

    // CARD 2 - Dados da Empresa
    const tipoEmpresaSelect = document.getElementById('tipo-empresa');
    if (tipoEmpresaSelect.options.length > 1) tipoEmpresaSelect.selectedIndex = 1;
    document.getElementById('cnpj-empresa').value = '12345678000190';
    document.getElementById('razao-social').value = 'EMPRESA TESTE LTDA V7';
    document.getElementById('municipio-empresa').value = 'São Paulo';

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
    document.getElementById('produto-principal').value = 'Soja em Grãos';
    const agrupSelect = document.getElementById('agrupamento-produto');
    if (agrupSelect.options.length > 1) agrupSelect.selectedIndex = 2;

    // CARD 5 - Caracterização do Transporte
    const tipoTranspSelect = document.getElementById('tipo-transporte');
    if (tipoTranspSelect.options.length > 1) tipoTranspSelect.selectedIndex = 1;

    // Origem e Destino
    const origemPaisSelect = document.getElementById('origem-pais');
    if (origemPaisSelect.options.length > 31) {
        origemPaisSelect.selectedIndex = 31; // Brasil
        origemPaisSelect.dispatchEvent(new Event('change', {bubbles: true}));
    }
    setTimeout(() => {
        const origemEstadoSelect = document.getElementById('origem-estado');
        if (origemEstadoSelect && origemEstadoSelect.options.length > 26) {
            origemEstadoSelect.selectedIndex = 26; // SP
            origemEstadoSelect.dispatchEvent(new Event('change', {bubbles: true}));
        }
    }, 400);

    const destinoPaisSelect = document.getElementById('destino-pais');
    if (destinoPaisSelect.options.length > 31) {
        destinoPaisSelect.selectedIndex = 31;
        destinoPaisSelect.dispatchEvent(new Event('change', {bubbles: true}));
    }
    setTimeout(() => {
        const destinoEstadoSelect = document.getElementById('destino-estado');
        if (destinoEstadoSelect && destinoEstadoSelect.options.length > 26) {
            destinoEstadoSelect.selectedIndex = 26;
            destinoEstadoSelect.dispatchEvent(new Event('change', {bubbles: true}));
        }
    }, 400);

    document.getElementById('distancia').value = '450';
    const temParadasSelect = document.getElementById('tem-paradas');
    if (temParadasSelect.options.length > 1) {
        temParadasSelect.selectedIndex = 1; // Sim
        temParadasSelect.dispatchEvent(new Event('change', {bubbles: true}));
    }
    setTimeout(() => {
        const numParadasSelect = document.getElementById('num-paradas');
        if (numParadasSelect && numParadasSelect.options.length > 1) {
            numParadasSelect.selectedIndex = 2; // 3-5
        }
    }, 500);

    // Checkboxes de Modo de Transporte
    const modoCheckboxes = document.querySelectorAll('input[name="modo"]');
    modoCheckboxes.forEach((cb, idx) => {
        if (idx < 2) cb.checked = true; // Rodoviário + Ferroviário
    });
    modoCheckboxes[0].dispatchEvent(new Event('change', {bubbles: true}));

    setTimeout(() => {
        const configSelect = document.getElementById('config-veiculo');
        if (configSelect && configSelect.options.length > 1) {
            configSelect.selectedIndex = 1;
        }
    }, 600);

    document.getElementById('capacidade-utilizada').value = '85';
    document.getElementById('peso-carga').value = '28000';
    const unidPesoSelect = document.getElementById('unidade-peso');
    if (unidPesoSelect.options.length > 1) unidPesoSelect.selectedIndex = 1;
    document.getElementById('custo-transporte').value = '5000';
    document.getElementById('valor-carga').value = '150000';
    const embalagemSelect = document.getElementById('tipo-embalagem');
    if (embalagemSelect.options.length > 1) embalagemSelect.selectedIndex = 1;
    const cargaPerigosaSelect = document.getElementById('carga-perigosa');
    if (cargaPerigosaSelect.options.length > 1) cargaPerigosaSelect.selectedIndex = 2;

    document.getElementById('tempo-dias').value = '2';
    document.getElementById('tempo-horas').value = '8';
    document.getElementById('tempo-minutos').value = '30';
    const frequenciaSelect = document.getElementById('frequencia');
    if (frequenciaSelect.options.length > 1) frequenciaSelect.selectedIndex = 1;

    // CARD 6 - Importância dos Fatores
    const fatores = ['custo', 'tempo', 'confiabilidade', 'seguranca', 'capacidade'];
    fatores.forEach((fator, idx) => {
        const importanciaSelect = document.getElementById(`importancia-${fator}`);
        if (importanciaSelect && importanciaSelect.options.length > 1) {
            importanciaSelect.selectedIndex = (idx % 5) + 1;
        }
        const variacao = document.getElementById(`variacao-${fator}`);
        if (variacao) variacao.value = (10 + idx * 5).toString();
    });

    // CARD 7 - Tipo de Cadeia e Modal Alternativo
    const cadeiaSelect = document.getElementById('tipo-cadeia');
    if (cadeiaSelect.options.length > 1) cadeiaSelect.selectedIndex = 1;

    // Checkboxes de Modal Alternativo
    const modalCheckboxes = document.querySelectorAll('input[name="modal-alternativo"]');
    modalCheckboxes.forEach((cb, idx) => {
        if (idx < 2) cb.checked = true; // Ferrovia + Hidrovia
    });

    document.getElementById('fator-adicional').value = 'Este é um texto de teste para o campo de fatores adicionais do formulário PLI 2050 v7.0.';

    // CARD 8 - Dificuldades
    const dificuldadeCheckboxes = document.querySelectorAll('input[name="dificuldade"]');
    dificuldadeCheckboxes.forEach((cb, idx) => {
        if (idx < 3) cb.checked = true; // Primeiras 3 opções
    });

    document.getElementById('detalhe-dificuldade').value = 'Detalhes das dificuldades encontradas no transporte de mercadorias - Teste V7.0 PLI 2050.';

    console.log('✅ Formulário preenchido com TODOS os campos! Total: 55 campos + 3 grupos de checkboxes + tabela de produtos');
}

// Auto-executar ao carregar
if (typeof window !== 'undefined') {
    window.preencherFormularioCompletoTeste = preencherFormularioCompletoTeste;
    console.log('✅ Função preencherFormularioCompletoTeste() registrada globalmente');
}