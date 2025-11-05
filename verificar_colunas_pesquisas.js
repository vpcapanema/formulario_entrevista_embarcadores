const { Pool } = require('pg');

const pool = new Pool({
    host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'sigma_admin',
    password: 'Malditas131533*',
    database: 'sigma_pli',
    ssl: { rejectUnauthorized: false }
});

async function verificarColunas() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'formulario_embarcadores'
              AND table_name = 'pesquisas'
            ORDER BY ordinal_position;
        `);
        
        console.log('📋 Colunas da tabela PESQUISAS:\n');
        result.rows.forEach(row => {
            console.log(`   ${row.column_name}: ${row.data_type}${row.character_maximum_length ? '(' + row.character_maximum_length + ')' : ''}`);
        });
    } finally {
        client.release();
        await pool.end();
    }
}

verificarColunas().catch(console.error);
