const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // GET /api/empresas/:id_empresa/entrevistados
    router.get('/empresas/:id_empresa/entrevistados', async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT * FROM formulario_embarcadores.entrevistados 
                WHERE id_empresa = $1
                ORDER BY principal DESC, nome
            `, [req.params.id_empresa]);
            
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar entrevistados:', error);
            res.status(500).json({ error: 'Erro ao buscar entrevistados' });
        }
    });

    // POST /api/entrevistados
    router.post('/entrevistados', async (req, res) => {
        const { id_empresa, nome, funcao, telefone, email, principal } = req.body;
        
        try {
            const result = await pool.query(`
                INSERT INTO formulario_embarcadores.entrevistados 
                (id_empresa, nome, funcao, telefone, email, principal)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `, [id_empresa, nome, funcao, telefone, email, principal]);
            
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao criar entrevistado:', error);
            res.status(500).json({ error: 'Erro ao criar entrevistado' });
        }
    });

    return router;
};
