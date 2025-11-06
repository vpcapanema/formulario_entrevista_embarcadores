/*
 * Gera payload_db_full.json a partir de um arquivo JSON contendo colunas por tabela
 * Entrada esperada: payload_columns.json no root do repositório com estrutura:
 * { "table1": [{"column":"col1","data_type":"text"}, ...], "table2": [...] }
 * Saída: payload_db_full.json com duas chaves: "by_table" (objeto por tabela) e "flat" (objeto com chaves table_column)
 * Uso: node .\scripts\generate_payload_from_columns.js
 */

const fs = require('fs');
const path = require('path');

function sampleValue(columnName, dataType) {
  const name = columnName.toLowerCase();
  if (name.includes('cnpj')) return '12345678000199';
  if (name.includes('cep')) return '13000000';
  if (name.includes('telefone') || name.includes('fone')) return '(11) 4000-0000';
  if (name.includes('email')) return 'contato@exemplo.com';
  if (name.includes('data') || dataType === 'date') return '2025-11-05';
  if (dataType && dataType.includes('timestamp')) return new Date().toISOString();
  if (dataType && (dataType.includes('int') || dataType === 'integer' || dataType === 'bigint')) return 0;
  if (dataType && (dataType === 'numeric' || dataType === 'double precision' || dataType === 'real' || dataType === 'decimal')) return 0.0;
  if (dataType === 'boolean') return false;
  if (dataType === 'json' || dataType === 'jsonb') return {};
  // default string
  return `SAMPLE_${columnName.toUpperCase()}`;
}

(async function main(){
  try {
    const root = path.join(__dirname, '..');
    const columnsPath = path.join(root, 'payload_columns.json');
    if (!fs.existsSync(columnsPath)) {
      console.error('Arquivo payload_columns.json não encontrado na raiz. Rode a query no banco e salve o JSON com esse nome.');
      process.exit(1);
    }

  const raw = fs.readFileSync(columnsPath, 'utf8');
  let tables = JSON.parse(raw);
  // compatibilidade: alguns clientes retornam { success: true, tables: { ... } }
  if (tables && tables.success && tables.tables) tables = tables.tables;

    const by_table = {};
    const flat = {};

    const skipPatterns = [/^id_/, /_id$/, /created_at/, /updated_at/, /^id$/, /senha/, /password/, /token/];

    for (const [table, cols] of Object.entries(tables)) {
      by_table[table] = {};
      for (const c of cols) {
        const col = c.column || c.column_name || c.name;
        const dt = (c.data_type || c.dataType || c.type || '').toLowerCase();

        let skip = false;
        for (const p of skipPatterns) if (p.test(col)) { skip = true; break; }
        if (skip) continue;

        const val = sampleValue(col, dt);
        by_table[table][col] = val;
        const flatKey = `${table}_${col}`;
        // if collision, append index
        let key = flatKey;
        let i = 1;
        while (Object.prototype.hasOwnProperty.call(flat, key)) {
          key = `${flatKey}_${i}`;
          i++;
        }
        flat[key] = val;
      }
    }

    const out = { by_table, flat };
    const outPath = path.join(root, 'payload_db_full.json');
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
    console.log('Gerado:', outPath);
  } catch (e) {
    console.error('Erro:', e.message);
    process.exit(1);
  }
})();
