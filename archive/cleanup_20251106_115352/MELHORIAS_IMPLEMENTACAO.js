/**
 * MELHORIAS PARA O SISTEMA PLI 2050
 * 
 * 1. Filtrar municípios por estado selecionado
 * 2. Corrigir validação visual
 * 3. Implementar salvamento completo no PostgreSQL
 * 4. Mensagens de feedback padronizadas
 */

// ============================================
// 1. ADICIONAR AO APP.JS - FILTRO DE MUNICÍPIOS
// ============================================

// Substituir a função de change do origemEstado (linha ~318)
if (origemEstado) {
    origemEstado.addEventListener('change', function() {
        const estadoId = this.value;
        origemMunicipio.innerHTML = '<option value="">Selecione o município...</option>';
        origemMunicipio.disabled = false;
        
        if (estadoId && window.listasPLI && window.listasPLI.municipios) {
            // FILTRAR municípios pelo estado selecionado
            const municipiosFiltrados = window.listasPLI.municipios.filter(m => 
                m.id_estado && m.id_estado.toString() === estadoId.toString()
            );
            
            if (municipiosFiltrados.length > 0) {
                municipiosFiltrados.forEach(municipio => {
                    const option = document.createElement('option');
                    option.value = municipio.id_municipio;
                    option.textContent = municipio.nome_municipio;
                    origemMunicipio.appendChild(option);
                });
            } else {
                // Se não houver municípios para o estado (ex: não é SP)
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nenhum município disponível para este estado';
                origemMunicipio.appendChild(option);
                origemMunicipio.disabled = true;
            }
        }
    });
}

