const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // GET /api/empresas
    router.get('/empresas', async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT * FROM formulario_embarcadores.empresas 
                ORDER BY nome_empresa
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
            res.status(500).json({ error: 'Erro ao buscar empresas' });
        }
    });

    // GET /api/empresas/:id
    router.get('/empresas/:id', async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT * FROM formulario_embarcadores.empresas 
                WHERE id_empresa = $1
            `, [req.params.id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Empresa não encontrada' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar empresa:', error);
            res.status(500).json({ error: 'Erro ao buscar empresa' });
        }
    });

    // POST /api/empresas
    router.post('/empresas', async (req, res) => {
        const { 
            nome_empresa, tipo_empresa, outro_tipo, municipio, estado, cnpj,
            razao_social, nome_fantasia, telefone, email, id_municipio,
            logradouro, numero, complemento, bairro, cep
        } = req.body;
        
        try {
            const result = await pool.query(`
                INSERT INTO formulario_embarcadores.empresas 
                (
                    nome_empresa, tipo_empresa, outro_tipo, municipio, estado, cnpj,
                    razao_social, nome_fantasia, telefone, email, id_municipio,
                    logradouro, numero, complemento, bairro, cep
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING *
            `, [
                nome_empresa, tipo_empresa, outro_tipo, municipio, estado, cnpj,
                razao_social, nome_fantasia, telefone, email, id_municipio,
                logradouro, numero, complemento, bairro, cep
            ]);
            
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao criar empresa:', error);
            res.status(500).json({ error: 'Erro ao criar empresa' });
        }
    });

    return router;
};
