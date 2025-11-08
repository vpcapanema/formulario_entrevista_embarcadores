/**
 * NAVBAR - Navegação Simples entre Páginas
 * Cada botão abre uma nova aba
 */

function navegarPara(pagina) {
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

console.log('✅ Navbar carregado - navegarPara() disponível');
