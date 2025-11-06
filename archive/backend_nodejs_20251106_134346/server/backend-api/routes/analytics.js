const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // GET /api/analytics/kpis
    router.get('/analytics/kpis', async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT * FROM formulario_embarcadores.v_kpis_gerais
            `);
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar KPIs:', error);
            res.status(500).json({ error: 'Erro ao buscar KPIs' });
        }
    });

    // GET /api/analytics/distribuicao-modal
    router.get('/analytics/distribuicao-modal', async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT * FROM formulario_embarcadores.v_distribuicao_modal
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar distribuição modal:', error);
            res.status(500).json({ error: 'Erro ao buscar distribuição modal' });
        }
    });

    // GET /api/analytics/produtos-ranking
    router.get('/analytics/produtos-ranking', async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT * FROM formulario_embarcadores.v_produtos_ranking
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar ranking de produtos:', error);
            res.status(500).json({ error: 'Erro ao buscar ranking de produtos' });
        }
    });

    return router;
};
