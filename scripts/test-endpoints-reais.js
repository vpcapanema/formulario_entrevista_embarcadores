const http = require('http');

/**
 * TESTE DE ENDPOINTS REAIS
 * Valida cada endpoint da API e seu comportamento
 */

const API_BASE = 'https://formulario-entrevista-embarcadores.onrender.com';

console.log('🧪 TESTANDO ENDPOINTS REAIS DA API\n');
console.log(`📍 Base URL: ${API_BASE}\n`);

// ============================================================
// HELPER: Fazer requisição HTTP/HTTPS
// ============================================================

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? require('https') : http;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ============================================================
// TESTES
// ============================================================

async function testarEndpoints() {
  const resultados = [];

  // ✅ 1. Health Check
  console.log('1️⃣ Testing /health...');
  try {
    const res = await makeRequest('GET', '/health');
    if (res.status === 200 && res.body?.status === 'OK') {
      console.log('   ✅ PASSOU - API está online\n');
      resultados.push({ endpoint: '/health', status: 'PASS', details: res.body });
    } else {
      console.log(`   ❌ FALHOU - Status ${res.status}\n`);
      resultados.push({ endpoint: '/health', status: 'FAIL', details: res });
    }
  } catch (err) {
    console.log(`   ❌ ERRO - ${err.message}\n`);
    resultados.push({ endpoint: '/health', status: 'ERROR', error: err.message });
  }

  // ✅ 2. GET /lists/paises.json
  console.log('2️⃣ Testing /lists/paises.json...');
  try {
    const res = await makeRequest('GET', '/lists/paises.json');
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(`   ✅ PASSOU - ${res.body.length} países retornados\n`);
      resultados.push({ endpoint: '/lists/paises.json', status: 'PASS', count: res.body.length });
    } else {
      console.log(`   ❌ FALHOU - Status ${res.status}\n`);
      resultados.push({ endpoint: '/lists/paises.json', status: 'FAIL' });
    }
  } catch (err) {
    console.log(`   ❌ ERRO - ${err.message}\n`);
    resultados.push({ endpoint: '/lists/paises.json', status: 'ERROR', error: err.message });
  }

  // ✅ 3. GET /lists/estados.json
  console.log('3️⃣ Testing /lists/estados.json...');
  try {
    const res = await makeRequest('GET', '/lists/estados.json');
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(`   ✅ PASSOU - ${res.body.length} estados retornados\n`);
      resultados.push({ endpoint: '/lists/estados.json', status: 'PASS', count: res.body.length });
    } else {
      console.log(`   ❌ FALHOU - Status ${res.status}\n`);
      resultados.push({ endpoint: '/lists/estados.json', status: 'FAIL' });
    }
  } catch (err) {
    console.log(`   ❌ ERRO - ${err.message}\n`);
    resultados.push({ endpoint: '/lists/estados.json', status: 'ERROR', error: err.message });
  }

  // ✅ 4. GET /lists/funcoes.json
  console.log('4️⃣ Testing /lists/funcoes.json...');
  try {
    const res = await makeRequest('GET', '/lists/funcoes.json');
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(`   ✅ PASSOU - ${res.body.length} funções retornadas\n`);
      resultados.push({ endpoint: '/lists/funcoes.json', status: 'PASS', count: res.body.length });
    } else {
      console.log(`   ❌ FALHOU - Status ${res.status}\n`);
      resultados.push({ endpoint: '/lists/funcoes.json', status: 'FAIL' });
    }
  } catch (err) {
    console.log(`   ❌ ERRO - ${err.message}\n`);
    resultados.push({ endpoint: '/lists/funcoes.json', status: 'ERROR', error: err.message });
  }

  // ✅ 5. GET /lists/entrevistadores.json
  console.log('5️⃣ Testing /lists/entrevistadores.json...');
  try {
    const res = await makeRequest('GET', '/lists/entrevistadores.json');
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(`   ✅ PASSOU - ${res.body.length} entrevistadores retornados\n`);
      resultados.push({ endpoint: '/lists/entrevistadores.json', status: 'PASS', count: res.body.length });
    } else {
      console.log(`   ❌ FALHOU - Status ${res.status}\n`);
      resultados.push({ endpoint: '/lists/entrevistadores.json', status: 'FAIL' });
    }
  } catch (err) {
    console.log(`   ❌ ERRO - ${err.message}\n`);
    resultados.push({ endpoint: '/lists/entrevistadores.json', status: 'ERROR', error: err.message });
  }

  // ✅ 6. GET /lists/municipios_por_uf/SP.json
  console.log('6️⃣ Testing /lists/municipios_por_uf/SP.json...');
  try {
    const res = await makeRequest('GET', '/lists/municipios_por_uf/SP.json');
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(`   ✅ PASSOU - ${res.body.length} municípios de SP retornados\n`);
      resultados.push({ endpoint: '/lists/municipios_por_uf/SP.json', status: 'PASS', count: res.body.length });
    } else {
      console.log(`   ❌ FALHOU - Status ${res.status}\n`);
      resultados.push({ endpoint: '/lists/municipios_por_uf/SP.json', status: 'FAIL' });
    }
  } catch (err) {
    console.log(`   ❌ ERRO - ${err.message}\n`);
    resultados.push({ endpoint: '/lists/municipios_por_uf/SP.json', status: 'ERROR', error: err.message });
  }

  // ✅ 7. POST /api/submit-form (teste com dados válidos)
  console.log('7️⃣ Testing /api/submit-form (POST)...');
  const payloadSubmit = {
    nome: 'Teste Automatizado',
    email: 'teste@automation.com',
    telefone: '1133334444',
    funcao: 'gerente',
    estadoCivil: 'solteiro',
    nacionalidade: 'brasileira',
    ufNaturalidade: 'SP',
    municipioNaturalidade: '3550308',
    cnpj: '57286005000140',
    nomeEmpresa: 'TEST AUTO LTDA',
    tipoEmpresa: 'embarcador',
    municipio: 'São Paulo',
    logradouro: 'Rua Teste',
    numero: '123',
    bairro: 'Teste',
    cep: '01311100',
    origemPais: '31',
    origemEstado: 'SP',
    origemMunicipio: '3550308',
    destinoPais: '31',
    destinoEstado: 'RJ',
    destinoMunicipio: '3304557',
    produtoPrincipal: 'Soja',
    agrupamentoProduto: 'graos',
    tipoTransporte: 'local',
    distancia: 500,
    temParadas: 'nao',
    modos: ['rodoviario'],
    pesoCarga: 50000,
    unidadePeso: 'tonelada',
    custoTransporte: 5000,
    valorCarga: 250000,
    tipoEmbalagem: 'granel',
    cargaPerigosa: 'nao',
    tempoDias: 2,
    tempoHoras: 5,
    tempoMinutos: 0,
    frequencia: 'semanal',
    importanciaCusto: 'importante',
    variacaoCusto: 10,
    importanciaTempo: 'importante',
    variacaoTempo: 10,
    importanciaConfiabilidade: 'importante',
    variacaoConfiabilidade: 10,
    importanciaSeguranca: 'importante',
    variacaoSeguranca: 10,
    importanciaCapacidade: 'importante',
    variacaoCapacidade: 10,
    consentimento: 'sim',
    tipoResponsavel: 'entrevistado',
    produtos: []
  };

  try {
    const res = await makeRequest('POST', '/api/submit-form', payloadSubmit);
    if (res.status === 201 && res.body?.success) {
      console.log(`   ✅ PASSOU - Pesquisa salva com ID ${res.body?.id_pesquisa}\n`);
      resultados.push({ 
        endpoint: '/api/submit-form', 
        status: 'PASS', 
        details: `ID Pesquisa: ${res.body?.id_pesquisa}` 
      });
    } else {
      console.log(`   ⚠️  Status ${res.status} - ${res.body?.message || 'Erro desconhecido'}\n`);
      resultados.push({ 
        endpoint: '/api/submit-form', 
        status: 'PARTIAL', 
        details: res.body?.message 
      });
    }
  } catch (err) {
    console.log(`   ❌ ERRO - ${err.message}\n`);
    resultados.push({ endpoint: '/api/submit-form', status: 'ERROR', error: err.message });
  }

  // ✅ 8. GET /api/pesquisas
  console.log('8️⃣ Testing /api/pesquisas (GET)...');
  try {
    const res = await makeRequest('GET', '/api/pesquisas');
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(`   ✅ PASSOU - ${res.body.length} pesquisas retornadas\n`);
      resultados.push({ endpoint: '/api/pesquisas', status: 'PASS', count: res.body.length });
    } else {
      console.log(`   ❌ FALHOU - Status ${res.status}\n`);
      resultados.push({ endpoint: '/api/pesquisas', status: 'FAIL' });
    }
  } catch (err) {
    console.log(`   ❌ ERRO - ${err.message}\n`);
    resultados.push({ endpoint: '/api/pesquisas', status: 'ERROR', error: err.message });
  }

  // ============================================================
  // RESUMO
  // ============================================================

  console.log('='.repeat(60));
  console.log('\n📊 RESUMO DOS TESTES:\n');

  const passed = resultados.filter(r => r.status === 'PASS').length;
  const failed = resultados.filter(r => r.status === 'FAIL').length;
  const errors = resultados.filter(r => r.status === 'ERROR').length;
  const partial = resultados.filter(r => r.status === 'PARTIAL').length;

  resultados.forEach(r => {
    const icon = {
      'PASS': '✅',
      'FAIL': '❌',
      'ERROR': '⚠️',
      'PARTIAL': '⚠️'
    }[r.status];
    console.log(`${icon} ${r.endpoint.padEnd(35)} → ${r.status}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`\n📈 RESULTADO FINAL:`);
  console.log(`   ✅ Passou: ${passed}/${resultados.length}`);
  console.log(`   ❌ Falhou: ${failed}/${resultados.length}`);
  console.log(`   ⚠️  Erros: ${errors}/${resultados.length}`);
  console.log(`   ⚠️  Parcial: ${partial}/${resultados.length}\n`);

  if (passed === resultados.length) {
    console.log('🎉 TODOS OS ENDPOINTS ESTÃO FUNCIONANDO!\n');
  } else {
    console.log('⚠️  Alguns endpoints precisam revisão\n');
  }
}

// Executar
testarEndpoints().catch(console.error);
