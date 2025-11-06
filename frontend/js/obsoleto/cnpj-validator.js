// =====================================================
// INTEGRAÇÃO COM API DA RECEITA FEDERAL (CNPJ)
// =====================================================

class CNPJValidator {
    constructor() {
        this.cnpjInput = document.getElementById('cnpj-empresa');
        this.nomeInput = document.getElementById('nome-empresa');
        this.statusElement = document.getElementById('cnpj-status');
        
        this.init();
    }
    
    init() {
        if (!this.cnpjInput) return;
        
        // Aplicar máscara ao digitar
        this.cnpjInput.addEventListener('input', (e) => {
            this.aplicarMascara(e);
        });
        
        // Buscar dados ao completar CNPJ
        this.cnpjInput.addEventListener('blur', () => {
            this.validarEBuscarCNPJ();
        });
    }
    
    aplicarMascara(e) {
        let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        
        // Limita a 14 dígitos
        valor = valor.substring(0, 14);
        
        // Aplica a máscara XX.XXX.XXX/XXXX-XX
        if (valor.length <= 14) {
            valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
            valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
            valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
        }
        
        e.target.value = valor;
    }
    
    validarEBuscarCNPJ() {
        const cnpj = this.cnpjInput.value.replace(/\D/g, '');
        
        // Limpar campos se CNPJ for apagado
        if (!cnpj) {
            this.nomeInput.value = '';
            this.statusElement.textContent = '';
            this.statusElement.className = 'field-hint';
            return;
        }
        
        // Validar tamanho
        if (cnpj.length !== 14) {
            this.mostrarStatus('CNPJ incompleto (14 dígitos necessários)', 'erro');
            this.nomeInput.value = '';
            return;
        }
        
        // Validar algoritmo do CNPJ
        if (!this.validarCNPJ(cnpj)) {
            this.mostrarStatus('CNPJ inválido', 'erro');
            this.nomeInput.value = '';
            return;
        }
        
        // Buscar dados na Receita Federal
        this.buscarDadosReceita(cnpj);
    }
    
