const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // GET /api/_dev/columns
    router.get('/_dev/columns', async (req, res) => {
        try {
            const q = `
                SELECT table_name, column_name, data_type
                FROM information_schema.columns
                WHERE table_schema = 'formulario_embarcadores'
                ORDER BY table_name, ordinal_position
            `;
            const result = await pool.query(q);

            const tables = {};
            for (const r of result.rows) {
                if (!tables[r.table_name]) tables[r.table_name] = [];
                tables[r.table_name].push({ column: r.column_name, data_type: r.data_type });
            }

            res.json({ success: true, tables });
        } catch (error) {
            console.error('Erro ao listar colunas (dev):', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};
