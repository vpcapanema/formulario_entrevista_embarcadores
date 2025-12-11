const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const fileUrl = 'file://' + path.resolve('TEST_AUTOSAVE_COMPLETO.html');
  console.log('Abrindo', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 60000 });

  await page.waitForSelector('input, textarea, select', { timeout: 10000 });

  // Este arquivo de teste usa funções internas do HTML de teste:
  // preencherFormulario(), salvarNoLocalStorage(), simularRecarga(), carregarRascunho()
  // Primeiro preenche com dados de teste
  const didFill = await page.evaluate(() => {
    if (typeof preencherFormulario === 'function') { preencherFormulario(); return true; }
    return false;
  });
  console.log('preencherFormulario() chamada:', didFill);

  // Chama a função que salva no localStorage (chave 'test_autosave')
  const didSave = await page.evaluate(() => {
    if (typeof salvarNoLocalStorage === 'function') {
      salvarNoLocalStorage();
      return true;
    }
    return false;
  });

  console.log('salvarNoLocalStorage() chamada:', didSave);
  const saved = await page.evaluate(() => !!localStorage.getItem('test_autosave'));
  const savedTs = await page.evaluate(() => localStorage.getItem('test_autosave_timestamp')).catch(()=>null);
  console.log('Chave test_autosave presente:', saved, 'timestamp:', savedTs);

  // Simular recarga (limpar formulário), depois carregar rascunho e comparar
  const didSimulateReload = await page.evaluate(() => {
    if (typeof simularRecarga === 'function') { simularRecarga(); return true; }
    return false;
  });
  console.log('Simular recarga chamada:', didSimulateReload);

  const didLoad = await page.evaluate(() => {
    if (typeof carregarRascunho === 'function') { carregarRascunho(); return true; }
    return false;
  });
  console.log('carregarRascunho() chamada:', didLoad);

  // Capturar valor do campo nome após restauração
  const restoredFirst = await page.evaluate(() => {
    const el = document.getElementById('nome') || document.querySelector('input[name="nome"]');
    return el ? el.value : null;
  });
  console.log('Valor restaurado do campo nome:', restoredFirst);

  await browser.close();
  if (!saved) process.exit(2);
  process.exit(0);
})();
