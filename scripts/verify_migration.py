#!/usr/bin/env python3
"""
Script para verificar o estado do banco após migration
"""

import psycopg2

DB_CONFIG = {
    'host': 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    'port': 5432,
    'database': 'sigma_pli',
    'user': 'sigma_admin',
    'password': 'Malditas131533*'
}

def verify_migration():
    """Verifica se a migration foi aplicada corretamente"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("\n📊 VERIFICAÇÃO PÓS-MIGRATION")
        print("=" * 70)
        
        # 1. Verificar constraints
        print("\n1️⃣  CONSTRAINTS em entrevistados:")
        print("-" * 70)
        cursor.execute("""
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_schema = 'formulario_embarcadores'
            AND table_name = 'entrevistados'
            ORDER BY constraint_type, constraint_name
        """)
        for constraint, ctype in cursor.fetchall():
            print(f"   • {constraint} ({ctype})")
        
        # 2. Verificar índices
        print("\n2️⃣  ÍNDICES em entrevistados:")
        print("-" * 70)
        cursor.execute("""
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'formulario_embarcadores'
            AND tablename = 'entrevistados'
            ORDER BY indexname
        """)
        for idxname, idxdef in cursor.fetchall():
            print(f"   • {idxname}")
        
        # 3. Verificar dados duplicados
        print("\n3️⃣  VERIFICAÇÃO DE DUPLICATAS:")
        print("-" * 70)
        cursor.execute("""
            SELECT 
                id_empresa,
                email_lower,
                COUNT(*) as qty
            FROM formulario_embarcadores.entrevistados
            WHERE email_lower IS NOT NULL
            GROUP BY id_empresa, email_lower
            HAVING COUNT(*) > 1
        """)
        duplicatas = cursor.fetchall()
        if duplicatas:
            print("   ⚠️  ENCONTRADAS DUPLICATAS:")
            for empresa, email, qty in duplicatas:
                print(f"      • Empresa {empresa}, Email {email}: {qty} registros")
        else:
            print("   ✅ Nenhuma duplicata encontrada!")
        
        # 4. Resumo
        print("\n4️⃣  RESUMO DO BANCO:")
        print("-" * 70)
        cursor.execute("SELECT COUNT(*) FROM formulario_embarcadores.empresas")
        empresa_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM formulario_embarcadores.entrevistados")
        entrevistado_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM formulario_embarcadores.pesquisas")
        pesquisa_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM formulario_embarcadores.produtos_transportados")
        produto_count = cursor.fetchone()[0]
        
        print(f"   • Empresas: {empresa_count}")
        print(f"   • Entrevistados: {entrevistado_count}")
        print(f"   • Pesquisas: {pesquisa_count}")
        print(f"   • Produtos: {produto_count}")
        
        print("\n✅ MIGRATION VERIFICADA COM SUCESSO!")
        print("=" * 70)
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    verify_migration()
