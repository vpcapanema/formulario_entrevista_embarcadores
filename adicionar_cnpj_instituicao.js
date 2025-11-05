// =====================================================
// ADICIONAR CAMPO CNPJ NA TABELA INSTITUIÇÕES
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

async function adicionarCNPJ() {
    const client = await pool.connect();
    
    try {
        console.log('🏢 ADICIONANDO CAMPO CNPJ NA TABELA INSTITUIÇÕES');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Verificar se a coluna já existe
        const checkColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'formulario_embarcadores' 
            AND table_name = 'instituicoes' 
            AND column_name = 'cnpj'
        `);
        
        if (checkColumn.rows.length > 0) {
            console.log('⚠️  Coluna CNPJ já existe na tabela instituições');
            console.log('🔄 Pulando criação da coluna...\n');
        } else {
            // Adicionar coluna CNPJ
            console.log('➕ Adicionando coluna CNPJ...');
            await client.query(`
                ALTER TABLE formulario_embarcadores.instituicoes 
                ADD COLUMN cnpj VARCHAR(18)
            `);
            
            await client.query(`
                COMMENT ON COLUMN formulario_embarcadores.instituicoes.cnpj 
                IS 'CNPJ da instituição no formato XX.XXX.XXX/XXXX-XX'
            `);
            
            console.log('✅ Coluna CNPJ adicionada com sucesso!\n');
        }
        
        // Atualizar instituições existentes
        console.log('🔄 Atualizando CNPJs das instituições existentes...\n');
        
        await client.query(`
            UPDATE formulario_embarcadores.instituicoes 
            SET cnpj = '00.000.000/0001-91' 
            WHERE nome_instituicao = 'Concremat' AND cnpj IS NULL
        `);
        
        await client.query(`
            UPDATE formulario_embarcadores.instituicoes 
            SET cnpj = '00.394.460/0058-87' 
            WHERE nome_instituicao = 'PLI 2050 - SEMIL' AND cnpj IS NULL
        `);
        
        // Verificar resultado
        const result = await client.query(`
            SELECT id_instituicao, nome_instituicao, tipo_instituicao, cnpj 
            FROM formulario_embarcadores.instituicoes 
            ORDER BY nome_instituicao
        `);
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📋 INSTITUIÇÕES CADASTRADAS');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        result.rows.forEach((inst, i) => {
            console.log(`${String(i + 1).padStart(2, '0')}. ${inst.nome_instituicao.padEnd(30)} | ${(inst.tipo_instituicao || 'N/A').padEnd(15)} | CNPJ: ${inst.cnpj || 'Não informado'}`);
        });
        
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('✅ Campo CNPJ adicionado com sucesso!');
        console.log('═══════════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('❌ Erro ao adicionar campo CNPJ:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

adicionarCNPJ().catch(console.error);
