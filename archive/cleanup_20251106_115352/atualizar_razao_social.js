// =====================================================
// ATUALIZAR INSTITUIÇÃO COM RAZÃO SOCIAL DA RECEITA
// =====================================================

const { Pool } = require('pg');
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

async function atualizarInstituicao() {
    const client = await pool.connect();
    
    try {
        console.log('🏢 ATUALIZANDO INSTITUIÇÃO COM DADOS DA RECEITA FEDERAL');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('📋 Dados da Receita Federal:');
        console.log('   CNPJ: 59.073.921/0001-27');
        console.log('   Razão Social: CONSORCIO CONCREMAT - TRANSPLAN');
        console.log('   Tipo: MATRIZ');
        console.log('   Situação: ATIVA');
        console.log('   Atividade: Serviços de engenharia');
        console.log('   Natureza Jurídica: Consórcio de Sociedades\n');
        
        // Atualizar instituição
        console.log('🔄 Atualizando banco de dados...');
        await client.query(`
            UPDATE formulario_embarcadores.instituicoes 
            SET nome_instituicao = 'CONSORCIO CONCREMAT - TRANSPLAN',
                tipo_instituicao = 'consorcio'
            WHERE cnpj = '59.073.921/0001-27'
        `);
        
        console.log('✅ Atualização concluída!\n');
        
        // Verificar resultado
        const result = await client.query(`
            SELECT id_instituicao, nome_instituicao, tipo_instituicao, cnpj 
            FROM formulario_embarcadores.instituicoes 
            ORDER BY id_instituicao
        `);
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📋 INSTITUIÇÃO ATUALIZADA');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        result.rows.forEach((inst) => {
            console.log(`   ID: ${inst.id_instituicao}`);
            console.log(`   Razão Social: ${inst.nome_instituicao}`);
            console.log(`   Tipo: ${inst.tipo_instituicao}`);
            console.log(`   CNPJ: ${inst.cnpj}`);
        });
        
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('✅ Instituição atualizada com dados oficiais da Receita!');
        console.log('═══════════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar instituição:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

atualizarInstituicao().catch(console.error);
