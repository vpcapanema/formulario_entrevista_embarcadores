const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Este script lê o arquivo de migration SQL ordenado e executa cada statement
// sequencialmente via driver pg. Útil quando o cliente `psql` não está disponível
// no ambiente local. NÃO executa o script dentro de uma transação (necessário
// para CREATE INDEX CONCURRENTLY).

const MIGRATION_FILE = path.join(__dirname, '..', 'migrations', '20251106_apply_constraints_ordered.sql');

async function main() {
    // Configuração de conexão - mantém a mesma usada em outros scripts do backend
    const pool = new Pool({
        host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
        port: 5432,
        database: 'sigma_pli',
        user: 'sigma_admin',
        password: 'Malditas131533*',
        ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    try {
        console.log('\n▶ Iniciando execução do migration ordenado:', MIGRATION_FILE);

        const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');

        // Dividir o script em statements usando análise por linhas: acumulamos até encontrar
        // uma linha que termina com ';' (terminador de statement). Isso evita problemas com
        // quebras de linha e mantém a ordem exata dos comandos.
        const lines = sql.split(/\r?\n/);
        // DEBUG: listar primeiras linhas para inspeção (até 40)
        console.log('\n--- Preview das primeiras linhas do arquivo SQL ---');
        lines.slice(0, 40).forEach((L, idx) => {
            const t = L.replace(/\t/g, '    ');
            const trimmed = t.trim();
            console.log(`${String(idx+1).padStart(3)}: ${trimmed.slice(0,200)} ${trimmed.endsWith(';') ? '[;]' : ''}`);
        });
        console.log('--- Fim preview ---\n');
        const parts = [];
        let acc = [];
        for (let rawLine of lines) {
            const line = rawLine.trim();
            // Ignorar linhas de comentário puro
            if (line.startsWith('--') && acc.length === 0) continue;
            acc.push(rawLine);
            if (line.endsWith(';')) {
                const stmt = acc.join('\n').trim();
                // Remover o ponto-e-vírgula final antes de enviar
                parts.push(stmt.replace(/;\s*$/, ''));
                acc = [];
            }
        }

        // Se sobrou algo sem terminador ';', adicionamos também (arquivo pode terminar sem ;)
        if (acc.length > 0) {
            parts.push(acc.join('\n').trim());
        }

        // Filtrar statements vazios e puro comentário
        const filtered = parts.map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`⚙️  Encontrados ${filtered.length} blocos SQL (comentários ignorados).`);

        // Depuração: listar os primeiros 200 caracteres de cada statement
        filtered.forEach((s, idx) => {
            const snippet = s.replace(/\s+/g, ' ').slice(0, 200);
            console.log(`   [${idx+1}] ${snippet}${s.length > 200 ? '...' : ''}`);
        });

        for (let i = 0; i < filtered.length; i++) {
            const stmt = filtered[i];
            console.log(`\n--- Executando statement ${i+1}/${filtered.length} ---`);
            // Mostrar a primeira linha do statement para contexto
            const firstLine = stmt.split(/\r?\n/)[0];
            console.log(firstLine.length > 200 ? firstLine.slice(0,200) + '...' : firstLine);

            try {
                const res = await client.query(stmt);
                // Alguns comandos (CREATE INDEX CONCURRENTLY) retornam null rowCount
                console.log(`   ⇒ OK (rowCount=${res && res.rowCount !== undefined ? res.rowCount : 'n/a'})`);
            } catch (err) {
                console.error(`   ❌ ERRO no statement ${i+1}:`, err.message);
                // Encerrar com erro para evitar executar comandos subsequentes automaticamente
                throw err;
            }
        }

        console.log('\n✅ Migration ordenado executado com sucesso.');

    } catch (err) {
        console.error('\n❌ Falha ao executar migration ordenado:', err.message);
        process.exitCode = 2;
    } finally {
        client.release();
        await pool.end();
    }
}

main();
