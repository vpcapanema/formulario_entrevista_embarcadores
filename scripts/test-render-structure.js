const https = require('https');

/**
 * Teste detalhado do que está disponível no Render
 */

const API_BASE = 'https://formulario-entrevista-embarcadores.onrender.com';

console.log('🔍 TESTE DE ESTRUTURA NO RENDER\n');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = { method: 'GET' };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          body: data.substring(0, 200) // primeiros 200 chars
        });
      });
    });

    req.on('error', () => {
      resolve({ path, status: 'ERROR' });
    });

    req.end();
  });
}

async function testar() {
  const paths = [
    '/',
    '/health',
    '/docs',
    '/api',
    '/api/submit-form',
    '/api/pesquisas',
    '/lists',
    '/lists/paises.json',
    '/lists/estados.json',
    '/html',
    '/html/index.html',
    '/frontend',
    '/frontend/html/lists/paises.json'
  ];

  console.log('Testando disponibilidade de paths...\n');

  for (const path of paths) {
    const result = await makeRequest(path);
    const status = result.status;
    const statusStr = status === 200 ? '✅' : status === 404 ? '❌' : status === 401 ? '🔒' : '⚠️';
    console.log(`${statusStr} ${path.padEnd(40)} → ${status}`);
  }
}

testar();
