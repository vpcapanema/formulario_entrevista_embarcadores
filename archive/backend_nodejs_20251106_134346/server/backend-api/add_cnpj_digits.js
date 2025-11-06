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
        console.log('▶ Aplicando ALTER TABLE para adicionar cnpj_digits (se necessário)');
        const alterSql = `ALTER TABLE IF EXISTS formulario_embarcadores.empresas
            ADD COLUMN IF NOT EXISTS cnpj_digits VARCHAR(14);`;
        await client.query(alterSql);
        console.log('   ✅ ALTER TABLE executado (se já existia, foi ignorado).');

        console.log('▶ Populando cnpj_digits para linhas existentes');
        const updateSql = `UPDATE formulario_embarcadores.empresas
            SET cnpj_digits = regexp_replace(coalesce(cnpj, ''), '\\D', '', 'g')
            WHERE cnpj IS NOT NULL;`;
        const res = await client.query(updateSql);
        console.log(`   ✅ UPDATE executado. Linhas afetadas: ${res.rowCount}`);

    } catch (err) {
        console.error('❌ Erro ao aplicar ALTER/UPDATE:', err.message);
        process.exitCode = 2;
    } finally {
        client.release();
        await pool.end();
    }
}

run();
