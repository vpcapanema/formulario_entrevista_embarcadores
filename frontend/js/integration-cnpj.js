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
        
        // Evento: Consulta automática após digitar 14 dígitos (CNPJ completo)
        // Dispara automaticamente enquanto usuário digita
        cnpjInput.addEventListener('input', async (e) => {
            const cnpj = e.target.value.replace(/\D/g, ''); // Remove formatação
            
            // Quando atingir 14 dígitos (CNPJ completo), consultar automaticamente
            if (cnpj.length === 14) {
                console.log('🔍 CNPJ completo digitado, consultando automaticamente...');
                await this.consultarEPreencherDados(cnpj);
            }
        });
        
        console.log('✅ IntegrationCNPJ inicializado (consulta automática após 14 dígitos)');
    },
    
    // ============================================================
    // NORMALIZAÇÃO DE MUNICÍPIO
    // ============================================================
    
    /**
     * Normaliza nome de município de UPPERCASE sem acentos para TitleCase com acentos
     * @param {string} municipio - Nome do município (ex: "SAO PAULO")
     * @returns {string} Nome normalizado (ex: "São Paulo")
     */
    _normalizarMunicipio(municipio) {
        if (!municipio) return '';
        
        // Mapa de substituições para restaurar acentuação
        const acentuacoes = {
            // Vogais acentuadas
            'A': { 'A': 'Á', 'A ': 'à', 'A~': 'Ã', 'A^': 'Â' },
            'E': { 'E': 'É', 'E ': 'È', 'E^': 'Ê' },
            'I': { 'I': 'Í' },
            'O': { 'O': 'Ó', 'O ': 'Ò', 'O~': 'Õ', 'O^': 'Ô' },
            'U': { 'U': 'Ú', 'U ': 'Ù' },
            'C': { 'C,': 'Ç' }
        };
        
        // Mapeamento específico de municípios comuns (lowercase para busca)
        const municipiosEspeciais = {
            'sao paulo': 'São Paulo',
            'sao jose dos campos': 'São José dos Campos',
            'sao bernardo do campo': 'São Bernardo do Campo',
            'sao caetano do sul': 'São Caetano do Sul',
            'sao vicente': 'São Vicente',
            'santo andre': 'Santo André',
            'ribeirao preto': 'Ribeirão Preto',
            'bauru': 'Bauru',
            'campinas': 'Campinas',
            'sorocaba': 'Sorocaba',
            'santos': 'Santos',
            'mogi das cruzes': 'Mogi das Cruzes',
            'diadema': 'Diadema',
            'piracicaba': 'Piracicaba',
            'carapicuiba': 'Carapicuíba',
            'itaquaquecetuba': 'Itaquaquecetuba',
            'guarulhos': 'Guarulhos',
            'osasco': 'Osasco',
            'jundiai': 'Jundiaí',
            'franca': 'Franca',
            'sao jose do rio preto': 'São José do Rio Preto',
            'marilia': 'Marília',
            'taubate': 'Taubaté',
            'limeira': 'Limeira',
            'suzano': 'Suzano',
            'taboao da serra': 'Taboão da Serra',
            'sumare': 'Sumaré',
            'barueri': 'Barueri',
            'embu das artes': 'Embu das Artes',
            'sao carlos': 'São Carlos',
            'maringa': 'Maringá',
            'londrina': 'Londrina',
            'brasilia': 'Brasília',
            'goiania': 'Goiânia',
            'belo horizonte': 'Belo Horizonte',
            'curitiba': 'Curitiba',
            'rio de janeiro': 'Rio de Janeiro',
            'porto alegre': 'Porto Alegre',
            'recife': 'Recife',
            'fortaleza': 'Fortaleza',
            'salvador': 'Salvador',
            'manaus': 'Manaus',
            'belem': 'Belém',
            'macapa': 'Macapá',
            'maceio': 'Maceió',
            'sao luis': 'São Luís',
            'teresina': 'Teresina',
            'natal': 'Natal',
            'joao pessoa': 'João Pessoa',
            'aracaju': 'Aracaju',
            'vitoria': 'Vitória',
            'campo grande': 'Campo Grande',
            'cuiaba': 'Cuiabá',
            'porto velho': 'Porto Velho',
            'rio branco': 'Rio Branco',
            'boa vista': 'Boa Vista',
            'palmas': 'Palmas'
        };
        
        // Converter para lowercase para busca
        const municipioLower = municipio.toLowerCase().trim();
        
        // Verificar se está no mapa de municípios especiais
        if (municipiosEspeciais[municipioLower]) {
            console.log(`✅ Município normalizado (mapa): ${municipio} → ${municipiosEspeciais[municipioLower]}`);
            return municipiosEspeciais[municipioLower];
        }
        
        // Fallback: Aplicar TitleCase básico
        const palavras = municipio.toLowerCase().split(' ');
        const palavrasMinusculas = ['da', 'de', 'do', 'das', 'dos', 'e']; // Preposições em minúscula
        
        const resultado = palavras.map((palavra, index) => {
            // Primeira palavra sempre maiúscula, outras verificam se são preposições
            if (index === 0 || !palavrasMinusculas.includes(palavra)) {
                return palavra.charAt(0).toUpperCase() + palavra.slice(1);
            }
            return palavra;
        }).join(' ');
        
        console.log(`✅ Município normalizado (titlecase): ${municipio} → ${resultado}`);
        return resultado;
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
            
            // DEBUG: Verificar o que a API retornou
            console.log('🔍 DEBUG: Dados retornados da API:', dados);
            console.log('🔍 DEBUG: razao_social =', dados.razao_social);
            console.log('🔍 DEBUG: municipio =', dados.municipio);
            
            // ============================================================
            // PREENCHER Q6b: RAZÃO SOCIAL (Nome da Empresa)
            // ============================================================
            const razaoSocialInput = document.getElementById('razao-social');
            console.log('🔍 DEBUG: Campo razao-social encontrado?', razaoSocialInput);
            console.log('🔍 DEBUG: Valor atual do campo:', razaoSocialInput?.value);
            
            if (razaoSocialInput && dados.razao_social) {
                razaoSocialInput.value = dados.razao_social;
                razaoSocialInput.dispatchEvent(new Event('change'));
                console.log(`✅ Q6b preenchido com: ${dados.razao_social}`);
                console.log('🔍 DEBUG: Valor do campo após preenchimento:', razaoSocialInput.value);
            } else {
                console.warn('⚠️ Campo razao-social não encontrado ou API não retornou razao_social');
            }
            
            // Preencher nome fantasia (se existir)
            const nomeFantasiaInput = document.getElementById('nome-fantasia');
            if (nomeFantasiaInput && dados.nome_fantasia) {
                nomeFantasiaInput.value = dados.nome_fantasia;
                nomeFantasiaInput.dispatchEvent(new Event('change'));
            }
            
            // ============================================================
            // PREENCHER CAMPOS INFORMATIVOS DA RECEITA FEDERAL (6c, 6d, 6e)
            // Campos readonly apenas para visualização
            // ============================================================
            
            // 6c: Nome Fantasia (campo informativo)
            const nomeFantasiaReceitaInput = document.getElementById('nome-fantasia-receita');
            if (nomeFantasiaReceitaInput) {
                nomeFantasiaReceitaInput.value = dados.nome_fantasia || 'Não informado';
                console.log(`✅ 6c preenchido: Nome Fantasia = ${dados.nome_fantasia || 'Não informado'}`);
            }
            
            // 6d: Situação Cadastral (campo informativo)
            const situacaoCadastralInput = document.getElementById('situacao-cadastral-receita');
            if (situacaoCadastralInput) {
                situacaoCadastralInput.value = dados.situacao_cadastral || 'Não informado';
                // Adicionar cor visual baseado no status
                if (dados.situacao_cadastral === 'ATIVA') {
                    situacaoCadastralInput.style.color = '#059669'; // Verde
                    situacaoCadastralInput.style.fontWeight = 'bold';
                } else {
                    situacaoCadastralInput.style.color = '#dc2626'; // Vermelho
                }
                console.log(`✅ 6d preenchido: Situação = ${dados.situacao_cadastral || 'Não informado'}`);
            }
            
            // 6e: Atividade Principal (campo informativo)
            const atividadePrincipalInput = document.getElementById('atividade-principal-receita');
            if (atividadePrincipalInput) {
                atividadePrincipalInput.value = dados.atividade_principal || 'Não informado';
                console.log(`✅ 6e preenchido: Atividade = ${dados.atividade_principal || 'Não informado'}`);
            }
            
            // Mostrar campos informativos (estavam ocultos)
            const camposReceitaFederal = document.getElementById('campos-receita-federal');
            const camposReceitaFederal2 = document.getElementById('campos-receita-federal-2');
            if (camposReceitaFederal) camposReceitaFederal.style.display = 'flex';
            if (camposReceitaFederal2) camposReceitaFederal2.style.display = 'flex';
            
            // ============================================================
            // PREENCHER Q7: MUNICÍPIO DA UNIDADE DE PRODUÇÃO (campo texto)
            // ============================================================
            const municipioInput = document.getElementById('municipio-empresa');
            console.log('🔍 DEBUG: Campo municipio-empresa encontrado?', municipioInput);
            console.log('🔍 DEBUG: Valor atual do campo:', municipioInput?.value);
            
            if (municipioInput && dados.municipio) {
                // Normalizar município de "SAO PAULO" para "São Paulo"
                const municipioNormalizado = this._normalizarMunicipio(dados.municipio);
                
                municipioInput.value = municipioNormalizado;
                municipioInput.dispatchEvent(new Event('change'));
                console.log(`✅ Q7 preenchido com: ${municipioNormalizado} (original: ${dados.municipio})`);
                console.log('🔍 DEBUG: Valor do campo após preenchimento:', municipioInput.value);
            } else {
                console.warn('⚠️ Campo municipio-empresa não encontrado ou API não retornou municipio');
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
            
            // Ocultar campos informativos da Receita Federal em caso de erro
            const camposReceitaFederal = document.getElementById('campos-receita-federal');
            const camposReceitaFederal2 = document.getElementById('campos-receita-federal-2');
            if (camposReceitaFederal) camposReceitaFederal.style.display = 'none';
            if (camposReceitaFederal2) camposReceitaFederal2.style.display = 'none';
            
            // Limpar valores dos campos informativos
            const nomeFantasiaReceitaInput = document.getElementById('nome-fantasia-receita');
            const situacaoCadastralInput = document.getElementById('situacao-cadastral-receita');
            const atividadePrincipalInput = document.getElementById('atividade-principal-receita');
            if (nomeFantasiaReceitaInput) nomeFantasiaReceitaInput.value = '';
            if (situacaoCadastralInput) situacaoCadastralInput.value = '';
            if (atividadePrincipalInput) atividadePrincipalInput.value = '';
            
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

