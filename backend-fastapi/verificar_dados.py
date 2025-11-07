"""Verificar dados inseridos no banco"""
from sqlalchemy import create_engine, text
from app.database import DATABASE_URL, SCHEMA_NAME

engine = create_engine(DATABASE_URL)
conn = engine.connect()

# Contar pesquisas
result = conn.execute(text(f"SELECT COUNT(*) FROM {SCHEMA_NAME}.pesquisas WHERE status='finalizada'"))
total_pesquisas = result.fetchone()[0]
print(f"\n✅ Total de pesquisas finalizadas: {total_pesquisas}")

# Contar produtos
result2 = conn.execute(text(f"SELECT COUNT(*) FROM {SCHEMA_NAME}.produtos_transportados"))
total_produtos = result2.fetchone()[0]
print(f"✅ Total de produtos transportados: {total_produtos}")

# Listar primeiras 5
result3 = conn.execute(text(f"""
    SELECT produto_principal, tipo_transporte, origem_pais, destino_pais 
    FROM {SCHEMA_NAME}.pesquisas 
    WHERE status='finalizada' 
    ORDER BY id_pesquisa 
    LIMIT 5
"""))

print(f"\n📊 Primeiras 5 pesquisas:")
for row in result3:
    print(f"  - {row[0]:20} | {row[1]:12} | {row[2]:10} → {row[3]:15}")

conn.close()
print("\n🎉 Dados prontos para teste nas páginas Respostas e Analytics!\n")
