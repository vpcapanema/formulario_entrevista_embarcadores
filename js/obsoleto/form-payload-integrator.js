/**
 * ════════════════════════════════════════════════════════════
 * 🔗 FORM PAYLOAD INTEGRATOR
 * ════════════════════════════════════════════════════════════
 * 
 * Conecta os campos do formulário ao PayloadManager
 * Atualiza payload em tempo real conforme usuário preenche
 * 
 * @author Sistema PLI 2050
 * @date 2025-11-05
 */

class FormPayloadIntegrator {
    constructor(payloadManager) {
        this.payloadManager = payloadManager;
        this.fieldMappings = this.createFieldMappings();
        this.init();
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 🗺️ MAPEAMENTO: Campo do HTML → Campo do Payload
     * ═══════════════════════════════════════════════════════════
     * 
     * Estrutura: {
     *   'id-do-campo-html': {
     *     tabela: 'empresa' | 'entrevistado' | 'pesquisa',
     *     campo: 'nome_do_campo_no_banco',
     *     alias: 'Label amigável mostrado ao usuário'
     *   }
     * }
     */
    createFieldMappings() {
        return {
            // ══════════════════════════════════════════════
            // 🏢 EMPRESA (Q3-Q11)
            // ══════════════════════════════════════════════
            'cnpj': {
                tabela: 'empresa',
                campo: 'cnpj',
                alias: 'CNPJ'
            },
            'razao-social': {
                tabela: 'empresa',
                campo: 'razao_social',
                alias: 'Razão Social'
            },
            'nome-fantasia': {
                tabela: 'empresa',
                campo: 'nome_fantasia',
                alias: 'Nome Fantasia'
            },
            'telefone-empresa': {
                tabela: 'empresa',
                campo: 'telefone',
                alias: 'Telefone da Empresa'
            },
            'email-empresa': {
                tabela: 'empresa',
                campo: 'email',
                alias: 'Email da Empresa'
            },
            'municipio-empresa': {
                tabela: 'empresa',
                campo: 'id_municipio',
                alias: 'Município' // Select mostra nome, envia código IBGE
            },
            'logradouro': {
                tabela: 'empresa',
                campo: 'logradouro',
                alias: 'Logradouro'
            },
            'numero': {
                tabela: 'empresa',
                campo: 'numero',
                alias: 'Número'
            },
            'complemento': {
                tabela: 'empresa',
                campo: 'complemento',
                alias: 'Complemento'
            },
            'bairro': {
                tabela: 'empresa',
                campo: 'bairro',
                alias: 'Bairro'
            },
            'cep': {
                tabela: 'empresa',
                campo: 'cep',
                alias: 'CEP'
            },

            // ══════════════════════════════════════════════
            // 👤 ENTREVISTADO (Q4)
            // ══════════════════════════════════════════════
            'nome-entrevistado': {
                tabela: 'entrevistado',
                campo: 'nome',
                alias: 'Nome do Entrevistado'
            },
            'cargo-entrevistado': {
                tabela: 'entrevistado',
                campo: 'cargo',
                alias: 'Cargo'
            },
            'telefone-entrevistado': {
                tabela: 'entrevistado',
                campo: 'telefone_entrevistado',
                alias: 'Telefone do Entrevistado'
            },
            'email-entrevistado': {
                tabela: 'entrevistado',
                campo: 'email_entrevistado',
                alias: 'Email do Entrevistado'
            },

            // ══════════════════════════════════════════════
            // 📋 PESQUISA - Metadados
            // ══════════════════════════════════════════════
            'entrevistador': {
                tabela: 'pesquisa',
                campo: 'id_entrevistador',
                alias: 'Entrevistador' // Select mostra nome, envia ID
            },
            'data-entrevista': {
                tabela: 'pesquisa',
                campo: 'data_entrevista',
                alias: 'Data da Entrevista'
            },
            'horario-entrevista': {
                tabela: 'pesquisa',
                campo: 'horario_entrevista',
                alias: 'Horário da Entrevista'
            },
            'instituicao': {
                tabela: 'pesquisa',
                campo: 'id_instituicao',
                alias: 'Instituição' // Select mostra nome, envia ID
            },

            // ══════════════════════════════════════════════
            // 📋 PESQUISA - Q1 e Q2
            // ══════════════════════════════════════════════
            'consentimento': {
                tabela: 'pesquisa',
                campo: 'consentimento',
                alias: 'Consentimento' // Radio: Sim/Não → true/false
            },
            'transporta-carga': {
                tabela: 'pesquisa',
                campo: 'transporta_carga',
                alias: 'Transporta Carga?' // Radio: Sim/Não → true/false
            },

            // ══════════════════════════════════════════════
            // 📋 PESQUISA - Q12 (Origem)
            // ══════════════════════════════════════════════
            'origem-pais': {
                tabela: 'pesquisa',
                campo: 'origem_pais',
                alias: 'País de Origem'
            },
            'origem-estado': {
                tabela: 'pesquisa',
                campo: 'origem_estado',
                alias: 'Estado de Origem' // Select mostra "São Paulo", envia "35"
            },
            'origem-municipio': {
                tabela: 'pesquisa',
                campo: 'origem_municipio',
                alias: 'Município de Origem' // Select mostra "São Paulo", envia "3550308"
            },
            'origem-instalacao': {
                tabela: 'pesquisa',
                campo: 'origem_instalacao',
                alias: 'Instalação de Origem'
            },

            // ══════════════════════════════════════════════
            // 📋 PESQUISA - Q13 (Destino)
            // ══════════════════════════════════════════════
            'destino-pais': {
                tabela: 'pesquisa',
                campo: 'destino_pais',
                alias: 'País de Destino'
            },
            'destino-estado': {
                tabela: 'pesquisa',
                campo: 'destino_estado',
                alias: 'Estado de Destino' // Select mostra "Goiás", envia "52"
            },
            'destino-municipio': {
                tabela: 'pesquisa',
                campo: 'destino_municipio',
                alias: 'Município de Destino' // Select mostra "Goiânia", envia "5208707"
            },
            'destino-instalacao': {
                tabela: 'pesquisa',
                campo: 'destino_instalacao',
                alias: 'Instalação de Destino'
            },

            // ══════════════════════════════════════════════
            // 📋 PESQUISA - Q14-Q16 (Produto/Volume)
            // ══════════════════════════════════════════════
            'distancia-km': {
                tabela: 'pesquisa',
                campo: 'distancia_km',
                alias: 'Distância (km)' // Input → number
            },
            'volume-anual': {
                tabela: 'pesquisa',
                campo: 'volume_anual_toneladas',
                alias: 'Volume Anual (toneladas)' // Input → number
            },
            'tipo-produto': {
                tabela: 'pesquisa',
                campo: 'tipo_produto',
                alias: 'Tipo de Produto'
            },
            'classe-produto': {
                tabela: 'pesquisa',
                campo: 'classe_produto',
                alias: 'Classe do Produto'
            },
            'produtos-especificos': {
                tabela: 'pesquisa',
                campo: 'produtos_especificos',
                alias: 'Produtos Específicos'
            },

            // ══════════════════════════════════════════════
            // 📋 PESQUISA - Q17-Q21 (Modal)
            // ══════════════════════════════════════════════
            'modal-predominante': {
                tabela: 'pesquisa',
                campo: 'modal_predominante',
                alias: 'Modal Predominante'
            },
            'modal-secundario': {
                tabela: 'pesquisa',
                campo: 'modal_secundario',
                alias: 'Modal Secundário'
            },
            'modal-terciario': {
                tabela: 'pesquisa',
                campo: 'modal_terciario',
                alias: 'Modal Terciário'
            },
            'proprio-terceirizado': {
                tabela: 'pesquisa',
                campo: 'proprio_terceirizado',
                alias: 'Próprio ou Terceirizado?'
            },
            'qtd-caminhoes-proprios': {
                tabela: 'pesquisa',
                campo: 'qtd_caminhoes_proprios',
                alias: 'Quantidade de Caminhões Próprios' // Input → integer
            },
            'qtd-caminhoes-terceirizados': {
                tabela: 'pesquisa',
                campo: 'qtd_caminhoes_terceirizados',
                alias: 'Quantidade de Caminhões Terceirizados' // Input → integer
            },

            // ══════════════════════════════════════════════
            // 📋 PESQUISA - Q22-Q26 (Frequência/Custo)
            // ══════════════════════════════════════════════
            'frequencia-envio': {
                tabela: 'pesquisa',
                campo: 'frequencia_envio',
                alias: 'Frequência de Envio'
            },
            'tempo-transporte': {
                tabela: 'pesquisa',
                campo: 'tempo_transporte',
                alias: 'Tempo de Transporte'
            },
            'custo-medio-tonelada': {
                tabela: 'pesquisa',
                campo: 'custo_medio_tonelada',
                alias: 'Custo Médio por Tonelada' // Input → number
            },
            'pedagio-custo': {
                tabela: 'pesquisa',
                campo: 'pedagio_custo',
                alias: 'Custo com Pedágio' // Input → number
            },
            'frete-custo': {
                tabela: 'pesquisa',
                campo: 'frete_custo',
                alias: 'Custo com Frete' // Input → number
            },
            'manutencao-custo': {
                tabela: 'pesquisa',
                campo: 'manutencao_custo',
                alias: 'Custo com Manutenção' // Input → number
            },
            'outros-custos': {
                tabela: 'pesquisa',
                campo: 'outros_custos',
                alias: 'Outros Custos' // Input → number
            },

            // ══════════════════════════════════════════════
            // 📋 PESQUISA - Q27-Q29 (Desafios/Sustentabilidade)
            // ══════════════════════════════════════════════
            'principais-desafios': {
                tabela: 'pesquisa',
                campo: 'principais_desafios',
                alias: 'Principais Desafios'
            },
            'investimento-sustentavel': {
                tabela: 'pesquisa',
                campo: 'investimento_sustentavel',
                alias: 'Investimento Sustentável'
            },
            'reducao-emissoes': {
                tabela: 'pesquisa',
                campo: 'reducao_emissoes',
                alias: 'Redução de Emissões'
            },

            // ══════════════════════════════════════════════
            // 📋 PESQUISA - Q30-Q34 (Tecnologia)
            // ══════════════════════════════════════════════
            'tecnologias-interesse': {
                tabela: 'pesquisa',
                campo: 'tecnologias_interesse',
                alias: 'Tecnologias de Interesse'
            },
            'uso-tecnologia': {
                tabela: 'pesquisa',
                campo: 'uso_tecnologia',
                alias: 'Uso de Tecnologia'
            },
            'grau-automacao': {
                tabela: 'pesquisa',
                campo: 'grau_automacao',
                alias: 'Grau de Automação'
            },
            'rastreamento-carga': {
                tabela: 'pesquisa',
                campo: 'rastreamento_carga',
                alias: 'Rastreamento de Carga'
            },
            'uso-dados': {
                tabela: 'pesquisa',
                campo: 'uso_dados',
                alias: 'Uso de Dados'
            },

            // ══════════════════════════════════════════════
            // 📋 PESQUISA - Q35-Q37 (Hidrovias)
            // ══════════════════════════════════════════════
            'conhecimento-hidrovias': {
                tabela: 'pesquisa',
                campo: 'conhecimento_hidrovias',
                alias: 'Conhecimento sobre Hidrovias'
            },
            'viabilidade-hidrovia': {
                tabela: 'pesquisa',
                campo: 'viabilidade_hidrovia',
                alias: 'Viabilidade de Hidrovia'
            },
            'pontos-melhoria': {
                tabela: 'pesquisa',
                campo: 'pontos_melhoria',
                alias: 'Pontos de Melhoria'
            },

            // ══════════════════════════════════════════════
            // 📋 PESQUISA - Q38 (Observações)
            // ══════════════════════════════════════════════
            'observacoes': {
                tabela: 'pesquisa',
                campo: 'observacoes',
                alias: 'Observações Adicionais'
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 🎬 INICIALIZAR INTEGRAÇÃO
     * ═══════════════════════════════════════════════════════════
     */
    init() {
        console.log('🔗 Inicializando integração Form → Payload...');

        // Conectar todos os campos do formulário
        Object.keys(this.fieldMappings).forEach(fieldId => {
            this.connectField(fieldId);
        });

        console.log(`✅ ${Object.keys(this.fieldMappings).length} campos conectados ao payload`);

        // Adicionar listener para debug
        this.payloadManager.addListener((tabela, campo, valor) => {
            console.log(`📝 ${tabela}.${campo} atualizado:`, valor);
        });

        // Listener para eventos de validação disparados pelo PayloadManager
        if (typeof window !== 'undefined') {
            window.addEventListener('payload:validation-error', (e) => {
                try {
                    const errors = e.detail.errors || [];
                    // Para cada erro, localizar o fieldId (mapeamento reverso) e mostrar mensagem
                    errors.forEach(err => {
                        const fieldIds = this.findFieldIdsFor(err.tabela, err.campo);
                        fieldIds.forEach(fid => {
                            const el = document.getElementById(fid);
                            if (el) this.showInlineError(el, err.erro || 'Erro de validação');
                        });
                    });
                } catch (err) {
                    console.error('Erro ao processar payload:validation-error:', err);
                }
            });
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 🔌 CONECTAR CAMPO AO PAYLOAD
     * ═══════════════════════════════════════════════════════════
     */
    connectField(fieldId) {
        const field = document.getElementById(fieldId);
        
        if (!field) {
            console.warn(`⚠️ Campo não encontrado: ${fieldId}`);
            return;
        }

    const mapping = this.fieldMappings[fieldId];

        // Detectar tipo de input
        const fieldType = field.type || field.tagName.toLowerCase();

        // Adicionar evento apropriado
        switch (fieldType) {
            case 'radio':
            case 'checkbox':
                // Para radio/checkbox, conectar todos os inputs com mesmo name
                const radioGroup = document.querySelectorAll(`[name="${field.name}"]`);
                radioGroup.forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        const valor = e.target.value;
                        this.updatePayload(mapping.tabela, mapping.campo, valor);
                    });
                });
                break;

            case 'select':
            case 'select-one':
                field.addEventListener('change', (e) => {
                    const valor = e.target.value;
                    this.updatePayload(mapping.tabela, mapping.campo, valor);
                });
                break;

            case 'textarea':
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
            case 'date':
            case 'time':
            default:
                // Atualizar ao digitar (com debounce)
                let timeout;
                field.addEventListener('input', (e) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        const valor = e.target.value;
                        this.validateAndUpdate(field, mapping, valor);
                    }, 300); // 300ms de delay
                });

                // Atualizar imediatamente ao sair do campo
                field.addEventListener('blur', (e) => {
            const valor = e.target.value;
            this.validateAndUpdate(field, mapping, valor);
                });
                break;
        }

