/**
 * SPA ROUTER - Navegação com URLs limpas
 * Gerencia navegação entre páginas sem recarregar, usando History API
 */

class SPARouter {
    constructor() {
        this.routes = {
            '/': 'formulario',
            '/formulario': 'formulario',
            '/respostas': 'respostas',
            '/analytics': 'analytics',
            '/instrucoes': 'instrucoes',
            '/visualizador': 'visualizador'
        };
        
        this.init();
    }
    
    init() {
        // Interceptar cliques nos botões de navegação
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.showPage(e.state.page, false);
            }
        });
        
        // Carregar página inicial baseada na URL
        const path = window.location.pathname.replace('/formulario_entrevista_embarcadores/frontend/html/index.html', '');
        const initialPage = this.routes[path] || 'formulario';
        this.showPage(initialPage, true);
    }
    
    navigate(pageName) {
        const path = this.getPathForPage(pageName);
        history.pushState({ page: pageName }, '', path);
        this.showPage(pageName, false);
    }
    
    getPathForPage(pageName) {
        // Retorna o caminho limpo baseado na página
        const baseUrl = '/formulario_entrevista_embarcadores/frontend/html/index.html';
        switch(pageName) {
            case 'formulario': return `${baseUrl}`;
            case 'respostas': return `${baseUrl}#respostas`;
            case 'analytics': return `${baseUrl}#analytics`;
            case 'instrucoes': return `${baseUrl}#instrucoes`;
            case 'visualizador': return `${baseUrl}#visualizador`;
            default: return baseUrl;
        }
    }
    
    showPage(pageName, isInitial) {
        // Esconder todas as seções
        document.querySelectorAll('.page-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar a seção correspondente
        const pageMap = {
            'formulario': 'form-page',
            'respostas': 'respostas-page',
            'analytics': 'analytics-page',
            'instrucoes': 'instrucoes-page',
            'visualizador': 'visualizador-page'
        };
        
        const sectionId = pageMap[pageName];
        if (sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'block';
            }
        }
        
        // Atualizar botões ativos da navbar
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[onclick*="${pageName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Scroll para o topo
        if (!isInitial) {
            window.scrollTo(0, 0);
        }
    }
}

// Inicializar router
let router;

// Esperar DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        router = new SPARouter();
    });
} else {
    router = new SPARouter();
}

console.log('✅ SPA Router carregado - navegação com URLs limpas habilitada');
