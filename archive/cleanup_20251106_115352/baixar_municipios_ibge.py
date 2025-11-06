"""
Baixa a lista oficial de municípios de São Paulo direto da API do IBGE
e gera SQL válido
"""

import requests
import json

# API do IBGE - Lista de municípios de São Paulo (UF=35)
url = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios"

print("🌐 Baixando lista oficial de municípios de SP do IBGE...")

try:
    response = requests.get(url)
    response.raise_for_status()
    municipios = response.json()
    
    print(f"✅ {len(municipios)} municípios recebidos do IBGE\n")
    
    # Gerar SQL
    sql_lines = []
    sql_lines.append("-- =====================================================")
    sql_lines.append(f"-- MUNICÍPIOS DE SÃO PAULO - LISTA OFICIAL IBGE ({len(municipios)} municípios)")
    sql_lines.append("-- Fonte: API do IBGE - https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios")
    sql_lines.append("-- =====================================================\n")
    sql_lines.append("-- Deletar dados existentes")
    sql_lines.append("DELETE FROM formulario_embarcadores.municipios_sp;\n")
    sql_lines.append("-- Inserir municípios em ordem alfabética")
    sql_lines.append("INSERT INTO formulario_embarcadores.municipios_sp (nome_municipio, codigo_ibge, regiao) VALUES")
    
    # Ordenar alfabeticamente
    municipios_sorted = sorted(municipios, key=lambda x: x['nome'])
    
    values = []
    for i, mun in enumerate(municipios_sorted):
        nome = mun['nome'].replace("'", "''")  # Escapar apóstrofos
        codigo = str(mun['id'])
        
        # Determinar região aproximada pela mesorregião
        regiao = mun.get('microrregiao', {}).get('mesorregiao', {}).get('nome', 'São Paulo')
        if regiao:
            regiao = regiao.replace("'", "''")
        
        values.append(f"('{nome}', '{codigo}', '{regiao}')")
    
    # Juntar todos os valores com vírgula
    sql_lines.append(",\n".join(values) + ";")
    
    # Adicionar verificação
    sql_lines.append("\n-- Verificar total inserido")
    sql_lines.append("SELECT COUNT(*) as total_municipios FROM formulario_embarcadores.municipios_sp;")
    
    # Salvar arquivo
    sql_content = "\n".join(sql_lines)
    
    with open('municipios_sp_ibge_oficial.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print("✅ Arquivo municipios_sp_ibge_oficial.sql gerado com sucesso!")
    print(f"📊 Total de municípios: {len(municipios)}")
    
    # Mostrar alguns exemplos
    print("\n📝 Primeiros 10 municípios:")
    for i, mun in enumerate(municipios_sorted[:10]):
        print(f"   {i+1}. {mun['nome']} (IBGE: {mun['id']})")
    
    # Verificar se há duplicados nos códigos IBGE
    codigos = [str(m['id']) for m in municipios]
    codigos_unicos = set(codigos)
    if len(codigos) == len(codigos_unicos):
        print(f"\n✅ Todos os {len(codigos)} códigos IBGE são únicos!")
    else:
        print(f"\n⚠️  ATENÇÃO: {len(codigos) - len(codigos_unicos)} códigos duplicados!")
        
except Exception as e:
    print(f"❌ Erro: {e}")
