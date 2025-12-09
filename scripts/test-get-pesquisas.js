const https = require('https');

/**
 * Teste GET /api/pesquisas
 */

const API_BASE = 'https://formulario-entrevista-embarcadores.onrender.com';

console.log('🧪 TESTANDO GET /api/pesquisas\n');

function makeRequest() {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + '/api/pesquisas');
    const options = { method: 'GET' };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    const result = await makeRequest();
    
    console.log(`Status: ${result.status}\n`);
    
    if (result.status === 200) {
      if (Array.isArray(result.body)) {
        console.log(`✅ SUCESSO!\n`);
        console.log(`📊 Total de pesquisas: ${result.body.length}\n`);
        
        if (result.body.length > 0) {
          console.log('Últimas 3 pesquisas:');
          result.body.slice(0, 3).forEach((p, idx) => {
            console.log(`\n${idx + 1}. ID: ${p.id_pesquisa}`);
            console.log(`   Empresa: ${p.razao_social || p.nomeEmpresa}`);
            console.log(`   Entrevistado: ${p.nome}`);
            console.log(`   Produto: ${p.produto_principal}`);
            console.log(`   Data: ${p.data_entrevista}`);
          });
        }
      } else {
        console.log('⚠️  Resposta não é um array');
        console.log(result.body);
      }
    } else {
      console.log(`❌ Status ${result.status}\n`);
      console.log('Resposta:', JSON.stringify(result.body, null, 2));
    }
  } catch (err) {
    console.error('❌ ERRO:', err.message);
  }
})();
