/**
 * Script para inserir estados brasileiros e países no banco RDS
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
        console.log('🔗 Conectado ao RDS PostgreSQL...\n');
        
        // ====== ESTADOS BRASILEIROS ======
        console.log('📄 Lendo arquivo estados_brasil.sql...');
        const sqlEstados = fs.readFileSync('./estados_brasil.sql', 'utf8');
        
        console.log('🚀 Executando SQL de estados...');
        await client.query(sqlEstados);
        
        const resultEstados = await client.query(
            'SELECT COUNT(*) as total FROM formulario_embarcadores.estados_brasil'
        );
        
        console.log(`✅ ${resultEstados.rows[0].total} estados brasileiros inseridos!`);
        
        // Mostrar alguns exemplos
        const exemplosEstados = await client.query(
            'SELECT uf, nome_estado, regiao FROM formulario_embarcadores.estados_brasil ORDER BY nome_estado LIMIT 10'
        );
        
        console.log('\n📝 Primeiros 10 estados (exemplo):');
        exemplosEstados.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.uf} - ${row.nome_estado} (${row.regiao})`);
        });
        
        // ====== PAÍSES ======
        console.log('\n\n📄 Lendo arquivo paises.sql...');
        const sqlPaises = fs.readFileSync('./paises.sql', 'utf8');
        
        console.log('🚀 Executando SQL de países...');
        await client.query(sqlPaises);
        
        const resultPaises = await client.query(
            'SELECT COUNT(*) as total FROM formulario_embarcadores.paises'
        );
        
        console.log(`✅ ${resultPaises.rows[0].total} países inseridos!`);
        
        // Mostrar top 10 por relevância
        const topPaises = await client.query(
            'SELECT nome_pais, codigo_iso2, relevancia FROM formulario_embarcadores.paises WHERE relevancia > 0 ORDER BY relevancia DESC LIMIT 10'
        );
        
        console.log('\n📊 Top 10 países por relevância:');
        topPaises.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.nome_pais} (${row.codigo_iso2}) - Relevância: ${row.relevancia}`);
        });
        
        // Mostrar América do Sul
        const sulamericanos = await client.query(
            "SELECT nome_pais, codigo_iso2 FROM formulario_embarcadores.paises WHERE nome_pais IN ('Brasil', 'Argentina', 'Paraguai', 'Uruguai', 'Chile', 'Bolívia', 'Peru', 'Colômbia', 'Venezuela', 'Equador', 'Guiana', 'Suriname', 'Guiana Francesa') ORDER BY relevancia DESC"
        );
        
        console.log('\n📝 Países da América do Sul:');
        sulamericanos.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.nome_pais} (${row.codigo_iso2})`);
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
        console.log('\n✅ Processo concluído! Estados e países inseridos no RDS.');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Processo falhou:', error);
        process.exit(1);
    });
