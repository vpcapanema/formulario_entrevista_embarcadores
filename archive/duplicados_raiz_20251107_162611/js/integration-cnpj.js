/**
 * ============================================================
 * INTEGRATION-CNPJ - Auto-preenchimento via Receita Federal
 * ============================================================
 * Consulta CNPJ na Receita Federal (BrasilAPI) e preenche dados automaticamente
 * 
 * CAMPOS PREENCHIDOS (TABELA: empresas):
 * - razao_social (VARCHAR) ← API Receita: razao_social
 * - nome_fantasia (VARCHAR) ← API Receita: nome_fantasia
 * - municipio (VARCHAR) ← API Receita: municipio
 * - estado (VARCHAR) ← API Receita: uf
 * - logradouro (VARCHAR) ← API Receita: logradouro
 * - numero (VARCHAR) ← API Receita: numero
 * - bairro (VARCHAR) ← API Receita: bairro
 * - cep (VARCHAR) ← API Receita: cep
 * - complemento (VARCHAR) ← API Receita: complemento
 * 
 * FLUXO:
 * 1. Usuário digita CNPJ no campo cnpj-empresa
 * 2. onBlur → consulta CoreAPI.consultarCNPJ()
 * 3. Auto-preenche 9 campos da tabela empresas
 * 4. DropdownManager carrega municípios da UF retornada
 */

const IntegrationCNPJ = {
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
        // Dispara automaticamente ao sair do campo
        cnpjInput.addEventListener('blur', async (e) => {
            const cnpj = e.target.value;
            
            if (cnpj && cnpj.length >= 14) {
                await this.consultarEPreencherDados(cnpj);
            }
        });
        
        console.log('✅ IntegrationCNPJ inicializado (consulta automática ao terminar de digitar)');
    },
    
    // ============================================================
    // CONSULTAR E PREENCHER DADOS
    // ============================================================
    
    async consultarEPreencherDados(cnpj) {
        try {
            // Limpar CNPJ (remover pontos, barras, hífens)
            const cnpjLimpo = cnpj.replace(/\D/g, '');
            
            // Validar comprimento
            if (cnpjLimpo.length !== 14) {
                this._showMessage(
                    `❌ CNPJ incompleto!\n` +
                    `Digite os 14 dígitos (você digitou ${cnpjLimpo.length}).\n` +
                    `Formato: 00.000.000/0000-00`,
                    'error'
                );
                return;
            }
            
            // Mostrar loading
            this._showMessage('🔍 Consultando CNPJ na Receita Federal...', 'info');
            
            // Consultar API
            const response = await CoreAPI.consultarCNPJ(cnpjLimpo);
            
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
                        const municipios = await CoreAPI.getMunicipiosByUF(dados.uf);
                        
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
window.IntegrationCNPJ = IntegrationCNPJ;
// Compatibilidade com código antigo
window.CNPJAutoFill = IntegrationCNPJ;

IntegrationCNPJ.init();

