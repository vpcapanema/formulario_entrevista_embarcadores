// =====================================================
// SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
// Sistema PLI 2050 - Formulário de Entrevistas
// =====================================================

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração de conexão
const config = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
        rejectUnauthorized: false // Necessário para RDS
    }
};

async function criarBancoDeDados() {
    const client = new Client(config);
    
    try {
        console.log('\n🔄 Conectando ao banco de dados RDS PostgreSQL...');
        console.log(`📍 Endpoint: ${config.host}`);
        console.log(`📊 Database: ${config.database}`);
        
        await client.connect();
        console.log('✅ Conexão estabelecida com sucesso!\n');
        
        // Ler o arquivo SQL
        const sqlFilePath = path.join(__dirname, 'database_schema_completo.sql');
        console.log('📄 Lendo arquivo SQL:', sqlFilePath);
        
        const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
        console.log('✅ Arquivo SQL carregado com sucesso!\n');
        
        // Executar o script SQL
        console.log('🚀 Executando script de criação do schema e tabelas...\n');
        await client.query(sqlScript);
        console.log('✅ Schema e tabelas criados com sucesso!\n');
        
        // Verificar tabelas criadas
        console.log('🔍 Verificando tabelas criadas...\n');
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'formulario_embarcadores' 
            ORDER BY table_name;
        `);
        
        console.log('📋 Tabelas criadas no schema formulario_embarcadores:');
        console.log('═'.repeat(50));
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.table_name}`);
        });
        console.log('═'.repeat(50));
        
        // Verificar views criadas
        const viewsResult = await client.query(`
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'formulario_embarcadores' 
            ORDER BY table_name;
        `);
        
        console.log('\n📊 Views criadas no schema formulario_embarcadores:');
        console.log('═'.repeat(50));
        viewsResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.table_name}`);
        });
        console.log('═'.repeat(50));
        
        // Verificar dados iniciais
        console.log('\n📊 Verificando dados iniciais...\n');
        
        const instituicoes = await client.query('SELECT COUNT(*) FROM formulario_embarcadores.instituicoes');
        console.log(`✓ Instituições: ${instituicoes.rows[0].count} registros`);
        
        const estados = await client.query('SELECT COUNT(*) FROM formulario_embarcadores.estados_brasil');
        console.log(`✓ Estados: ${estados.rows[0].count} registros`);
        
        const paises = await client.query('SELECT COUNT(*) FROM formulario_embarcadores.paises');
        console.log(`✓ Países: ${paises.rows[0].count} registros`);
        
        const municipios = await client.query('SELECT COUNT(*) FROM formulario_embarcadores.municipios_sp');
        console.log(`✓ Municípios SP: ${municipios.rows[0].count} registros`);
        
        const funcoes = await client.query('SELECT COUNT(*) FROM formulario_embarcadores.funcoes_entrevistado');
        console.log(`✓ Funções: ${funcoes.rows[0].count} registros`);
        
        console.log('\n✨ Banco de dados criado e configurado com sucesso!');
        console.log('🎯 Sistema pronto para receber dados de entrevistas!\n');
        
    } catch (error) {
        console.error('\n❌ Erro ao criar banco de dados:');
        console.error('Mensagem:', error.message);
        console.error('Detalhes:', error.stack);
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Conexão encerrada.\n');
    }
}

// Executar
criarBancoDeDados();
