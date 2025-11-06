"""
Script para gerar arquivos JSON estáticos das listas auxiliares
Extrai dados do PostgreSQL RDS e salva em frontend/lists/
"""

import psycopg2
import json
import os
from dotenv import load_dotenv
from decimal import Decimal
from datetime import datetime, date

# Conversor para tipos não serializáveis
def json_converter(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

# Carregar variáveis de ambiente
load_dotenv('backend-fastapi/.env')

# Conexão com banco
conn = psycopg2.connect(
    host=os.getenv('PGHOST'),
    port=os.getenv('PGPORT'),
    database=os.getenv('PGDATABASE'),
    user=os.getenv('PGUSER'),
    password=os.getenv('PGPASSWORD')
)

cur = conn.cursor()

OUTPUT_DIR = 'frontend/lists'

print("="*60)
print("🚀 GERANDO ARQUIVOS JSON DAS LISTAS AUXILIARES")
print("="*60)

# ============================================================
# 1. ESTADOS DO BRASIL (27 registros)
# ============================================================
print("\n1. 🗺️  Exportando ESTADOS...")

cur.execute("""
    SELECT id_estado, uf, nome_estado, regiao
    FROM formulario_embarcadores.estados_brasil
    ORDER BY nome_estado
""")

estados = []
for row in cur.fetchall():
    estados.append({
        "id_estado": row[0],
        "uf": row[1],
        "nome_estado": row[2],
        "regiao": row[3]
    })

with open(f'{OUTPUT_DIR}/estados.json', 'w', encoding='utf-8') as f:
    json.dump(estados, f, ensure_ascii=False, indent=2)

print(f"   ✅ {len(estados)} estados salvos em estados.json")

# ============================================================
# 2. PAÍSES (61 registros)
# ============================================================
print("\n2. 🌍 Exportando PAÍSES...")

cur.execute("""
    SELECT id_pais, nome_pais, codigo_iso2, codigo_iso3, relevancia
    FROM formulario_embarcadores.paises
    ORDER BY relevancia DESC, nome_pais
""")

paises = []
for row in cur.fetchall():
    paises.append({
        "id_pais": row[0],
        "nome_pais": row[1],
        "codigo_iso2": row[2],
        "codigo_iso3": row[3],
        "relevancia": row[4]
    })

with open(f'{OUTPUT_DIR}/paises.json', 'w', encoding='utf-8') as f:
    json.dump(paises, f, ensure_ascii=False, indent=2)

print(f"   ✅ {len(paises)} países salvos em paises.json")

# ============================================================
# 3. FUNÇÕES/CARGOS (12 registros)
# ============================================================
print("\n3. 👔 Exportando FUNÇÕES DE ENTREVISTADOS...")

cur.execute("""
    SELECT id_funcao, nome_funcao
    FROM formulario_embarcadores.funcoes_entrevistado
    ORDER BY nome_funcao
""")

funcoes = []
for row in cur.fetchall():
    funcoes.append({
        "id_funcao": row[0],
        "nome_funcao": row[1]
    })

with open(f'{OUTPUT_DIR}/funcoes.json', 'w', encoding='utf-8') as f:
    json.dump(funcoes, f, ensure_ascii=False, indent=2)

print(f"   ✅ {len(funcoes)} funções salvas em funcoes.json")

# ============================================================
# 4. INSTITUIÇÕES (5 registros)
# ============================================================
print("\n4. 🏛️  Exportando INSTITUIÇÕES...")

cur.execute("""
    SELECT id_instituicao, nome_instituicao, tipo_instituicao, cnpj
    FROM formulario_embarcadores.instituicoes
    ORDER BY nome_instituicao
""")

instituicoes = []
for row in cur.fetchall():
    instituicoes.append({
        "id_instituicao": row[0],
        "nome_instituicao": row[1],
        "tipo_instituicao": row[2],
        "cnpj": row[3]
    })

with open(f'{OUTPUT_DIR}/instituicoes.json', 'w', encoding='utf-8') as f:
    json.dump(instituicoes, f, ensure_ascii=False, indent=2)

print(f"   ✅ {len(instituicoes)} instituições salvas em instituicoes.json")

# ============================================================
# 5. ENTREVISTADORES (2 registros)
# ============================================================
print("\n5. 🎤 Exportando ENTREVISTADORES...")

cur.execute("""
    SELECT id_entrevistador, nome_completo, email, id_instituicao
    FROM formulario_embarcadores.entrevistadores
    ORDER BY nome_completo
""")

entrevistadores = []
for row in cur.fetchall():
    entrevistadores.append({
        "id_entrevistador": row[0],
        "nome_completo": row[1],
        "email": row[2],
        "id_instituicao": row[3]
    })

with open(f'{OUTPUT_DIR}/entrevistadores.json', 'w', encoding='utf-8') as f:
    json.dump(entrevistadores, f, ensure_ascii=False, indent=2)

print(f"   ✅ {len(entrevistadores)} entrevistadores salvos em entrevistadores.json")

# ============================================================
# 6. MUNICÍPIOS (5570+ registros) - SEM GEOMETRY
# ============================================================
print("\n6. 🏙️  Exportando MUNICÍPIOS (isso pode demorar...)...")

# Primeiro, verificar quais colunas existem na tabela
cur.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'dados_brasil' 
    AND table_name = 'dim_municipio'
    ORDER BY ordinal_position
""")

colunas = [row[0] for row in cur.fetchall()]
print(f"   📋 Colunas encontradas: {', '.join(colunas)}")

# Remover geometry das colunas
colunas_sem_geometry = [c for c in colunas if c not in ['geometry', 'geom', 'the_geom']]

# Construir query dinamicamente
colunas_query = ', '.join(colunas_sem_geometry)

cur.execute(f"""
    SELECT {colunas_query}
    FROM dados_brasil.dim_municipio
    ORDER BY nm_mun
""")

municipios = []
for row in cur.fetchall():
    municipio = {}
    for i, coluna in enumerate(colunas_sem_geometry):
        municipio[coluna] = row[i]
    municipios.append(municipio)

# Salvar arquivo completo
with open(f'{OUTPUT_DIR}/municipios_completo.json', 'w', encoding='utf-8') as f:
    json.dump(municipios, f, ensure_ascii=False, indent=2, default=json_converter)

print(f"   ✅ {len(municipios)} municípios salvos em municipios_completo.json")

# ============================================================
# 7. MUNICÍPIOS POR UF (arquivos separados para cache)
# ============================================================
print("\n7. 📁 Exportando MUNICÍPIOS POR UF (27 arquivos)...")

# Criar subdiretório para municípios por UF
os.makedirs(f'{OUTPUT_DIR}/municipios_por_uf', exist_ok=True)

# Obter lista de UFs
cur.execute("""
    SELECT DISTINCT sigla_uf 
    FROM dados_brasil.dim_municipio 
    ORDER BY sigla_uf
""")

ufs = [row[0] for row in cur.fetchall()]

for uf in ufs:
    cur.execute(f"""
        SELECT {colunas_query}
        FROM dados_brasil.dim_municipio
        WHERE sigla_uf = %s
        ORDER BY nm_mun
    """, (uf,))
    
    municipios_uf = []
    for row in cur.fetchall():
        municipio = {}
        for i, coluna in enumerate(colunas_sem_geometry):
            municipio[coluna] = row[i]
        municipios_uf.append(municipio)
    
    with open(f'{OUTPUT_DIR}/municipios_por_uf/{uf}.json', 'w', encoding='utf-8') as f:
        json.dump(municipios_uf, f, ensure_ascii=False, indent=2, default=json_converter)
    
    print(f"   ✅ {uf}: {len(municipios_uf)} municípios")

# ============================================================
# FECHAR CONEXÃO
# ============================================================
cur.close()
conn.close()

print("\n" + "="*60)
print("✅ TODOS OS ARQUIVOS JSON GERADOS COM SUCESSO!")
print("="*60)
print(f"\n📁 Arquivos salvos em: {OUTPUT_DIR}/")
print("""
Arquivos criados:
  - estados.json (27 registros)
  - paises.json (61 registros)
  - funcoes.json (12 registros)
  - instituicoes.json (5 registros)
  - entrevistadores.json (2 registros)
  - municipios_completo.json (5570+ registros)
  - municipios_por_uf/*.json (27 arquivos, um por UF)
""")

