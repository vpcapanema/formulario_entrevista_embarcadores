/**
 * ============================================================
 * CORE-API - Comunicação com Backend FastAPI
 * ============================================================
 * Interface única para comunicação HTTP
 * Detecta automaticamente ambiente (dev/prod)
 * Implementa retry e tratamento de erros
 * 
 * TABELAS DO BANCO MANIPULADAS:
 * - empresas (19 colunas): nome_empresa, tipo_empresa, cnpj, municipio, etc
 * - entrevistados (9 colunas): nome, funcao, telefone, email
 * - pesquisas (89 colunas): produto_principal, origem_pais, destino_pais, etc
 * - produtos_transportados: produto, movimentacao_anual, origem_pais, etc
 * 
 * ENDPOINTS:
 * - POST /api/submit-form → INSERT em 4 tabelas
 * - GET /api/analytics/* → SELECT agregações
 * - GET /lists/*.json → Arquivos JSON estáticos (países, estados, municípios)
 */

const CoreAPI = {
    // ============================================================
    // CONFIGURAÇÃO DE AMBIENTE
    // ============================================================
    
    get BASE_URL() {
        // Auto-detecção: produção (GitHub Pages) ou desenvolvimento (localhost)
        const hostname = window.location.hostname;
        
        if (hostname.includes('github.io')) {
            return 'https://sua-api-producao.onrender.com'; // Atualizar após deploy
        }
        
        return 'http://localhost:8000';
    },
    
    // ============================================================
    // CONFIGURAÇÃO DE RETRY
    // ============================================================
    
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // ms
    
    /**
     * Faz requisição HTTP com retry automático
     */
    async request(url, options = {}) {
        const fullUrl = `${this.BASE_URL}${url}`;
        
        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                const response = await fetch(fullUrl, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    }
                });
                
                // Se resposta OK, retornar JSON
                if (response.ok) {
                    return await response.json();
                }
                
                // Se erro 4xx/5xx, lançar exceção com detalhes
                const errorData = await response.json().catch(() => ({}));
                throw {
                    status: response.status,
                    message: errorData.detail || response.statusText,
                    data: errorData
                };
                
            } catch (error) {
                console.error(`Tentativa ${attempt}/${this.MAX_RETRIES} falhou:`, error);
                
                // Se última tentativa, lançar erro
                if (attempt === this.MAX_RETRIES) {
                    throw error;
                }
                
                // Aguardar antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
            }
        }
    },
    
    // ============================================================
    // MÉTODOS HTTP
    // ============================================================
    
    async get(url) {
        return this.request(url, { method: 'GET' });
    },
    
    async post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // ============================================================
    // ENDPOINTS ESPECÍFICOS
    // ============================================================
    
    /**
     * Health check - testa se backend está online
     */
    async healthCheck() {
        return this.get('/health');
    },
    
    /**
     * Submete formulário completo
     * @param {Object} formData - Dados coletados do formulário
     * @returns {Promise<Object>} Resposta com IDs das entidades criadas
     */
    async submitForm(formData) {
        return this.post('/api/submit-form', formData);
    },
    
    // ============================================================
    // LISTAS AUXILIARES (DROPDOWNS) - CARREGAMENTO ULTRA-RÁPIDO
    // ============================================================
    // ESTRATÉGIA: Cache em memória + fetch com force-cache
    // JSONs são servidos como arquivos estáticos (0ms de backend)
    
    _cache: {}, // Cache em memória (1ª requisição: rede, demais: RAM)
    
    /**
     * Carrega JSON estático com CACHE AGRESSIVO
     * @param {string} fileName - Nome do arquivo (ex: 'estados.json')
     * @returns {Promise<Array|Object>}
     */
    async loadJSONFast(fileName) {
        // 1. Cache em memória (mais rápido)
        if (this._cache[fileName]) {
            console.log(`⚡ RAM cache: ${fileName} (0ms)`);
            return this._cache[fileName];
        }
        
        try {
            const startTime = performance.now();
            
            // 2. Fetch com caminho ABSOLUTO (FastAPI monta em /lists/)
            const response = await fetch(`/lists/${fileName}`, {
                method: 'GET',
                cache: 'force-cache' // Prioriza cache do navegador
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${fileName} não encontrado`);
            }
            
            const data = await response.json();
            this._cache[fileName] = data; // Salvar na RAM
            
            const elapsed = (performance.now() - startTime).toFixed(1);
            const count = Array.isArray(data) ? data.length : 1;
            console.log(`✅ ${fileName}: ${count} registros em ${elapsed}ms`);
            
            return data;
            
        } catch (error) {
            console.error(`❌ Erro ao carregar ${fileName}:`, error);
            throw error;
        }
    },
    
    /**
     * Carrega estados do Brasil (27 registros)
     */
    async getEstados() {
        return this.loadJSONFast('estados.json');
    },
    
    /**
     * Carrega países (61 registros)
     */
    async getPaises() {
        return this.loadJSONFast('paises.json');
    },
    
    /**
     * Carrega funções de entrevistados (12 registros)
     */
    async getFuncoes() {
        return this.loadJSONFast('funcoes.json');
    },
    
    /**
     * Carrega instituições parceiras (1 registro)
     */
    async getInstituicoes() {
        return this.loadJSONFast('instituicoes.json');
    },
    
    /**
     * Carrega entrevistadores ativos (2 registros)
     */
    async getEntrevistadores() {
        return this.loadJSONFast('entrevistadores.json');
    },
    
    /**
     * Carrega municípios por UF (sob demanda)
     * @param {string} uf - Sigla do estado (SP, RJ, DF, etc)
     */
    async getMunicipiosByUF(uf) {
        if (!uf) return [];
        const ufUpper = uf.toUpperCase();
        return this.loadJSONFast(`municipios_por_uf/${ufUpper}.json`);
    },
    
    /**
     * @deprecated NÃO USAR - 2.85 MB de JSON
     * Use getMunicipiosByUF(uf) para carregar sob demanda
     */
    async getMunicipios() {
        console.error('❌ getMunicipios() NÃO DEVE SER USADO - Use getMunicipiosByUF(uf)');
        throw new Error('Use getMunicipiosByUF(uf) para carregar municípios por UF');
    },
    
    // ============================================================
    // ANALYTICS (NOVOS ENDPOINTS)
    // ============================================================
    
    async getKPIs() {
        return this.get('/api/analytics/kpis');
    },
    
    async getDistribuicaoModal() {
        return this.get('/api/analytics/distribuicao-modal');
    },
    
    async getOrigemDestino() {
        return this.get('/api/analytics/origem-destino');
    },
    
    async getTipoTransporte() {
        return this.get('/api/analytics/tipo-transporte');
    },
    
    async getProdutosTop() {
        return this.get('/api/analytics/produtos-top');
    },
    
    async getImportancias() {
        return this.get('/api/analytics/importancias');
    },
    
    async getFrequencia() {
        return this.get('/api/analytics/frequencia');
    },
    
    async getDificuldades() {
        return this.get('/api/analytics/dificuldades');
    },
    
    // ============================================================
    // CONSULTAS EXTERNAS (RECEITA FEDERAL)
    // ============================================================
    
    /**
     * Consulta CNPJ na Receita Federal via BrasilAPI
     * @param {string} cnpj - CNPJ com ou sem formatação
     * @returns {Promise<Object>} Dados da empresa (razão social, município, etc)
     */
    async consultarCNPJ(cnpj) {
        // Remove formatação do CNPJ
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        
        if (cnpjLimpo.length !== 14) {
            throw {
                status: 400,
                message: 'CNPJ deve ter 14 dígitos'
            };
        }
        
        return this.get(`/api/external/cnpj/${cnpjLimpo}`);
    },
    
    /**
     * Valida se CNPJ existe e está ativo
     * @param {string} cnpj - CNPJ com ou sem formatação
     * @returns {Promise<Object>} {valido: boolean, ativo: boolean}
     */
    async validarCNPJ(cnpj) {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        return this.get(`/api/external/cnpj/${cnpjLimpo}/validar`);
    },
    
    // ============================================================
    // UTILITÁRIOS
    // ============================================================
    
    /**
     * Testa conectividade com backend
     * @returns {Promise<boolean>}
     */
    async testConnection() {
        try {
            const result = await this.healthCheck();
            return result.status === 'OK';
        } catch (error) {
            console.error('Backend não está acessível:', error);
            return false;
        }
    }
};

// Exportar para uso global
window.CoreAPI = CoreAPI;
// Compatibilidade com código antigo
window.API = CoreAPI;
