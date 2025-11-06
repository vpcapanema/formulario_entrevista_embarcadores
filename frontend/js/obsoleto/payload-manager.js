/**
 * ════════════════════════════════════════════════════════════
 * 📦 PAYLOAD MANAGER - SISTEMA DE DADOS PADRONIZADO
 * ════════════════════════════════════════════════════════════
 * 
 * Responsabilidades:
 * 1. Consolidar dados do formulário em payload estruturado
 * 2. Validar e formatar valores em tempo real
 * 3. Separar dados por tabela (empresas, entrevistados, pesquisas)
 * 4. Garantir que valores estejam no formato correto do banco
 * 
 * @author Sistema PLI 2050
 * @date 2025-11-05
 */

class PayloadManager {
    constructor() {
        this.payload = this.createEmptyPayload();
        this.validationErrors = [];
        this.listeners = [];
    }

    /**
     * 📋 ESTRUTURA PADRÃO DO PAYLOAD
     * Separado por tabelas do banco de dados
     */
    createEmptyPayload() {
        return {
            // ══════════════════════════════════════════════
            // 🏢 TABELA: empresas
            // ══════════════════════════════════════════════
            empresa: {
                cnpj: null,                    // Q6a - VARCHAR(14) - apenas números
                razao_social: null,            // Q6b - VARCHAR(255) - obrigatório
                nome_fantasia: null,           // Q6b - VARCHAR(255) (obtido da API)
                telefone: null,                // Q8  - VARCHAR(20) - apenas números
                email: null,                   // Q9  - VARCHAR(255) - validar formato
                id_municipio: null,            // Q7  - INTEGER - código IBGE 7 dígitos
                logradouro: null,              // Q10a - VARCHAR(255)
                numero: null,                  // Q10b - VARCHAR(20)
                complemento: null,             // Q10c - VARCHAR(100)
                bairro: null,                  // Q10d - VARCHAR(100)
                cep: null                      // Q11 - VARCHAR(8) - apenas números
            },

            // ══════════════════════════════════════════════
            // 👤 TABELA: entrevistados
            // ══════════════════════════════════════════════
            entrevistado: {
                nome: null,                    // Q1 - VARCHAR(255) - obrigatório
                cargo: null,                   // Q2 - VARCHAR(100)
                telefone_entrevistado: null,   // Q3 - VARCHAR(20) - apenas números
                email_entrevistado: null       // Q4 - VARCHAR(255) - validar formato
            },

            // ══════════════════════════════════════════════
            // 📋 TABELA: pesquisas
            // ══════════════════════════════════════════════
            pesquisa: {
                // Referências (serão preenchidas pelo backend)
                id_empresa: null,              // INTEGER - gerado no backend após INSERT empresa
                id_entrevistado: null,         // INTEGER - gerado no backend após INSERT entrevistado
                
                // Q0: Responsável pela pesquisa
                id_responsavel: null,          // Q0 - INTEGER - id_entrevistador OU id_entrevistado (quem preenche)
                
                // Metadados da entrevista
                data_entrevista: null,         // DATE - formato YYYY-MM-DD (gerado automaticamente)
                horario_entrevista: null,      // TIME - formato HH:MM:SS (gerado automaticamente)
                
                // Q5: Tipo de empresa
                tipo_empresa: null,            // Q5 - VARCHAR(100) - embarcador/operador logístico/etc
                
                // Q14: Consentimento
                consentimento: false,          // Q14 - BOOLEAN - aceite obrigatório
                
                // Q15: Transporta carga?
                transporta_carga: false,       // Q15 - BOOLEAN - pergunta filtro
                
                // Q12: Origem (CÓDIGOS IBGE - STRING)
                origem_pais: null,             // Q12a - VARCHAR(100) - país de origem
                origem_estado: null,           // Q12b - VARCHAR(2) - código UF (ex: '35' para SP)
                origem_municipio: null,        // Q12c - VARCHAR(7) - código IBGE (ex: '3550308' para São Paulo)
                origem_instalacao: null,       // Q12d - VARCHAR(255) - nome da instalação/porto/terminal
                
                // Q13: Destino (CÓDIGOS IBGE - STRING)
                destino_pais: null,            // Q13a - VARCHAR(100) - país de destino
                destino_estado: null,          // Q13b - VARCHAR(2) - código UF (ex: '52' para GO)
                destino_municipio: null,       // Q13c - VARCHAR(7) - código IBGE (ex: '5208707' para Goiânia)
                destino_instalacao: null,      // Q13d - VARCHAR(255) - nome da instalação/porto/terminal
                
                // Q16-Q18: Produto/Volume
                distancia_km: null,            // Q16 - DECIMAL(10,2) - distância em km
                volume_anual_toneladas: null,  // Q17 - DECIMAL(15,2) - volume transportado/ano
                tipo_produto: null,            // Q18a - VARCHAR(100) - granel sólido/líquido/etc
                classe_produto: null,          // Q18b - VARCHAR(100) - agrícola/mineral/etc
                produtos_especificos: null,    // Q18c - TEXT - lista de produtos específicos
                
                // Q19-Q23: Modal
                modal_predominante: null,      // Q19 - VARCHAR(50) - rodoviário/ferroviário/etc
                modal_secundario: null,        // Q20 - VARCHAR(50) - modal complementar
                modal_terciario: null,         // Q21 - VARCHAR(50) - terceiro modal (se houver)
                proprio_terceirizado: null,    // Q22 - VARCHAR(50) - próprio/terceirizado/misto
                qtd_caminhoes_proprios: null,  // Q23a - INTEGER - quantidade de caminhões próprios
                qtd_caminhoes_terceirizados: null, // Q23b - INTEGER - quantidade terceirizados
                
                // Q24-Q28: Frequência/Custo
                frequencia_envio: null,        // Q24 - VARCHAR(50) - diária/semanal/mensal
                tempo_transporte: null,        // Q25 - VARCHAR(100) - tempo médio de viagem
                custo_medio_tonelada: null,    // Q26 - DECIMAL(15,2) - custo R$/tonelada
                pedagio_custo: null,           // Q27a - DECIMAL(15,2) - custo com pedágios
                frete_custo: null,             // Q27b - DECIMAL(15,2) - custo com frete
                manutencao_custo: null,        // Q27c - DECIMAL(15,2) - custo com manutenção
                outros_custos: null,           // Q27d - DECIMAL(15,2) - outros custos
                
                // Q29-Q31: Desafios/Sustentabilidade
                principais_desafios: null,     // Q29 - TEXT - desafios logísticos enfrentados
                investimento_sustentavel: null,// Q30 - TEXT - investimentos em sustentabilidade
                reducao_emissoes: null,        // Q31 - TEXT - ações para reduzir emissões
                
                // Q32-Q36: Tecnologia
                tecnologias_interesse: null,   // Q32 - TEXT - tecnologias de interesse
                uso_tecnologia: null,          // Q33 - TEXT - tecnologias atualmente utilizadas
                grau_automacao: null,          // Q34 - VARCHAR(50) - nível de automação
                rastreamento_carga: null,      // Q35 - VARCHAR(50) - tipo de rastreamento
                uso_dados: null,               // Q36 - TEXT - como usa dados logísticos
                
                // Q37-Q39: Hidrovias
                conhecimento_hidrovias: null,  // Q37 - VARCHAR(50) - conhece hidrovias? sim/não
                viabilidade_hidrovia: null,    // Q38 - TEXT - avaliação de viabilidade
                pontos_melhoria: null,         // Q39 - TEXT - pontos que precisam melhorar
                
                // Q40: Observações
                observacoes: null              // Q40 - TEXT - observações gerais
            },

            // ══════════════════════════════════════════════
            // 📦 TABELA: produtos_transportados (opcional)
            // ══════════════════════════════════════════════
            produtos_transportados: []         // Tabela de produtos - ARRAY de objetos
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 🔄 ATUALIZAR PAYLOAD EM TEMPO REAL
     * ═══════════════════════════════════════════════════════════
     * 
     * @param {string} tabela - 'empresa', 'entrevistado', 'pesquisa'
     * @param {string} campo - Nome do campo
     * @param {any} valor - Valor do campo
     */
    updateField(tabela, campo, valor) {
        try {
            // Validar e formatar valor
            const valorFormatado = this.formatValue(tabela, campo, valor);
            
            // Atualizar payload
            if (this.payload[tabela]) {
                this.payload[tabela][campo] = valorFormatado;
                
                // Notificar listeners
                this.notifyListeners(tabela, campo, valorFormatado);
                
                console.log(`✅ Payload atualizado: ${tabela}.${campo} =`, valorFormatado);
            } else {
                console.error(`❌ Tabela inválida: ${tabela}`);
            }
        } catch (error) {
            console.error(`❌ Erro ao atualizar payload: ${tabela}.${campo}`, error);
            this.validationErrors.push({
                tabela,
                campo,
                valor,
                erro: error.message
            });
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 🔧 FORMATAÇÃO DE VALORES
     * ═══════════════════════════════════════════════════════════
     * 
     * Garante que valores estejam no formato correto do banco
     */
    formatValue(tabela, campo, valor) {
        // Se vazio, retornar null
        if (valor === '' || valor === undefined || valor === null) {
            return null;
        }

        // ──────────────────────────────────────────────────
        // 🏢 EMPRESA - Formatações específicas
        // ──────────────────────────────────────────────────
        if (tabela === 'empresa') {
            switch (campo) {
                case 'cnpj':
                    // Remover formatação, manter apenas números
                    return valor.replace(/\D/g, '').substring(0, 14);
                
                case 'cep':
                    // Remover formatação, manter apenas números
                    return valor.replace(/\D/g, '').substring(0, 8);
                
                case 'telefone':
                    // Remover formatação, manter apenas números
                    return valor.replace(/\D/g, '').substring(0, 20);
                
                case 'email':
                    // Validar formato de email
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
                        throw new Error('Email inválido');
                    }
                    return valor.toLowerCase().trim();
                
                case 'id_municipio':
                    // Converter para integer (código IBGE)
                    const codigo = parseInt(valor);
                    if (isNaN(codigo)) {
                        throw new Error('Código de município inválido');
                    }
                    return codigo;
                
                default:
                    return typeof valor === 'string' ? valor.trim() : valor;
            }
        }

        // ──────────────────────────────────────────────────
        // 👤 ENTREVISTADO - Formatações específicas
        // ──────────────────────────────────────────────────
        if (tabela === 'entrevistado') {
            switch (campo) {
                case 'telefone_entrevistado':
                    return valor.replace(/\D/g, '').substring(0, 20);
                
                case 'email_entrevistado':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
                        throw new Error('Email inválido');
                    }
                    return valor.toLowerCase().trim();
                
                default:
                    return typeof valor === 'string' ? valor.trim() : valor;
            }
        }

        // ──────────────────────────────────────────────────
        // 📋 PESQUISA - Formatações específicas
        // ──────────────────────────────────────────────────
        if (tabela === 'pesquisa') {
            switch (campo) {
                // Booleanos
                case 'consentimento':
                case 'transporta_carga':
                    return valor === 'sim' || valor === true || valor === 'true';
                
                // Códigos IBGE - SEMPRE STRING
                case 'origem_estado':
                case 'destino_estado':
                    // Código UF (2 dígitos) - manter como STRING
                    const uf = valor.toString().padStart(2, '0');
                    if (!/^\d{2}$/.test(uf)) {
                        throw new Error('Código UF inválido (deve ter 2 dígitos)');
                    }
                    return uf;
                
                case 'origem_municipio':
                case 'destino_municipio':
                    // Código IBGE (7 dígitos) - manter como STRING
                    const ibge = valor.toString().padStart(7, '0');
                    if (!/^\d{7}$/.test(ibge)) {
                        throw new Error('Código IBGE inválido (deve ter 7 dígitos)');
                    }
                    return ibge;
                
                // Números decimais
                case 'distancia_km':
                case 'volume_anual_toneladas':
                case 'custo_medio_tonelada':
                case 'pedagio_custo':
                case 'frete_custo':
                case 'manutencao_custo':
                case 'outros_custos':
                    const decimal = parseFloat(valor.toString().replace(',', '.'));
                    if (isNaN(decimal)) {
                        throw new Error(`${campo} deve ser um número`);
                    }
                    return decimal;
                
                // Números inteiros
                case 'qtd_caminhoes_proprios':
                case 'qtd_caminhoes_terceirizados':
                case 'id_entrevistador':
                case 'id_instituicao':
                    const inteiro = parseInt(valor);
                    if (isNaN(inteiro)) {
                        throw new Error(`${campo} deve ser um número inteiro`);
                    }
                    return inteiro;
                
                // Datas
                case 'data_entrevista':
                    // Formato YYYY-MM-DD
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
                        throw new Error('Data inválida (use YYYY-MM-DD)');
                    }
                    return valor;
                
                case 'horario_entrevista':
                    // Formato HH:MM:SS
                    if (!/^\d{2}:\d{2}:\d{2}$/.test(valor)) {
                        // Tentar adicionar segundos se estiver faltando
                        if (/^\d{2}:\d{2}$/.test(valor)) {
                            return valor + ':00';
                        }
                        throw new Error('Horário inválido (use HH:MM ou HH:MM:SS)');
                    }
                    return valor;
                
                default:
                    return typeof valor === 'string' ? valor.trim() : valor;
            }
        }

        return valor;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ✅ VALIDAR PAYLOAD COMPLETO
     * ═══════════════════════════════════════════════════════════
     */
    validate() {
        this.validationErrors = [];

        // Validar campos obrigatórios - EMPRESA
        if (!this.payload.empresa.razao_social && !this.payload.empresa.nome_empresa) {
            this.validationErrors.push({
                tabela: 'empresa',
                campo: 'nome_empresa',
                erro: 'Nome da empresa é obrigatório (razao_social ou nome_empresa)'
            });
        }

        // Validar campos obrigatórios - ENTREVISTADO
        if (!this.payload.entrevistado.nome) {
            this.validationErrors.push({
                tabela: 'entrevistado',
                campo: 'nome',
                erro: 'Nome do entrevistado é obrigatório'
            });
        }

        // ⚠️ CONSENTIMENTO REMOVIDO - Campo não existe no formulário atual
        // Se for adicionado no futuro, descomentar:
        // if (!this.payload.pesquisa.consentimento) {
        //     this.validationErrors.push({
        //         tabela: 'pesquisa',
        //         campo: 'consentimento',
        //         erro: 'Consentimento é obrigatório'
        //     });
        // }

        // Se houver erros, log detalhado para DevTools e disparar evento customizado
        if (this.validationErrors.length > 0) {
            try {
                console.groupCollapsed('❌ Payload validation errors (PayloadManager.validate)');
                console.table(this.validationErrors);
                console.log('📦 Payload snapshot (truncated):', this.payload);
                console.groupEnd();
            } catch (e) {
                console.error('Erro ao logar validationErrors:', e);
            }

            // Dispatch custom event para quem quiser escutar (DevTools-friendly)
            try {
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('payload:validation-error', {
                        detail: {
                            errors: this.validationErrors,
                            payload: this.payload
                        }
                    }));
                }
            } catch (e) {
                // silence
            }
        }

        return this.validationErrors.length === 0;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 📤 GERAR PAYLOAD PARA ENVIO
     * ═══════════════════════════════════════════════════════════
     * 
     * Retorna payload consolidado pronto para enviar ao backend
     */
    getPayload() {
        if (!this.validate()) {
            console.error('❌ Payload inválido:', this.validationErrors);
            throw new Error('Payload contém erros de validação');
        }

        return {
            // Dados da empresa (com alias amigáveis → valores do banco)
            cnpj: this.payload.empresa.cnpj,
            razaoSocial: this.payload.empresa.razao_social,
            nomeFantasia: this.payload.empresa.nome_fantasia,
            telefone: this.payload.empresa.telefone,
            email: this.payload.empresa.email,
            municipio: this.payload.empresa.id_municipio,
            logradouro: this.payload.empresa.logradouro,
            numero: this.payload.empresa.numero,
            complemento: this.payload.empresa.complemento,
            bairro: this.payload.empresa.bairro,
            cep: this.payload.empresa.cep,

            // Dados do entrevistado
            nomeEntrevistado: this.payload.entrevistado.nome,
            cargoEntrevistado: this.payload.entrevistado.cargo,
            telefoneEntrevistado: this.payload.entrevistado.telefone_entrevistado,
            emailEntrevistado: this.payload.entrevistado.email_entrevistado,

            // Dados da pesquisa (com valores já formatados)
            entrevistador: this.payload.pesquisa.id_entrevistador,
            dataEntrevista: this.payload.pesquisa.data_entrevista,
            horarioEntrevista: this.payload.pesquisa.horario_entrevista,
            instituicao: this.payload.pesquisa.id_instituicao,
            consentimento: this.payload.pesquisa.consentimento,
            transportaCarga: this.payload.pesquisa.transporta_carga,

            // Origem (CÓDIGOS IBGE - STRING)
            origemPais: this.payload.pesquisa.origem_pais,
            origemEstado: this.payload.pesquisa.origem_estado,
            origemMunicipio: this.payload.pesquisa.origem_municipio,
            origemInstalacao: this.payload.pesquisa.origem_instalacao,

            // Destino (CÓDIGOS IBGE - STRING)
            destinoPais: this.payload.pesquisa.destino_pais,
            destinoEstado: this.payload.pesquisa.destino_estado,
            destinoMunicipio: this.payload.pesquisa.destino_municipio,
            destinoInstalacao: this.payload.pesquisa.destino_instalacao,

            // Produto/Volume
            distanciaKm: this.payload.pesquisa.distancia_km,
            volumeAnual: this.payload.pesquisa.volume_anual_toneladas,
            tipoProduto: this.payload.pesquisa.tipo_produto,
            classeProduto: this.payload.pesquisa.classe_produto,
            produtosEspecificos: this.payload.pesquisa.produtos_especificos,

            // Modal
            modalPredominante: this.payload.pesquisa.modal_predominante,
            modalSecundario: this.payload.pesquisa.modal_secundario,
            modalTerciario: this.payload.pesquisa.modal_terciario,
            proprioTerceirizado: this.payload.pesquisa.proprio_terceirizado,
            qtdCaminhoesProprios: this.payload.pesquisa.qtd_caminhoes_proprios,
            qtdCaminhoesTerceirizados: this.payload.pesquisa.qtd_caminhoes_terceirizados,

            // Frequência/Custo
            frequenciaEnvio: this.payload.pesquisa.frequencia_envio,
            tempoTransporte: this.payload.pesquisa.tempo_transporte,
            custoMedioTonelada: this.payload.pesquisa.custo_medio_tonelada,
            pedagioCusto: this.payload.pesquisa.pedagio_custo,
            freteCusto: this.payload.pesquisa.frete_custo,
            manutencaoCusto: this.payload.pesquisa.manutencao_custo,
            outrosCustos: this.payload.pesquisa.outros_custos,

            // Desafios/Sustentabilidade
            principaisDesafios: this.payload.pesquisa.principais_desafios,
            investimentoSustentavel: this.payload.pesquisa.investimento_sustentavel,
            reducaoEmissoes: this.payload.pesquisa.reducao_emissoes,

            // Tecnologia
            tecnologiasInteresse: this.payload.pesquisa.tecnologias_interesse,
            usoTecnologia: this.payload.pesquisa.uso_tecnologia,
            grauAutomacao: this.payload.pesquisa.grau_automacao,
            rastreamentoCarga: this.payload.pesquisa.rastreamento_carga,
            usoDados: this.payload.pesquisa.uso_dados,

            // Hidrovias
            conhecimentoHidrovias: this.payload.pesquisa.conhecimento_hidrovias,
            viabilidadeHidrovia: this.payload.pesquisa.viabilidade_hidrovia,
            pontosMelhoria: this.payload.pesquisa.pontos_melhoria,

            // Observações
            observacoes: this.payload.pesquisa.observacoes,

            // Produtos transportados (array)
            produtos_transportados: this.payload.produtos_transportados
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 📡 ENVIAR PAYLOAD PARA BACKEND
     * ═══════════════════════════════════════════════════════════
     */
    async submit() {
        try {
            console.log('📤 Preparando envio do payload...');

            // Validar antes de enviar
            if (!this.validate()) {
                throw new Error('Payload contém erros de validação');
            }

            // Obter payload formatado
            const payload = this.getPayload();

            console.log('📦 Payload gerado:', payload);

            // Enviar para backend
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao enviar dados');
            }

            const result = await response.json();

            console.log('✅ Dados enviados com sucesso!', result);

            return {
                success: true,
                data: result
            };

        } catch (error) {
            // Log detalhado para DevTools
            try {
                console.groupCollapsed('❌ PayloadManager.submit error');
                console.error('Error object:', error);
                console.log('Validation errors:', this.validationErrors);
                console.log('Payload snapshot:', this.payload);
                console.groupEnd();
            } catch (e) {
                console.error('Erro ao logar submit error:', e);
            }

            // Disparar evento customizado para listeners externos
            try {
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('payload:submit-error', {
                        detail: {
                            error: error && (error.message || error),
                            validationErrors: this.validationErrors,
                            payload: this.payload
                        }
                    }));
                }
            } catch (e) {
                // ignore
            }

            console.error('❌ Erro ao enviar payload:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 👂 LISTENERS - OBSERVAR MUDANÇAS NO PAYLOAD
     * ═══════════════════════════════════════════════════════════
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(tabela, campo, valor) {
        this.listeners.forEach(callback => {
            callback(tabela, campo, valor, this.payload);
        });
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 🔄 RESETAR PAYLOAD
     * ═══════════════════════════════════════════════════════════
     */
    reset() {
        this.payload = this.createEmptyPayload();
        this.validationErrors = [];
        console.log('🔄 Payload resetado');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 📊 DEBUG - EXIBIR PAYLOAD ATUAL
     * ═══════════════════════════════════════════════════════════
     */
    debug() {
        console.log('═══════════════════════════════════════════════════════');
        console.log('📦 PAYLOAD ATUAL:');
        console.log('═══════════════════════════════════════════════════════');
        console.log('🏢 EMPRESA:', this.payload.empresa);
        console.log('👤 ENTREVISTADO:', this.payload.entrevistado);
        console.log('📋 PESQUISA:', this.payload.pesquisa);
        console.log('📦 PRODUTOS:', this.payload.produtos_transportados);
        console.log('═══════════════════════════════════════════════════════');
        console.log('❌ ERROS:', this.validationErrors);
        console.log('═══════════════════════════════════════════════════════');
    }
}

// ═══════════════════════════════════════════════════════════
// 🌍 EXPORTAR PARA USO GLOBAL
// ═══════════════════════════════════════════════════════════
window.PayloadManager = PayloadManager;
