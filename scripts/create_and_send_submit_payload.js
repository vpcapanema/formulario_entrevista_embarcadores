const fs = require('fs');
const path = require('path');
// Usa fetch global disponível em Node 18+. Se não existir, o script assumirá que o ambiente fornece fetch.

(async function(){
  try {
    const root = path.join(__dirname, '..');
    const camposPath = path.join(root, 'campos_tabelas_banco_payload.json');
    if (!fs.existsSync(camposPath)) {
      console.error('campos_tabelas_banco_payload.json não encontrado. Gere-o primeiro executando a inspeção de schema.');
      process.exit(1);
    }

    const raw = fs.readFileSync(camposPath, 'utf8');
    const schemaObj = JSON.parse(raw);
    const tables = (schemaObj && schemaObj.tables) || {};

    const empresasCols = tables.empresas || [];
    const entrevistadosCols = tables.entrevistados || [];
    const pesquisasCols = tables.pesquisas || [];

    function sampleValue(col) {
      const name = col.column_name;
      const dt = (col.data_type || '').toLowerCase();
      const nullable = col.is_nullable === 'YES';

      // tipos primários por data_type
      if (dt.includes('integer')) return 1;
      if (dt.includes('numeric')) return 0;
      if (dt.includes('boolean')) return false;
      if (dt.includes('array')) {
        // retorna exemplo coerente para colunas conhecidas
        if (name === 'modos') return ['rodoviario'];
        if (name === 'modais_alternativos') return ['hidrovia'];
        if (name === 'dificuldades') return ['logistica', 'carga'];
        return [];
      }

      // heurísticas por nome (após verificações por tipo)
      if (name.includes('cnpj')) return '12345678000199';
      if (name.includes('email')) return 'teste@example.com';
      if (name.includes('telefone') || name.includes('phone')) return '+5511999999999';
      if (name.match(/data|timestamp|data_/i)) return new Date().toISOString();
      if (name.includes('cep')) return '14000000';
      if (name.includes('uf') || name === 'estado') return 'SP';
      if (name.includes('municipio')) return 'Sao Paulo';
      if (name.includes('nome') || name.includes('razao') || name.includes('fantasia') || name.includes('produto') || name.includes('origem') || name.includes('destino')) return `Exemplo ${name}`;
      if (name.includes('tipo') || name.includes('categoria') || name.includes('modal')) return 'rodoviario';
  if (dt.includes('text') || dt.includes('character varying') || dt.includes('varchar')) return `${name}_exemplo`;

      // fallback
      return nullable ? null : '';
    }

    // montar objeto empresa com todas as colunas
    const empresaAllCols = {};
    empresasCols.forEach(col => {
      const key = col.column_name;
      // pular id autoincrement
      if (key === 'id_empresa') return;
      empresaAllCols[key] = sampleValue(col);
    });

    // Correção especial: quando o nome do município é São Paulo, usar id_municipio conhecido (1017)
    const muniNomeRaw = (empresaAllCols.municipio || '').toString().toLowerCase();
    if (muniNomeRaw.includes('são paulo') || muniNomeRaw.includes('sao paulo')) {
      empresaAllCols.municipio = 'São Paulo';
      empresaAllCols.id_municipio = 1017; // id interno da tabela municipios_sp
    }

    // montar entrevistado
    const entrevistadoBody = {};
    entrevistadosCols.forEach(col => {
      const key = col.column_name;
      if (key === 'id_entrevistado') return;
      entrevistadoBody[key] = sampleValue(col);
    });

    // montar pesquisa (payload principal). Incluir todos os campos, exceto id_pesquisa
    const pesquisaBody = {};
    pesquisasCols.forEach(col => {
      const key = col.column_name;
      if (key === 'id_pesquisa') return;
      pesquisaBody[key] = sampleValue(col);
    });

    // adicionar relacionamentos: id_empresa e id_entrevistado serão preenchidos após criação da empresa/entrevistado
    // construir produtos_transportados com um exemplo simples
    const prod = {
      produto: 'Produto Teste',
      movimentacao_anual: 1000,
      origem: 'Origem Exemplo',
      destino: 'Destino Exemplo',
      distancia: 123,
      modalidade: 'rodoviario',
      ordem: 1
    };

    // payload final para /api/submit-form: combinar pesquisa + entrevistado + produtos
    const payload = Object.assign({}, pesquisaBody);
    // notação: manter nomes tal como estão no banco (snake_case)
    payload.produtos_transportados = [prod];
  // incluir dados do entrevistado mínimo (será criado via endpoint entrevistados se necessário)
  payload.entrevistado = entrevistadoBody;

  // incluir dados da empresa no payload (campos que /api/submit-form espera)
  payload.nome_empresa = empresaAllCols.nome_empresa;
  payload.tipo_empresa = empresaAllCols.tipo_empresa;
  payload.outro_tipo = empresaAllCols.outro_tipo;
  payload.cnpj = empresaAllCols.cnpj;
  payload.razaoSocial = empresaAllCols.razao_social;
  payload.nomeFantasia = empresaAllCols.nome_fantasia;
  payload.telefone = empresaAllCols.telefone;
  payload.email = empresaAllCols.email;
    // municipio: para /api/submit-form o servidor espera (em alguns caminhos) um id inteiro em 'municipio'
    // portanto enviar municipio como id (quando disponível) e manter id_municipio também
    if (empresaAllCols.id_municipio) {
      payload.municipio = empresaAllCols.id_municipio; // inteiro
    } else {
      // fallback: quando não tiver id, enviar nome (string)
      payload.municipio = empresaAllCols.municipio || null;
    }
    payload.id_municipio = empresaAllCols.id_municipio || null;
  payload.logradouro = empresaAllCols.logradouro;
  payload.numero = empresaAllCols.numero;
  payload.complemento = empresaAllCols.complemento;
  payload.bairro = empresaAllCols.bairro;
  payload.cep = empresaAllCols.cep;

    const outPath = path.join(root, 'payload_for_submit.json');
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log('Gerado payload para submissão:', outPath);

    // Enviar para /api/submit-form
    const endpoint = process.env.API_URL || 'http://localhost:3000/api/submit-form';
    console.log('Enviando para', endpoint);

      // Primeiro, garantir que a empresa exista: POST /api/empresas
      const empresaEndpoint = process.env.API_URL || 'http://localhost:3000/api/empresas';
  const empresaPostBody = Object.assign({}, empresaAllCols);
  // garantir que o endpoint /api/empresas receba nome do município (string)
  if (empresaAllCols.municipio) empresaPostBody.municipio = empresaAllCols.municipio;
  if (empresaAllCols.id_municipio) empresaPostBody.id_municipio = empresaAllCols.id_municipio;
      // garantir campos requeridos pelo DB
      if (!empresaPostBody.tipo_empresa) empresaPostBody.tipo_empresa = 'privada';
      if (!empresaPostBody.nome_empresa) empresaPostBody.nome_empresa = empresaPostBody.razao_social || 'Empresa Teste';

      try {
        console.log('Empresa payload (antes do POST):', JSON.stringify(empresaPostBody, null, 2));
        const resEmp = await fetch(empresaEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(empresaPostBody)
        });
        const textEmp = await resEmp.text();
        console.log('Criação empresa HTTP', resEmp.status);
        let empJson = null;
        try { empJson = JSON.parse(textEmp); console.log('Resposta empresa:', empJson); } catch(e) { console.log(textEmp); }

        let createdEmpresaId = null;
        if (empJson && empJson.success && empJson.data && empJson.data.id_empresa) {
          createdEmpresaId = empJson.data.id_empresa;
          payload.id_empresa = createdEmpresaId;
        } else {
          // Se criação da empresa falhou, evitar dependência de CNPJ/ids no submit-form
          console.warn('Aviso: criação de empresa retornou erro - o script vai tentar enviar /api/submit-form sem CNPJ/ids para forçar inserção nova.');
          delete payload.cnpj;
          delete payload.id_empresa;
          delete payload.id_entrevistado;
        }

        // Criar entrevistado explicitamente para obter id_entrevistado apenas se empresa foi criada com sucesso
        if (createdEmpresaId) {
          try {
            const entrevistadoEndpoint = process.env.API_URL || 'http://localhost:3000/api/entrevistados';
            const entrevistadoPost = Object.assign({}, entrevistadoBody);
            if (createdEmpresaId) entrevistadoPost.id_empresa = createdEmpresaId;
            console.log('Criando entrevistado (antes do POST):', JSON.stringify(entrevistadoPost, null, 2));
            const resEnt = await fetch(entrevistadoEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entrevistadoPost)
            });
            const textEnt = await resEnt.text();
            let entJson = null;
            try { entJson = JSON.parse(textEnt); console.log('Resposta entrevistado:', entJson); } catch(e) { console.log(textEnt); }
            if (entJson && entJson.success && entJson.data && entJson.data.id_entrevistado) {
              payload.id_entrevistado = entJson.data.id_entrevistado;
            }
          } catch (e) {
            console.warn('Falha ao criar entrevistado (pode já existir):', e.message || e);
          }
        }
      } catch (e) {
        console.warn('Falha ao criar empresa (pode já existir):', e.message || e);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      try { console.log('HTTP', res.status, res.statusText, JSON.parse(text)); }
      catch (e) { console.log('HTTP', res.status, res.statusText, text); }

  } catch (e) {
    console.error('Erro:', e.message || e);
    process.exit(1);
  }
})();
