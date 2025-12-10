#!/usr/bin/env python3
"""
Script para executar migration no banco de dados PostgreSQL do Render
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys

# Dados de conexão
DB_CONFIG = {
    'host': 'sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com',
    'port': 5432,
    'database': 'sigma_pli',
    'user': 'sigma_admin',
    'password': 'Malditas131533*'
}

# SQL da migration
MIGRATION_SQL = """
-- Adicionar UNIQUE constraint em (id_empresa, email_lower) para evitar duplicatas
-- Isso permite que o mesmo email seja usado em empresas diferentes, mas não na mesma empresa

-- Primeiro, remover registros duplicados se existirem (manter apenas o primeiro)
DELETE FROM formulario_embarcadores.entrevistados t1
WHERE id_entrevistado > (
    SELECT MIN(id_entrevistado)
    FROM formulario_embarcadores.entrevistados t2
    WHERE t1.id_empresa = t2.id_empresa
    AND t1.email_lower IS NOT NULL
    AND t1.email_lower = t2.email_lower
);

-- Adicionar a constraint UNIQUE
ALTER TABLE formulario_embarcadores.entrevistados
    ADD CONSTRAINT uq_entrevistado_empresa_email 
    UNIQUE (id_empresa, email_lower) 
    DEFERRABLE INITIALLY DEFERRED;

-- Comentário explicativo
COMMENT ON CONSTRAINT uq_entrevistado_empresa_email 
ON formulario_embarcadores.entrevistados 
IS 'Um email pode existir em empresas diferentes, mas não pode haver duplicatas dentro da mesma empresa';
"""

def execute_migration():
    """Conecta ao banco e executa a migration"""
    try:
        print("🔌 Conectando ao banco de dados...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        print("✅ Conexão estabelecida!")
        print(f"   Host: {DB_CONFIG['host']}")
        print(f"   Database: {DB_CONFIG['database']}")
        print(f"   User: {DB_CONFIG['user']}")
        
        print("\n📋 Executando migration...")
        print("-" * 60)
        
        # Executar migration
        cursor.execute(MIGRATION_SQL)
        
        print("✅ Migration executada com sucesso!")
        
        # Verificar se a constraint foi criada
        cursor.execute("""
            SELECT constraint_name, table_name
            FROM information_schema.table_constraints
            WHERE constraint_name = 'uq_entrevistado_empresa_email'
        """)
        result = cursor.fetchone()
        
        if result:
            print(f"✅ Constraint verificada: {result[0]} em {result[1]}")
        else:
            print("⚠️  Constraint não foi encontrada")
        
        # Contar registros
        cursor.execute("SELECT COUNT(*) FROM formulario_embarcadores.entrevistados")
        count = cursor.fetchone()[0]
        print(f"✅ Total de entrevistados: {count}")
        
        cursor.close()
        conn.close()
        print("\n✅ Tudo concluído com sucesso!")
        return True
        
    except psycopg2.Error as e:
        print(f"\n❌ Erro no banco de dados: {e}")
        print(f"   Código de erro: {e.pgcode}")
        return False
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        return False

if __name__ == "__main__":
    success = execute_migration()
    sys.exit(0 if success else 1)
