/**
 * ════════════════════════════════════════════════════════════
 * 🚀 INICIALIZADOR DO SISTEMA DE PAYLOAD
 * ════════════════════════════════════════════════════════════
 * 
 * Conecta PayloadManager + FormIntegrator ao carregar a página
 * 
 * @author Sistema PLI 2050
 * @date 2025-11-05
 */

(function() {
    'use strict';

    console.log('🚀 Inicializando sistema de payload...');

    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        try {
            console.log('📦 Criando PayloadManager...');
            
            // Criar instância do PayloadManager
            window.payloadManager = new PayloadManager();

            console.log('🔗 Criando FormPayloadIntegrator...');
            
            // Criar integrador (conecta formulário ao payload)
            window.formIntegrator = new FormPayloadIntegrator(window.payloadManager);

            console.log('✅ Sistema de payload inicializado com sucesso!');

            // ═══════════════════════════════════════════════════════════
            // 🔧 SOBRESCREVER FUNÇÃO DE SUBMIT EXISTENTE
            // ═══════════════════════════════════════════════════════════
            
            // Encontrar botão de submit
            const submitButton = document.querySelector('button[type="submit"]');
            if (submitButton) {
                console.log('🔘 Conectando botão de submit ao novo sistema...');
                
                // Remover listeners antigos
                const newButton = submitButton.cloneNode(true);
                submitButton.parentNode.replaceChild(newButton, submitButton);
                
                // Adicionar novo listener
                newButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    
                    console.log('🚀 Botão submit clicado!');
                    
                    // Usar novo sistema de payload
                    await window.formIntegrator.submitForm();
                });
            }

            // ═══════════════════════════════════════════════════════════
            // 🐛 FUNÇÕES DE DEBUG GLOBAIS
            // ═══════════════════════════════════════════════════════════
            
            window.debugPayload = function() {
                window.payloadManager.debug();
            };

            window.getPayload = function() {
                return window.payloadManager.getPayload();
            };

            window.resetPayload = function() {
                window.payloadManager.reset();
                window.formIntegrator.resetForm();
            };

            console.log('🐛 Funções de debug disponíveis:');
            console.log('   - debugPayload()   → Exibir payload atual');
            console.log('   - getPayload()     → Obter payload formatado');
            console.log('   - resetPayload()   → Limpar tudo');

            // Listeners globais para eventos customizados do PayloadManager
            if (typeof window !== 'undefined') {
                window.addEventListener('payload:validation-error', (e) => {
                    try {
                        console.groupCollapsed('📣 Evento: payload:validation-error');
                        console.log('Errors:', e.detail.errors);
                        console.log('Payload snapshot:', e.detail.payload);
                        console.groupEnd();
                    } catch (err) {
                        console.error('Erro ao tratar payload:validation-error', err);
                    }
                    // Enviar log para o servidor (não bloqueante)
                    try {
                        fetch('/api/logs', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'payload:validation-error',
                                level: 'warn',
                                message: 'Validação de payload falhou no frontend',
                                detail: {
                                    errors: e.detail.errors,
                                    payload: e.detail.payload
                                },
                                timestamp: new Date().toISOString()
                            })
                        }).catch(err => console.warn('Falha ao enviar log para /api/logs:', err));
                    } catch (err) {
                        // ignore
                    }
                });

                window.addEventListener('payload:submit-error', (e) => {
                    try {
                        console.groupCollapsed('📣 Evento: payload:submit-error');
                        console.log('Error:', e.detail.error);
                        console.log('Validation errors:', e.detail.validationErrors);
                        console.log('Payload snapshot:', e.detail.payload);
                        console.groupEnd();
                    } catch (err) {
                        console.error('Erro ao tratar payload:submit-error', err);
                    }
                    // Enviar log para o servidor (não bloqueante)
                    try {
                        fetch('/api/logs', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'payload:submit-error',
                                level: 'error',
                                message: e.detail.error || 'Erro ao submeter payload',
                                detail: {
                                    validationErrors: e.detail.validationErrors,
                                    payload: e.detail.payload
                                },
                                timestamp: new Date().toISOString()
                            })
                        }).catch(err => console.warn('Falha ao enviar log para /api/logs:', err));
                    } catch (err) {
                        // ignore
                    }
                });

                // Atalho para mostrar logs no console (F12)
                window.showPayloadLogs = function() {
                    if (!window.payloadManager) return console.warn('payloadManager não inicializado');
                    console.groupCollapsed('🔎 Payload quick inspect');
                    console.log('Payload:', window.payloadManager.payload);
                    console.log('Validation errors:', window.payloadManager.validationErrors);
                    console.groupEnd();
                };
                console.log('🔎 Atalho: showPayloadLogs() — chama inspeção rápida do payload no console');
            }

        } catch (error) {
            console.error('❌ Erro ao inicializar sistema de payload:', error);
        }
    }
})();
