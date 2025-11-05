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
            
            // Preencher nome da empresa
            this.nomeInput.value = dados.razaoSocial || '';
            
            // Mostrar informações adicionais
            const situacao = dados.situacao === 'ATIVA' ? '✅' : '⚠️';
            this.mostrarStatus(
                `${situacao} ${dados.situacao} | ${dados.atividadePrincipal?.text || 'N/A'}`,
                'sucesso'
            );
            
            // Log para debug
            console.log('Dados da Receita Federal:', {
                cnpj: dados.cnpj,
                razaoSocial: dados.razaoSocial,
                fantasia: dados.nomeFantasia,
                situacao: dados.situacao,
                tipo: dados.tipo,
                atividade: dados.atividadePrincipal?.text,
                municipio: dados.endereco?.municipio,
                uf: dados.endereco?.uf
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
