/**
 * DEBUG: Verificar por que config-veiculo não aparece
 */

console.log('🔍 DEBUG: Investigando config-veiculo\n');

// 1. Verificar se o elemento existe no DOM
const container = document.getElementById('config-veiculo-container');
console.log('1. Container existe?', container ? '✅ SIM' : '❌ NÃO');
if (container) {
    console.log('   - Classes:', container.className);
    console.log('   - Display:', window.getComputedStyle(container).display);
}

// 2. Verificar se os checkboxes existem
const checkboxes = document.querySelectorAll('input[name="modo"]');
console.log('\n2. Checkboxes de modo encontrados?', checkboxes.length > 0 ? `✅ ${checkboxes.length}` : '❌ 0');
checkboxes.forEach((cb, idx) => {
    console.log(`   [${idx}] value="${cb.value}" checked=${cb.checked}`);
});

// 3. Verificar o checkbox rodoviário especificamente
const rodoviario = document.querySelector('input[name="modo"][value="rodoviario"]');
console.log('\n3. Checkbox "rodoviario" encontrado?', rodoviario ? '✅ SIM' : '❌ NÃO');
if (rodoviario) {
    console.log('   - Checked:', rodoviario.checked);
}

// 4. Testar manualmente a lógica
console.log('\n4. Testando lógica de visibilidade:');
if (rodoviario && container) {
    if (rodoviario.checked) {
        console.log('   - Rodoviário tá CHECKED');
        console.log('   - Container deveria estar VISÍVEL');
        console.log('   - Mas tá com class:', container.className);
    } else {
        console.log('   - Rodoviário tá UNCHECKED');
        console.log('   - Container deveria estar ESCONDIDO');
    }
}

// 5. Tentar forçar visibilidade
console.log('\n5. Forçando visibilidade do container:');
if (container) {
    container.classList.remove('hidden-field');
    console.log('   ✅ Removido "hidden-field"');
    console.log('   - Display agora:', window.getComputedStyle(container).display);
}
