const { Pool } = require('pg');

const pool = new Pool({
    host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'sigma_pli',
    user: 'sigma_admin',
    password: 'Malditas131533*',
    ssl: { rejectUnauthorized: false }
});

async function verificarConstraints() {
    try {
        // Verificar constraints da tabela empresas
        const result = await pool.query(`
            SELECT 
                conname AS constraint_name,
                pg_get_constraintdef(oid) AS constraint_definition
            FROM pg_constraint
            WHERE conrelid = 'formulario_embarcadores.empresas'::regclass
            AND contype = 'c';
        `);
        
        console.log('\n📋 CONSTRAINTS na tabela empresas:\n');
        result.rows.forEach(row => {
            console.log(`✓ ${row.constraint_name}:`);
            console.log(`  └─ ${row.constraint_definition}\n`);
        });
        
    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        await pool.end();
    }
}

verificarConstraints();
