#!/usr/bin/env python3
"""
Teste de Conexão - SISTEMA_FORMULARIOS_ENTREVISTA → Render PostgreSQL
Verifica se a aplicação consegue se conectar e ler dados do banco
"""

import psycopg2
import os
import sys

# Configuração do Render PostgreSQL
DB_CONFIG = {
    'host': 'dpg-d5rc90pr0fns73e2q4n0-a.oregon-postgres.render.com',
    'port': 5432,
    'database': 'sigma_pli_qr53',
    'user': 'sigma_user',
    'password': 'pzRszi7xZ4IzjehPVNdCR73DNCJ9jiq5',
    'sslmode': 'require'
}

SCHEMA = 'formulario_embarcadores'

def testar_conexao():
    """Testa conexão com o banco"""
    print("=" * 60)
    print("🔗 TESTE DE CONEXÃO - FORMULÁRIOS EMBARCADORES")
    print("=" * 60)
    print(f"📌 Host: {DB_CONFIG['host']}")
    print(f"📌 Database: {DB_CONFIG['database']}")
    print(f"📌 Schema: {SCHEMA}")
    print("-" * 60)
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Configurar search_path
        cur.execute(f"SET search_path TO {SCHEMA}")
        
        print("\n✅ CONEXÃO ESTABELECIDA COM SUCESSO!\n")
        
        # Listar tabelas e contagens
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = %s 
            ORDER BY table_name
        """, (SCHEMA,))
        
        tabelas = cur.fetchall()
        
        print(f"📊 TABELAS NO SCHEMA '{SCHEMA}':")
        print("-" * 40)
        
        for (tabela,) in tabelas:
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.{tabela}")
            count = cur.fetchone()[0]
            status = "✓" if count > 0 else "○"
            print(f"  {status} {tabela}: {count} registros")
        
        print("-" * 40)
        
        # Testar dados de referência essenciais
        print("\n📋 DADOS DE REFERÊNCIA:")
        
        # Estados
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.estados_brasil")
        print(f"  • Estados: {cur.fetchone()[0]} registros")
        
        # Países
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.paises")
        print(f"  • Países: {cur.fetchone()[0]} registros")
        
        # Municípios SP
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.municipios_sp")
        print(f"  • Municípios SP: {cur.fetchone()[0]} registros")
        
        # Funções
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.funcoes_entrevistado")
        print(f"  • Funções: {cur.fetchone()[0]} registros")
        
        # Instituições
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.instituicoes")
        print(f"  • Instituições: {cur.fetchone()[0]} registros")
        
        # Exemplo de consulta que a API usará
        print("\n🔍 TESTE DE CONSULTA (estados_brasil):")
        cur.execute(f"""
            SELECT id_estado, nome_estado, uf 
            FROM {SCHEMA}.estados_brasil 
            ORDER BY nome_estado 
            LIMIT 5
        """)
        for row in cur.fetchall():
            print(f"   {row[0]:2} | {row[1]:20} | {row[2]}")
        
        print("\n" + "=" * 60)
        print("✅ TODOS OS TESTES PASSARAM COM SUCESSO!")
        print("   A aplicação está pronta para usar o banco Render.")
        print("=" * 60)
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO DE CONEXÃO: {e}")
        print("\nVerifique:")
        print("  1. Credenciais no .env")
        print("  2. Acesso de rede ao Render")
        print("  3. Schema existe no banco")
        return False

if __name__ == "__main__":
    success = testar_conexao()
    sys.exit(0 if success else 1)
