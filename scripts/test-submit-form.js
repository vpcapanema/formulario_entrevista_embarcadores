const https = require('https');

/**
 * Teste detalhado do endpoint POST /api/submit-form
 */

const API_BASE = 'https://formulario-entrevista-embarcadores.onrender.com';

console.log('🧪 TESTANDO POST /api/submit-form\n');

const payload = {
  nome: 'Teste API',
  email: 'teste@api.com',
  telefone: '1133334444',
  funcao: 'gerente',
  estadoCivil: 'solteiro',
  nacionalidade: 'brasileira',
  ufNaturalidade: 'SP',
  municipioNaturalidade: '3550308',
  cnpj: '11222333000181',
  nomeEmpresa: 'EMPRESA TESTE LTDA',
  tipoEmpresa: 'embarcador',
  municipio: 'São Paulo',
  logradouro: 'Rua Teste',
  numero: '100',
  bairro: 'Centro',
  cep: '01310100',
  origemPais: '31',
  origemEstado: 'SP',
  origemMunicipio: '3550308',
  destinoPais: '31',
  destinoEstado: 'RJ',
  destinoMunicipio: '3304557',
  produtoPrincipal: 'Eletrônicos',
  agrupamentoProduto: 'eletronico',
  tipoTransporte: 'local',
  distancia: 500,
  temParadas: 'nao',
  modos: ['rodoviario'],
  configVeiculo: 'veiculo-simples',  // ✅ Obrigatório com modo rodoviário
  pesoCarga: 10000,
  unidadePeso: 'tonelada',
  custoTransporte: 5000,
  valorCarga: 100000,
  tipoEmbalagem: 'caixa',
  cargaPerigosa: 'nao',
  tempoDias: 1,
  tempoHoras: 8,
  tempoMinutos: 0,
  frequencia: 'diaria',
  importanciaCusto: 'importante',
  variacaoCusto: 5,
  importanciaTempo: 'muito-importante',
  variacaoTempo: 10,
  importanciaConfiabilidade: 'importante',
  variacaoConfiabilidade: 8,
  importanciaSeguranca: 'importante',
  variacaoSeguranca: 5,
  importanciaCapacidade: 'importante',
  variacaoCapacidade: 5,
  tipoResponsavel: 'entrevistado',
  consentimento: true,  // ✅ BOOLEAN, não string
  tipoCadeia: 'directa',  // ✅ Campo obrigatório
  produtos: []
};

console.log('📤 Payload:', JSON.stringify(payload).substring(0, 200) + '...\n');

function makePostRequest() {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + '/api/submit-form');
    const body = JSON.stringify(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
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
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('Enviando POST...\n');
  try {
    const result = await makePostRequest();
    
    console.log(`Status: ${result.status}\n`);
    
    if (result.status === 201 || result.status === 200) {
      console.log('✅ SUCESSO!\n');
      console.log('Resposta:', JSON.stringify(result.body, null, 2));
    } else if (result.status === 422) {
      console.log('❌ ERRO DE VALIDAÇÃO (422)\n');
      console.log('Detalhes:', JSON.stringify(result.body, null, 2));
    } else {
      console.log(`⚠️  Status ${result.status}\n`);
      console.log('Resposta:', JSON.stringify(result.body, null, 2));
    }
  } catch (err) {
    console.error('❌ ERRO:', err.message);
  }
})();
