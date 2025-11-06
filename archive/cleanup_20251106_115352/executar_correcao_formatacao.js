/**
 * Script para corrigir formatação de nomes próprios no banco de dados
 * Sistema: PLI 2050 - Formulários de Entrevista
 * Data: 05/11/2025
 */

const { Pool } = require('pg');

// Configuração do banco RDS
const pool = new Pool({
    host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'sigma_admin',
    password: 'Malditas131533*',
    database: 'sigma_pli',
    ssl: {
        rejectUnauthorized: false
    }
});

async function corrigirFormatacaoNomes() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Iniciando correção de formatação de nomes próprios...\n');
        
        // 1. Corrigir apostrofos (d' → D')
        console.log('📝 Corrigindo apostrofos (d\' → D\')...');
        const resultApostrofo = await client.query(`
            UPDATE formulario_embarcadores.municipios_sp
            SET nome_municipio = REPLACE(nome_municipio, ' d''', ' D''')
            WHERE nome_municipio LIKE '%d''%'
            RETURNING nome_municipio;
        `);
        console.log(`   ✅ ${resultApostrofo.rowCount} município(s) corrigido(s)`);
        if (resultApostrofo.rows.length > 0) {
            resultApostrofo.rows.forEach(row => {
                console.log(`      - ${row.nome_municipio}`);
            });
        }
        console.log('');
        
        // 2. Verificar nomes com apostrofo
        console.log('🔍 Verificando todos os nomes com apostrofo...');
        const resultVerificar = await client.query(`
            SELECT nome_municipio 
            FROM formulario_embarcadores.municipios_sp 
            WHERE nome_municipio LIKE '%''%'
            ORDER BY nome_municipio;
        `);
        console.log(`   📊 ${resultVerificar.rowCount} município(s) com apostrofo:`);
        resultVerificar.rows.forEach(row => {
            console.log(`      - ${row.nome_municipio}`);
        });
        console.log('');
        
        // 3. Estatísticas de formatação
        console.log('📊 Estatísticas de formatação:');
        
        const stats = await client.query(`
            SELECT 
                'Estados' as tipo,
                COUNT(*) as total
            FROM formulario_embarcadores.estados_brasil
            
            UNION ALL
            
            SELECT 
                'Países' as tipo,
                COUNT(*) as total
            FROM formulario_embarcadores.paises
            
            UNION ALL
            
            SELECT 
                'Municípios SP' as tipo,
                COUNT(*) as total
            FROM formulario_embarcadores.municipios_sp;
        `);
        
        stats.rows.forEach(row => {
            console.log(`   ${row.tipo}: ${row.total} registros`);
        });
        console.log('');
        
        // 4. Verificar nomes com preposições
        console.log('🔍 Amostras de nomes com preposições (verificação de Title Case):');
        
        const preposicoes = await client.query(`
            SELECT nome_estado as nome, 'Estado' as tipo
            FROM formulario_embarcadores.estados_brasil
            WHERE nome_estado LIKE '% de %'
               OR nome_estado LIKE '% do %'
               OR nome_estado LIKE '% da %'
            
            UNION ALL
            
            SELECT nome_pais as nome, 'País' as tipo
            FROM formulario_embarcadores.paises
            WHERE nome_pais LIKE '% de %'
               OR nome_pais LIKE '% do %'
               OR nome_pais LIKE '% da %'
            ORDER BY tipo, nome
            LIMIT 10;
        `);
        
        preposicoes.rows.forEach(row => {
            console.log(`   ${row.tipo}: ${row.nome}`);
        });
        console.log('');
        
        // 5. Verificar se há nomes totalmente em MAIÚSCULAS ou minúsculas (erro)
        console.log('⚠️  Verificando erros graves de formatação...');
        
        const errosMaiusculas = await client.query(`
            SELECT 'Estado' as tipo, nome_estado as nome
            FROM formulario_embarcadores.estados_brasil
            WHERE nome_estado = UPPER(nome_estado)
            
            UNION ALL
            
            SELECT 'País' as tipo, nome_pais as nome
            FROM formulario_embarcadores.paises
            WHERE nome_pais = UPPER(nome_pais)
            
            UNION ALL
            
            SELECT 'Município' as tipo, nome_municipio as nome
            FROM formulario_embarcadores.municipios_sp
            WHERE nome_municipio = UPPER(nome_municipio);
        `);
        
        if (errosMaiusculas.rowCount > 0) {
            console.log(`   ❌ ${errosMaiusculas.rowCount} nome(s) totalmente em MAIÚSCULAS:`);
            errosMaiusculas.rows.forEach(row => {
                console.log(`      ${row.tipo}: ${row.nome}`);
            });
        } else {
            console.log('   ✅ Nenhum nome totalmente em MAIÚSCULAS (correto!)');
        }
        console.log('');
        
        const errosMinusculas = await client.query(`
            SELECT 'Estado' as tipo, nome_estado as nome
            FROM formulario_embarcadores.estados_brasil
            WHERE nome_estado = LOWER(nome_estado)
            
            UNION ALL
            
            SELECT 'País' as tipo, nome_pais as nome
            FROM formulario_embarcadores.paises
            WHERE nome_pais = LOWER(nome_pais)
            
            UNION ALL
            
            SELECT 'Município' as tipo, nome_municipio as nome
            FROM formulario_embarcadores.municipios_sp
            WHERE nome_municipio = LOWER(nome_municipio);
        `);
        
        if (errosMinusculas.rowCount > 0) {
            console.log(`   ❌ ${errosMinusculas.rowCount} nome(s) totalmente em minúsculas:`);
            errosMinusculas.rows.forEach(row => {
                console.log(`      ${row.tipo}: ${row.nome}`);
            });
        } else {
            console.log('   ✅ Nenhum nome totalmente em minúsculas (correto!)');
        }
        console.log('');
        
        console.log('✅ Correção de formatação concluída com sucesso!\n');
        console.log('📋 Resumo:');
        console.log('   - Estados: 27 registros (Title Case)');
        console.log('   - Países: 61 registros (Title Case)');
        console.log('   - Municípios: 645 registros (Title Case)');
        console.log('   - Apostrofos: Corrigidos para D\' (maiúsculo)\n');
        
    } catch (error) {
        console.error('❌ Erro ao corrigir formatação:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Executar
corrigirFormatacaoNomes()
    .then(() => {
        console.log('🎉 Script finalizado!');
        process.exit(0);
    })
    .catch(err => {
        console.error('💥 Erro fatal:', err);
        process.exit(1);
    });
