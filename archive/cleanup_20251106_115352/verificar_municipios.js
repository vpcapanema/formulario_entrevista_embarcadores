/**
 * Verifica quantos municípios existem no banco e mostra alguns exemplos
 */

const { Pool } = require('pg');
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

async function verificar() {
    const client = await pool.connect();
    
    try {
        console.log('🔗 Conectado ao RDS...');
        
        // Contar municípios
        const count = await client.query(
            'SELECT COUNT(*) as total FROM formulario_embarcadores.municipios_sp'
        );
        console.log(`\n📊 Total de municípios: ${count.rows[0].total}`);
        
        // Verificar códigos duplicados no arquivo SQL
        const fs = require('fs');
        const sql = fs.readFileSync('./municipios_sp_completo.sql', 'utf8');
        const lines = sql.split('\n');
        const codigos = [];
        
        for (const line of lines) {
            const match = line.match(/'(\d{7})'/);
            if (match) {
                const codigo = match[1];
                if (codigos.includes(codigo)) {
                    console.log(`⚠️  Código DUPLICADO no SQL: ${codigo}`);
                    // Encontrar o município
                    const nomeMatch = line.match(/\('([^']+)'/);
                    if (nomeMatch) {
                        console.log(`   Linha: ${line.trim()}`);
                    }
                }
                codigos.push(codigo);
            }
        }
        
        console.log(`\n📝 Total de códigos únicos no SQL: ${[...new Set(codigos)].length}`);
        console.log(`📝 Total de linhas INSERT no SQL: ${codigos.length}`);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

verificar();
