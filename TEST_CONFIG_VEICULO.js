// ============================================
// TESTE SIMPLES - COPIE E COLE NO CONSOLE
// ============================================

console.log('=== TESTE CONFIG VEICULO ===');

// 1. Verificar container
const container = document.getElementById('config-veiculo-container');
console.log('1. Container encontrado?', !!container);
if (container) {
    console.log('   Classes atuais:', container.className);
    console.log('   Tem "hidden-field"?', container.classList.contains('hidden-field'));
}

// 2. Verificar checkboxes
const checkboxes = document.querySelectorAll('input[name="modo"]');
console.log('2. Checkboxes encontrados?', checkboxes.length > 0);
console.log('   Quantidade:', checkboxes.length);

// 3. Verificar checkbox "rodoviario" especificamente
const rodoCheckbox = document.querySelector('input[name="modo"][value="rodoviario"]');
console.log('3. Checkbox rodoviario encontrado?', !!rodoCheckbox);
if (rodoCheckbox) {
    console.log('   Checado?', rodoCheckbox.checked);
}

// 4. Verificar se FormCollector existe
console.log('4. FormCollector existe?', typeof window.FormCollector !== 'undefined');

// 5. Testar clique no checkbox
console.log('\n5. TESTANDO CLIQUE NO RODOVIARIO...');
if (rodoCheckbox) {
    rodoCheckbox.click();
    console.log('   Clicado em rodoviario');
    
    // Aguardar um pouco e checar
    setTimeout(() => {
        console.log('   Após clique:');
        console.log('   - Checkbox checado?', rodoCheckbox.checked);
        console.log('   - Container tem "hidden-field"?', container?.classList.contains('hidden-field'));
        console.log('   - Classes do container:', container?.className);
    }, 100);
}

// 6. Forçar remoção de hidden-field para testar CSS
console.log('\n6. FORÇANDO REMOÇÃO DE hidden-field...');
if (container) {
    container.classList.remove('hidden-field');
    console.log('   Classe removida forcadamente');
    console.log('   Classes agora:', container.className);
    console.log('   Display CSS:', window.getComputedStyle(container).display);
}
