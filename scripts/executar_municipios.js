/**
 * Script para inserir os 645 municípios de São Paulo no banco RDS
 */

const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: './backend-api/.env' });

const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

async function executarSQL() {
    const client = await pool.connect();
    
    try {
        console.log('🔗 Conectado ao RDS PostgreSQL...');
        
        // Ler arquivo SQL
        console.log('📄 Lendo arquivo municipios_sp_ibge_oficial.sql...');
        const sql = fs.readFileSync('./municipios_sp_ibge_oficial.sql', 'utf8');
        
        console.log('🚀 Executando SQL...');
        await client.query(sql);
        
        console.log('✅ SQL executado com sucesso!');
        
        // Verificar quantos municípios foram inseridos
        const result = await client.query(
            'SELECT COUNT(*) as total FROM formulario_embarcadores.municipios_sp'
        );
        
        console.log(`\n📊 Total de municípios no banco: ${result.rows[0].total}`);
        
        // Mostrar alguns exemplos
        const exemplos = await client.query(
            'SELECT nome_municipio, codigo_ibge, regiao FROM formulario_embarcadores.municipios_sp ORDER BY nome_municipio LIMIT 10'
        );
        
        console.log('\n📝 Primeiros 10 municípios (exemplo):');
        exemplos.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.nome_municipio} (IBGE: ${row.codigo_ibge}) - ${row.regiao}`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao executar SQL:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

executarSQL()
    .then(() => {
        console.log('\n✅ Processo concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Processo falhou:', error);
        process.exit(1);
    });