// Mesma lógica para destinoEstado
if (destinoEstado) {
    destinoEstado.addEventListener('change', function() {
        const estadoId = this.value;
        destinoMunicipio.innerHTML = '<option value="">Selecione o município...</option>';
        destinoMunicipio.disabled = false;
        
        if (estadoId && window.listasPLI && window.listasPLI.municipios) {
            // FILTRAR municípios pelo estado selecionado
            const municipiosFiltrados = window.listasPLI.municipios.filter(m => 
                m.id_estado && m.id_estado.toString() === estadoId.toString()
            );
            
            if (municipiosFiltrados.length > 0) {
                municipiosFiltrados.forEach(municipio => {
                    const option = document.createElement('option');
                    option.value = municipio.id_municipio;
                    option.textContent = municipio.nome_municipio;
                    destinoMunicipio.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nenhum município disponível para este estado';
                destinoMunicipio.appendChild(option);
                destinoMunicipio.disabled = true;
            }
        }
    });
}

// ============================================
// 2. MENSAGENS DE FEEDBACK PADRONIZADAS
// ============================================

// Adicionar ao final do app.js
const MENSAGENS_FEEDBACK = {
    sucesso: {
        salvamento: {
            titulo: '✅ Resposta Salva com Sucesso!',
            corpo: (nomeEmpresa, arquivo) => `
                <div class="feedback-success">
                    <div class="feedback-icon">✅</div>
                    <h3>${MENSAGENS_FEEDBACK.sucesso.salvamento.titulo}</h3>
                    <p>A resposta da empresa <strong>${nomeEmpresa}</strong> foi salva no banco de dados PostgreSQL.</p>
                    <div class="feedback-details">
                        <p>📊 <strong>Arquivo gerado:</strong> ${arquivo}</p>
                        <p>💾 O download começará automaticamente em instantes.</p>
                    </div>
                    <button onclick="fecharFeedback()" class="btn-primary">OK, Entendi</button>
                </div>
            `
        }
    },
    erro: {
        validacao: {
            titulo: '⚠️ Campos Obrigatórios Não Preenchidos',
            corpo: (quantidade) => `
                <div class="feedback-warning">
                    <div class="feedback-icon">⚠️</div>
                    <h3>${MENSAGENS_FEEDBACK.erro.validacao.titulo}</h3>
                    <p>Foram encontrados <strong>${quantidade} ${quantidade === 1 ? 'campo' : 'campos'}</strong> obrigatório(s) não preenchido(s).</p>
                    <div class="feedback-instrucoes">
                        <p>📋 <strong>O que fazer:</strong></p>
                        <ul>
                            <li>Os campos com erro estão destacados em <span class="error-highlight">vermelho</span></li>
                            <li>Role a página até o primeiro campo marcado</li>
                            <li>Preencha todos os campos obrigatórios (marcados com *)</li>
                            <li>Tente salvar novamente</li>
                        </ul>
                    </div>
                    <button onclick="fecharFeedback(); scrollToFirstInvalidField()" class="btn-primary">Ver Primeiro Erro</button>
                </div>
            `
        },
        conexao: {
            titulo: '❌ Erro de Conexão',
            corpo: (detalhes) => `
                <div class="feedback-error">
                    <div class="feedback-icon">❌</div>
                    <h3>${MENSAGENS_FEEDBACK.erro.conexao.titulo}</h3>
                    <p>Não foi possível conectar ao servidor de dados.</p>
                    <div class="feedback-details">
                        <p><strong>Detalhes técnicos:</strong></p>
                        <pre>${detalhes}</pre>
                        <p><strong>Possíveis causas:</strong></p>
                        <ul>
                            <li>Servidor backend não está rodando (porta 3000)</li>
                            <li>Problema na conexão com o banco de dados PostgreSQL</li>
                            <li>Firewall bloqueando a conexão</li>
                        </ul>
                        <p><strong>Solução:</strong></p>
                        <p>1. Verifique se o backend está rodando: <code>node backend-api/server.js</code></p>
                        <p>2. Verifique a conexão com o PostgreSQL</p>
                        <p>3. Tente novamente</p>
                    </div>
                    <button onclick="fecharFeedback()" class="btn-primary">Fechar</button>
                </div>
            `
        },
        banco: {
            titulo: '❌ Erro ao Salvar no Banco de Dados',
            corpo: (erro) => {
                let mensagemAmigavel = '';
                let solucao = '';
                
                if (erro.includes('duplicate key') || erro.includes('unique')) {
                    mensagemAmigavel = 'Já existe um registro com estes dados.';
                    solucao = 'Verifique se esta resposta já foi cadastrada anteriormente.';
                } else if (erro.includes('foreign key') || erro.includes('violates')) {
                    mensagemAmigavel = 'Há um problema com os dados selecionados nas listas.';
                    solucao = 'Tente selecionar novamente o país, estado ou município.';
                } else if (erro.includes('null value') || erro.includes('not-null')) {
                    mensagemAmigavel = 'Faltam dados obrigatórios para salvar.';
                    solucao = 'Verifique se todos os campos obrigatórios estão preenchidos.';
                } else if (erro.includes('connection') || erro.includes('timeout')) {
                    mensagemAmigavel = 'Tempo de conexão excedido com o banco de dados.';
                    solucao = 'Verifique a conexão de rede e tente novamente.';
                } else {
                    mensagemAmigavel = 'Ocorreu um erro inesperado ao salvar.';
                    solucao = 'Entre em contato com o suporte técnico informando o erro abaixo.';
                }
                
                return `
                    <div class="feedback-error">
                        <div class="feedback-icon">❌</div>
                        <h3>${MENSAGENS_FEEDBACK.erro.banco.titulo}</h3>
                        <p><strong>${mensagemAmigavel}</strong></p>
                        <div class="feedback-solucao">
                            <p>💡 <strong>Solução sugerida:</strong></p>
                            <p>${solucao}</p>
                        </div>
                        <details class="feedback-technical">
                            <summary>🔧 Detalhes técnicos (para suporte)</summary>
                            <pre>${erro}</pre>
                        </details>
                        <button onclick="fecharFeedback()" class="btn-primary">Fechar</button>
                    </div>
                `;
            }
        }
    }
};

function mostrarFeedback(html) {
    let modal = document.getElementById('feedback-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'feedback-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    modal.innerHTML = html;
    modal.classList.add('active');
}

function fecharFeedback() {
    const modal = document.getElementById('feedback-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// 3. CSS PARA FEEDBACKS - ADICIONAR AO STYLES.CSS
// ============================================

/*
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s;
}

.modal-overlay.active {
    display: flex;
}

.feedback-success,
.feedback-warning,
.feedback-error {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 600px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s;
}

.feedback-icon {
    font-size: 4rem;
    text-align: center;
    margin-bottom: 1rem;
}

.feedback-success { border-left: 6px solid #28a745; }
.feedback-warning { border-left: 6px solid #ffc107; }
.feedback-error { border-left: 6px solid #dc3545; }

.feedback-details,
.feedback-instrucoes,
.feedback-solucao {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 6px;
    margin: 1rem 0;
}

.feedback-technical {
    margin-top: 1rem;
    cursor: pointer;
}

.feedback-technical summary {
    color: #666;
    font-size: 0.9rem;
    padding: 0.5rem;
}

.feedback-technical pre {
    background: #2c3e50;
    color: #ecf0f1;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.85rem;
    margin-top: 0.5rem;
}

.error-highlight {
    color: #dc3545;
    font-weight: bold;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from { transform: translateY(-50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
*/

// ============================================
// 4. NOVA ESTRUTURA DO BANCO DE DADOS
// ============================================

/* 
Os municípios precisam ter uma coluna id_estado para filtrar.
Se não tiver, adicionar:

ALTER TABLE formulario_embarcadores.municipios_sp 
ADD COLUMN IF NOT EXISTS id_estado INTEGER;

-- Assumindo que todos são de SP (id_estado = 26)
UPDATE formulario_embarcadores.municipios_sp 
SET id_estado = 26 
WHERE id_estado IS NULL;
*/
