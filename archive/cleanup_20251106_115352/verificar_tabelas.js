/**
 * Script para verificar tabelas existentes
 */

const { Pool } = require('pg');

const pool = new Pool({
    host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'sigma_admin',
    password: 'Malditas131533*',
    database: 'sigma_pli',
    ssl: {
        rejectUnauthorized: false
    }
});

async function verificarTabelas() {
    const client = await pool.connect();
    
    try {
        console.log('📋 Tabelas no schema formulario_embarcadores:\n');
        
        const result = await client.query(`
            SELECT table_name, table_type
            FROM information_schema.tables
            WHERE table_schema = 'formulario_embarcadores'
            ORDER BY table_name;
        `);
        
        result.rows.forEach(row => {
            console.log(`   ${row.table_type === 'BASE TABLE' ? '📁' : '👁️ '} ${row.table_name}`);
        });
        
        console.log(`\n✅ Total: ${result.rows.length} objetos`);
        
    } catch (error) {
        console.error('❌ Erro:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

verificarTabelas()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('💥 Erro fatal:', err);
        process.exit(1);
    });
