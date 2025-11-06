/**
 * ============================================================
 * CNPJ AUTO-FILL - PLI 2050
 * ============================================================
 * Preenche automaticamente dados da empresa ao digitar CNPJ
 * - Q6b: Razão Social (nome da empresa)
 * - Q7: Município da unidade de produção
 */

const CNPJAutoFill = {
    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._setup());
        } else {
            this._setup();
        }
    },
    
    _setup() {
        const cnpjInput = document.getElementById('cnpj-empresa');
        
        if (!cnpjInput) {
            console.warn('⚠️ Campo CNPJ não encontrado');
            return;
        }
        
        // Evento: Quando usuário terminar de digitar CNPJ (blur)
        cnpjInput.addEventListener('blur', async (e) => {
            const cnpj = e.target.value;
            
            if (cnpj && cnpj.length >= 14) {
                await this.consultarEPreencherDados(cnpj);
            }
        });
        
        // Adicionar botão de consulta ao lado do campo CNPJ
        this._addConsultarButton(cnpjInput);
        
        console.log('✅ CNPJ Auto-Fill inicializado');
    },
    
    // ============================================================
    // ADICIONAR BOTÃO "CONSULTAR CNPJ"
    // ============================================================
    
    _addConsultarButton(cnpjInput) {
        // Criar botão
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-consultar-cnpj';
        button.innerHTML = '🔍 Buscar na Receita Federal';
        button.style.cssText = `
            margin-left: 10px;
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        `;
        
        button.addEventListener('mouseover', () => {
            button.style.background = '#0056b3';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.background = '#007bff';
        });
        
        button.addEventListener('click', async () => {
            const cnpj = cnpjInput.value;
            if (cnpj) {
                await this.consultarEPreencherDados(cnpj);
            } else {
                this._showMessage('⚠️ Digite o CNPJ primeiro', 'warning');
            }
        });
        
        // Inserir botão após o campo CNPJ
        cnpjInput.parentNode.appendChild(button);
    },
    
    // ============================================================
    // CONSULTAR E PREENCHER DADOS
    // ============================================================
    
    async consultarEPreencherDados(cnpj) {
        try {
            // Mostrar loading
            this._showMessage('🔍 Consultando CNPJ na Receita Federal...', 'info');
            
            // Consultar API
            const response = await API.consultarCNPJ(cnpj);
            
            if (!response.success) {
                this._showMessage('❌ ' + response.message, 'error');
                return;
            }
            
            const dados = response.data;
            
            // ============================================================
            // PREENCHER Q6b: RAZÃO SOCIAL
            // ============================================================
            const razaoSocialInput = document.getElementById('nome-empresa');
            if (razaoSocialInput) {
                razaoSocialInput.value = dados.razao_social;
                razaoSocialInput.dispatchEvent(new Event('change'));
                console.log(`✅ Q6b preenchido: ${dados.razao_social}`);
            }
            
            // Preencher nome fantasia (se existir)
            const nomeFantasiaInput = document.getElementById('nome-fantasia');
            if (nomeFantasiaInput && dados.nome_fantasia) {
                nomeFantasiaInput.value = dados.nome_fantasia;
                nomeFantasiaInput.dispatchEvent(new Event('change'));
            }
            
            // ============================================================
            // PREENCHER Q7: MUNICÍPIO DA UNIDADE DE PRODUÇÃO
            // ============================================================
            
            // A Q7 tem apenas um dropdown simples (municipio-empresa)
            // Vamos buscar o município pelo NOME (API retorna nome em uppercase sem acentos)
            const municipioSelect = document.getElementById('municipio-empresa');
            if (municipioSelect && dados.municipio) {
                // API da Receita retorna NOME do município (ex: "BRASILIA"), não código IBGE
                const nomeMunicipioAPI = dados.municipio;
                
                // Se o dropdown ainda não estiver populado, carregar municípios da UF
                if (municipioSelect.options.length <= 1) {
                    console.log(`🔄 Carregando municípios de ${dados.uf}...`);
                    
                    try {
                        const municipios = await API.getMunicipiosByUF(dados.uf);
                        
                        // Limpar dropdown
                        municipioSelect.innerHTML = '<option value="">Selecione o município</option>';
                        
                        // Adicionar opções (ATENÇÃO: Colunas reais da tabela dim_municipio)
                        municipios.forEach(mun => {
                            const option = document.createElement('option');
                            option.value = mun.cd_mun; // CÓDIGO IBGE 7 dígitos
                            option.textContent = mun.nm_mun; // NOME DO MUNICÍPIO
                            municipioSelect.appendChild(option);
                        });
                    } catch (error) {
                        console.error('❌ Erro ao carregar municípios:', error);
                    }
                }
                
                // Aguardar um pouco para dropdown popular
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Normalizar nome para comparação (remove acentos e converte para uppercase)
                const normalizar = (str) => {
                    return str
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toUpperCase()
                        .trim();
                };
                
                const nomeNormalizado = normalizar(nomeMunicipioAPI);
                
                // Procurar opção comparando TEXTO normalizado (não código)
                const optionMunicipio = Array.from(municipioSelect.options).find(
                    opt => normalizar(opt.textContent) === nomeNormalizado
                );
                
                if (optionMunicipio) {
                    municipioSelect.value = optionMunicipio.value; // Seleciona pelo código IBGE
                    municipioSelect.dispatchEvent(new Event('change'));
                    console.log(`✅ Q7 preenchido: ${optionMunicipio.textContent} (${optionMunicipio.value})`);
                } else {
                    console.warn(`⚠️ Município "${nomeMunicipioAPI}" não encontrado no dropdown de ${dados.uf}`);
                }
            }
            
            // ============================================================
            // PREENCHER OUTROS CAMPOS (ENDEREÇO)
            // ============================================================
            
            if (dados.cep) {
                const cepInput = document.getElementById('cep');
                if (cepInput) cepInput.value = dados.cep;
            }
            
            if (dados.logradouro) {
                const logradouroInput = document.getElementById('logradouro');
                if (logradouroInput) logradouroInput.value = dados.logradouro;
            }
            
            if (dados.numero) {
                const numeroInput = document.getElementById('numero');
                if (numeroInput) numeroInput.value = dados.numero;
            }
            
            if (dados.bairro) {
                const bairroInput = document.getElementById('bairro');
                if (bairroInput) bairroInput.value = dados.bairro;
            }
            
            // Mostrar sucesso
            this._showMessage(
                `✅ Dados preenchidos automaticamente!\n📍 ${dados.razao_social}\n🏙️ ${dados.uf}`,
                'success'
            );
            
        } catch (error) {
            console.error('❌ Erro ao consultar CNPJ:', error);
            
            if (error.status === 404) {
                this._showMessage('❌ CNPJ não encontrado na Receita Federal', 'error');
            } else if (error.status === 400) {
                this._showMessage('❌ CNPJ inválido (deve ter 14 dígitos)', 'error');
            } else {
                this._showMessage('❌ Erro ao consultar Receita Federal. Tente novamente.', 'error');
            }
        }
    },
    
    // ============================================================
    // UTILITÁRIO: MOSTRAR MENSAGEM
    // ============================================================
    
    _showMessage(message, type = 'info') {
        // Criar/atualizar elemento de mensagem
        let messageDiv = document.getElementById('cnpj-message');
        
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'cnpj-message';
            messageDiv.style.cssText = `
                margin-top: 10px;
                padding: 12px;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                white-space: pre-line;
            `;
            
            const cnpjInput = document.getElementById('cnpj-empresa');
            cnpjInput.parentNode.appendChild(messageDiv);
        }
        
        // Cores por tipo
        const colors = {
            info: { bg: '#d1ecf1', text: '#0c5460', border: '#bee5eb' },
            success: { bg: '#d4edda', text: '#155724', border: '#c3e6cb' },
            warning: { bg: '#fff3cd', text: '#856404', border: '#ffeaa7' },
            error: { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' }
        };
        
        const color = colors[type] || colors.info;
        
        messageDiv.style.backgroundColor = color.bg;
        messageDiv.style.color = color.text;
        messageDiv.style.border = `1px solid ${color.border}`;
        messageDiv.textContent = message;
        
        // Auto-remover mensagens info após 5s
        if (type === 'info') {
            setTimeout(() => {
                if (messageDiv && messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
};

// Exportar e inicializar
window.CNPJAutoFill = CNPJAutoFill;
CNPJAutoFill.init();

