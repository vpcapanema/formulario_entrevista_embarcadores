const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // POST /api/logs
    router.post('/logs', async (req, res) => {
        try {
            const payload = req.body || {};
            const level = payload.level || 'info';
            const type = payload.type || 'frontend-log';
            const message = payload.message || '';

            console.log(`📣 [FRONTEND LOG] type=${type} level=${level} message=${message}`);
            if (payload.detail) {
                try {
                    console.dir(payload.detail, { depth: 4 });
                } catch (err) {
                    console.log('detail:', payload.detail);
                }
            }

            res.status(201).json({ success: true });
        } catch (error) {
            console.error('Erro ao receber log do frontend:', error && error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};
