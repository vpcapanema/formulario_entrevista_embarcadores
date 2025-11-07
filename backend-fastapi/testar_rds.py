#!/usr/bin/env python3
"""
Script de teste de conexão com RDS Sigma PLI
Verifica conectividade e existência do schema
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Configurações do RDS Sigma PLI
RDS_CONFIG = {
    'host': 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    'port': 5432,
    'database': 'sigma_pli',
    'user': 'sigma_admin',
    'password': 'Malditas131533*'
}

print("=" * 80)
print("🔍 TESTE DE CONEXÃO - RDS SIGMA PLI")
print("=" * 80)
print(f"\n📡 Conectando ao RDS...")
print(f"   Host: {RDS_CONFIG['host']}")
print(f"   Database: {RDS_CONFIG['database']}")
print(f"   User: {RDS_CONFIG['user']}")
print()

try:
    # Conectar ao RDS
    conn = psycopg2.connect(**RDS_CONFIG)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    print("✅ CONEXÃO BEM-SUCEDIDA!\n")
    
    # Versão do PostgreSQL
    cursor.execute('SELECT version()')
    version = cursor.fetchone()[0]
    print(f"📊 PostgreSQL Version:")
    print(f"   {version[:80]}...")
    print()
    
    # Verificar schema formulario_embarcadores
    cursor.execute("""
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'formulario_embarcadores'
    """)
    schema_exists = cursor.fetchone()
    
    if schema_exists:
        print("✅ Schema 'formulario_embarcadores': EXISTE")
        
        # Contar tabelas no schema
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'formulario_embarcadores'
        """)
        table_count = cursor.fetchone()[0]
        print(f"   📋 Tabelas encontradas: {table_count}")
        
        # Listar tabelas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'formulario_embarcadores'
            ORDER BY table_name
        """)
        tables = cursor.fetchall()
        
        if tables:
            print("\n📌 Tabelas no schema:")
            for i, (table,) in enumerate(tables, 1):
                print(f"   {i:2d}. {table}")
    else:
        print("❌ Schema 'formulario_embarcadores': NÃO EXISTE")
        print("\n💡 Próximo passo: Executar script de criação do banco de dados")
        print("   Comando: cd backend-fastapi && python criar_banco.py")
    
    print()
    
    # Verificar outros schemas disponíveis
    cursor.execute("""
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        ORDER BY schema_name
    """)
    schemas = cursor.fetchall()
    
    print("📂 Schemas disponíveis no banco:")
    for schema, in schemas:
        print(f"   - {schema}")
    
    print()
    print("=" * 80)
    print("✅ TESTE CONCLUÍDO COM SUCESSO!")
    print("=" * 80)
    
    cursor.close()
    conn.close()

except psycopg2.OperationalError as e:
    print("❌ ERRO DE CONEXÃO!")
    print(f"\nDetalhes: {e}")
    print("\n🔧 Verifique:")
    print("   1. Credenciais corretas")
    print("   2. Security Group permite seu IP (porta 5432)")
    print("   3. RDS está com 'Publicly Accessible' habilitado")
    print("   4. Conexão com a internet está funcionando")

except Exception as e:
    print(f"❌ ERRO INESPERADO: {e}")

finally:
    print()
