const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST || 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'sigma_pli',
  user: process.env.PGUSER || 'sigma_admin',
  password: process.env.PGPASSWORD || 'Malditas131533*',
  ssl: { rejectUnauthorized: false }
});

async function getColumns(table) {
  const q = `
    SELECT column_name, data_type, is_nullable, column_default, character_maximum_length, numeric_precision, numeric_scale
    FROM information_schema.columns
    WHERE table_schema = 'formulario_embarcadores' AND table_name = $1
    ORDER BY ordinal_position`;
  const r = await pool.query(q, [table]);
  return r.rows;
}

async function getPrimaryKey(table) {
  const q = `
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'formulario_embarcadores' AND tc.table_name = $1
    ORDER BY kcu.ordinal_position`;
  const r = await pool.query(q, [table]);
  return r.rows.map(r => r.column_name);
}

async function getConstraints(table) {
  const q = `
    SELECT conname, pg_get_constraintdef(c.oid) AS def
    FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname = 'formulario_embarcadores' AND cl.relname = $1
      AND c.contype IN ('c','f','u')`;
  const r = await pool.query(q, [table]);
  return r.rows; // conname, def
}

function columnDefToSql(col) {
  const name = col.column_name;
  let type = col.data_type;
  // map some information_schema types to PostgreSQL types with length/precision
  if (col.character_maximum_length) type += `(${col.character_maximum_length})`;
  else if (col.numeric_precision) {
    type += `(${col.numeric_precision}${col.numeric_scale ? ',' + col.numeric_scale : ''})`;
  }
  const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : '';
  const def = col.column_default ? `DEFAULT ${col.column_default}` : '';
  return `  ${name} ${type} ${def} ${nullable}`.replace(/\s+/g, ' ').trim();
}

async function generateDDLForTable(table) {
  const cols = await getColumns(table);
  const pk = await getPrimaryKey(table);
  const constraints = await getConstraints(table);

  const lines = [];
  lines.push(`-- DDL for table formulario_embarcadores.${table}`);
  lines.push(`CREATE TABLE formulario_embarcadores.${table} (`);
  const colLines = cols.map(columnDefToSql);
  // primary key will be added as constraint after columns
  lines.push(colLines.join(',\n'));
  if (pk && pk.length > 0) {
    lines.push(',');
    lines.push(`  PRIMARY KEY (${pk.join(', ')})`);
  }
  lines.push(');');

  if (constraints && constraints.length > 0) {
    lines.push('');
    lines.push('-- Constraints:');
    constraints.forEach(c => {
      lines.push(`-- name: ${c.conname}`);
      lines.push(`ALTER TABLE formulario_embarcadores.${table} ADD CONSTRAINT ${c.conname} ${c.def};`);
    });
  }

  lines.push('\n');
  return lines.join('\n');
}

async function main() {
  const tables = ['empresas','entrevistados','pesquisas'];
  const out = [];
  for (const t of tables) {
    out.push(await generateDDLForTable(t));
  }
  const outPath = path.join(__dirname, '..', 'test_table_ddls.txt');
  fs.writeFileSync(outPath, out.join('\n'), 'utf8');
  console.log('DDLs gerados em', outPath);
  await pool.end();
}

main().catch(e => {
  console.error('Erro ao gerar DDLs:', e);
  process.exit(1);
});
