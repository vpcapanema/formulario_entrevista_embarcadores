const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // GET /api/respostas-consolidadas
    router.get('/respostas-consolidadas', async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT * FROM formulario_embarcadores.v_pesquisas_completa
                ORDER BY data_entrevista DESC
            `);
            res.json({ 
                success: true, 
                data: result.rows,
                total: result.rowCount
            });
        } catch (error) {
            console.error('Erro ao buscar respostas consolidadas:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erro ao buscar respostas consolidadas',
                details: error.message 
            });
        }
    });

    return router;
};
