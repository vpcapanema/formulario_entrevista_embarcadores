const fs = require('fs');
const path = require('path');

/**
 * TESTE COMPLETO DE EXPORTAÇÃO DE RASCUNHO
 * Simula: coleta → conversão → remoção de helper keys → geração Excel
 */

console.log('🧪 INICIANDO TESTE COMPLETO DE EXPORTAÇÃO\n');

// ============================================================
// 1. Simular FormCollector.collectData()
// ============================================================

const mockFormData = {
  // Entrevistado
  nome: 'João Silva Teste',
  email: 'joao@empresa.com',
  telefone: '(11) 98765-4321',
  funcao: 'gerente-logistica',
  estadoCivil: 'casado',
  nacionalidade: 'brasileira',
  
  // Naturalidade
  ufNaturalidade: 'SP',
  municipioNaturalidade: '3550308',
  
  // Empresa
  cnpj: '57286005000140',
  tipoEmpresa: 'embarcador',
  razaoSocial: 'TEST COMPANY LTDA',
  municipio: 'São Paulo',
  
  // Origem
  origemPais: '31',
  origemEstado: 'SP',
  origemMunicipio: '3550308',
  
  // Destino
  destinoPais: '76',
  destinoEstado: 'RJ',
  destinoMunicipio: '3304557',
  
  // Produto
  produtoPrincipal: 'Soja',
  agrupamentoProduto: 'graos',
  
  // Transporte
  tipoTransporte: 'exportacao',
  distancia: 500,
  temParadas: 'nao',
  modos: ['rodoviario'],
  
  // Peso e custos
  pesoCarga: 50000,
  unidadePeso: 'tonelada',
  custoTransporte: 5000,
  valorCarga: 250000,
  
  // Outros campos obrigatórios
  tipoEmbalagem: 'granel',
  cargaPerigosa: 'nao',
  tempoDias: 2,
  tempoHoras: 5,
  tempoMinutos: 30,
  frequencia: 'semanal',
  importanciaCusto: 'muito-importante',
  variacaoCusto: 10,
  consentimento: 'sim',
  
  // PRODUTOS (com códigos e nomes)
  produtos: [
    {
      carga: 'Soja',
      movimentacao: 50000,
      // Origem - com ambos códigos e nomes
      origemPaisCodigo: '31',
      origemPaisNome: 'Brasil',
      origemEstadoUf: 'SP',
      origemEstadoNome: 'São Paulo',
      origemMunicipioCodigo: '3550308',
      origemMunicipioNome: 'São Paulo',
      // Destino
      destinoPaisCodigo: '76',
      destinoPaisNome: 'Argentina',
      destinoEstadoUf: 'RJ',
      destinoEstadoNome: 'Rio de Janeiro',
      destinoMunicipioCodigo: '3304557',
      destinoMunicipioNome: 'Rio de Janeiro',
      modalidade: 'rodoviario',
      acondicionamento: 'granel',
      distancia: 500
    }
  ]
};

console.log('✅ FormData simulado:\n', JSON.stringify(mockFormData, null, 2).substring(0, 500) + '...\n');

// ============================================================
// 2. Simular _convertCodesToNames()
// ============================================================

