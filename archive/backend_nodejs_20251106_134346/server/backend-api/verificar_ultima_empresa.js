const { Pool } = require('pg');

const pool = new Pool({
    host: 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'sigma_pli',
    user: 'postgres',
    password: 'Castor030509'
});

async function verificarUltimaEmpresa() {
    try {
        console.log('\n════════════════════════════════════════════════════════════');
        console.log('🔍 VERIFICANDO ÚLTIMA EMPRESA INSERIDA NO BANCO');
        console.log('════════════════════════════════════════════════════════════\n');

        // Buscar última empresa
        const empresaResult = await pool.query(`
            SELECT 
                id_empresa,
                nome_empresa,
                tipo_empresa,
                razao_social,
                nome_fantasia,
                telefone,
                email,
                municipio,
                estado,
                cnpj,
                id_municipio,
                logradouro,
                numero,
                complemento,
                bairro,
                cep,
                data_cadastro
            FROM formulario_embarcadores.empresas
            ORDER BY id_empresa DESC
            LIMIT 1
        `);

        if (empresaResult.rows.length === 0) {
            console.log('❌ Nenhuma empresa encontrada no banco!\n');
            return;
        }

        const empresa = empresaResult.rows[0];

        console.log('✅ EMPRESA MAIS RECENTE:');
        console.log('─────────────────────────────────────────────────────────────\n');
        
        console.log('📋 DADOS BÁSICOS:');
        console.log(`   ├─ ID: ${empresa.id_empresa}`);
        console.log(`   ├─ Nome: ${empresa.nome_empresa}`);
        console.log(`   ├─ Tipo: ${empresa.tipo_empresa}`);
        console.log(`   ├─ CNPJ: ${empresa.cnpj}`);
        console.log(`   └─ Data Cadastro: ${empresa.data_cadastro}\n`);

        console.log('🏢 DADOS DA API CNPJ (Q6b):');
        console.log(`   ├─ Razão Social: ${empresa.razao_social || '(vazio)'}`);
        console.log(`   ├─ Nome Fantasia: ${empresa.nome_fantasia || '(vazio)'}`);
        console.log(`   ├─ Telefone: ${empresa.telefone || '(vazio)'}`);
        console.log(`   └─ Email: ${empresa.email || '(vazio)'}\n`);

        console.log('📍 LOCALIZAÇÃO (Q7):');
        console.log(`   ├─ Município: ${empresa.municipio}`);
        console.log(`   ├─ Estado: ${empresa.estado}`);
        console.log(`   └─ ID Município (IBGE): ${empresa.id_municipio || '(vazio)'}\n`);

        console.log('🏠 ENDEREÇO COMPLETO (Q10-Q11):');
        console.log(`   ├─ Logradouro: ${empresa.logradouro || '(vazio)'}`);
        console.log(`   ├─ Número: ${empresa.numero || '(vazio)'}`);
        console.log(`   ├─ Complemento: ${empresa.complemento || '(vazio)'}`);
        console.log(`   ├─ Bairro: ${empresa.bairro || '(vazio)'}`);
        console.log(`   └─ CEP: ${empresa.cep || '(vazio)'}\n`);

        // Buscar entrevistado relacionado
        const entrevistadoResult = await pool.query(`
            SELECT *
            FROM formulario_embarcadores.entrevistados
            WHERE id_empresa = $1
            ORDER BY id_entrevistado DESC
            LIMIT 1
        `, [empresa.id_empresa]);

        if (entrevistadoResult.rows.length > 0) {
            const entrevistado = entrevistadoResult.rows[0];
            
            console.log('👤 ENTREVISTADO RELACIONADO:');
            console.log('─────────────────────────────────────────────────────────────\n');
            console.log(`   ├─ ID: ${entrevistado.id_entrevistado}`);
            console.log(`   ├─ Nome: ${entrevistado.nome}`);
            console.log(`   ├─ Função: ${entrevistado.funcao}`);
            console.log(`   ├─ Telefone: ${entrevistado.telefone}`);
            console.log(`   ├─ Email: ${entrevistado.email}`);
            console.log(`   └─ Principal: ${entrevistado.principal}\n`);
        }

        // Buscar pesquisa relacionada
        const pesquisaResult = await pool.query(`
            SELECT *
            FROM formulario_embarcadores.pesquisas
            WHERE id_empresa = $1
            ORDER BY id_pesquisa DESC
            LIMIT 1
        `, [empresa.id_empresa]);

        if (pesquisaResult.rows.length > 0) {
            const pesquisa = pesquisaResult.rows[0];
            
            console.log('📋 PESQUISA RELACIONADA:');
            console.log('─────────────────────────────────────────────────────────────\n');
            console.log(`   ├─ ID: ${pesquisa.id_pesquisa}`);
            console.log(`   ├─ Produto Principal: ${pesquisa.produto_principal}`);
            console.log(`   ├─ Agrupamento: ${pesquisa.agrupamento_produto}`);
            console.log(`   ├─ Tipo Transporte: ${pesquisa.tipo_transporte}`);
            console.log(`   ├─ Origem: ${pesquisa.origem_municipio}/${pesquisa.origem_estado}`);
            console.log(`   ├─ Destino: ${pesquisa.destino_municipio}/${pesquisa.destino_estado}`);
            console.log(`   ├─ Distância: ${pesquisa.distancia} km`);
            console.log(`   ├─ Peso Carga: ${pesquisa.peso_carga} ${pesquisa.unidade_peso}`);
            console.log(`   └─ Status: ${pesquisa.status}\n`);
        }

        console.log('════════════════════════════════════════════════════════════');
        console.log('✅ VERIFICAÇÃO CONCLUÍDA!');
        console.log('════════════════════════════════════════════════════════════\n');

        // Validar campos da API CNPJ
        const camposAPIPreenchidos = [
            empresa.razao_social,
            empresa.nome_fantasia,
            empresa.telefone,
            empresa.email,
            empresa.id_municipio,
            empresa.logradouro,
            empresa.numero,
            empresa.bairro,
            empresa.cep
        ].filter(campo => campo !== null && campo !== undefined && campo !== '').length;

        console.log('📊 ESTATÍSTICAS:');
        console.log('─────────────────────────────────────────────────────────────\n');
        console.log(`   ├─ Campos da API CNPJ preenchidos: ${camposAPIPreenchidos}/9`);
        console.log(`   ├─ Empresa tem entrevistado: ${entrevistadoResult.rows.length > 0 ? 'Sim' : 'Não'}`);
        console.log(`   └─ Empresa tem pesquisa: ${pesquisaResult.rows.length > 0 ? 'Sim' : 'Não'}\n`);

        if (camposAPIPreenchidos === 9) {
            console.log('✅ TODOS OS CAMPOS DA API CNPJ FORAM PREENCHIDOS!\n');
        } else {
            console.log(`⚠️ Apenas ${camposAPIPreenchidos} de 9 campos da API foram preenchidos\n`);
        }

    } catch (err) {
        console.error('❌ Erro ao verificar dados:', err.message);
        console.error('\n📋 Detalhes:', err);
    } finally {
        await pool.end();
    }
}

verificarUltimaEmpresa();
