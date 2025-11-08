/**
 * NAVBAR - Navegação com SPA Router
 * Usa History API para URLs limpas sem recarregar
 */

function navegarPara(pagina) {
    // Se o router estiver disponível, usa navegação SPA
    if (window.router) {
        window.router.navigate(pagina);
    } else {
        // Fallback: abrir em nova aba (caso router não carregue)
        const urls = {
            'formulario': './index.html',
            'respostas': './respostas.html',
            'analytics': './analytics.html',
            'instrucoes': './instrucoes.html',
            'visualizador': './visualizador_dados.html'
        };
        
        const url = urls[pagina];
        if (url) {
            window.open(url, '_blank');
        }
    }
}

console.log('✅ Navbar carregado - navegarPara() disponível');
