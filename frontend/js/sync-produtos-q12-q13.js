/**
 * Sincronização entre Tabela de Produtos (Q8) e Campos Q12/Q13
 * ============================================================
 * 
 * OBJETIVO:
 * Os campos Q12 (Origem) e Q13 (Destino) devem ser preenchidos automaticamente
 * com base nas escolhas feitas na tabela de produtos.
 * 
 * LÓGICA:
 * 1. Se produto 1 tiver origem=Brasil/SP e destino=Brasil/RJ
 *    → Q12 e Q13 são preenchidos automaticamente com esses valores
 * 
 * 2. Se múltiplos produtos tiverem mesma origem/destino
 *    → Usa essa origem/destino comum
 * 
 * 3. Se produtos tiverem origens/destinos diferentes
 *    → Usa a origem/destino do PRIMEIRO produto
 */

const SincProdutosQ12Q13 = {
    // Cache de produtos atuais
    _ultimosProdutos: {
        origem: { pais: '', estado: '', municipio: '' },
        destino: { pais: '', estado: '', municipio: '' }
    },

    /**
     * Inicializa sincronização
     */
    init() {
        console.log('🔄 SincProdutosQ12Q13.init() iniciado');

        // Monitorar mudanças na tabela de produtos
        this._observarMudancasProdutos();

        // Sincronizar ao carregar a página (caso haja dados pré-carregados)
        setTimeout(() => {
            this.sincronizar();
        }, 500);
    },

    /**
     * Observa mudanças em tempo real na tabela de produtos
     */
    _observarMudancasProdutos() {
        const tbody = document.getElementById('produtos-tbody');
        if (!tbody) {
            console.warn('⚠️  #produtos-tbody não encontrado');
            return;
        }

        // MutationObserver para detectar adição/remoção de linhas
        const observer = new MutationObserver((mutations) => {
            // Aguardar um pouco para a linha renderizar completamente
            setTimeout(() => {
                this.sincronizar();
            }, 100);
        });

        observer.observe(tbody, {
            childList: true, // Detecta adição/remoção de tr
            subtree: true,   // Detecta mudanças em inputs/selects dentro das linhas
        });

        // Também monitorar mudanças diretas em inputs/selects existentes
        document.addEventListener('change', (e) => {
            if (
                e.target.name && (
                    e.target.name.includes('produto-origem-pais') ||
                    e.target.name.includes('produto-origem-estado') ||
                    e.target.name.includes('produto-origem-municipio') ||
                    e.target.name.includes('produto-destino-pais') ||
                    e.target.name.includes('produto-destino-estado') ||
                    e.target.name.includes('produto-destino-municipio')
                )
            ) {
                setTimeout(() => {
                    this.sincronizar();
                }, 100);
            }
        });
    },

    /**
     * Sincroniza Q12/Q13 com dados dos produtos
     */
    sincronizar() {
        console.log('🔄 Sincronizando Q12/Q13 com tabela de produtos...');

        const produtos = this._extrairDadosProdutos();

        if (produtos.length === 0) {
            console.log('   ℹ️  Nenhum produto preenchido');
            return;
        }

        // Usar origem/destino do PRIMEIRO produto como referência
        const produtoReferencia = produtos[0];

        // Verificar se todos os produtos têm a mesma origem/destino
        const mesmaOrigem = produtos.every(p => 
            p.origem.pais === produtoReferencia.origem.pais &&
            p.origem.estado === produtoReferencia.origem.estado &&
            p.origem.municipio === produtoReferencia.origem.municipio
        );

        const mesmoDestino = produtos.every(p => 
            p.destino.pais === produtoReferencia.destino.pais &&
            p.destino.estado === produtoReferencia.destino.estado &&
            p.destino.municipio === produtoReferencia.destino.municipio
        );

        if (mesmaOrigem) {
            console.log(`   ✅ Todos os ${produtos.length} produto(s) têm MESMA origem`);
        } else {
            console.log(`   ⚠️  Produtos com origens DIFERENTES - usando origem do 1º produto`);
        }

        if (mesmoDestino) {
            console.log(`   ✅ Todos os ${produtos.length} produto(s) têm MESMO destino`);
        } else {
            console.log(`   ⚠️  Produtos com destinos DIFERENTES - usando destino do 1º produto`);
        }

        // Preenchera Q12 (Origem)
        this._preencherOrigem(produtoReferencia.origem);

        // Preencher Q13 (Destino)
        this._preencherDestino(produtoReferencia.destino);
    },

    /**
     * Extrai dados de origem/destino de todos os produtos
     */
    _extrairDadosProdutos() {
        const produtos = [];
        const rows = document.querySelectorAll('#produtos-tbody tr[id^="produto-row-"]');

        rows.forEach((row) => {
            const idParts = (row.id || '').split('-');
            const rowNum = idParts[idParts.length - 1];

            // Buscar selects de origem
            const origemPaisSelect = row.querySelector(`[name="produto-origem-pais-${rowNum}"]`);
            const origemEstadoSelect = row.querySelector(`[name="produto-origem-estado-${rowNum}"]`);
            const origemMunicipioSelect = row.querySelector(`[name="produto-origem-municipio-${rowNum}"]`);

            // Buscar selects de destino
            const destinoPaisSelect = row.querySelector(`[name="produto-destino-pais-${rowNum}"]`);
            const destinoEstadoSelect = row.querySelector(`[name="produto-destino-estado-${rowNum}"]`);
            const destinoMunicipioSelect = row.querySelector(`[name="produto-destino-municipio-${rowNum}"]`);

            // Extrair valores
            const origemPaisCodigo = origemPaisSelect ? origemPaisSelect.value || '' : '';
            const origemEstadoUf = origemEstadoSelect ? origemEstadoSelect.value || '' : '';
            const origemMunicipioCodigo = origemMunicipioSelect ? origemMunicipioSelect.value || '' : '';

            const destinoPaisCodigo = destinoPaisSelect ? destinoPaisSelect.value || '' : '';
            const destinoEstadoUf = destinoEstadoSelect ? destinoEstadoSelect.value || '' : '';
            const destinoMunicipioCodigo = destinoMunicipioSelect ? destinoMunicipioSelect.value || '' : '';

            // Só incluir se tiver pelo menos país preenchido
            if (origemPaisCodigo || destinoPaisCodigo) {
                produtos.push({
                    rowNum: rowNum,
                    origem: {
                        pais: origemPaisCodigo,
                        estado: origemEstadoUf,
                        municipio: origemMunicipioCodigo
                    },
                    destino: {
                        pais: destinoPaisCodigo,
                        estado: destinoEstadoUf,
                        municipio: destinoMunicipioCodigo
                    }
                });
            }
        });

        console.log(`   📦 ${produtos.length} produto(s) com origem/destino preenchido(s)`);
        return produtos;
    },

    /**
     * Preenche Q12 (Origem) automaticamente
     */
    _preencherOrigem(origem) {
        console.log(`   📍 Preenchendo Q12 (Origem):`, origem);

        const paisSelect = document.getElementById('origem-pais');
        const estadoSelect = document.getElementById('origem-estado');
        const municipioSelect = document.getElementById('origem-municipio');

        if (!paisSelect) {
            console.error('❌ Campo origem-pais não encontrado');
            return;
        }

        // Definir país
        if (origem.pais) {
            paisSelect.value = origem.pais;
            paisSelect.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`       ✅ origem-pais = ${origem.pais}`);

            // Aguardar carregamento de estados
            setTimeout(() => {
                // Definir estado (se Brasil)
                if (origem.estado && estadoSelect) {
                    estadoSelect.value = origem.estado;
                    estadoSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log(`       ✅ origem-estado = ${origem.estado}`);

                    // Aguardar carregamento de municípios
                    setTimeout(() => {
                        // Definir município
                        if (origem.municipio && municipioSelect) {
                            municipioSelect.value = origem.municipio;
                            municipioSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            console.log(`       ✅ origem-municipio = ${origem.municipio}`);
                        }
                    }, 150);
                }
            }, 150);
        }
    },

    /**
     * Preenche Q13 (Destino) automaticamente
     */
    _preencherDestino(destino) {
        console.log(`   📍 Preenchendo Q13 (Destino):`, destino);

        const paisSelect = document.getElementById('destino-pais');
        const estadoSelect = document.getElementById('destino-estado');
        const municipioSelect = document.getElementById('destino-municipio');

        if (!paisSelect) {
            console.error('❌ Campo destino-pais não encontrado');
            return;
        }

        // Definir país
        if (destino.pais) {
            paisSelect.value = destino.pais;
            paisSelect.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`       ✅ destino-pais = ${destino.pais}`);

            // Aguardar carregamento de estados
            setTimeout(() => {
                // Definir estado (se Brasil)
                if (destino.estado && estadoSelect) {
                    estadoSelect.value = destino.estado;
                    estadoSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log(`       ✅ destino-estado = ${destino.estado}`);

                    // Aguardar carregamento de municípios
                    setTimeout(() => {
                        // Definir município
                        if (destino.municipio && municipioSelect) {
                            municipioSelect.value = destino.municipio;
                            municipioSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            console.log(`       ✅ destino-municipio = ${destino.municipio}`);
                        }
                    }, 150);
                }
            }, 150);
        }
    }
};

// Auto-inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para outros scripts carregarem
    setTimeout(() => {
        SincProdutosQ12Q13.init();
    }, 1000);
});

// Exportar para escopo global
window.SincProdutosQ12Q13 = SincProdutosQ12Q13;
