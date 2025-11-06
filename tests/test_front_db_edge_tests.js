/*
 * Script de testes de integração: validação dos "incertos" do front no banco
 * Envia vários payloads de borda para POST /api/submit-form e registra respostas.
 *
 * Uso (PowerShell):
 *   node .\test_front_db_edge_tests.js
 *
 * Observações:
 * - Assumo que o backend está rodando em http://localhost:3000
 * - O Node 18+ tem fetch global; se sua versão for anterior, instale 'node-fetch' ou execute com Node 18+
 */

const endpoint = process.env.API_URL || 'http://localhost:3000/api/submit-form';

// Casos de teste (simplificados; ajuste conforme schema do backend)
const payloads = [
  {
    name: 'happyPath_minimal',
    payload: {
      cnpj: '12.345.678/0001-90',
      razao_social: 'Empresa Teste Ltda',
      entrevistado: { nome: 'João da Silva', funcao: 'Diretor' },
      tem_paradas: 'sim',
      num_paradas: 2,
      modos: ['rodoviario'],
      config_veiculo: 'truck',
      pais_origem: 31, // Brasil
      origem_estado: 'SP',
      origem_municipio: '3550308',
      produtos_transportados: [
        { produto: 'Soja', movimentacao_anual: 1000, origem: 'Campinas' }
      ]
    }
  },
  {
    name: 'missing_conditional_num_paradas',
    payload: {
      cnpj: '98.765.432/0001-10',
      razao_social: 'Empresa Teste 2',
      entrevistado: { nome: 'Maria', funcao: 'Gerente' },
      tem_paradas: 'sim',
      // num_paradas ausente
      modos: ['ferroviario'],
      pais_origem: 31,
      origem_estado: 'SP',
      origem_municipio: '3548708',
      produtos_transportados: [ { produto: 'Açúcar', movimentacao_anual: 500 } ]
    }
  },
  {
    name: 'present_when_should_be_absent',
    payload: {
      cnpj: '11.222.333/0001-44',
      razao_social: 'Empresa Teste 3',
      entrevistado: { nome: 'Carlos', funcao: 'Analista' },
      tem_paradas: 'nao',
      num_paradas: 5, // inválido se tem_paradas == 'nao'
      modos: ['rodoviario'],
      pais_origem: 31,
      origem_estado: 'SP',
      origem_municipio: '3552205',
      produtos_transportados: [ { produto: 'Milho', movimentacao_anual: 200 } ]
    }
  },
  {
    name: 'nulls_and_empties',
    payload: {
      cnpj: '22.333.444/0001-55',
      razao_social: null,
      entrevistado: { nome: '', funcao: null },
      tem_paradas: 'nao',
      modos: [],
      pais_origem: null,
      origem_estado: '',
      origem_municipio: '',
      produtos_transportados: []
    }
  },
  {
    name: 'long_strings',
    payload: {
      cnpj: '33.444.555/0001-66',
      razao_social: 'X'.repeat(8000),
      entrevistado: { nome: 'Y'.repeat(2000), funcao: 'Z'.repeat(500) },
      tem_paradas: 'nao',
      modos: ['rodoviario'],
      pais_origem: 31,
      origem_estado: 'SP',
      origem_municipio: '3550308',
      produtos_transportados: [ { produto: 'Produto Grande', movimentacao_anual: 1 } ]
    }
  },
  {
    name: 'produto_missing_fields',
    payload: {
      cnpj: '44.555.666/0001-77',
      razao_social: 'Empresa Produto Incompleto',
      entrevistado: { nome: 'Paula', funcao: 'Coordenadora' },
      tem_paradas: 'nao',
      modos: ['rodoviario'],
      pais_origem: 31,
      origem_estado: 'SP',
      origem_municipio: '3550308',
      produtos_transportados: [ { produto: '', movimentacao_anual: null } ]
    }
  }
];

async function run() {
  console.log('Iniciando testes de integração para campos incertos contra', endpoint);

  for (const t of payloads) {
    console.log('\n---');
    console.log('Teste:', t.name);

    try {
      // fetch global disponível em Node 18+; se não houver, instrução irá falhar
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t.payload),
        // timeout control pode ser adicionado por libs; aguardamos o padrão
      });

      const text = await res.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch (e) { parsed = text; }

      console.log('HTTP', res.status, res.statusText);
      console.log('Resposta do backend:', parsed);

    } catch (error) {
      console.error('Erro ao enviar payload:', error && error.message ? error.message : error);
      console.error('Dica: verifique se o backend está rodando em http://localhost:3000 e se o endpoint /api/submit-form está disponível.');
    }
  }

  console.log('\nFim dos testes.');
}

run();
