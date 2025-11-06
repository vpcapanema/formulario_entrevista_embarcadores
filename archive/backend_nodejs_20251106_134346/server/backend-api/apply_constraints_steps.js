const { Pool } = require('pg');

const pool = new Pool({
    host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'sigma_pli',
    user: 'sigma_admin',
    password: 'Malditas131533*',
    ssl: { rejectUnauthorized: false }
});

const steps = [
    {
        name: 'Criar índice único em empresas.cnpj_digits',
        sql: `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_empresas_cnpj_digits
            ON formulario_embarcadores.empresas (cnpj_digits);`
    },
    {
        name: 'Remover duplicados em entrevistados (mantém menor id_entrevistado)',
        sql: `WITH duplicates AS (
            SELECT id_entrevistado FROM (
                SELECT id_entrevistado,
                       ROW_NUMBER() OVER (PARTITION BY id_empresa, lower(email) ORDER BY id_entrevistado) as rn
                FROM formulario_embarcadores.entrevistados
                WHERE email IS NOT NULL AND trim(email) <> ''
            ) t WHERE rn > 1
        )
        DELETE FROM formulario_embarcadores.entrevistados
        WHERE id_entrevistado IN (SELECT id_entrevistado FROM duplicates);`
    },
    {
        name: 'Criar índice único em entrevistados (id_empresa, lower(email))',
        sql: `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_entrevistados_empresa_email
            ON formulario_embarcadores.entrevistados (id_empresa, (lower(email)));`
    },
    {
        name: 'Criar índice único em entrevistadores (lower(email))',
        sql: `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_entrevistadores_email_lower
            ON formulario_embarcadores.entrevistadores ((lower(email)));`
    },
    {
        name: 'Set NOT NULL em produtos_transportados.id_pesquisa e id_empresa',
        sql: `ALTER TABLE formulario_embarcadores.produtos_transportados
            ALTER COLUMN id_pesquisa SET NOT NULL,
            ALTER COLUMN id_empresa SET NOT NULL;`
    }
];

async function run() {
    const client = await pool.connect();
    try {
        console.log('\n▶ Iniciando aplicação de constraints/índices ordenados');
        for (let i = 0; i < steps.length; i++) {
            const s = steps[i];
            console.log(`\n--- (${i+1}/${steps.length}) ${s.name}`);
            try {
                const res = await client.query(s.sql);
                console.log('   ⇒ OK', res && res.rowCount !== undefined ? `(rowCount=${res.rowCount})` : '');
            } catch (err) {
                console.error('   ❌ ERRO:', err.message);
                // For CREATE INDEX CONCURRENTLY, some DBs may require permissions; continue or halt?
                throw err;
            }
        }
        console.log('\n✅ Todas as steps de constraints aplicadas com sucesso.');
    } catch (err) {
        console.error('\n❌ Falha ao aplicar constraints:', err.message);
        process.exitCode = 3;
    } finally {
        client.release();
        await pool.end();
    }
}

run();
