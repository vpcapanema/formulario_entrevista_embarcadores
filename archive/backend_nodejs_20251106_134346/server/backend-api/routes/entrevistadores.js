const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // GET /api/entrevistadores
    router.get('/entrevistadores', async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT e.*, i.nome_instituicao, i.tipo_instituicao
                FROM formulario_embarcadores.entrevistadores e
                LEFT JOIN formulario_embarcadores.instituicoes i ON e.id_instituicao = i.id_instituicao
                ORDER BY e.nome_completo
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar entrevistadores:', error);
            res.status(500).json({ error: 'Erro ao buscar entrevistadores' });
        }
    });

    // POST /api/entrevistadores
    router.post('/entrevistadores', async (req, res) => {
        const { nome_completo, email, id_instituicao } = req.body;
        
        try {
            const result = await pool.query(`
                INSERT INTO formulario_embarcadores.entrevistadores 
                (nome_completo, email, id_instituicao)
                VALUES ($1, $2, $3)
                RETURNING *
            `, [nome_completo, email, id_instituicao]);
            
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao criar entrevistador:', error);
            res.status(500).json({ error: 'Erro ao criar entrevistador' });
        }
    });

    return router;
};
