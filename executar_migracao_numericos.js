// =====================================================
// EXECUTAR MIGRAÇÃO: CAMPOS NUMÉRICOS
// =====================================================

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

async function executarMigracao() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 INICIANDO MIGRAÇÃO DE CAMPOS NUMÉRICOS');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Ler arquivo SQL
        const sqlPath = path.join(__dirname, 'migrar_campos_numericos.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📄 Executando migração SQL...\n');
        
        // Executar migração
        await client.query(sql);
        
        console.log('✅ Migração executada com sucesso!\n');
        
        // Verificar resultado
        console.log('📊 VERIFICANDO ESTRUTURA ATUALIZADA');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        const result = await client.query(`
            SELECT 
                column_name,
                data_type,
                numeric_precision,
                numeric_scale,
                is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'formulario_embarcadores'
              AND table_name = 'pesquisas'
              AND column_name IN ('capacidade_utilizada', 'num_paradas', 'frequencia_diaria', 
                                  'distancia', 'peso_carga', 'custo_transporte', 'valor_carga',
                                  'variacao_custo', 'variacao_tempo', 'variacao_confiabilidade',
                                  'variacao_seguranca', 'variacao_capacidade')
            ORDER BY column_name
        `);
        
        console.log('Campos Numéricos na Tabela pesquisas:');
        console.log('─────────────────────────────────────────────────────────────');
        result.rows.forEach(col => {
            const tipo = col.data_type === 'numeric' 
                ? `NUMERIC(${col.numeric_precision}, ${col.numeric_scale})`
                : col.data_type.toUpperCase();
            const nullable = col.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)';
            console.log(`${col.column_name.padEnd(30)} | ${tipo.padEnd(20)} | ${nullable}`);
        });
        
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('📋 PRÓXIMOS PASSOS:');
        console.log('1. Frontend agora envia valores numéricos (parseFloat/parseInt)');
        console.log('2. Backend deve validar tipos antes de INSERT');
        console.log('3. Queries de análise podem usar AVG(), SUM(), PERCENTILE()');
        console.log('4. Dashboard pode calcular KPIs automaticamente\n');
        
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        console.error('\n💡 Dica: Verifique se a tabela pesquisas existe e está vazia.');
        console.error('   Se houver dados, a migração converterá faixas para médias.\n');
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

executarMigracao().catch(console.error);
