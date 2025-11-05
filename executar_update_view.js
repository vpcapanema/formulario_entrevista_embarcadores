/**
 * Script Node.js para executar atualização da view
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function atualizarView() {
    const client = await pool.connect();
    
    try {
        console.log('📋 Lendo script SQL...\n');
        const sqlScript = fs.readFileSync(
            path.join(__dirname, 'view_respostas_simplificada.sql'),
            'utf8'
        );
        
        console.log('🔄 Executando atualização da view...\n');
        await client.query(sqlScript);
        
        console.log('✅ View atualizada com sucesso!\n');
        
        // Testar a view
        console.log('🔍 Testando estrutura da view...\n');
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'formulario_embarcadores' 
              AND table_name = 'v_pesquisas_completa'
            ORDER BY ordinal_position;
        `);
        
        console.log('📊 Colunas da view (total: ' + result.rows.length + '):\n');
        result.rows.forEach((row, idx) => {
            console.log(`   ${idx + 1}. ${row.column_name} (${row.data_type})`);
        });
        
        console.log('\n✅ View pronta para uso!');
        
    } catch (error) {
        console.error('❌ Erro:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

atualizarView()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('💥 Erro fatal:', err);
        process.exit(1);
    });
