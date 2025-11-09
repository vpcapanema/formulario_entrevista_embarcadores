console.log('Script V6 carregado');

async function preencherFormularioCompletoTeste() {
    const aguardar = (ms) => new Promise(r => setTimeout(r, ms));
    const setField = (id, v) => { const f = document.getElementById(id); if(f) { f.value = v; f.dispatchEvent(new Event('input', {bubbles:true})); f.dispatchEvent(new Event('change', {bubbles:true})); f.classList.remove('invalid'); console.log('OK:',id); return true; } return false; };
    const setRadio = (n, v) => { const r = document.querySelector('input[name="'+n+'"][value="'+v+'"]'); if(r) { r.checked = true; r.dispatchEvent(new Event('change', {bubbles:true})); console.log('Radio:',n,'=',v); return true; } return false; };
    const setCheckbox = (n, vs) => { document.querySelectorAll('input[name="'+n+'"]').forEach(c => c.checked = false); if(!Array.isArray(vs)) vs = [vs]; vs.forEach(v => { const c = document.querySelector('input[name="'+n+'"][value="'+v+'"]'); if(c) { c.checked = true; c.dispatchEvent(new Event('change', {bubbles:true})); } }); console.log('Checkbox:',n,vs.length,'marcados'); };
    const aguardarSelect = async (id, max = 30) => { for(let i = 0; i < max; i++) { const s = document.getElementById(id); if(s && s.options.length > 1) return true; await aguardar(200); } return false; };
    
    try {
        console.log('Preenchendo...');
        setRadio('tipo-responsavel', 'entrevistado');
        setField('nome', 'Maria Costa Silva');
        await aguardarSelect('funcao');
        setField('funcao', '1');
        setField('telefone', '11987654321');
        setField('email', 'maria@teste.com');
        setField('tipo-empresa', 'embarcador');
        setField('cnpj-empresa', '11222333000181');
        await aguardar(3000);
        if(!document.getElementById('razao-social').value) {
            setField('razao-social', 'Log Moderna LTDA');
            setField('municipio-empresa', 'Sao Paulo');
        }
        const tb = document.getElementById('produtos-tbody');
        if(tb && tb.children.length === 0) {
            const btn = document.querySelector('button[onclick*="addProdutoRow"]');
            if(btn) { btn.click(); await aguardar(300); }
        }
        setField('produto-carga-1', 'Acucar');
        setField('produto-movimentacao-1', '120000');
        setField('produto-origem-1', 'Piracicaba');
        setField('produto-destino-1', 'Santos');
        setField('produto-distancia-1', '180');
        setField('produto-modalidade-1', 'rodoviario');
        setField('produto-acondicionamento-1', 'big-bag');
        setField('produto-principal', 'Acucar');
        setField('agrupamento-produto', 'agricultura');
        setField('tipo-transporte', 'exportacao');
        await aguardarSelect('origem-pais');
        setField('origem-pais', '31');
        await aguardar(500);
        await aguardarSelect('origem-estado');
        setField('origem-estado', 'SP');
        await aguardar(500);
        await aguardarSelect('origem-municipio');
        setField('origem-municipio', '3538709');
        setField('destino-pais', '31');
        await aguardar(500);
        await aguardarSelect('destino-estado');
        setField('destino-estado', 'SP');
        await aguardar(500);
        await aguardarSelect('destino-municipio');
        setField('destino-municipio', '3548500');
        setField('distancia', '180');
        setField('tem-paradas', 'sim');
        await aguardar(300);
        setField('num-paradas', '1');
        setCheckbox('modo', ['rodoviario', 'ferroviario']);
        await aguardar(300);
        setField('config-veiculo', 'cavalo-mecanico-carreta');
        setField('capacidade-utilizada', '92.5');
        setField('peso-carga', '32000');
        setField('unidade-peso', 'kg');
        setField('custo-transporte', '6500');
        setField('valor-carga', '280000');
        setField('tipo-embalagem', 'big-bag');
        setField('carga-perigosa', 'nao');
        setField('tempo-dias', '0');
        setField('tempo-horas', '4');
        setField('tempo-minutos', '30');
        setField('frequencia', 'diaria');
        await aguardar(300);
        setField('frequencia-diaria', '3.5');
        setField('importancia-custo', 'muito-importante');
        setField('variacao-custo', '18');
        setField('importancia-tempo', 'muito-importante');
        setField('variacao-tempo', '15');
        setField('importancia-confiabilidade', 'muito-importante');
        setField('variacao-confiabilidade', '8');
        setField('importancia-seguranca', 'importante');
        setField('variacao-seguranca', '10');
        setField('importancia-capacidade', 'importante');
        setField('variacao-capacidade', '12');
        setField('tipo-cadeia', 'just-in-time');
        setCheckbox('modal-alternativo', ['ferrovia', 'hidrovia']);
        setField('fator-adicional', 'Porto de Santos proximo');
        setCheckbox('dificuldade', ['infra-rodoviaria', 'infra-portuaria', 'acessos-portos']);
        setField('detalhe-dificuldade', 'Congestionamentos na Anchieta e Imigrantes');
        const obs = document.getElementById('observacoes');
        if(obs) setField('observacoes', 'Teste V6');
        const cons = document.getElementById('consentimento');
        if(cons) { cons.checked = true; cons.dispatchEvent(new Event('change', {bubbles:true})); }
        window.scrollTo(0,0);
        alert('Formulario preenchido!\nTODOS os campos OK!\nClique SALVAR!');
    } catch(e) {
        console.error('ERRO:',e);
        alert('ERRO: '+e.message);
    }
}

window.preencherFormularioCompletoTeste = preencherFormularioCompletoTeste;
console.log('Execute: preencherFormularioCompletoTeste()');
