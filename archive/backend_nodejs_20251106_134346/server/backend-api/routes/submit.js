const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // POST /api/submit-form
    router.post('/submit-form', async (req, res) => {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const dados = req.body || {};
            
            // 1. INSERIR/ATUALIZAR EMPRESA (UPSERT por cnpj_digits quando possível)
            let id_empresa;
            const cnpj_digits = dados.cnpj ? ('' + dados.cnpj).replace(/\D/g, '') : null;

            if (cnpj_digits) {
                const upsertEmpresaSql = `
                    INSERT INTO formulario_embarcadores.empresas (
                        nome_empresa, tipo_empresa, cnpj, cnpj_digits, razao_social, nome_fantasia, telefone, email,
                        id_municipio, logradouro, numero, complemento, bairro, cep, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8,
                        $9, $10, $11, $12, $13, $14, NOW(), NOW()
                    )
                    ON CONFLICT (cnpj_digits) DO UPDATE SET
                        nome_empresa = COALESCE(EXCLUDED.nome_empresa, formulario_embarcadores.empresas.nome_empresa),
                        tipo_empresa = COALESCE(EXCLUDED.tipo_empresa, formulario_embarcadores.empresas.tipo_empresa),
                        cnpj = COALESCE(EXCLUDED.cnpj, formulario_embarcadores.empresas.cnpj),
                        razao_social = EXCLUDED.razao_social,
                        nome_fantasia = EXCLUDED.nome_fantasia,
                        telefone = EXCLUDED.telefone,
                        email = EXCLUDED.email,
                        id_municipio = EXCLUDED.id_municipio,
                        logradouro = EXCLUDED.logradouro,
                        numero = EXCLUDED.numero,
                        complemento = EXCLUDED.complemento,
                        bairro = EXCLUDED.bairro,
                        cep = EXCLUDED.cep,
                        updated_at = NOW()
                    RETURNING id_empresa;
                `;

                const empresaRes = await client.query(upsertEmpresaSql, [
                    dados.nome_empresa || dados.razaoSocial,
                    dados.tipo_empresa || null,
                    dados.cnpj,
                    cnpj_digits,
                    dados.razaoSocial || null,
                    dados.nomeFantasia || null,
                    dados.telefone || null,
                    dados.email || null,
                    dados.municipio || null,
                    dados.logradouro || null,
                    dados.numero || null,
                    dados.complemento || null,
                    dados.bairro || null,
                    dados.cep || null
                ]);

                id_empresa = empresaRes.rows[0].id_empresa;
            } else {
                const novaEmpresa = await client.query(`
                    INSERT INTO formulario_embarcadores.empresas (
                        nome_empresa, tipo_empresa, razao_social, nome_fantasia, telefone, email,
                        id_municipio, logradouro, numero, complemento, bairro, cep, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
                    RETURNING id_empresa
                `, [
                    dados.nome_empresa || dados.razaoSocial,
                    dados.tipo_empresa || null,
                    dados.razaoSocial || null,
                    dados.nomeFantasia || null,
                    dados.telefone || null,
                    dados.email || null,
                    dados.municipio || null,
                    dados.logradouro || null,
                    dados.numero || null,
                    dados.complemento || null,
                    dados.bairro || null,
                    dados.cep || null
                ]);
                id_empresa = novaEmpresa.rows[0].id_empresa;
            }
            
            // 2. INSERIR/ATUALIZAR ENTREVISTADO
            let id_entrevistado = null;
            const emailEnt = dados.emailEntrevistado ? String(dados.emailEntrevistado).trim() : null;
            const emailLower = emailEnt ? emailEnt.toLowerCase() : null;

            if (emailEnt) {
                const upsertSql = `
                    INSERT INTO formulario_embarcadores.entrevistados (
                        id_empresa, nome, funcao, telefone, email, email_lower, principal, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                    ON CONFLICT (id_empresa, email_lower) DO UPDATE SET
                        nome = COALESCE(EXCLUDED.nome, formulario_embarcadores.entrevistados.nome),
                        funcao = COALESCE(EXCLUDED.funcao, formulario_embarcadores.entrevistados.funcao),
                        telefone = COALESCE(EXCLUDED.telefone, formulario_embarcadores.entrevistados.telefone),
                        principal = EXCLUDED.principal,
                        updated_at = NOW()
                    RETURNING id_entrevistado;
                `;

                const resEnt = await client.query(upsertSql, [
                    id_empresa,
                    dados.nomeEntrevistado || null,
                    dados.cargoEntrevistado || null,
                    dados.telefoneEntrevistado || null,
                    emailEnt,
                    emailLower,
                    true
                ]);
                id_entrevistado = resEnt.rows[0].id_entrevistado;
            } else {
                const ins = await client.query(`
                    INSERT INTO formulario_embarcadores.entrevistados (
                        id_empresa, nome, funcao, telefone, email, email_lower, principal, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, NULL, $6, NOW(), NOW())
                    RETURNING id_entrevistado
                `, [id_empresa, dados.nomeEntrevistado || null, dados.cargoEntrevistado || null, dados.telefoneEntrevistado || null, null, true]);
                id_entrevistado = ins.rows[0].id_entrevistado;
            }

            // 3. INSERIR PESQUISA (simplificado nesta rota)
            const pesquisaResult = await client.query(`
                INSERT INTO formulario_embarcadores.pesquisas (
                    id_empresa,
                    id_entrevistado,
                    id_entrevistador,
                    data_entrevista,
                    horario_entrevista,
                    id_instituicao,
                    consentimento,
                    transporta_carga,
                    origem_pais,
                    origem_estado,
                    origem_municipio,
                    origem_instalacao,
                    destino_pais,
                    destino_estado,
                    destino_municipio,
                    destino_instalacao,
                    distancia_km,
                    volume_anual_toneladas,
                    tipo_produto,
                    classe_produto,
                    produtos_especificos,
                    modal_predominante,
                    modal_secundario,
                    modal_terciario,
                    proprio_terceirizado,
                    qtd_caminhoes_proprios,
                    qtd_caminhoes_terceirizados,
                    frequencia_envio,
                    tempo_transporte,
                    custo_medio_tonelada,
                    pedagio_custo,
                    frete_custo,
                    manutencao_custo,
                    outros_custos,
                    principais_desafios,
                    investimento_sustentavel,
                    reducao_emissoes,
                    tecnologias_interesse,
                    uso_tecnologia,
                    grau_automacao,
                    rastreamento_carga,
                    uso_dados,
                    conhecimento_hidrovias,
                    viabilidade_hidrovia,
                    pontos_melhoria,
                    observacoes
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8,
                    $9, $10, $11, $12, $13, $14, $15, $16,
                    $17, $18, $19, $20, $21, $22, $23, $24,
                    $25, $26, $27, $28, $29, $30, $31, $32,
                    $33, $34, $35, $36, $37, $38, $39, $40,
                    $41, $42, $43, $44, $45, $46
                )
                RETURNING id_pesquisa
            `, [
                id_empresa,
                id_entrevistado,
                dados.entrevistador || null,
                dados.dataEntrevista || new Date().toISOString().split('T')[0],
                dados.horarioEntrevista || new Date().toTimeString().split(' ')[0],
                dados.instituicao || null,
                dados.consentimento === 'sim' || dados.consentimento === true,
                dados.transportaCarga === 'sim' || dados.transportaCarga === true,
                dados.origemPais || null,
                dados.origemEstado || null,
                dados.origemMunicipio || null,
                dados.origemInstalacao || null,
                dados.destinoPais || null,
                dados.destinoEstado || null,
                dados.destinoMunicipio || null,
                dados.destinoInstalacao || null,
                dados.distanciaKm ? parseFloat(dados.distanciaKm) : null,
                dados.volumeAnual ? parseFloat(dados.volumeAnual) : null,
                dados.tipoProduto || null,
                dados.classeProduto || null,
                dados.produtosEspecificos || null,
                dados.modalPredominante || null,
                dados.modalSecundario || null,
                dados.modalTerciario || null,
                dados.proprioTerceirizado || null,
                dados.qtdCaminhoesProprios ? parseInt(dados.qtdCaminhoesProprios) : null,
                dados.qtdCaminhoesTerceirizados ? parseInt(dados.qtdCaminhoesTerceirizados) : null,
                dados.frequenciaEnvio || null,
                dados.tempoTransporte || null,
                dados.custoMedioTonelada ? parseFloat(dados.custoMedioTonelada) : null,
                dados.pedagioCusto ? parseFloat(dados.pedagioCusto) : null,
                dados.freteCusto ? parseFloat(dados.freteCusto) : null,
                dados.manutencaoCusto ? parseFloat(dados.manutencaoCusto) : null,
                dados.outrosCustos ? parseFloat(dados.outrosCustos) : null,
                dados.principaisDesafios || null,
                dados.investimentoSustentavel || null,
                dados.reducaoEmissoes || null,
                dados.tecnologiasInteresse || null,
                dados.usoTecnologia || null,
                dados.grauAutomacao || null,
                dados.rastreamentoCarga || null,
                dados.usoDados || null,
                dados.conhecimentoHidrovias || null,
                dados.viabilidadeHidrovia || null,
                dados.pontosMelhoria || null,
                dados.observacoes || null
            ]);

            const id_pesquisa = pesquisaResult.rows[0].id_pesquisa;

            // 4. INSERIR PRODUTOS TRANSPORTADOS (em lote) - similar ao outro endpoint
            if (dados.produtos_transportados && Array.isArray(dados.produtos_transportados) && dados.produtos_transportados.length > 0) {
                const insertProdutoSql = `
                    INSERT INTO formulario_embarcadores.produtos_transportados
                        (id_pesquisa, id_empresa, carga, movimentacao, origem, destino, distancia, modalidade, acondicionamento, ordem)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                `;

                for (let i = 0; i < dados.produtos_transportados.length; i++) {
                    const p = dados.produtos_transportados[i] || {};
                    const carga = p.produto || p.carga || p.nome || null;
                    const movRaw = p.movimentacao_anual || p.movimentacao || p.mov || p.quantidade || null;
                    const movimentacao = movRaw == null ? null : (isNaN(Number(String(movRaw).replace(/,/g, '.'))) ? null : Number(String(movRaw).replace(/,/g, '.')));
                    const origem = p.origem || null;
                    const destino = p.destino || null;
                    const distancia = p.distancia == null ? null : (isNaN(Number(String(p.distancia).replace(/,/g, '.'))) ? null : Number(String(p.distancia).replace(/,/g, '.')));
                    const modalidade = p.modalidade || p.modal || null;
                    const acondicionamento = p.acondicionamento || p.embalagem || null;
                    const ordem = p.ordem || (i + 1);

                    const params2 = [id_pesquisa, id_empresa, carga, movimentacao, origem, destino, distancia, modalidade, acondicionamento, ordem];
                    await client.query(insertProdutoSql, params2);
                }
            }

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Pesquisa salva com sucesso!',
                data: {
                    id_pesquisa,
                    id_empresa,
                    id_entrevistado,
                    razao_social: dados.razaoSocial,
                    nome_entrevistado: dados.nomeEntrevistado
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Erro ao salvar pesquisa (submit-form):', error);

            let mensagemAmigavel = 'Erro ao salvar a pesquisa no banco de dados.';
            let detalhes = error.message;

            if (error.code === '23505') {
                mensagemAmigavel = 'Já existe um registro com estes dados.';
                detalhes = 'CNPJ duplicado ou pesquisa já cadastrada.';
            } else if (error.code === '23503') {
                mensagemAmigavel = 'Há um problema com os dados selecionados.';
                detalhes = 'Verifique se país, estado, município, instituição e entrevistador foram selecionados corretamente.';
            } else if (error.code === '23502') {
                mensagemAmigavel = 'Faltam dados obrigatórios.';
                detalhes = `Campo obrigatório não preenchido: ${error.column || 'desconhecido'}`;
            }

            res.status(500).json({
                success: false,
                message: mensagemAmigavel,
                details: detalhes,
                error_code: error.code,
                error_type: error.name
            });

        } finally {
            client.release();
        }
    });

    return router;
};
