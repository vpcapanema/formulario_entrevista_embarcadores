/**
 * ============================================================================
 * CORE-VALIDATORS - Validadores de Campos com Base em PostgreSQL
 * ============================================================================
 * 
 * TIPOS DE DADOS DO BANCO (PostgreSQL):
 * - VARCHAR: nome_empresa, tipo_empresa, cnpj, email, telefone, etc
 * - NUMERIC: distancia, peso_carga, custo_transporte, valor_carga, variacao_*
 * - INTEGER: tempo_dias, tempo_horas, tempo_minutos, num_paradas
 * - BOOLEAN: consentimento, transporta_carga
 * - ARRAY: modos[], dificuldades[], modais_alternativos[]
 * - TEXT: observacoes, detalhe_dificuldade, fator_adicional
 * - TIMESTAMP: data_entrevista, data_cadastro, data_atualizacao
 * 
 * Cada validador retorna objeto com:
 * - isValid: boolean
 * - message: string (mensagem de erro/sucesso)
 * - type: 'success' | 'warning' | 'error'
 * - badge: string (texto do badge)
 * - title: string (título da mensagem)
 * - details: string (detalhes com formato esperado + exemplo)
 */

const CoreValidators = {
    
    /**
     * Valida CNPJ - VARCHAR(18) formato: XX.XXX.XXX/XXXX-XX
     */
    cnpj: function(value) {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                type: 'error',
                badge: 'Obrigatório',
                title: 'Campo não preenchido',
                details: 'Este campo deve ser preenchido antes de salvar'
            };
        }

        // Remove caracteres não numéricos
        const cnpjLimpo = value.replace(/[^\d]/g, '');

        // Verifica se tem 14 dígitos
        if (cnpjLimpo.length !== 14) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Formato incorreto',
                details: 'Esperado: <code>XX.XXX.XXX/XXXX-XX</code><br>Exemplo: <code>12.345.678/0001-90</code>'
            };
        }

        // Validação dos dígitos verificadores
        if (!this._validarDigitosCNPJ(cnpjLimpo)) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'CNPJ inválido',
                details: 'Os dígitos verificadores do CNPJ estão incorretos'
            };
        }

        return {
            isValid: true,
            type: 'success',
            badge: 'Validado',
            title: '',
            details: ''
        };
    },

    /**
     * Validação auxiliar de dígitos verificadores do CNPJ
     */
    _validarDigitosCNPJ: function(cnpj) {
        // Rejeita CNPJs com todos os dígitos iguais
        if (/^(\d)\1{13}$/.test(cnpj)) return false;

        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        const digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado != digitos.charAt(0)) return false;

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado != digitos.charAt(1)) return false;

        return true;
    },

    /**
     * Valida Email - VARCHAR(100)
     */
    email: function(value, isRequired = false) {
        if (!value || value.trim() === '') {
            if (isRequired) {
                return {
                    isValid: false,
                    type: 'error',
                    badge: 'Obrigatório',
                    title: 'Campo não preenchido',
                    details: 'Este campo deve ser preenchido antes de salvar'
                };
            }
            return { isValid: true, type: 'success', badge: '', title: '', details: '' };
        }

        // Regex RFC 5322 simplificado
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(value)) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Formato incorreto',
                details: 'Esperado: <code>usuario@dominio.com</code><br>Exemplo: <code>joao.silva@empresa.com.br</code>'
            };
        }

        if (value.length > 100) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Email muito longo',
                details: 'Máximo de 100 caracteres permitido'
            };
        }

        return {
            isValid: true,
            type: 'success',
            badge: 'Validado',
            title: '',
            details: ''
        };
    },

    /**
     * Valida Telefone - VARCHAR(15) formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
     */
    telefone: function(value, isRequired = false) {
        if (!value || value.trim() === '') {
            if (isRequired) {
                return {
                    isValid: false,
                    type: 'error',
                    badge: 'Obrigatório',
                    title: 'Campo não preenchido',
                    details: 'Este campo deve ser preenchido antes de salvar'
                };
            }
            return { isValid: true, type: 'success', badge: '', title: '', details: '' };
        }

        // Remove caracteres não numéricos
        const telefoneLimpo = value.replace(/[^\d]/g, '');

        // Aceita 10 ou 11 dígitos (com ou sem 9 na frente)
        if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Formato incorreto',
                details: 'Esperado: <code>(XX) XXXXX-XXXX</code> ou <code>(XX) XXXX-XXXX</code><br>Exemplo: <code>(11) 98765-4321</code>'
            };
        }

        return {
            isValid: true,
            type: 'success',
            badge: 'Validado',
            title: '',
            details: ''
        };
    },

    /**
     * Valida Número Inteiro - INTEGER ou BIGINT
     */
    integer: function(value, isRequired = false, min = null, max = null) {
        if (!value || value.trim() === '') {
            if (isRequired) {
                return {
                    isValid: false,
                    type: 'error',
                    badge: 'Obrigatório',
                    title: 'Campo não preenchido',
                    details: 'Este campo deve ser preenchido antes de salvar'
                };
            }
            return { isValid: true, type: 'success', badge: '', title: '', details: '' };
        }

        const numero = parseInt(value, 10);

        if (isNaN(numero) || numero.toString() !== value.trim()) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Formato incorreto',
                details: 'Esperado: Número inteiro<br>Exemplo: <code>1000</code>, <code>25</code>, <code>500</code>'
            };
        }

        if (min !== null && numero < min) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Valor abaixo do mínimo',
                details: `O valor deve ser maior ou igual a ${min}`
            };
        }

        if (max !== null && numero > max) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Valor acima do máximo',
                details: `O valor deve ser menor ou igual a ${max}`
            };
        }

        return {
            isValid: true,
            type: 'success',
            badge: 'Validado',
            title: '',
            details: ''
        };
    },

    /**
     * Valida Número Decimal - NUMERIC ou DECIMAL
     */
    numeric: function(value, isRequired = false, min = null, max = null) {
        if (!value || value.trim() === '') {
            if (isRequired) {
                return {
                    isValid: false,
                    type: 'error',
                    badge: 'Obrigatório',
                    title: 'Campo não preenchido',
                    details: 'Este campo deve ser preenchido antes de salvar'
                };
            }
            return { isValid: true, type: 'success', badge: '', title: '', details: '' };
        }

        const numero = parseFloat(value.replace(',', '.'));

        if (isNaN(numero)) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Formato incorreto',
                details: 'Esperado: Número decimal<br>Exemplo: <code>1000.50</code>, <code>25,75</code>, <code>500</code>'
            };
        }

        if (min !== null && numero < min) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Valor abaixo do mínimo',
                details: `O valor deve ser maior ou igual a ${min}`
            };
        }

        if (max !== null && numero > max) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Valor acima do máximo',
                details: `O valor deve ser menor ou igual a ${max}`
            };
        }

        return {
            isValid: true,
            type: 'success',
            badge: 'Validado',
            title: '',
            details: ''
        };
    },

    /**
     * Valida VARCHAR com limite de caracteres
     */
    varchar: function(value, isRequired = false, maxLength = 255) {
        if (!value || value.trim() === '') {
            if (isRequired) {
                return {
                    isValid: false,
                    type: 'error',
                    badge: 'Obrigatório',
                    title: 'Campo não preenchido',
                    details: 'Este campo deve ser preenchido antes de salvar'
                };
            }
            return { isValid: true, type: 'success', badge: '', title: '', details: '' };
        }

        if (value.length > maxLength) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Texto muito longo',
                details: `Máximo de ${maxLength} caracteres. Você digitou ${value.length}.`
            };
        }

        return {
            isValid: true,
            type: 'success',
            badge: 'Validado',
            title: '',
            details: ''
        };
    },

    /**
     * Valida Data - DATE formato: YYYY-MM-DD ou DD/MM/YYYY
     */
    date: function(value, isRequired = false) {
        if (!value || value.trim() === '') {
            if (isRequired) {
                return {
                    isValid: false,
                    type: 'error',
                    badge: 'Obrigatório',
                    title: 'Campo não preenchido',
                    details: 'Este campo deve ser preenchido antes de salvar'
                };
            }
            return { isValid: true, type: 'success', badge: '', title: '', details: '' };
        }

        // Aceita YYYY-MM-DD ou DD/MM/YYYY
        const dateRegex1 = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
        const dateRegex2 = /^\d{2}\/\d{2}\/\d{4}$/; // DD/MM/YYYY

        if (!dateRegex1.test(value) && !dateRegex2.test(value)) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Formato incorreto',
                details: 'Esperado: <code>DD/MM/YYYY</code> ou <code>YYYY-MM-DD</code><br>Exemplo: <code>25/12/2024</code> ou <code>2024-12-25</code>'
            };
        }

        // Valida se é uma data válida
        let data;
        if (dateRegex1.test(value)) {
            data = new Date(value);
        } else {
            const [dia, mes, ano] = value.split('/');
            data = new Date(`${ano}-${mes}-${dia}`);
        }

        if (isNaN(data.getTime())) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'Data inválida',
                details: 'A data informada não existe no calendário'
            };
        }

        return {
            isValid: true,
            type: 'success',
            badge: 'Validado',
            title: '',
            details: ''
        };
    },

    /**
     * Valida Select (dropdown) - verifica se um valor foi selecionado
     */
    select: function(value, isRequired = false) {
        if (!value || value.trim() === '' || value === '0' || value === 'null' || value === 'undefined') {
            if (isRequired) {
                return {
                    isValid: false,
                    type: 'error',
                    badge: 'Obrigatório',
                    title: 'Seleção obrigatória',
                    details: 'Selecione uma opção antes de continuar'
                };
            }
            return { isValid: true, type: 'success', badge: '', title: '', details: '' };
        }

        return {
            isValid: true,
            type: 'success',
            badge: 'Validado',
            title: '',
            details: ''
        };
    },

    /**
     * Valida URL
     */
    url: function(value, isRequired = false) {
        if (!value || value.trim() === '') {
            if (isRequired) {
                return {
                    isValid: false,
                    type: 'error',
                    badge: 'Obrigatório',
                    title: 'Campo não preenchido',
                    details: 'Este campo deve ser preenchido antes de salvar'
                };
            }
            return { isValid: true, type: 'success', badge: '', title: '', details: '' };
        }

        try {
            new URL(value);
            return {
                isValid: true,
                type: 'success',
                badge: 'Validado',
                title: '',
                details: ''
            };
        } catch (e) {
            return {
                isValid: false,
                type: 'warning',
                badge: 'Inválido',
                title: 'URL inválida',
                details: 'Esperado: <code>https://exemplo.com</code><br>Exemplo: <code>https://www.empresa.com.br</code>'
            };
        }
    }
};

// Exporta para uso global
window.CoreValidators = CoreValidators;
// Compatibilidade com código antigo
window.FieldValidators = CoreValidators;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoreValidators;
}
