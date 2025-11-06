require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false }
});

async function testView() {
    try {
        console.log('🔍 Consultando dados_brasil.vw_dim_municipio_alias...\n');
        
        const result = await pool.query('SELECT * FROM dados_brasil.vw_dim_municipio_alias LIMIT 5');
        
        if (result.rows.length > 0) {
            console.log('📋 Colunas:', Object.keys(result.rows[0]).join(', '));
            console.log('\n📊 Amostra de 5 registros:\n');
            result.rows.forEach((row, i) => {
                console.log(`\nMunicipio ${i+1}:`);
                Object.entries(row).forEach(([key, value]) => {
                    console.log(`  ${key}: ${value}`);
                });
            });
        }
        
        // Contar UFs distintas
        const ufCount = await pool.query('SELECT COUNT(DISTINCT uf) as total FROM dados_brasil.vw_dim_municipio_alias');
        console.log('\n📍 Total de UFs:', ufCount.rows[0].total);
        
        // Contar municipios
        const munCount = await pool.query('SELECT COUNT(*) as total FROM dados_brasil.vw_dim_municipio_alias');
        console.log('🏙️ Total de municipios:', munCount.rows[0].total);
        
        // Exemplos de SP
        console.log('\n🔍 Amostra de municipios de SP:');
        const spMun = await pool.query("SELECT * FROM dados_brasil.vw_dim_municipio_alias WHERE uf = 'SP' LIMIT 3");
        spMun.rows.forEach((row, i) => {
            console.log(`  ${i+1}. ${row.municipio} (UF: ${row.uf})`);
        });
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await pool.end();
    }
}

testView();
