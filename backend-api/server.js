// =====================================================
// SERVIDOR API REST - SISTEMA PLI 2050
// =====================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// CONFIGURAÇÃO DO POOL DE CONEXÕES POSTGRESQL
// =====================================================

const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20, // Máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Testar conexão ao iniciar
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Erro ao conectar ao PostgreSQL:', err);
    } else {
        console.log('✅ PostgreSQL conectado:', res.rows[0].now);
    }
});

// =====================================================
// MIDDLEWARES
// =====================================================

// Segurança
app.use(helmet());

// CORS - Permitir GitHub Pages e localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sem origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Origem não permitida pelo CORS'));
        }
    },
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // Limite de 100 requests por IP
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================================================
// ROTAS - LISTAS AUXILIARES
// =====================================================

// GET /api/instituicoes
app.get('/api/instituicoes', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM formulario_embarcadores.instituicoes ORDER BY nome_instituicao'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar instituições:', error);
        res.status(500).json({ error: 'Erro ao buscar instituições' });
    }
});

// GET /api/estados
app.get('/api/estados', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM formulario_embarcadores.estados_brasil ORDER BY nome_estado'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar estados:', error);
        res.status(500).json({ error: 'Erro ao buscar estados' });
    }
});

// GET /api/paises
app.get('/api/paises', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM formulario_embarcadores.paises ORDER BY relevancia DESC, nome_pais'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar países:', error);
        res.status(500).json({ error: 'Erro ao buscar países' });
    }
});

// GET /api/municipios
app.get('/api/municipios', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM formulario_embarcadores.municipios_sp ORDER BY nome_municipio'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar municípios:', error);
        res.status(500).json({ error: 'Erro ao buscar municípios' });
    }
});

// GET /api/funcoes
app.get('/api/funcoes', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM formulario_embarcadores.funcoes_entrevistado ORDER BY nome_funcao'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar funções:', error);
        res.status(500).json({ error: 'Erro ao buscar funções' });
    }
});

// =====================================================
// ROTAS - ENTREVISTADORES
// =====================================================

