/*
 * Gera um payload JSON com todas as colunas das tabelas no schema formulario_embarcadores
 * - Exclui colunas que parecem 'ocultas' (chaves primárias id_*, timestamps created_at/updated_at, senhas)
 * - Tenta obter conexão do env (PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT)
 * - Se não encontrar, tenta ler 'credencias_bd.txt' para extrair connection string (somente para uso local)
 * - Gera arquivo '../payload_db_full.json'
 *
 * Uso:
 *   node .\scripts\generate_payload_from_db.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function parseCredFile(filePath) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    const m = txt.match(/postgresql:\/\/([^\s\n]+)/);
    if (m) return m[0];
  } catch (e) {
    return null;
  }
  return null;
}

function sampleValue(columnName, dataType) {
  const name = columnName.toLowerCase();
  if (name.includes('cnpj')) return '12345678000199';
  if (name.includes('cep')) return '13000000';
  if (name.includes('telefone') || name.includes('telefone') || name.includes('fone')) return '(11) 4000-0000';
  if (dataType.includes('int')) return 0;
  if (dataType === 'numeric' || dataType === 'double precision' || dataType === 'real' || dataType === 'decimal') return 0.0;
  if (dataType === 'boolean') return false;
  if (dataType === 'date') return '2025-11-05';
  if (dataType.includes('timestamp')) return new Date().toISOString();
  if (dataType === 'json' || dataType === 'jsonb') return {};
  // default string
  return 'SAMPLE_' + columnName;
}

(async function main(){
  const env = process.env;
  let config = {};

  if (env.PGHOST && env.PGUSER && env.PGDATABASE) {
    config = {
      host: env.PGHOST,
      port: env.PGPORT || 5432,
      database: env.PGDATABASE,
      user: env.PGUSER,
      password: env.PGPASSWORD
    };
  } else {
    // tentar ler credencias_bd.txt
    const credPath = path.join(__dirname, '..', 'credencias_bd.txt');
    if (fs.existsSync(credPath)) {
      const connStr = parseCredFile(credPath);
      if (connStr) {
        // connStr = postgresql://user:pass@host:port/db
        try {
          const url = new URL(connStr);
          config = {
            host: url.hostname,
            port: url.port || 5432,
            database: url.pathname ? url.pathname.replace(/^\//, '') : undefined,
            user: url.username,
            password: url.password
          };
        } catch (e) {
          console.error('Erro ao parsear connection string:', e.message);
          process.exit(1);
        }
      }
    }
  }

  if (!config.host || !config.database) {
    console.error('Configuração de BD não encontrada. Exporte PGHOST/PGUSER/PGPASSWORD/PGDATABASE ou coloque credencias_bd.txt.');
    process.exit(1);
  }

  const client = new Client(config);
  await client.connect();

  // Buscar colunas
  const q = `
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'formulario_embarcadores'
    ORDER BY table_name, ordinal_position
  `;

  const res = await client.query(q);

  const tables = {};
  for (const row of res.rows) {
    const t = row.table_name;
    const col = row.column_name;
    const dt = row.data_type;

    // excluir colunas ocultas / automáticas
    const skipPatterns = [
      /^id_/, /_id$/, /_at$/, /created_at/, /updated_at/, /^id$/, /senha/, /password/, /token/
    ];
    let skip = false;
    for (const p of skipPatterns) {
      if (typeof p === 'string') {
        if (col === p) skip = true;
      } else if (p instanceof RegExp) {
        if (p.test(col)) { skip = true; break; }
      }
    }
    if (skip) continue;

    if (!tables[t]) tables[t] = {};
    tables[t][col] = sampleValue(col, dt.toLowerCase());
  }

  await client.end();

  const outPath = path.join(__dirname, '..', 'payload_db_full.json');
  fs.writeFileSync(outPath, JSON.stringify(tables, null, 2), 'utf8');
  console.log('Arquivo gerado:', outPath);
})();