        console.log(`✅ Campo conectado: ${fieldId} → ${mapping.tabela}.${mapping.campo}`);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 🔄 ATUALIZAR PAYLOAD
     * ═══════════════════════════════════════════════════════════
     */
    updatePayload(tabela, campo, valor) {
        try {
            this.payloadManager.updateField(tabela, campo, valor);
        } catch (error) {
            console.error(`❌ Erro ao atualizar ${tabela}.${campo}:`, error.message);
            
            // Mostrar erro ao usuário (opcional)
            // alert(`Erro: ${error.message}`);
        }
    }

    /**
     * Validar o valor localmente usando payloadManager.formatValue e
     * exibir feedback inline se houver erro; caso válido, atualizar payload.
     */
    validateAndUpdate(fieldElement, mapping, valor) {
        // Limpar erro visual anterior
        this.clearInlineError(fieldElement);

        try {
            // formatValue valida e pode lançar erro
            const formatted = this.payloadManager.formatValue(mapping.tabela, mapping.campo, valor);
            // Se chegou aqui, valor válido — atualizar no payload manager
            this.payloadManager.updateField(mapping.tabela, mapping.campo, formatted);
            // remover qualquer erro visual
            this.clearInlineError(fieldElement);
            // marcar sucesso visualmente (opcional)
            try {
                fieldElement.classList.remove('field-error');
                fieldElement.removeAttribute('aria-invalid');
                // podemos adicionar uma classe de sucesso se desejar
                // fieldElement.classList.add('field-success');
            } catch (e) {
                // ignore
            }
        } catch (err) {
            // mostrar mensagem inline
            this.showInlineError(fieldElement, err.message || 'Valor inválido');
            // registrar no payloadManager.validationErrors também
            try {
                this.payloadManager.validationErrors.push({ tabela: mapping.tabela, campo: mapping.campo, erro: err.message });
            } catch (e) {
                // ignore
            }
        }
    }

