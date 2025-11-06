const { Pool } = require('pg');

const pool = new Pool({
    host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'sigma_pli',
    user: 'postgres',
    password: 'Castor030509'
});

async function checkNotNullColumns() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'formulario_embarcadores' 
            AND table_name = 'pesquisas' 
            AND is_nullable = 'NO'
            ORDER BY ordinal_position
        `);
        
        console.log('\n📋 Colunas NOT NULL na tabela pesquisas:\n');
        result.rows.forEach(col => {
            console.log(`   ✓ ${col.column_name.padEnd(30)} | ${col.data_type}`);
        });
        
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await pool.end();
    }
}

checkNotNullColumns();
