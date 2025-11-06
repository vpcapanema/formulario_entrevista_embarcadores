// =====================================================
// SERVIDOR API REST - SISTEMA PLI 2050
// =====================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// CONFIGURAÇÃO DO POOL DE CONEXÕES POSTGRESQL
// =====================================================

const pool = new Pool({
    host: process.env.PGHOST || 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'sigma_pli',
    user: process.env.PGUSER || 'sigma_admin',
    password: process.env.PGPASSWORD || 'Malditas131533*',
    ssl: { rejectUnauthorized: false }
});
app.use(express.json());

// =====================================================
// CORS - permitir origens de desenvolvimento e produção via ENV
// =====================================================
const defaultAllowed = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultAllowed.join(',')).split(',').map(s => s.trim()).filter(Boolean);

app.use((req, res, next) => {
    // OPTIONS preflight handling
    const origin = req.headers.origin;
    if (!origin) return next();
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// Registrar módulos de rota (cada arquivo em routes/)
try {
    const listsRouter = require('./routes/lists')(pool);
    const entrevistadoresRouter = require('./routes/entrevistadores')(pool);
    const cnpjRouter = require('./routes/cnpj')(pool);
    const empresasRouter = require('./routes/empresas')(pool);
    const entrevistadosRouter = require('./routes/entrevistados')(pool);
    const pesquisasRouter = require('./routes/pesquisas')(pool);
    const submitRouter = require('./routes/submit')(pool);
    const analyticsRouter = require('./routes/analytics')(pool);
    const respostasRouter = require('./routes/respostas')(pool);
    const devRouter = require('./routes/dev')(pool);
    const logsRouter = require('./routes/logs')(pool);
    const healthRouter = require('./routes/health')(pool);

    app.use('/api', listsRouter);
    app.use('/api', entrevistadoresRouter);
    app.use('/api', cnpjRouter);
    app.use('/api', empresasRouter);
    app.use('/api', entrevistadosRouter);
    app.use('/api', pesquisasRouter);
    app.use('/api', submitRouter);
    app.use('/api', analyticsRouter);
    app.use('/api', respostasRouter);
    app.use('/api', devRouter);
    app.use('/api', logsRouter);
    app.use('/', healthRouter);
} catch (err) {
    console.error('Erro ao registrar rotas modulares:', err);
}

// =====================================================
// ROTA DE HEALTH CHECK
// =====================================================

app.get('/health', async (req, res) => {
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

// =====================================================
// TRATAMENTO DE ERROS 404
// =====================================================

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {
    console.log('═'.repeat(60));
    console.log('🚀 API REST - Sistema PLI 2050');
    console.log('═'.repeat(60));
    console.log(`📡 Servidor rodando na porta: ${PORT}`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`📊 Database: ${process.env.PGDATABASE}`);
    try {
        console.log(`🔒 CORS habilitado para: ${allowedOrigins.join(', ')}`);
    } catch (e) {
        console.log(`🔒 CORS habilitado para: ${process.env.ALLOWED_ORIGINS || 'nenhum (usar ALLOWED_ORIGINS)'}`);
    }
    console.log('═'.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM recebido, encerrando servidor...');
    await pool.end();
    process.exit(0);
});