    validarCNPJ(cnpj) {
        // Elimina CNPJs invalidos conhecidos
        if (cnpj === "00000000000000" || 
            cnpj === "11111111111111" || 
            cnpj === "22222222222222" || 
            cnpj === "33333333333333" || 
            cnpj === "44444444444444" || 
            cnpj === "55555555555555" || 
            cnpj === "66666666666666" || 
            cnpj === "77777777777777" || 
            cnpj === "88888888888888" || 
            cnpj === "99999999999999") {
            return false;
        }
        
        // Valida DVs
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        const digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) return false;
        
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1)) return false;
        
        return true;
    }
    
    async buscarDadosReceita(cnpj) {
        this.mostrarStatus('🔍 Consultando Receita Federal...', 'consultando');
        this.nomeInput.value = 'Aguarde...';
        
        try {
            // Usar nosso backend como proxy para evitar CORS
            const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3000'
                : 'https://sua-api-aqui.herokuapp.com'; // Atualizar com URL do Render depois
            
            const response = await fetch(`${API_URL}/api/cnpj/${cnpj}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro na consulta à Receita Federal');
            }
            
            const dados = await response.json();
            
            // Preencher nome da empresa com RAZÃO SOCIAL (não nome fantasia)
            this.nomeInput.value = dados.razaoSocial || '';
            
            // Selecionar automaticamente o município (Q7)
            // API Receita retorna: municipio: "SAO PAULO" (sem acentos, maiúsculas)
            // Precisamos encontrar o ID correspondente na lista de municípios
            if (dados.endereco?.municipio && dados.endereco?.uf) {
                const municipioSelect = document.getElementById('municipio-empresa');
                
                if (municipioSelect && window.listasPLI?.municipios) {
                    // Normalizar nome do município da API (remover acentos, maiúsculas)
                    const normalizarTexto = (texto) => {
                        return texto
                            .toUpperCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
                    };
                    
                    const municipioAPI = normalizarTexto(dados.endereco.municipio);
                    const ufAPI = dados.endereco.uf;
                    
                    // Buscar município correspondente na lista
                    const municipioEncontrado = window.listasPLI.municipios.find(mun => {
                        const nomeMunNormalizado = normalizarTexto(mun.nome_municipio);
                        return nomeMunNormalizado === municipioAPI && mun.uf === ufAPI;
                    });
                    
                    if (municipioEncontrado) {
                        municipioSelect.value = municipioEncontrado.codigo_municipio;
                        
                        // Trigger change event para atualizar payload
                        const event = new Event('change', { bubbles: true });
                        municipioSelect.dispatchEvent(event);
                        
                        console.log('✅ Município selecionado automaticamente:', {
                            api: `${dados.endereco.municipio}/${dados.endereco.uf}`,
                            encontrado: municipioEncontrado.nome_municipio,
                            codigo: municipioEncontrado.codigo_municipio
                        });
                    } else {
                        console.warn('⚠️ Município não encontrado na lista:', {
                            buscado: `${municipioAPI}/${ufAPI}`,
                            disponivel: window.listasPLI.municipios.length + ' municípios'
                        });
                    }
                }
            }
            
            // Atualizar PayloadManager se disponível
            if (window.payloadManager) {
                window.payloadManager.updateField('empresa', 'razao_social', dados.razaoSocial);
                if (dados.nomeFantasia) {
                    window.payloadManager.updateField('empresa', 'nome_fantasia', dados.nomeFantasia);
                }
                if (dados.telefone) {
                    window.payloadManager.updateField('empresa', 'telefone', dados.telefone);
                }
                if (dados.email) {
                    window.payloadManager.updateField('empresa', 'email', dados.email);
                }
                // O id_municipio será atualizado automaticamente via evento change do select
                if (dados.endereco?.logradouro) {
                    window.payloadManager.updateField('empresa', 'logradouro', dados.endereco.logradouro);
                }
                if (dados.endereco?.numero) {
                    window.payloadManager.updateField('empresa', 'numero', dados.endereco.numero);
                }
                if (dados.endereco?.complemento) {
                    window.payloadManager.updateField('empresa', 'complemento', dados.endereco.complemento);
                }
                if (dados.endereco?.bairro) {
                    window.payloadManager.updateField('empresa', 'bairro', dados.endereco.bairro);
                }
                if (dados.endereco?.cep) {
                    window.payloadManager.updateField('empresa', 'cep', dados.endereco.cep);
                }
            }
            
            // Mostrar informações adicionais
            const situacao = dados.situacao === 'ATIVA' ? '✅' : '⚠️';
            this.mostrarStatus(
                `${situacao} ${dados.situacao} | ${dados.endereco?.municipio}/${dados.endereco?.uf}`,
                'sucesso'
            );
            
            // Log para debug
            console.log('✅ Dados da Receita Federal:', {
                cnpj: dados.cnpj,
                razaoSocial: dados.razaoSocial,
                fantasia: dados.nomeFantasia,
                situacao: dados.situacao,
                tipo: dados.tipo,
                atividade: dados.atividadePrincipal?.text,
                municipio: dados.endereco?.municipio,
                uf: dados.endereco?.uf,
                id_municipio: dados.id_municipio
            });
            
        } catch (error) {
            console.error('Erro ao buscar CNPJ:', error);
            this.mostrarStatus(`❌ ${error.message}`, 'erro');
            this.nomeInput.value = '';
        }
    }
    
    mostrarStatus(mensagem, tipo) {
        this.statusElement.textContent = mensagem;
        this.statusElement.className = 'field-hint';
        
        if (tipo === 'erro') {
            this.statusElement.style.color = '#d32f2f';
            this.statusElement.style.fontWeight = 'bold';
        } else if (tipo === 'sucesso') {
            this.statusElement.style.color = '#388e3c';
        } else if (tipo === 'consultando') {
            this.statusElement.style.color = '#1976d2';
            this.statusElement.style.fontStyle = 'italic';
        } else {
            this.statusElement.style.color = '#666';
            this.statusElement.style.fontWeight = 'normal';
            this.statusElement.style.fontStyle = 'normal';
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new CNPJValidator();
});
