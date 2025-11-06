const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    router.get('/health', async (req, res) => {
        try {
            await pool.query('SELECT 1');
            res.json({ 
                status: 'OK', 
                timestamp: new Date(),
                database: 'Connected' 
            });
        } catch (error) {
            res.status(503).json({ 
                status: 'ERROR', 
                timestamp: new Date(),
                database: 'Disconnected',
                error: error.message 
            });
        }
    });

    return router;
};
