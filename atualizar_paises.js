// =====================================================
// ATUALIZAR LISTA DE PAÍSES - Parceiros Comerciais Brasil
// Baseado em dados reais MDIC 2019-2024
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

async function atualizarPaises() {
    const client = await pool.connect();
    
    try {
        console.log('🌍 ATUALIZANDO LISTA DE PAÍSES');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Deletar países existentes
        console.log('🗑️  Removendo países antigos...');
        await client.query('DELETE FROM formulario_embarcadores.paises');
        
        // Inserir novos países
        console.log('➕ Inserindo países atualizados...\n');
        
        const paises = [
            // Brasil
            ['Brasil', 'BR', 100],
            
            // TOP 10 Parceiros Comerciais
            ['China', 'CN', 98],
            ['Estados Unidos', 'US', 95],
            ['Argentina', 'AR', 92],
            ['Paraguai', 'PY', 88],
            ['Holanda', 'NL', 85],
            ['Uruguai', 'UY', 82],
            ['Alemanha', 'DE', 80],
            ['Japão', 'JP', 75],
            ['Chile', 'CL', 73],
            ['Coreia do Sul', 'KR', 72],
            
            // Outros América do Sul
            ['Bolívia', 'BO', 70],
            ['México', 'MX', 70],
            ['Espanha', 'ES', 68],
            ['Canadá', 'CA', 67],
            ['Peru', 'PE', 65],
            ['Colômbia', 'CO', 63],
            
            // Europa
            ['Itália', 'IT', 72],
            ['França', 'FR', 70],
            ['Portugal', 'PT', 68],
            ['Reino Unido', 'GB', 67],
            ['Bélgica', 'BE', 63],
            ['Rússia', 'RU', 60],
            ['Suíça', 'CH', 58],
            ['Polônia', 'PL', 48],
            ['Suécia', 'SE', 48],
            
            // Ásia
            ['Índia', 'IN', 68],
            ['Singapura', 'SG', 63],
            ['Taiwan', 'TW', 62],
            ['Emirados Árabes Unidos', 'AE', 60],
            ['Tailândia', 'TH', 58],
            ['Hong Kong', 'HK', 58],
            ['Indonésia', 'ID', 55],
            ['Malásia', 'MY', 55],
            ['Vietnã', 'VN', 55],
            ['Israel', 'IL', 55],
            ['Turquia', 'TR', 55],
            ['Venezuela', 'VE', 55],
            ['Arábia Saudita', 'SA', 52],
            ['Equador', 'EC', 52],
            ['Nova Zelândia', 'NZ', 52],
            ['Costa Rica', 'CR', 52],
            ['Nigéria', 'NG', 52],
            ['Egito', 'EG', 50],
            ['Noruega', 'NO', 50],
            
            // América Central/Caribe
            ['Panamá', 'PA', 63],
            ['Cuba', 'CU', 48],
            ['República Dominicana', 'DO', 48],
            
            // África
            ['África do Sul', 'ZA', 63],
            ['Angola', 'AO', 58],
            ['Marrocos', 'MA', 48],
            
            // Oceania
            ['Austrália', 'AU', 63],
            
            // Outros América do Sul
            ['Guiana', 'GY', 45],
            ['Suriname', 'SR', 45],
            ['Guiana Francesa', 'GF', 45],
            
            // Europa adicional
            ['Irlanda', 'IE', 48],
            ['Dinamarca', 'DK', 48],
            ['Finlândia', 'FI', 48],
            ['Áustria', 'AT', 48],
            ['Ucrânia', 'UA', 48],
            
            // Genérico
            ['Outro país', 'XX', 0]
        ];
        
        for (const [nome, codigo, relevancia] of paises) {
            await client.query(
                'INSERT INTO formulario_embarcadores.paises (nome_pais, codigo_iso2, relevancia) VALUES ($1, $2, $3)',
                [nome, codigo, relevancia]
            );
        }
        
        // Verificar resultado
        const result = await client.query('SELECT COUNT(*) as total FROM formulario_embarcadores.paises');
        console.log(`✅ ${result.rows[0].total} países inseridos com sucesso!\n`);
        
        // Mostrar TOP 15
        const top15 = await client.query(`
            SELECT nome_pais, codigo_iso2, relevancia,
                CASE 
                    WHEN relevancia = 100 THEN '🇧🇷 País de origem'
                    WHEN relevancia >= 90 THEN '⭐⭐⭐ Parceiro estratégico'
                    WHEN relevancia >= 70 THEN '⭐⭐ Parceiro importante'
                    WHEN relevancia >= 50 THEN '⭐ Parceiro relevante'
                    ELSE 'Comércio menor'
                END as classificacao
            FROM formulario_embarcadores.paises 
            WHERE relevancia > 0
            ORDER BY relevancia DESC, nome_pais
            LIMIT 15
        `);
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🏆 TOP 15 PAÍSES POR RELEVÂNCIA COMERCIAL');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        top15.rows.forEach((p, i) => {
            console.log(`${String(i + 1).padStart(2, '0')}. ${p.nome_pais.padEnd(30)} (${p.codigo_iso2}) - ${String(p.relevancia).padStart(3)} - ${p.classificacao}`);
        });
        
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('✅ Atualização concluída com sucesso!');
        console.log('═══════════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar países:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

atualizarPaises().catch(console.error);