    // Mostrar mensagem de erro logo abaixo do campo
    showInlineError(fieldElement, message) {
        if (!fieldElement) return;
        // evitar duplicados
        this.clearInlineError(fieldElement);
        // aplicar classe de erro no input para destaque visual
        try {
            fieldElement.classList.add('field-error');
            fieldElement.setAttribute('aria-invalid', 'true');
        } catch (e) {
            // ignore
        }
        const small = document.createElement('small');
        small.className = 'validation-error-inline';
        small.style.color = '#b00020';
        small.style.display = 'block';
        small.style.marginTop = '4px';
        small.textContent = message;
        // Inserir após o campo
        if (fieldElement.parentNode) {
            fieldElement.parentNode.appendChild(small);
        } else {
            fieldElement.after(small);
        }
    }

    clearInlineError(fieldElement) {
        if (!fieldElement || !fieldElement.parentNode) return;
        const existing = fieldElement.parentNode.querySelector('.validation-error-inline');
        if (existing) existing.remove();
        try {
            fieldElement.classList.remove('field-error');
            fieldElement.removeAttribute('aria-invalid');
        } catch (e) {
            // ignore
        }
    }

    // Encontrar ids de campo que mapeiam para dada tabela+campo
    findFieldIdsFor(tabela, campo) {
        const ids = [];
        Object.keys(this.fieldMappings).forEach(fid => {
            const m = this.fieldMappings[fid];
            if (m && m.tabela === tabela && m.campo === campo) ids.push(fid);
        });
        return ids;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 📤 ENVIAR FORMULÁRIO
     * ═══════════════════════════════════════════════════════════
     */
    async submitForm() {
        console.log('📤 Iniciando envio do formulário...');

        try {
            // Mostrar payload atual (debug)
            this.payloadManager.debug();

            // Enviar
            const result = await this.payloadManager.submit();

            if (result.success) {
                console.log('✅ Formulário enviado com sucesso!', result.data);
                
                // Mostrar mensagem de sucesso
                alert('✅ Resposta salva com sucesso!\n\n' + 
                      `ID da Pesquisa: ${result.data.id_pesquisa}\n` +
                      `Empresa: ${result.data.razao_social}`);

                // Resetar formulário
                this.resetForm();

                return result;
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('❌ Erro ao enviar formulário:', error);

            // Exibir detalhes completos no console (DevTools)
            try {
                console.groupCollapsed('❌ FormPayloadIntegrator.submitForm - detalhes do erro');
                console.error('Erro lançado:', error);
                if (this.payloadManager) {
                    console.log('Validation errors:', this.payloadManager.validationErrors);
                    console.log('Payload snapshot:', this.payloadManager.payload);
                }
                console.groupEnd();
            } catch (e) {
                console.error('Erro ao logar detalhes do envio:', e);
            }

            alert('❌ Erro ao salvar resposta:\n\n' + error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 🔄 RESETAR FORMULÁRIO
     * ═══════════════════════════════════════════════════════════
     */
    resetForm() {
        // Resetar payload
        this.payloadManager.reset();

        // Resetar campos do HTML
        const form = document.getElementById('entrevista-form');
        if (form) {
            form.reset();
            // limpar classes de erro e mensagens inline de todos os campos mapeados
            Object.keys(this.fieldMappings).forEach(fid => {
                const el = document.getElementById(fid);
                if (el) this.clearInlineError(el);
            });
        }

        console.log('🔄 Formulário resetado');
    }
}

// ═══════════════════════════════════════════════════════════
// 🌍 EXPORTAR PARA USO GLOBAL
// ═══════════════════════════════════════════════════════════
window.FormPayloadIntegrator = FormPayloadIntegrator;