// GET /api/entrevistadores
app.get('/api/entrevistadores', async (req, res) => {
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
app.post('/api/entrevistadores', async (req, res) => {
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

// =====================================================
// ROTAS - CNPJ (RECEITA FEDERAL)
// =====================================================

// GET /api/cnpj/:cnpj
app.get('/api/cnpj/:cnpj', async (req, res) => {
    const { cnpj } = req.params;
    
    // Remove formatação do CNPJ (mantém apenas números)
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
        return res.status(400).json({ error: 'CNPJ deve ter 14 dígitos' });
    }
    
    try {
        // Fazer requisição para a API da Receita Federal
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
        
        if (!response.ok) {
            throw new Error('Erro na consulta à Receita Federal');
        }
        
        const dados = await response.json();
        
        if (dados.status === 'ERROR') {
            return res.status(404).json({ 
                error: dados.message || 'CNPJ não encontrado' 
            });
        }
        
        // Retornar dados formatados
        res.json({
            cnpj: dados.cnpj,
            razaoSocial: dados.nome,
            nomeFantasia: dados.fantasia,
            situacao: dados.situacao,
            tipo: dados.tipo,
            porte: dados.porte,
            naturezaJuridica: dados.natureza_juridica,
            atividadePrincipal: dados.atividade_principal?.[0] || null,
            endereco: {
                logradouro: dados.logradouro,
                numero: dados.numero,
                complemento: dados.complemento,
                bairro: dados.bairro,
                municipio: dados.municipio,
                uf: dados.uf,
                cep: dados.cep
            },
            email: dados.email,
            telefone: dados.telefone,
            abertura: dados.abertura,
            dataSituacao: dados.data_situacao
        });
        
    } catch (error) {
        console.error('Erro ao consultar CNPJ:', error);
        res.status(500).json({ 
            error: 'Erro ao consultar CNPJ na Receita Federal',
            message: error.message 
        });
    }
});

// =====================================================
// ROTAS - EMPRESAS
// =====================================================

// GET /api/empresas
app.get('/api/empresas', async (req, res) => {
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
app.get('/api/empresas/:id', async (req, res) => {
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
app.post('/api/empresas', async (req, res) => {
    const { nome_empresa, tipo_empresa, outro_tipo, municipio, estado, cnpj } = req.body;
    
    try {
        const result = await pool.query(`
            INSERT INTO formulario_embarcadores.empresas 
            (nome_empresa, tipo_empresa, outro_tipo, municipio, estado, cnpj)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [nome_empresa, tipo_empresa, outro_tipo, municipio, estado, cnpj]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar empresa:', error);
        res.status(500).json({ error: 'Erro ao criar empresa' });
    }
});

// =====================================================
// ROTAS - ENTREVISTADOS
// =====================================================

// GET /api/empresas/:id_empresa/entrevistados
app.get('/api/empresas/:id_empresa/entrevistados', async (req, res) => {
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
app.post('/api/entrevistados', async (req, res) => {
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

// =====================================================
// ROTAS - PESQUISAS
// =====================================================

// GET /api/pesquisas
app.get('/api/pesquisas', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM formulario_embarcadores.v_pesquisas_completa 
            ORDER BY data_entrevista DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar pesquisas:', error);
        res.status(500).json({ error: 'Erro ao buscar pesquisas' });
    }
});

// GET /api/pesquisas/:id
app.get('/api/pesquisas/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM formulario_embarcadores.v_pesquisas_completa 
            WHERE id_pesquisa = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pesquisa não encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar pesquisa:', error);
        res.status(500).json({ error: 'Erro ao buscar pesquisa' });
    }
});

// POST /api/pesquisas
app.post('/api/pesquisas', async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const {
            id_empresa,
            id_entrevistado,
            tipo_responsavel,
            id_responsavel,
            produto_principal,
            agrupamento_produto,
            outro_produto,
            tipo_transporte,
            origem_pais,
            origem_estado,
            origem_municipio,
            destino_pais,
            destino_estado,
            destino_municipio,
            distancia,
            tem_paradas,
            num_paradas,
            modos,
            config_veiculo,
            capacidade_utilizada,
            peso_carga,
            unidade_peso,
            custo_transporte,
            valor_carga,
            tipo_embalagem,
            carga_perigosa,
            tempo_dias,
            tempo_horas,
            tempo_minutos,
            frequencia,
            frequencia_diaria,
            frequencia_outra,
            importancia_custo,
            variacao_custo,
            importancia_tempo,
            variacao_tempo,
            importancia_confiabilidade,
            variacao_confiabilidade,
            importancia_seguranca,
            variacao_seguranca,
            importancia_capacidade,
            variacao_capacidade,
            tipo_cadeia,
            modais_alternativos,
            fator_adicional,
            dificuldades,
            detalhe_dificuldade,
            observacoes,
            produtos_transportados
        } = req.body;
        
        // Inserir pesquisa
        const pesquisaResult = await client.query(`
            INSERT INTO formulario_embarcadores.pesquisas (
                id_empresa, id_entrevistado, tipo_responsavel, id_responsavel,
                produto_principal, agrupamento_produto, outro_produto, tipo_transporte,
                origem_pais, origem_estado, origem_municipio,
                destino_pais, destino_estado, destino_municipio,
                distancia, tem_paradas, num_paradas, modos, config_veiculo,
                capacidade_utilizada, peso_carga, unidade_peso, custo_transporte,
                valor_carga, tipo_embalagem, carga_perigosa,
                tempo_dias, tempo_horas, tempo_minutos,
                frequencia, frequencia_diaria, frequencia_outra,
                importancia_custo, variacao_custo,
                importancia_tempo, variacao_tempo,
                importancia_confiabilidade, variacao_confiabilidade,
                importancia_seguranca, variacao_seguranca,
                importancia_capacidade, variacao_capacidade,
                tipo_cadeia, modais_alternativos, fator_adicional,
                dificuldades, detalhe_dificuldade, observacoes
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38,
                $39, $40, $41, $42, $43, $44, $45, $46, $47
            ) RETURNING id_pesquisa
        `, [
            id_empresa, id_entrevistado, tipo_responsavel, id_responsavel,
            produto_principal, agrupamento_produto, outro_produto, tipo_transporte,
            origem_pais, origem_estado, origem_municipio,
            destino_pais, destino_estado, destino_municipio,
            distancia, tem_paradas, num_paradas, modos, config_veiculo,
            capacidade_utilizada, peso_carga, unidade_peso, custo_transporte,
            valor_carga, tipo_embalagem, carga_perigosa,
            tempo_dias, tempo_horas, tempo_minutos,
            frequencia, frequencia_diaria, frequencia_outra,
            importancia_custo, variacao_custo,
            importancia_tempo, variacao_tempo,
            importancia_confiabilidade, variacao_confiabilidade,
            importancia_seguranca, variacao_seguranca,
            importancia_capacidade, variacao_capacidade,
            tipo_cadeia, modais_alternativos, fator_adicional,
            dificuldades, detalhe_dificuldade, observacoes
        ]);
        
        const id_pesquisa = pesquisaResult.rows[0].id_pesquisa;
        
        // Inserir produtos transportados (Q8)
        if (produtos_transportados && produtos_transportados.length > 0) {
            for (let i = 0; i < produtos_transportados.length; i++) {
                const produto = produtos_transportados[i];
                await client.query(`
                    INSERT INTO formulario_embarcadores.produtos_transportados
                    (id_pesquisa, id_empresa, carga, movimentacao, origem, destino, distancia, modalidade, acondicionamento, ordem)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `, [
                    id_pesquisa,
                    id_empresa,
                    produto.carga,
                    produto.movimentacao,
                    produto.origem,
                    produto.destino,
                    produto.distancia,
                    produto.modalidade,
                    produto.acondicionamento,
                    i + 1
                ]);
            }
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({ 
            success: true, 
            id_pesquisa,
            message: 'Pesquisa salva com sucesso!' 
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao salvar pesquisa:', error);
        res.status(500).json({ error: 'Erro ao salvar pesquisa' });
    } finally {
        client.release();
    }
});

// =====================================================
// ROTAS - ANALYTICS
// =====================================================

// GET /api/analytics/kpis
app.get('/api/analytics/kpis', async (req, res) => {
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
app.get('/api/analytics/distribuicao-modal', async (req, res) => {
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
app.get('/api/analytics/produtos-ranking', async (req, res) => {
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
    console.log(`🔒 CORS habilitado para: ${process.env.ALLOWED_ORIGINS}`);
    console.log('═'.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM recebido, encerrando servidor...');
    await pool.end();
    process.exit(0);
});
