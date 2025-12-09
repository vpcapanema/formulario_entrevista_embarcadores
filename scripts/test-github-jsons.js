const https = require('https');

/**
 * Teste: JSONs são servidos do GitHub Pages, não da API
 */

const GITHUB_BASE = 'https://vpcapanema.github.io/formulario_entrevista_embarcadores';

console.log('🧪 TESTANDO JSONS DO GITHUB PAGES\n');
console.log(`📍 Base URL: ${GITHUB_BASE}\n`);

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(GITHUB_BASE + path);
    const options = { method: 'GET' };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            path,
            status: res.statusCode,
            isArray: Array.isArray(parsed),
            count: Array.isArray(parsed) ? parsed.length : 0,
            sample: Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null
          });
        } catch (e) {
          resolve({
            path,
            status: res.statusCode,
            error: 'JSON inválido'
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testar() {
  const endpoints = [
    '/frontend/html/lists/paises.json',
    '/frontend/html/lists/estados.json',
    '/frontend/html/lists/funcoes.json',
    '/frontend/html/lists/entrevistadores.json',
    '/frontend/html/lists/municipios_por_uf/SP.json'
  ];

  console.log('Testando JSONs...\n');

  for (const path of endpoints) {
    try {
      const result = await makeRequest(path);
      if (result.status === 200) {
        console.log(`✅ ${path}`);
        console.log(`   → ${result.count} registros`);
        if (result.sample) {
          console.log(`   → Sample:`, JSON.stringify(result.sample).substring(0, 80));
        }
      } else {
        console.log(`❌ ${path} → Status ${result.status}`);
      }
    } catch (err) {
      console.log(`⚠️  ${path} → ${err.message}`);
    }
    console.log();
  }
}

testar();