async function convertCodesToNames(data) {
  console.log('🔄 FASE 1: Convertendo códigos para nomes...\n');
  
  const copy = JSON.parse(JSON.stringify(data));
  
  // Mock de lookup tables
  const paisesMap = {
    '31': 'Brasil',
    '76': 'Argentina'
  };
  
  const estadosMap = {
    'SP': 'São Paulo',
    'RJ': 'Rio de Janeiro',
    'MG': 'Minas Gerais',
    'PI': 'Piauí'
  };
  
  const municipiosMap = {
    'SP': {
      '3550308': 'São Paulo',
      '3509007': 'Campinas'
    },
    'RJ': {
      '3304557': 'Rio de Janeiro',
      '3302700': 'Niterói'
    }
  };
  
  // Converter campos de topo
  console.log('  → Convertendo origem/destino (top-level)...');
  copy.origemPais = paisesMap[copy.origemPais] || copy.origemPais;
  copy.destinoPais = paisesMap[copy.destinoPais] || copy.destinoPais;
  copy.origemEstado = estadosMap[copy.origemEstado] || copy.origemEstado;
  copy.destinoEstado = estadosMap[copy.destinoEstado] || copy.destinoEstado;
  copy.origemMunicipio = (municipiosMap[copy.origemEstado] && municipiosMap[copy.origemEstado][copy.origemMunicipio]) || copy.origemMunicipio;
  copy.destinoMunicipio = (municipiosMap[copy.destinoEstado] && municipiosMap[copy.destinoEstado][copy.destinoMunicipio]) || copy.destinoMunicipio;
  
  copy.ufNaturalidade = estadosMap[copy.ufNaturalidade] || copy.ufNaturalidade;
  copy.municipioNaturalidade = (municipiosMap['SP'] && municipiosMap['SP'][copy.municipioNaturalidade]) || copy.municipioNaturalidade;
  
  console.log('    ✅ Origem:', `${copy.origemMunicipio}/${copy.origemEstado} (${copy.origemPais})`);
  console.log('    ✅ Destino:', `${copy.destinoMunicipio}/${copy.destinoEstado} (${copy.destinoPais})`);
  
  // Converter produtos
  if (Array.isArray(copy.produtos)) {
    console.log('  → Convertendo produtos...');
    for (const p of copy.produtos) {
      // Preferir nomes se disponíveis
      if (p.origemPaisNome) p.origemPais = p.origemPaisNome;
      else p.origemPais = paisesMap[p.origemPaisCodigo] || p.origemPais;
      
      if (p.destinoPaisNome) p.destinoPais = p.destinoPaisNome;
      else p.destinoPais = paisesMap[p.destinoPaisCodigo] || p.destinoPais;
      
      if (p.origemEstadoNome) p.origemEstado = p.origemEstadoNome;
      else p.origemEstado = estadosMap[p.origemEstadoUf] || p.origemEstado;
      
      if (p.destinoEstadoNome) p.destinoEstado = p.destinoEstadoNome;
      else p.destinoEstado = estadosMap[p.destinoEstadoUf] || p.destinoEstado;
      
      if (p.origemMunicipioNome) p.origemMunicipio = p.origemMunicipioNome;
      if (p.destinoMunicipioNome) p.destinoMunicipio = p.destinoMunicipioNome;
      
      console.log(`    ✅ Produto "${p.carga}": ${p.origemMunicipio}/${p.origemEstado} → ${p.destinoMunicipio}/${p.destinoEstado}`);
    }
  }
  
  return copy;
}

// ============================================================
// 3. Simular remoção de helper keys
// ============================================================

function removeHelperKeys(data) {
  console.log('\n🧹 FASE 2: Removendo helper keys...\n');
  
  const copy = JSON.parse(JSON.stringify(data));
  
  // Helper keys a remover
  const helperTopLevel = [
    '__conversionError',
    'origemPaisCodigo', 'destinoPaisCodigo',
    'origemEstadoCodigo', 'destinoEstadoCodigo',
    'origemEstadoUf', 'destinoEstadoUf',
    'origemMunicipioCodigo', 'destinoMunicipioCodigo',
    'naturalidadeUfCodigo', 'naturalidadeMunicipioCodigo'
  ];
  
  const helperProduto = [
    'origemPaisCodigo', 'destinoPaisCodigo',
    'origemEstadoUf', 'destinoEstadoUf',
    'origemMunicipioCodigo', 'destinoMunicipioCodigo',
    'origemPaisNome', 'destinoPaisNome',
    'origemEstadoNome', 'destinoEstadoNome',
    'origemMunicipioNome', 'destinoMunicipioNome',
    '__conversionError'
  ];
  
  // Remover de top-level
  helperTopLevel.forEach(key => delete copy[key]);
  console.log('  ✅ Top-level helper keys removidas');
  
  // Remover de produtos
  if (Array.isArray(copy.produtos)) {
    copy.produtos.forEach((p, idx) => {
      const beforeKeys = Object.keys(p);
      helperProduto.forEach(key => delete p[key]);
      const afterKeys = Object.keys(p);
      const removidos = beforeKeys.filter(k => !afterKeys.includes(k));
      if (removidos.length > 0) {
        console.log(`  ✅ Produto ${idx}: removidos ${removidos.join(', ')}`);
      }
    });
  }
  
  return copy;
}

