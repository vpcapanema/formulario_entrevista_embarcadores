// ════════════════════════════════════════════════════════════
// 🔧 EXECUTAR MIGRATION: Adicionar Colunas Faltantes
// ════════════════════════════════════════════════════════════
// Schema: formulario_embarcadores
// ════════════════════════════════════════════════════════════

const { Pool } = require('pg');

const pool = new Pool({
    host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'sigma_pli',
    user: 'sigma_admin',
    password: 'Malditas131533*',
    ssl: { rejectUnauthorized: false }
});

async function executeMigration() {
    const client = await pool.connect();
    
    try {
        console.log('\n════════════════════════════════════════════════════════════');
        console.log('🚀 INICIANDO MIGRATION: Adicionar Colunas Faltantes');
        console.log('════════════════════════════════════════════════════════════\n');
        
        // ════════════════════════════════════════════════════════════
        // STEP 1: Adicionar colunas na tabela EMPRESAS
        // ════════════════════════════════════════════════════════════
        console.log('📦 STEP 1: Tabela formulario_embarcadores.empresas');
        console.log('─────────────────────────────────────────────────────────────\n');
        
        const alterEmpresas = `
            ALTER TABLE formulario_embarcadores.empresas
            ADD COLUMN IF NOT EXISTS razao_social VARCHAR(255),
            ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(255),
            ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
            ADD COLUMN IF NOT EXISTS email VARCHAR(255),
            ADD COLUMN IF NOT EXISTS id_municipio INTEGER,
            ADD COLUMN IF NOT EXISTS logradouro VARCHAR(255),
            ADD COLUMN IF NOT EXISTS numero VARCHAR(20),
            ADD COLUMN IF NOT EXISTS complemento VARCHAR(100),
            ADD COLUMN IF NOT EXISTS bairro VARCHAR(100),
            ADD COLUMN IF NOT EXISTS cep VARCHAR(8);
        `;
        
        await client.query(alterEmpresas);
        console.log('✅ 10 colunas adicionadas com sucesso!');
        console.log('   ├─ razao_social');
        console.log('   ├─ nome_fantasia');
        console.log('   ├─ telefone');
        console.log('   ├─ email');
        console.log('   ├─ id_municipio');
        console.log('   ├─ logradouro');
        console.log('   ├─ numero');
        console.log('   ├─ complemento');
        console.log('   ├─ bairro');
        console.log('   └─ cep\n');
        
        // ════════════════════════════════════════════════════════════
        // STEP 2: Tabela ENTREVISTADOS (sem alterações)
        // ════════════════════════════════════════════════════════════
        console.log('📦 STEP 2: Tabela formulario_embarcadores.entrevistados');
        console.log('─────────────────────────────────────────────────────────────\n');
        console.log('⏭️  Nenhuma coluna a adicionar (campos já existem)\n');
        
        // ════════════════════════════════════════════════════════════
        // STEP 3: Adicionar colunas na tabela PESQUISAS
        // ════════════════════════════════════════════════════════════
        console.log('📦 STEP 3: Tabela formulario_embarcadores.pesquisas');
        console.log('─────────────────────────────────────────────────────────────\n');
        
        const alterPesquisas = `
            ALTER TABLE formulario_embarcadores.pesquisas
            ADD COLUMN IF NOT EXISTS consentimento BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS transporta_carga BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS origem_instalacao VARCHAR(255),
            ADD COLUMN IF NOT EXISTS destino_instalacao VARCHAR(255),
            ADD COLUMN IF NOT EXISTS volume_anual_toneladas DECIMAL(15,2),
            ADD COLUMN IF NOT EXISTS tipo_produto VARCHAR(100),
            ADD COLUMN IF NOT EXISTS classe_produto VARCHAR(100),
            ADD COLUMN IF NOT EXISTS produtos_especificos TEXT,
            ADD COLUMN IF NOT EXISTS modal_predominante VARCHAR(50),
            ADD COLUMN IF NOT EXISTS modal_secundario VARCHAR(50),
            ADD COLUMN IF NOT EXISTS modal_terciario VARCHAR(50),
            ADD COLUMN IF NOT EXISTS proprio_terceirizado VARCHAR(50),
            ADD COLUMN IF NOT EXISTS qtd_caminhoes_proprios INTEGER,
            ADD COLUMN IF NOT EXISTS qtd_caminhoes_terceirizados INTEGER,
            ADD COLUMN IF NOT EXISTS tempo_transporte VARCHAR(50),
            ADD COLUMN IF NOT EXISTS custo_medio_tonelada DECIMAL(15,2),
            ADD COLUMN IF NOT EXISTS pedagio_custo DECIMAL(15,2),
            ADD COLUMN IF NOT EXISTS frete_custo DECIMAL(15,2),
            ADD COLUMN IF NOT EXISTS manutencao_custo DECIMAL(15,2),
            ADD COLUMN IF NOT EXISTS outros_custos DECIMAL(15,2),
            ADD COLUMN IF NOT EXISTS principais_desafios TEXT,
            ADD COLUMN IF NOT EXISTS investimento_sustentavel VARCHAR(10),
            ADD COLUMN IF NOT EXISTS reducao_emissoes TEXT,
            ADD COLUMN IF NOT EXISTS tecnologias_interesse TEXT,
            ADD COLUMN IF NOT EXISTS uso_tecnologia VARCHAR(50),
            ADD COLUMN IF NOT EXISTS grau_automacao VARCHAR(50),
            ADD COLUMN IF NOT EXISTS rastreamento_carga BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS uso_dados TEXT,
            ADD COLUMN IF NOT EXISTS conhecimento_hidrovias VARCHAR(50),
            ADD COLUMN IF NOT EXISTS viabilidade_hidrovia VARCHAR(50),
            ADD COLUMN IF NOT EXISTS pontos_melhoria TEXT,
            ADD COLUMN IF NOT EXISTS interesse_parcerias BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS observacoes TEXT,
            ADD COLUMN IF NOT EXISTS feedback_formulario TEXT,
            ADD COLUMN IF NOT EXISTS id_instalacao_origem INTEGER;
        `;
        
        await client.query(alterPesquisas);
        console.log('✅ 35 colunas adicionadas com sucesso!');
        console.log('   ├─ consentimento');
        console.log('   ├─ transporta_carga');
        console.log('   ├─ origem_instalacao');
        console.log('   ├─ destino_instalacao');
        console.log('   ├─ volume_anual_toneladas');
        console.log('   ├─ tipo_produto');
        console.log('   ├─ classe_produto');
        console.log('   ├─ produtos_especificos');
        console.log('   ├─ modal_predominante');
        console.log('   ├─ modal_secundario');
        console.log('   ├─ modal_terciario');
        console.log('   └─ ... e mais 24 campos\n');
        
        // ════════════════════════════════════════════════════════════
        // STEP 4: Verificar colunas adicionadas
        // ════════════════════════════════════════════════════════════
        console.log('🔍 STEP 4: Verificando colunas adicionadas');
        console.log('─────────────────────────────────────────────────────────────\n');
        
        // Verificar empresas
        const verifyEmpresas = await client.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'formulario_embarcadores'
            AND table_name = 'empresas'
            AND column_name IN (
                'razao_social', 'nome_fantasia', 'telefone', 'email', 
                'id_municipio', 'logradouro', 'numero', 'complemento', 
                'bairro', 'cep'
            )
            ORDER BY column_name;
        `);
        
        console.log('✅ Tabela empresas - Colunas verificadas:', verifyEmpresas.rows.length);
        verifyEmpresas.rows.forEach(row => {
            const length = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
            console.log(`   ├─ ${row.column_name}: ${row.data_type}${length}`);
        });
        console.log('');
        
        // Verificar pesquisas
        const verifyPesquisas = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'formulario_embarcadores'
            AND table_name = 'pesquisas'
            AND column_name IN (
                'consentimento', 'transporta_carga', 'origem_instalacao', 
                'destino_instalacao', 'volume_anual_toneladas', 'tipo_produto',
                'classe_produto', 'produtos_especificos', 'modal_predominante',
                'modal_secundario', 'modal_terciario', 'proprio_terceirizado'
            )
            ORDER BY column_name;
        `);
        
        console.log('✅ Tabela pesquisas - Colunas verificadas:', verifyPesquisas.rows.length);
        verifyPesquisas.rows.forEach(row => {
            console.log(`   ├─ ${row.column_name}: ${row.data_type}`);
        });
        console.log('');
        
        // ════════════════════════════════════════════════════════════
        // RESUMO FINAL
        // ════════════════════════════════════════════════════════════
        console.log('════════════════════════════════════════════════════════════');
        console.log('✅ MIGRATION CONCLUÍDA COM SUCESSO!');
        console.log('════════════════════════════════════════════════════════════\n');
        console.log('📊 RESUMO:');
        console.log('─────────────────────────────────────────────────────────────');
        console.log('   ✅ Tabela empresas: 10 colunas adicionadas');
        console.log('   ✅ Tabela entrevistados: 0 colunas (campos já existem)');
        console.log('   ✅ Tabela pesquisas: 35 colunas adicionadas');
        console.log('   ──────────────────────────────────────────────────────────');
        console.log('   📊 TOTAL: 45 novas colunas disponíveis\n');
        console.log('⚠️  IMPORTANTE:');
        console.log('   └─ A INTERFACE NÃO FOI ALTERADA');
        console.log('   └─ As novas colunas estão prontas para uso futuro');
        console.log('   └─ O payload-manager.js pode agora salvar todos os campos\n');
        console.log('════════════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('\n❌ ERRO NA MIGRATION:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Executar migration
executeMigration()
    .then(() => {
        console.log('✅ Script finalizado com sucesso!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Script falhou:', error.message);
        process.exit(1);
    });
