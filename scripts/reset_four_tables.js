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

async function resetTables() {
    const client = await pool.connect();
    try {
        console.log('Conectado ao banco. Iniciando truncagem das tabelas...');
        await client.query('BEGIN');

        // TRUNCATE com RESTART IDENTITY e CASCADE para garantir remoção segura
        const sql = `TRUNCATE TABLE
            formulario_embarcadores.produtos_transportados,
            formulario_embarcadores.pesquisas,
            formulario_embarcadores.entrevistados,
            formulario_embarcadores.empresas
            RESTART IDENTITY CASCADE;`;

        await client.query(sql);

        await client.query('COMMIT');
        console.log('✅ Truncagem concluída com sucesso (tabelas limpas e sequências reiniciadas).');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Erro ao truncar tabelas:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

if (require.main === module) {
    resetTables().catch(err => {
        console.error('Erro inesperado:', err);
        process.exit(1);
    });
}

module.exports = { resetTables };