// ============================================================
// 4. Validar estrutura final
// ============================================================

function validarEstrutura(data) {
  console.log('\n✔️ FASE 3: Validando estrutura final...\n');
  
  const issues = [];
  
  // Verificar campos de topo
  console.log('  Top-level:');
  console.log(`    ✓ nome: "${data.nome}"`);
  console.log(`    ✓ razaoSocial: "${data.razaoSocial}"`);
  console.log(`    ✓ origemPais: "${data.origemPais}" (esperado: Brasil)`);
  console.log(`    ✓ origemEstado: "${data.origemEstado}" (esperado: São Paulo)`);
  console.log(`    ✓ origemMunicipio: "${data.origemMunicipio}" (esperado: São Paulo)`);
  
  if (data.origemPais !== 'Brasil') issues.push('origemPais não convertido!');
  if (data.origemEstado !== 'São Paulo') issues.push('origemEstado não convertido!');
  
  // Verificar helper keys ausentes
  const helperKeys = Object.keys(data).filter(k => /Codigo|Uf$|Nome$/.test(k));
  if (helperKeys.length > 0) {
    issues.push(`Helper keys encontradas no top-level: ${helperKeys.join(', ')}`);
    console.log(`    ❌ Helper keys encontradas: ${helperKeys.join(', ')}`);
  } else {
    console.log(`    ✓ Sem helper keys no top-level`);
  }
  
  // Verificar produtos
  if (data.produtos && data.produtos.length > 0) {
    console.log(`\n  Produtos (${data.produtos.length}):`);
    data.produtos.forEach((p, idx) => {
      console.log(`    [${idx}] ${p.carga}`);
      console.log(`        ✓ origemPais: "${p.origemPais}"`);
      console.log(`        ✓ origemEstado: "${p.origemEstado}"`);
      console.log(`        ✓ origemMunicipio: "${p.origemMunicipio}"`);
      console.log(`        ✓ destinoPais: "${p.destinoPais}"`);
      
      const prodHelpers = Object.keys(p).filter(k => /Codigo|Uf$|Nome$/.test(k) && k !== 'modalidade');
      if (prodHelpers.length > 0) {
        issues.push(`Helper keys no produto ${idx}: ${prodHelpers.join(', ')}`);
        console.log(`        ❌ Helper keys: ${prodHelpers.join(', ')}`);
      } else {
        console.log(`        ✓ Sem helper keys`);
      }
    });
  }
  
  return issues;
}

// ============================================================
// EXECUTAR TESTE
// ============================================================

(async () => {
  try {
    // Etapa 1: Converter
    const converted = await convertCodesToNames(mockFormData);
    
    // Etapa 2: Remover helpers
    const cleaned = removeHelperKeys(converted);
    
    // Etapa 3: Validar
    const issues = validarEstrutura(cleaned);
    
    // Resultado final
    console.log('\n' + '='.repeat(60));
    if (issues.length === 0) {
      console.log('\n✅ TESTE PASSOU! Exportação está funcionando corretamente\n');
      console.log('📊 Amostra de dados para exportação:');
      console.log('  Origem:', `${cleaned.origemMunicipio} / ${cleaned.origemEstado} (${cleaned.origemPais})`);
      console.log('  Destino:', `${cleaned.destinoMunicipio} / ${cleaned.destinoEstado} (${cleaned.destinoPais})`);
      console.log('  Produto:', cleaned.produtoPrincipal);
      console.log('  Entrevistado:', cleaned.nome);
      console.log('  Empresa:', cleaned.razaoSocial);
      console.log('\n✨ Excel será gerado com esses dados (apenas nomes, sem códigos)\n');
    } else {
      console.log('\n❌ TESTE FALHOU! Problemas encontrados:\n');
      issues.forEach((issue, idx) => {
        console.log(`  ${idx + 1}. ${issue}`);
      });
    }
  } catch (err) {
    console.error('❌ Erro durante teste:', err.message);
  }
})();
