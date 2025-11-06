const { Pool } = require('pg');

const pool = new Pool({
    host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'sigma_pli',
    user: 'sigma_admin',
    password: 'Malditas131533*',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('▶ Adicionando coluna email_lower em entrevistados (se necessário)');
        await client.query(`ALTER TABLE IF EXISTS formulario_embarcadores.entrevistados
            ADD COLUMN IF NOT EXISTS email_lower VARCHAR(255)`);
        console.log('   ✅ Coluna garantida');

        console.log('▶ Populando email_lower a partir de email (lower)');
        const upd = await client.query(`UPDATE formulario_embarcadores.entrevistados
            SET email_lower = lower(email)
            WHERE email IS NOT NULL AND (email_lower IS NULL OR email_lower <> lower(email))`);
        console.log(`   ✅ Linhas atualizadas: ${upd.rowCount}`);

        console.log('▶ Criando índice único em (id_empresa, email_lower) concorrente');
        await client.query(`CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_entrevistados_empresa_email_lower
            ON formulario_embarcadores.entrevistados (id_empresa, email_lower)`);
        console.log('   ✅ Índice criado (ou já existia)');

    } catch (err) {
        console.error('❌ Erro:', err.message);
        process.exitCode = 2;
    } finally {
        client.release();
        await pool.end();
    }
}

run();
