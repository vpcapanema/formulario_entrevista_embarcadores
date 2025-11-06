const { Pool } = require('pg');

const pool = new Pool({
    host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'sigma_pli',
    user: 'sigma_admin',
    password: 'Malditas131533*',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('▶ Verificando CNPJs que geram mais de 14 dígitos após limpeza');
        const checkSql = `SELECT count(*) AS cnt FROM formulario_embarcadores.empresas
            WHERE char_length(regexp_replace(coalesce(cnpj, ''), '\\D', '', 'g')) > 14;`;
        const chk = await client.query(checkSql);
        const cnt = chk.rows[0].cnt;
        console.log(`   ➜ Registros com >14 dígitos: ${cnt}`);

        if (parseInt(cnt, 10) > 0) {
            console.log('▶ Truncando cnpj_digits para 14 caracteres (LEFT) e atualizando coluna)');
            const updateSql = `UPDATE formulario_embarcadores.empresas
                SET cnpj_digits = LEFT(regexp_replace(coalesce(cnpj, ''), '\\D', '', 'g'), 14)
                WHERE cnpj IS NOT NULL;`;
            const res = await client.query(updateSql);
            console.log(`   ✅ UPDATE executado. Linhas afetadas: ${res.rowCount}`);
        } else {
            console.log('   ✅ Nenhum registro com mais de 14 dígitos encontrado. Nada a fazer.');
        }

    } catch (err) {
        console.error('❌ Erro ao verificar/truncar cnpj_digits:', err.message);
        process.exitCode = 2;
    } finally {
        client.release();
        await pool.end();
    }
}

run();
