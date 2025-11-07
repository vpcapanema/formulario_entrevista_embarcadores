/**
 * NAVBAR - Navegação Simples entre Páginas
 * Cada botão abre uma nova aba
 */

function navegarPara(pagina) {
    const urls = {
        'formulario': '/html/index.html',
        'respostas': '/html/respostas.html',
        'analytics': '/html/analytics.html',
        'instrucoes': '/html/instrucoes.html',
        'visualizador': '/html/visualizador_dados.html'
    };
    
    const url = urls[pagina];
    if (url) {
        window.open(url, '_blank');
    }
}

console.log('✅ Navbar carregado - navegarPara() disponível');
