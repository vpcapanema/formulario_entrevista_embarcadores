const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // GET /api/instituicoes
    router.get('/instituicoes', async (req, res) => {
        console.log('🏢 Buscando instituições no banco...');
        try {
            const result = await pool.query(
                'SELECT * FROM formulario_embarcadores.instituicoes ORDER BY nome_instituicao'
            );
            console.log(`✅ ${result.rows.length} instituições encontradas`);
            res.json(result.rows);
        } catch (error) {
            console.error('❌ Erro ao buscar instituições:', error.message);
            console.error('Stack:', error.stack);
            res.status(500).json({ error: 'Erro ao buscar instituições' });
        }
    });

    // GET /api/estados
    router.get('/estados', async (req, res) => {
        console.log('🗺️  Buscando estados da view dados_brasil.vw_dim_municipio_alias...');
        try {
            const result = await pool.query(`
                SELECT DISTINCT 
                    "Código da Unidade Federativa" as codigo_uf,
                    "Nome da Unidade Federativa" as nome_uf
                FROM dados_brasil.vw_dim_municipio_alias
                ORDER BY "Nome da Unidade Federativa"
            `);
            console.log(`✅ ${result.rows.length} estados encontrados`);
            res.json(result.rows);
        } catch (error) {
            console.error('❌ Erro ao buscar estados:', error.message);
            console.error('Stack:', error.stack);
            res.status(500).json({ error: 'Erro ao buscar estados' });
        }
    });

    // GET /api/paises
    router.get('/paises', async (req, res) => {
        console.log('🌍 Buscando países no banco...');
        try {
            const result = await pool.query(
                'SELECT * FROM formulario_embarcadores.paises ORDER BY relevancia DESC, nome_pais'
            );
            console.log(`✅ ${result.rows.length} países encontrados`);
            res.json(result.rows);
        } catch (error) {
            console.error('❌ Erro ao buscar países:', error.message);
            console.error('Stack:', error.stack);
            res.status(500).json({ error: 'Erro ao buscar países' });
        }
    });

    // GET /api/municipios
    router.get('/municipios', async (req, res) => {
        console.log('🏙️  Buscando municípios da view dados_brasil.vw_dim_municipio_alias...');
        try {
            const result = await pool.query(`
                SELECT 
                    "Código da Unidade Federativa" as codigo_uf,
                    "Código do Município" as codigo_municipio,
                    "Nome do Município" as nome_municipio,
                    "Nome da Unidade Federativa" as nome_uf
                FROM dados_brasil.vw_dim_municipio_alias
                ORDER BY "Nome do Município"
            `);
            console.log(`✅ ${result.rows.length} municípios encontrados`);
            res.json(result.rows);
        } catch (error) {
            console.error('❌ Erro ao buscar municípios:', error.message);
            console.error('Stack:', error.stack);
            res.status(500).json({ error: 'Erro ao buscar municípios' });
        }
    });

    // GET /api/funcoes
    router.get('/funcoes', async (req, res) => {
        console.log('👔 Buscando funções no banco...');
        try {
            const result = await pool.query(
                'SELECT * FROM formulario_embarcadores.funcoes_entrevistado ORDER BY nome_funcao'
            );
            console.log(`✅ ${result.rows.length} funções encontradas`);
            res.json(result.rows);
        } catch (error) {
            console.error('❌ Erro ao buscar funções:', error.message);
            console.error('Stack:', error.stack);
            res.status(500).json({ error: 'Erro ao buscar funções' });
        }
    });

    return router;
};
