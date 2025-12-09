/**
 * DEBUG FINAL: Por que config-veiculo não aparece?
 * Execute isso no console do navegador
 */

console.clear();
console.log('='.repeat(70));
console.log('🔍 DEBUG: config-veiculo invisível');
console.log('='.repeat(70));

// Step 1: Container existe?
const container = document.getElementById('config-veiculo-container');
console.log('\n1️⃣ Container #config-veiculo-container existe?');
console.log(container ? '✅ SIM, encontrado' : '❌ NÃO, não encontrado no DOM');

if (!container) {
    console.error('FATAL: Container não existe no HTML!');
    console.log('Procurando por alternativas...');
    const allDivs = document.querySelectorAll('[id*="config"]');
    console.log('Elementos com "config" no id:', allDivs.length);
    allDivs.forEach(el => console.log('  -', el.id, el.className));
} else {
    // Step 2: Classes e estilos
    console.log('\n2️⃣ Estado do container:');
    console.log('  Classes:', container.className);
    console.log('  Display:', window.getComputedStyle(container).display);
    console.log('  Visibility:', window.getComputedStyle(container).visibility);
    console.log('  Hidden-field class?', container.classList.contains('hidden-field') ? '✅ SIM' : '❌ NÃO');

    // Step 3: Checkboxes de modo
    console.log('\n3️⃣ Checkboxes name="modo":');
    const checkboxes = document.querySelectorAll('input[name="modo"]');
    console.log(`  Total: ${checkboxes.length} encontrados`);
    
    let rodoviarioFound = false;
    checkboxes.forEach((cb, idx) => {
        const isRodo = cb.value === 'rodoviario';
        if (isRodo) rodoviarioFound = true;
        console.log(`  [${idx}] value="${cb.value}" checked=${cb.checked} ${isRodo ? '← RODOVIÁRIO' : ''}`);
    });

    if (!rodoviarioFound) {
        console.error('PROBLEMA: Checkbox rodoviario não encontrado!');
    }

    // Step 4: Lógica de visibilidade
    console.log('\n4️⃣ Lógica de visibilidade:');
    const rodo = document.querySelector('input[name="modo"][value="rodoviario"]');
    if (rodo) {
        console.log(`  Rodoviário checked? ${rodo.checked}`);
        console.log(`  Container hidden-field? ${container.classList.contains('hidden-field')}`);
        
        if (rodo.checked && container.classList.contains('hidden-field')) {
            console.error('❌ BUG: Rodoviário tá checked mas container tá com hidden-field!');
            console.log('  → updateConfigVeiculoVisibility() não foi executada');
        } else if (!rodo.checked && !container.classList.contains('hidden-field')) {
            console.error('❌ BUG: Rodoviário tá unchecked mas container tá visível!');
        } else {
            console.log('✅ Estado correto');
        }
    }

    // Step 5: Event listeners
    console.log('\n5️⃣ Event listeners nos checkboxes:');
    checkboxes.forEach((cb, idx) => {
        const hasChangeListener = false;
        console.log(`  [${idx}] listeners: (não é possível verificar diretamente)`);
    });

    // Step 6: Testar seleção manual
    console.log('\n6️⃣ TESTANDO: Clicando em Rodoviário manualmente...');
    if (rodo) {
        rodo.click();
        console.log(`  Após click: checked=${rodo.checked}`);
        console.log(`  Container hidden-field? ${container.classList.contains('hidden-field')}`);
        console.log(`  Container display: ${window.getComputedStyle(container).display}`);
    }

    // Step 7: Forçar remoção de hidden-field
    console.log('\n7️⃣ FORÇANDO remoção de hidden-field:');
    container.classList.remove('hidden-field');
    console.log(`  Display agora: ${window.getComputedStyle(container).display}`);
    console.log(`  Se aparecer agora, problema é JavaScript`);
    console.log(`  Se NÃO aparecer, problema é CSS`);
}

console.log('\n' + '='.repeat(70));
console.log('Compartilhe o output acima para debugar');
console.log('='.repeat(70));
