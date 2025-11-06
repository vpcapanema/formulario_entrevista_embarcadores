// =====================================================
// RESETAR TABELA INSTITUIÇÕES
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

async function resetarInstituicoes() {
    const client = await pool.connect();
    
    try {
        console.log('🗑️  RESETANDO TABELA INSTITUIÇÕES');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Remover todos os registros
        console.log('🗑️  Removendo todos os registros atuais...');
        await client.query(`
            DELETE FROM formulario_embarcadores.instituicoes
        `);
        console.log('✅ Registros removidos!\n');
        
        // Resetar o sequence do ID
        await client.query(`
            ALTER SEQUENCE formulario_embarcadores.instituicoes_id_instituicao_seq RESTART WITH 1
        `);
        
        // Inserir nova instituição
        console.log('➕ Inserindo nova instituição...');
        const result = await client.query(`
            INSERT INTO formulario_embarcadores.instituicoes (nome_instituicao, tipo_instituicao, cnpj) 
            VALUES ('Instituição Principal', 'empresa', '59.073.921/0001-27')
            RETURNING *
        `);
        
        console.log('✅ Instituição inserida com sucesso!\n');
        
        // Verificar resultado
        const verify = await client.query(`
            SELECT id_instituicao, nome_instituicao, tipo_instituicao, cnpj 
            FROM formulario_embarcadores.instituicoes 
            ORDER BY id_instituicao
        `);
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📋 INSTITUIÇÕES CADASTRADAS');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        verify.rows.forEach((inst, i) => {
            console.log(`${String(i + 1).padStart(2, '0')}. ID: ${inst.id_instituicao} | ${inst.nome_instituicao.padEnd(30)} | ${(inst.tipo_instituicao || 'N/A').padEnd(15)} | CNPJ: ${inst.cnpj || 'Não informado'}`);
        });
        
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('✅ Tabela resetada com sucesso!');
        console.log(`✅ Total de instituições: ${verify.rows.length}`);
        console.log('═══════════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('❌ Erro ao resetar instituições:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

resetarInstituicoes().catch(console.error);
