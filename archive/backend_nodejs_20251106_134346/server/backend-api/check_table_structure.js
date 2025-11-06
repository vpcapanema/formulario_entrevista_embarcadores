/**
 * Verificar estrutura das tabelas no banco
 */

const { Pool } = require('pg');

const pool = new Pool({
    host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'sigma_pli',
    user: 'sigma_admin',
    password: 'Malditas131533*',
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkTables() {
    console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
    console.log('║                      🔍 ESTRUTURA DAS TABELAS                             ║');
    console.log('╠═══════════════════════════════════════════════════════════════════════════╣\n');

    try {
        // EMPRESAS
        console.log('🏢 TABELA: formulario_embarcadores.empresas');
        console.log('─────────────────────────────────────────────────────────────\n');
        
        const empresasQuery = `
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'formulario_embarcadores'
            AND table_name = 'empresas'
            ORDER BY ordinal_position;
        `;
        
        const empresasResult = await pool.query(empresasQuery);
        
        if (empresasResult.rows.length === 0) {
            console.log('❌ Tabela não existe!\n');
        } else {
            empresasResult.rows.forEach(col => {
                const type = col.character_maximum_length 
                    ? `${col.data_type}(${col.character_maximum_length})`
                    : col.data_type;
                const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                console.log(`   ${col.column_name.padEnd(30)} ${type.padEnd(20)} ${nullable}`);
            });
            console.log('');
        }

        // ENTREVISTADOS
        console.log('👤 TABELA: formulario_embarcadores.entrevistados');
        console.log('─────────────────────────────────────────────────────────────\n');
        
        const entrevistadosQuery = `
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'formulario_embarcadores'
            AND table_name = 'entrevistados'
            ORDER BY ordinal_position;
        `;
        
        const entrevistadosResult = await pool.query(entrevistadosQuery);
        
        if (entrevistadosResult.rows.length === 0) {
            console.log('❌ Tabela não existe!\n');
        } else {
            entrevistadosResult.rows.forEach(col => {
                const type = col.character_maximum_length 
                    ? `${col.data_type}(${col.character_maximum_length})`
                    : col.data_type;
                const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                console.log(`   ${col.column_name.padEnd(30)} ${type.padEnd(20)} ${nullable}`);
            });
            console.log('');
        }

        // PESQUISAS
        console.log('📋 TABELA: formulario_embarcadores.pesquisas');
        console.log('─────────────────────────────────────────────────────────────\n');
        
        const pesquisasQuery = `
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'formulario_embarcadores'
            AND table_name = 'pesquisas'
            ORDER BY ordinal_position;
        `;
        
        const pesquisasResult = await pool.query(pesquisasQuery);
        
        if (pesquisasResult.rows.length === 0) {
            console.log('❌ Tabela não existe!\n');
        } else {
            pesquisasResult.rows.forEach(col => {
                const type = col.character_maximum_length 
                    ? `${col.data_type}(${col.character_maximum_length})`
                    : col.data_type;
                const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                console.log(`   ${col.column_name.padEnd(30)} ${type.padEnd(20)} ${nullable}`);
            });
            console.log('');
        }

        console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await pool.end();
    }
}

checkTables();
