const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST || 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'sigma_pli',
  user: process.env.PGUSER || 'sigma_admin',
  password: process.env.PGPASSWORD || 'Malditas131533*',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    // Criar uma empresa para ligar as entrevistas
    const empresaRes = await client.query(
      `INSERT INTO formulario_embarcadores.empresas (nome_empresa, tipo_empresa, municipio, estado, id_municipio, razao_social, telefone, email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id_empresa`,
      ['Empresa Bulk Test', 'embarcador', 'São Paulo', 'SP', 1017, 'Empresa Bulk Razao', '+5511999999000', 'bulk@example.com']
    );
    const empresaId = empresaRes.rows[0].id_empresa;
    console.log('Empresa criada:', empresaId);

    let successCount = 0;
    const errors = [];

    for (let i = 1; i <= 34; i++) {
      try {
        // Criar entrevistado
        const nome = `Entrevistado Bulk ${i}`;
        const funcao = 'Gerente';
        const telefone = `+5511999900${String(i).padStart(2,'0')}`;
        const email = `entrevistado.bulk.${i}@example.com`;

        const entRes = await client.query(
          `INSERT INTO formulario_embarcadores.entrevistados (id_empresa, nome, funcao, telefone, email, principal)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_entrevistado`,
          [empresaId, nome, funcao, telefone, email, false]
        );
        const entrevistadoId = entRes.rows[0].id_entrevistado;

        // Criar pesquisa vinculada
        const pesquisaRes = await client.query(
          `INSERT INTO formulario_embarcadores.pesquisas (
             id_empresa, id_entrevistado, tipo_responsavel, id_responsavel, produto_principal, agrupamento_produto,
             tipo_transporte, origem_pais, origem_estado, origem_municipio, destino_pais, destino_estado, destino_municipio,
             distancia, tem_paradas, modos, peso_carga, unidade_peso, custo_transporte, valor_carga, tipo_embalagem,
             carga_perigosa, tempo_dias, tempo_horas, tempo_minutos, frequencia, importancia_custo, variacao_custo,
             importancia_tempo, variacao_tempo, importancia_confiabilidade, variacao_confiabilidade, importancia_seguranca,
             variacao_seguranca, importancia_capacidade, variacao_capacidade, tipo_cadeia
           ) VALUES (
             $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37
           ) RETURNING id_pesquisa`,
          [
            empresaId, //1
            entrevistadoId, //2
            'entrevistador', //3 tipo_responsavel
            entrevistadoId, //4 id_responsavel
            `Produto Bulk ${i}`, //5 produto_principal
            `Agrup ${i}`, //6 agrupamento_produto
            'local', //7 tipo_transporte
            'Brasil', //8 origem_pais
            'SP', //9 origem_estado
            '3550308', //10 origem_municipio (string IBGE)
            'Brasil', //11 destino_pais
            'SP', //12 destino_estado
            '3550308', //13 destino_municipio
            100.0, //14 distancia
            'nao', //15 tem_paradas
            ['rodoviario'], //16 modos (array)
            1000.0, //17 peso_carga
            'tonelada', //18 unidade_peso
            500.0, //19 custo_transporte
            10000.0, //20 valor_carga
            'saco', //21 tipo_embalagem
            'nao', //22 carga_perigosa
            1, //23 tempo_dias
            2, //24 tempo_horas
            30, //25 tempo_minutos
            'semanal', //26 frequencia
            'alta', //27 importancia_custo
            0.0, //28 variacao_custo
            'alta', //29 importancia_tempo
            0.0, //30 variacao_tempo
            'alta', //31 importancia_confiabilidade
            0.0, //32 variacao_confiabilidade
            'alta', //33 importancia_seguranca
            0.0, //34 variacao_seguranca
            'alta', //35 importancia_capacidade
            0.0, //36 variacao_capacidade
            'curta' //37 tipo_cadeia
          ]
        );

        const id_pesquisa = pesquisaRes.rows[0].id_pesquisa;
        console.log(`Inserido pesquisa ${i} -> id_pesquisa=${id_pesquisa}, entrevistado=${entrevistadoId}`);
        successCount++;
      } catch (err) {
        console.error(`Erro na iteração ${i}:`, err.message || err);
        errors.push({ i, error: err.message || err.toString() });
      }
    }

    console.log(`\nResumo: inserções bem-sucedidas: ${successCount}/34`);
    if (errors.length > 0) console.log('Erros:', errors);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => { console.error('Erro fatal:', e); process.exit(1); });
