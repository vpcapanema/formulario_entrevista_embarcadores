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
        // Listar schemas disponíveis
        console.log('� Listando schemas...\n');
        const schemas = await pool.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE '%brasil%' OR schema_name LIKE '%dados%' ORDER BY schema_name");
        console.log('Schemas encontrados:', schemas.rows.map(r => r.schema_name).join(', '));
        
        // Listar views que contêm 'municipio'
        console.log('\n� Listando views com "municipio"...\n');
        const views = await pool.query("SELECT table_schema, table_name FROM information_schema.views WHERE table_name LIKE '%municipio%' ORDER BY table_schema, table_name");
        views.rows.forEach(v => {
            console.log(`  ${v.table_schema}.${v.table_name}`);
        });
        
        if (views.rows.length > 0) {
            const firstView = `${views.rows[0].table_schema}.${views.rows[0].table_name}`;
            console.log(`\n🔍 Consultando ${firstView}...\n`);
            
            const result = await pool.query(`SELECT * FROM ${firstView} LIMIT 3`);
            
            if (result.rows.length > 0) {
                console.log('� Colunas:', Object.keys(result.rows[0]).join(', '));
                console.log('\n📊 Amostra:\n');
                result.rows.forEach((row, i) => {
                    console.log(`Registro ${i+1}:`, JSON.stringify(row, null, 2));
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await pool.end();
    }
}

testView();
