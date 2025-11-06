const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // GET /api/cnpj/:cnpj
    router.get('/cnpj/:cnpj', async (req, res) => {
        const { cnpj } = req.params;
        
        // Remove formatação do CNPJ (mantém apenas números)
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        
        if (cnpjLimpo.length !== 14) {
            return res.status(400).json({ error: 'CNPJ deve ter 14 dígitos' });
        }
        
        try {
            // Fazer requisição para a API da Receita Federal
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
            
            if (!response.ok) {
                throw new Error('Erro na consulta à Receita Federal');
            }
            
            const dados = await response.json();
            
            if (dados.status === 'ERROR') {
                return res.status(404).json({ 
                    error: dados.message || 'CNPJ não encontrado' 
                });
            }
            
            // Retornar dados formatados (frontend fará correspondência de município)
            res.json({
                // Dados básicos da empresa
                cnpj: dados.cnpj,
                razaoSocial: dados.nome,
                nomeFantasia: dados.fantasia,
                situacao: dados.situacao,
                tipo: dados.tipo,
                porte: dados.porte,
                naturezaJuridica: dados.natureza_juridica,
                atividadePrincipal: dados.atividade_principal?.[0] || null,
                
                // Endereço completo
                endereco: {
                    logradouro: dados.logradouro,
                    numero: dados.numero,
                    complemento: dados.complemento,
                    bairro: dados.bairro,
                    municipio: dados.municipio,
                    uf: dados.uf,
                    cep: dados.cep
                },
                
                // Contato
                email: dados.email,
                telefone: dados.telefone,
                
                // Outros
                abertura: dados.abertura,
                dataSituacao: dados.data_situacao
            });
            
        } catch (error) {
            console.error('Erro ao consultar CNPJ:', error);
            res.status(500).json({ 
                error: 'Erro ao consultar CNPJ na Receita Federal',
                message: error.message 
            });
        }
    });

    return router;
};
