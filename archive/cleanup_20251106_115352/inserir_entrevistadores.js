/**
 * Script para inserir entrevistadores no banco de dados
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

async function inserirEntrevistadores() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Buscando ID da instituição CONSORCIO CONCREMAT - TRANSPLAN...\n');
        
        // Buscar ID da instituição
        const resultInstituicao = await client.query(`
            SELECT id_instituicao, nome_instituicao 
            FROM formulario_embarcadores.instituicoes 
            WHERE nome_instituicao ILIKE '%CONCREMAT%TRANSPLAN%'
            LIMIT 1;
        `);
        
        if (resultInstituicao.rows.length === 0) {
            console.error('❌ Instituição CONSORCIO CONCREMAT - TRANSPLAN não encontrada!');
            console.log('💡 Verificando instituições disponíveis...\n');
            
            const todasInst = await client.query(`
                SELECT id_instituicao, nome_instituicao 
                FROM formulario_embarcadores.instituicoes;
            `);
            
            console.log('📋 Instituições cadastradas:');
            todasInst.rows.forEach(inst => {
                console.log(`   ${inst.id_instituicao}: ${inst.nome_instituicao}`);
            });
            
            process.exit(1);
        }
        
        const idInstituicao = resultInstituicao.rows[0].id_instituicao;
        const nomeInstituicao = resultInstituicao.rows[0].nome_instituicao;
        
        console.log(`✅ Instituição encontrada:`);
        console.log(`   ID: ${idInstituicao}`);
        console.log(`   Nome: ${nomeInstituicao}\n`);
        
        // Dados dos entrevistadores (nomes em UPPERCASE conforme padrão)
        const entrevistadores = [
            {
                nome: 'SILVIO MASSARU ICHIHARA',
                email: 'silvio.ichihara@concremat.com.br'
            },
            {
                nome: 'RAQUEL CHAVES COSTA LIMA',
                email: 'raquel.lima@concremat.com.br'
            }
        ];
        
        console.log('📝 Inserindo entrevistadores...\n');
        
        for (const entrev of entrevistadores) {
            // Verificar se já existe
            const verificar = await client.query(`
                SELECT id_entrevistador, nome_completo 
                FROM formulario_embarcadores.entrevistadores 
                WHERE nome_completo = $1;
            `, [entrev.nome]);
            
            if (verificar.rows.length > 0) {
                console.log(`⚠️  ${entrev.nome}`);
                console.log(`   Já cadastrado com ID: ${verificar.rows[0].id_entrevistador}`);
                console.log('');
                continue;
            }
            
            // Inserir entrevistador
            const resultado = await client.query(`
                INSERT INTO formulario_embarcadores.entrevistadores 
                    (nome_completo, email, id_instituicao)
                VALUES 
                    ($1, $2, $3)
                RETURNING id_entrevistador, nome_completo, email;
            `, [entrev.nome, entrev.email, idInstituicao]);
            
            const inserted = resultado.rows[0];
            console.log(`✅ ${inserted.nome_completo}`);
            console.log(`   ID: ${inserted.id_entrevistador}`);
            console.log(`   Email: ${inserted.email}`);
            console.log(`   Instituição: ${nomeInstituicao}`);
            console.log('');
        }
        
        // Listar todos os entrevistadores
        console.log('═══════════════════════════════════════════════');
        console.log('📊 TODOS OS ENTREVISTADORES CADASTRADOS:');
        console.log('═══════════════════════════════════════════════\n');
        
        const todos = await client.query(`
            SELECT 
                e.id_entrevistador,
                e.nome_completo,
                e.email,
                i.nome_instituicao
            FROM formulario_embarcadores.entrevistadores e
            LEFT JOIN formulario_embarcadores.instituicoes i 
                ON e.id_instituicao = i.id_instituicao
            ORDER BY e.id_entrevistador;
        `);
        
        todos.rows.forEach(e => {
            console.log(`ID ${e.id_entrevistador}: ${e.nome_completo}`);
            console.log(`   Email: ${e.email}`);
            console.log(`   Instituição: ${e.nome_instituicao || 'Sem instituição'}`);
            console.log('');
        });
        
        console.log('═══════════════════════════════════════════════');
        console.log(`✅ Total de entrevistadores: ${todos.rows.length}`);
        console.log('═══════════════════════════════════════════════');
        
    } catch (error) {
        console.error('❌ Erro ao inserir entrevistadores:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Executar
inserirEntrevistadores()
    .then(() => {
        console.log('\n🎉 Script finalizado com sucesso!');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n💥 Erro fatal:', err);
        process.exit(1);
    });
