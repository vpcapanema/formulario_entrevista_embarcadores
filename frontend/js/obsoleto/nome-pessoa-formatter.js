/**
 * =====================================================
 * FORMATADOR DE NOMES DE PESSOAS
 * Sistema: PLI 2050 - Formulários de Entrevista
 * =====================================================
 * 
 * Padrão: Nomes de pessoas devem ser armazenados em UPPERCASE no banco
 * Motivos:
 * - Padronização e consistência
 * - Facilita buscas (sem case-sensitivity)
 * - Previne erros de capitalização
 * - Padrão em sistemas corporativos brasileiros
 */

/**
 * Sanitiza e formata nome de pessoa para UPPERCASE
 * @param {string} nome - Nome digitado pelo usuário
 * @returns {string} Nome em UPPERCASE, sanitizado e normalizado
 */
function sanitizarNomePessoa(nome) {
    if (!nome || typeof nome !== 'string') {
        return '';
    }
    
    return nome
        .trim()                           // Remove espaços no início e fim
        .replace(/\s+/g, ' ')             // Substitui múltiplos espaços por um único
        .normalize('NFC')                 // Normaliza caracteres Unicode (garante acentuação correta)
        .toUpperCase();                   // Converte para UPPERCASE
}

/**
 * Formata nome de pessoa de UPPERCASE para Title Case (para exibição)
 * @param {string} nomeUppercase - Nome em UPPERCASE do banco
 * @returns {string} Nome em Title Case para exibição
 */
function formatarNomePessoaExibicao(nomeUppercase) {
    if (!nomeUppercase || typeof nomeUppercase !== 'string') {
        return '';
    }
    
    const minusculas = ['de', 'do', 'da', 'dos', 'das', 'e', 'a', 'o'];
    
    return nomeUppercase
        .toLowerCase()
        .split(' ')
        .map((palavra, index) => {
            // Primeira palavra sempre maiúscula
            if (index === 0) {
                return palavra.charAt(0).toUpperCase() + palavra.slice(1);
            }
            
            // Verificar se é preposição/artigo (manter minúscula)
            if (minusculas.includes(palavra)) {
                return palavra;
            }
            
            // Caso especial: d' (apostrofo)
            if (palavra.startsWith("d'")) {
                return "D'" + palavra.slice(2).charAt(0).toUpperCase() + palavra.slice(3);
            }
            
            // Palavras normais: primeira letra maiúscula
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        })
        .join(' ');
}

/**
 * Valida se nome de pessoa está no formato correto
 * @param {string} nome - Nome a ser validado
 * @returns {object} { valido: boolean, erro: string }
 */
function validarNomePessoa(nome) {
    if (!nome || nome.trim() === '') {
        return {
            valido: false,
            erro: 'Nome não pode estar vazio'
        };
    }
    
    const nomeLimpo = nome.trim();
    
    // Verificar tamanho mínimo (pelo menos 2 caracteres)
    if (nomeLimpo.length < 2) {
        return {
            valido: false,
            erro: 'Nome muito curto (mínimo 2 caracteres)'
        };
    }
    
    // Verificar se contém apenas letras, espaços, acentos e apostrofos
    const regexNome = /^[A-ZÀ-ÿa-z'\s]+$/;
    if (!regexNome.test(nomeLimpo)) {
        return {
            valido: false,
            erro: 'Nome contém caracteres inválidos (apenas letras, espaços e apostrofos são permitidos)'
        };
    }
    
    // Verificar se tem pelo menos um espaço (nome + sobrenome)
    if (!nomeLimpo.includes(' ')) {
        return {
            valido: false,
            erro: 'Por favor, informe nome e sobrenome'
        };
    }
    
    return {
        valido: true,
        erro: null
    };
}

/**
 * Adiciona evento de auto-conversão para UPPERCASE em campo de nome
 * @param {string|HTMLElement} elemento - Seletor CSS ou elemento DOM
 */
function aplicarAutoConversaoUppercase(elemento) {
    const input = typeof elemento === 'string' 
        ? document.querySelector(elemento) 
        : elemento;
    
    if (!input) {
        console.warn('Elemento não encontrado:', elemento);
        return;
    }
    
    // Converter para UPPERCASE ao perder foco
    input.addEventListener('blur', function() {
        const nomeOriginal = this.value;
        const nomeSanitizado = sanitizarNomePessoa(nomeOriginal);
        
        if (nomeSanitizado !== nomeOriginal) {
            this.value = nomeSanitizado;
            
            // Feedback visual (opcional)
            this.classList.add('text-transformed');
            setTimeout(() => {
                this.classList.remove('text-transformed');
            }, 1000);
        }
    });
    
    // Validar ao digitar (feedback em tempo real)
    input.addEventListener('input', function() {
        const validacao = validarNomePessoa(this.value);
        
        // Remover mensagem de erro anterior
        const erroAnterior = this.parentElement.querySelector('.nome-erro');
        if (erroAnterior) {
            erroAnterior.remove();
        }
        
        // Se houver erro e campo não estiver vazio, mostrar
        if (!validacao.valido && this.value.trim() !== '') {
            const mensagemErro = document.createElement('small');
            mensagemErro.className = 'nome-erro';
            mensagemErro.style.color = '#dc3545';
            mensagemErro.style.fontSize = '0.875rem';
            mensagemErro.style.display = 'block';
            mensagemErro.style.marginTop = '0.25rem';
            mensagemErro.textContent = validacao.erro;
            this.parentElement.appendChild(mensagemErro);
        }
    });
}

/**
 * Inicializa formatação automática de nomes em todos os campos relevantes
 */
function inicializarFormatacaoNomes() {
    // Campos de nome de pessoa no formulário
    const camposNome = [
        '#nome',                        // Q1: Nome do entrevistado
        '#nome-responsavel-outro',      // Cartão 0: Nome do responsável (se outro)
        // Adicionar outros campos conforme necessário
    ];
    
    camposNome.forEach(seletor => {
        const elemento = document.querySelector(seletor);
        if (elemento) {
            aplicarAutoConversaoUppercase(elemento);
            console.log(`✅ Auto-conversão UPPERCASE ativada: ${seletor}`);
        }
    });
}

// =====================================================
// AUTO-INICIALIZAÇÃO
// =====================================================

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFormatacaoNomes);
} else {
    inicializarFormatacaoNomes();
}

// =====================================================
// EXEMPLOS DE USO
// =====================================================

/**
 * EXEMPLO 1: Sanitizar nome manualmente
 * 
 * const nomeDigitado = "  maria   da  silva  ";
 * const nomeBanco = sanitizarNomePessoa(nomeDigitado);
 * console.log(nomeBanco); // "MARIA DA SILVA"
 */

/**
 * EXEMPLO 2: Formatar para exibição
 * 
 * const nomeBanco = "JOÃO PEDRO DA SILVA";
 * const nomeTela = formatarNomePessoaExibicao(nomeBanco);
 * console.log(nomeTela); // "João Pedro da Silva"
 */

/**
 * EXEMPLO 3: Validar nome
 * 
 * const validacao = validarNomePessoa("José");
 * if (!validacao.valido) {
 *     alert(validacao.erro); // "Por favor, informe nome e sobrenome"
 * }
 */

/**
 * EXEMPLO 4: Aplicar em campo específico
 * 
 * const inputNome = document.getElementById('nome');
 * aplicarAutoConversaoUppercase(inputNome);
 */
