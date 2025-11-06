// =====================================================
// CONFIGURAÇÃO DA API - SISTEMA PLI 2050
// =====================================================

// IMPORTANTE: Após fazer deploy do backend, atualize a URL abaixo
const API_CONFIG = {
    // URL da API em produção (atualizar após deploy)
    PRODUCTION_URL: 'https://sua-api-aqui.herokuapp.com',
    
    // URL para desenvolvimento local (FastAPI na porta 8000)
    DEVELOPMENT_URL: 'http://localhost:8000',
    
    // Detecta automaticamente o ambiente
    get BASE_URL() {
        // Se estiver rodando no GitHub Pages
        if (window.location.hostname.includes('github.io')) {
            return this.PRODUCTION_URL;
        }
        // Se estiver rodando localmente
        return this.DEVELOPMENT_URL;
    },
    
    // Endpoints
    ENDPOINTS: {
        // Listas auxiliares
        instituicoes: '/api/instituicoes',
        estados: '/api/estados',
        paises: '/api/paises',
        municipios: '/api/municipios',
        funcoes: '/api/funcoes',
        
        // Entrevistadores
        entrevistadores: '/api/entrevistadores',
        
        // Empresas
        empresas: '/api/empresas',
        
        // Entrevistados
        entrevistados: '/api/entrevistados',
        
        // Pesquisas
        pesquisas: '/api/pesquisas',
        
        // Analytics
        kpis: '/api/analytics/kpis',
        distribuicaoModal: '/api/analytics/distribuicao-modal',
        produtosRanking: '/api/analytics/produtos-ranking',
        
        // Health
        health: '/health'
    },
    
    // Timeout padrão para requests (ms)
    TIMEOUT: 30000,
    
    // Retry automático em caso de falha
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// =====================================================
// CLASSE DE CLIENTE API
// =====================================================

class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
        this.retryDelay = API_CONFIG.RETRY_DELAY;
    }
    
    /**
     * Faz requisição GET
     */
    async get(endpoint, options = {}) {
        return this._request('GET', endpoint, null, options);
    }
    
    /**
     * Faz requisição POST
     */
    async post(endpoint, data, options = {}) {
        return this._request('POST', endpoint, data, options);
    }
    
    /**
     * Faz requisição PUT
     */
    async put(endpoint, data, options = {}) {
        return this._request('PUT', endpoint, data, options);
    }
    
    /**
     * Faz requisição DELETE
     */
    async delete(endpoint, options = {}) {
        return this._request('DELETE', endpoint, null, options);
    }
    
    /**
     * Método interno para fazer requisições com retry
     */
    async _request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        if (data) {
            config.body = JSON.stringify(data);
        }
        
        // Implementar retry
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.error || `HTTP ${response.status}`);
                }
                
                return await response.json();
                
            } catch (error) {
                console.error(`Tentativa ${attempt}/${this.retryAttempts} falhou:`, error);
                
                // Se for o último attempt ou erro de timeout, lança exceção
                if (attempt === this.retryAttempts || error.name === 'AbortError') {
                    throw error;
                }
                
                // Aguarda antes de tentar novamente
                await this._sleep(this.retryDelay * attempt);
            }
        }
    }
    
    /**
     * Função auxiliar para aguardar
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Verifica se a API está online
     */
    async healthCheck() {
        try {
            const response = await this.get(API_CONFIG.ENDPOINTS.health);
            return response.status === 'OK';
        } catch (error) {
            console.error('Health check falhou:', error);
            return false;
        }
    }
}

// =====================================================
// INSTÂNCIA GLOBAL DO CLIENTE API
// =====================================================

const api = new APIClient();

// =====================================================
// FUNÇÕES DE CONVENIÊNCIA
// =====================================================

/**
 * Carrega listas auxiliares
 */
async function carregarListasAuxiliares() {
    try {
        const [instituicoes, estados, paises, municipios, funcoes] = await Promise.all([
            api.get(API_CONFIG.ENDPOINTS.instituicoes),
            api.get(API_CONFIG.ENDPOINTS.estados),
            api.get(API_CONFIG.ENDPOINTS.paises),
            api.get(API_CONFIG.ENDPOINTS.municipios),
            api.get(API_CONFIG.ENDPOINTS.funcoes)
        ]);
        
        return { instituicoes, estados, paises, municipios, funcoes };
    } catch (error) {
        console.error('Erro ao carregar listas auxiliares:', error);
        throw error;
    }
}

/**
 * Salva pesquisa completa
 */
async function salvarPesquisa(dadosPesquisa) {
    try {
        const response = await api.post(API_CONFIG.ENDPOINTS.pesquisas, dadosPesquisa);
        console.log('Pesquisa salva com sucesso:', response);
        return response;
    } catch (error) {
        console.error('Erro ao salvar pesquisa:', error);
        throw error;
    }
}

/**
 * Carrega todas as pesquisas
 */
async function carregarPesquisas() {
    try {
        return await api.get(API_CONFIG.ENDPOINTS.pesquisas);
    } catch (error) {
        console.error('Erro ao carregar pesquisas:', error);
        throw error;
    }
}

/**
 * Carrega KPIs para analytics
 */
async function carregarKPIs() {
    try {
        return await api.get(API_CONFIG.ENDPOINTS.kpis);
    } catch (error) {
        console.error('Erro ao carregar KPIs:', error);
        throw error;
    }
}

/**
 * Carrega distribuição modal
 */
async function carregarDistribuicaoModal() {
    try {
        return await api.get(API_CONFIG.ENDPOINTS.distribuicaoModal);
    } catch (error) {
        console.error('Erro ao carregar distribuição modal:', error);
        throw error;
    }
}

// =====================================================
// VERIFICAR CONEXÃO COM API AO CARREGAR PÁGINA
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔍 Verificando conexão com API...');
    console.log('📡 URL da API:', API_CONFIG.BASE_URL);
    
    const isOnline = await api.healthCheck();
    
    if (isOnline) {
        console.log('✅ API online e funcionando!');
    } else {
        console.warn('⚠️ API offline ou inacessível');
        console.warn('💡 Verifique se o backend está rodando em:', API_CONFIG.BASE_URL);
    }
});
