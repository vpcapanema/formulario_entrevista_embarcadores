const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // GET /api/pesquisas
    router.get('/pesquisas', async (req, res) => {
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
    router.get('/pesquisas/:id', async (req, res) => {
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
    router.post('/pesquisas', async (req, res) => {
        const client = await pool.connect();
        // Normalizar e logar o recebimento (evita dumps grandes)
        let received = req.body || {};
        try {
            const produtosCount = Array.isArray(received.produtos_transportados) ? received.produtos_transportados.length : 0;
            console.info(`📥 /api/pesquisas - id_empresa=${received.id_empresa || 'N/A'} id_entrevistado=${received.id_entrevistado || 'N/A'} produtos=${produtosCount}`);
        } catch (e) {
            console.info('📥 /api/pesquisas - payload recebido (erro ao resumir)');
        }
        
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
            } = received;
            
            // Inserir pesquisa (montar SQL/args separadamente para debug)
            const insertSql = `
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
                    $1, $2, $3, $4, $5, $6, $7, $8,
                    $9, $10, $11, $12, $13, $14, $15, $16,
                    $17, $18, $19, $20, $21, $22, $23, $24,
                    $25, $26, $27, $28, $29, $30, $31, $32,
                    $33, $34, $35, $36, $37, $38, $39, $40,
                    $41, $42, $43, $44, $45, $46, $47, $48
                ) RETURNING id_pesquisa
            `;

            const insertArgs = [
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
            ];

            // Inserção da pesquisa (execução com validação silenciosa de tamanho de args)
            let pesquisaResult;
            try {
                const placeholders = (insertSql.match(/\$\d+/g) || []).length;
                const execArgs = insertArgs.length > placeholders ? insertArgs.slice(0, placeholders) : insertArgs;
                if (insertArgs.length > placeholders) {
                    console.warn('⚠️ Ajustando número de argumentos para INSERT de pesquisa (truncando extras)');
                }
                pesquisaResult = await client.query(insertSql, execArgs);
            } catch (qerr) {
                console.error('❌ Falha ao executar INSERT de pesquisa:', qerr.message);
                throw qerr;
            }

            const pesquisaRow = (pesquisaResult && pesquisaResult.rows && pesquisaResult.rows[0]) ? pesquisaResult.rows[0] : null;
            const id_pesquisa = pesquisaRow ? pesquisaRow.id_pesquisa : null;
            
            // Se o payload contiver produtos_transportados, inserir em lote atrelando id_pesquisa e id_empresa
            if (produtos_transportados && Array.isArray(produtos_transportados) && produtos_transportados.length > 0) {
                if (!id_pesquisa) {
                    throw new Error('id_pesquisa não foi retornado pelo INSERT de pesquisa; abortando inserção de produtos');
                }

                console.info(`📦 Inserindo ${produtos_transportados.length} produtos para pesquisa ${id_pesquisa} (empresa ${id_empresa})`);

                const insertProdutoSql = `
                    INSERT INTO formulario_embarcadores.produtos_transportados
                        (id_pesquisa, id_empresa, carga, movimentacao, origem, destino, distancia, modalidade, acondicionamento, ordem)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                `;

                for (let i = 0; i < produtos_transportados.length; i++) {
                    const p = produtos_transportados[i] || {};
                    const carga = p.produto || p.carga || p.nome || null;
                    const movRaw = p.movimentacao_anual || p.movimentacao || p.mov || p.quantidade || null;
                    const movimentacao = movRaw == null ? null : (isNaN(Number(String(movRaw).replace(/,/g, '.'))) ? null : Number(String(movRaw).replace(/,/g, '.')));
                    const origem = p.origem || null;
                    const destino = p.destino || null;
                    const distancia = p.distancia == null ? null : (isNaN(Number(String(p.distancia).replace(/,/g, '.'))) ? null : Number(String(p.distancia).replace(/,/g, '.')));
                    const modalidade = p.modalidade || p.modal || null;
                    const acondicionamento = p.acondicionamento || p.embalagem || null;
                    const ordem = p.ordem || (i + 1);

                    const params = [id_pesquisa, id_empresa, carga, movimentacao, origem, destino, distancia, modalidade, acondicionamento, ordem];
                    await client.query(insertProdutoSql, params);
                }
                console.info(`✅ Produtos inseridos: ${produtos_transportados.length} para pesquisa ${id_pesquisa} (empresa ${id_empresa})`);
            }
            
            await client.query('COMMIT');
            
            res.status(201).json({ 
                success: true, 
                id_pesquisa,
                message: 'Pesquisa salva com sucesso!' 
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Erro ao salvar pesquisa:', error && error.message);
            try {
                const received = req.body || {};
                const keys = Object.keys(received).length;
                const produtosCount = Array.isArray(received.produtos_transportados) ? received.produtos_transportados.length : 0;
                console.error(`❗ Payload resumo: keys=${keys}, produtos_transportados=${produtosCount}`);
            } catch (e) {
                console.error('❗ Falha ao resumir payload do erro');
            }
            res.status(500).json({ error: 'Erro ao salvar pesquisa' });
        } finally {
            client.release();
        }
    });

    return router;
};
