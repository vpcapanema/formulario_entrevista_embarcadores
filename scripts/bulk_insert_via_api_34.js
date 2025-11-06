const fetch = global.fetch || require('node-fetch');
const API_BASE = process.env.API_URL || 'http://localhost:3000';

async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }
  return { status: res.status, body: json };
}

async function run() {
  console.log('API base:', API_BASE);

  // 1) criar empresa via API
  const empresaPayload = {
    nome_empresa: 'Empresa API Bulk Test',
    tipo_empresa: 'embarcador',
    outro_tipo: null,
    municipio: 'São Paulo',
    estado: 'SP',
    cnpj: `12${Date.now().toString().slice(-12)}`,
    razao_social: 'Empresa API Bulk Razao',
    nome_fantasia: 'Empresa API Bulk',
    telefone: '+5511999999000',
    email: 'bulk-api@example.com',
    id_municipio: 1017,
    logradouro: 'Rua API',
    numero: '100',
    complemento: '',
    bairro: 'Centro',
    cep: '14000000'
  };

  console.log('Criando empresa via API...');
  const empRes = await postJson('/api/empresas', empresaPayload);
  console.log('Empresa HTTP', empRes.status, empRes.body);
  if (empRes.status >= 400) {
    console.error('Falha ao criar empresa via API, abortando testes via API.');
    return;
  }
  const empresa = empRes.body || empRes.body.data || empRes.body;
  const empresaId = empresa.id_empresa || empresa.id || (empRes.body && empRes.body.id_empresa) || null;
  if (!empresaId) {
    console.error('Não foi possível obter id_empresa da resposta:', empRes.body);
    return;
  }

  let success = 0;
  const errors = [];

  for (let i = 1; i <= 2; i++) {
    // criar entrevistado
    const entrevistadoPayload = {
      id_empresa: empresaId,
      nome: `Entrevistado API ${i}`,
      funcao: 'Coordenador',
      telefone: `+5511999900${String(i).padStart(2,'0')}`,
      email: `api.entrevistado.${i}@example.com`,
      principal: false
    };

    const entRes = await postJson('/api/entrevistados', entrevistadoPayload);
    if (entRes.status >= 400) {
      console.error(`erro criando entrevistado ${i}:`, entRes.status, entRes.body);
      errors.push({ i, step: 'entrevistado', resp: entRes });
      continue;
    }
    const entrevistado = entRes.body || {};
    const entrevistadoId = entrevistado.id_entrevistado || entrevistado.id || (entRes.body && entRes.body.id_entrevistado) || null;
    if (!entrevistadoId) {
      console.error('Não obteve id_entrevistado para', i, entRes.body);
      errors.push({ i, step: 'entrevistado_no_id', resp: entRes });
      continue;
    }

    // criar pesquisa via API
    const pesquisaPayload = {
      id_empresa: empresaId,
      id_entrevistado: entrevistadoId,
      tipo_responsavel: 'entrevistador',
      id_responsavel: entrevistadoId,
      produto_principal: `Produto API ${i}`,
      agrupamento_produto: `Agrup ${i}`,
      tipo_transporte: 'local',
      origem_pais: 'Brasil',
      origem_estado: 'SP',
      origem_municipio: '3550308',
      destino_pais: 'Brasil',
      destino_estado: 'SP',
      destino_municipio: '3550308',
      distancia: 100,
      tem_paradas: 'nao',
      modos: ['rodoviario'],
      peso_carga: 1000,
      unidade_peso: 'tonelada',
      custo_transporte: 100,
      valor_carga: 10000,
      tipo_embalagem: 'saco',
      carga_perigosa: 'nao',
      tempo_dias: 1,
      tempo_horas: 2,
      tempo_minutos: 30,
      frequencia: 'semanal',
      importancia_custo: 'alta',
      variacao_custo: 0,
      importancia_tempo: 'alta',
      variacao_tempo: 0,
      importancia_confiabilidade: 'alta',
      variacao_confiabilidade: 0,
      importancia_seguranca: 'alta',
      variacao_seguranca: 0,
      importancia_capacidade: 'alta',
      variacao_capacidade: 0,
      tipo_cadeia: 'curta',
      produtos_transportados: [
        { produto: `Produto API ${i}`, movimentacao_anual: 1000, origem: 'Origem API', destino: 'Destino API', distancia: 100, modalidade: 'rodoviario', acondicionamento: 'a granel' }
      ]
    };

    const pesRes = await postJson('/api/pesquisas', pesquisaPayload);
    if (pesRes.status >= 400) {
      console.error(`erro criando pesquisa ${i}:`, pesRes.status, pesRes.body);
      errors.push({ i, step: 'pesquisa', resp: pesRes });
      continue;
    }

    console.log(`OK ${i}: entrevistado ${entrevistadoId} pesquisa ${pesRes.body && pesRes.body.id_pesquisa}`);
    success++;
  }

  console.log(`\nResumo via API: ${success}/2 inserções de pesquisa bem-sucedidas`);
  if (errors.length) console.log('Erros:', errors);
}

run().catch(e => { console.error('Erro fatal:', e); process.exit(1); });
