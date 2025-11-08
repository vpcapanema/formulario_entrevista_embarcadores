/**
 * SPA ROUTER - Navegação Multi-Page
 * Gerencia navegação entre arquivos HTML separados
 */

class SPARouter {
    constructor() {
        this.routes = {
            '/': 'index.html',
            '/formulario': 'index.html',
            '/respostas': 'respostas.html',
            '/analytics': 'analytics.html',
            '/instrucoes': 'instrucoes.html',
            '/visualizador': 'visualizador_dados.html'
        };
    }
    
    /**
     * Navega para uma página
     */
    navigate(pageName) {
        const fileName = this.getFileForPage(pageName);
        if (fileName) {
            // Navegação simples - abre na mesma aba
            window.location.href = `./${fileName}`;
        }
    }
    
    /**
     * Retorna o arquivo HTML para a página
     */
    getFileForPage(pageName) {
        switch(pageName) {
            case 'formulario': return 'index.html';
            case 'respostas': return 'respostas.html';
            case 'analytics': return 'analytics.html';
            case 'instrucoes': return 'instrucoes.html';
            case 'visualizador': return 'visualizador_dados.html';
            default: return 'index.html';
        }
    }
}

// Inicializar router
const router = new SPARouter();

// Exportar para uso global
window.router = router;

console.log('✅ Multi-Page Router carregado - navegação entre arquivos HTML');
