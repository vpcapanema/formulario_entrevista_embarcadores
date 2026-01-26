#!/usr/bin/env python3
"""
Script de migração: Adicionar data_entrevista com timezone de Brasília
Sistema PLI 2050 - Formulário de Entrevistas
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from pathlib import Path

# Carregar variáveis de ambiente
env_path = Path(__file__).parent.parent / "backend-fastapi" / ".env"
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=env_path)

# Configurações do banco
DB_CONFIG = {
    'host': os.getenv('PGHOST', 'dpg-d5rc90pr0fns73e2q4n0-a.oregon-postgres.render.com'),
    'port': int(os.getenv('PGPORT', 5432)),
    'database': os.getenv('PGDATABASE', 'sigma_pli_qr53'),
    'user': os.getenv('PGUSER', 'sigma_user'),
    'password': os.getenv('PGPASSWORD', 'pzRszi7xZ4IzjehPVNdCR73DNCJ9jiq5'),
    'sslmode': os.getenv('POSTGRES_SSLMODE', 'require')
}

def executar_migracao():
    """Executa a migração da data_entrevista para timezone de Brasília"""

    print("=" * 80)
    print("🔄 MIGRAÇÃO: data_entrevista com timezone de Brasília")
    print("=" * 80)

    try:
        # Conectar ao banco
        print("📡 Conectando ao banco de dados...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        print("✅ Conexão estabelecida!")

        # Executar migração
        print("\n🔄 Executando migração...")

        # SQL da migração
        sql_migracao = """
        -- Conectar ao schema correto
        SET search_path TO formulario_embarcadores, public;

        -- Remover o default atual (NOW())
        ALTER TABLE formulario_embarcadores.pesquisas
        ALTER COLUMN data_entrevista DROP DEFAULT;

        -- Adicionar novo default usando timezone de Brasília (UTC-3)
        ALTER TABLE formulario_embarcadores.pesquisas
        ALTER COLUMN data_entrevista SET DEFAULT (NOW() AT TIME ZONE 'UTC-3');

        -- Para registros que ainda não têm data_entrevista, definir como NOW() em Brasília
        UPDATE formulario_embarcadores.pesquisas
        SET data_entrevista = (NOW() AT TIME ZONE 'UTC-3')
        WHERE data_entrevista IS NULL;
        """

        cursor.execute(sql_migracao)
        print("✅ Migração executada com sucesso!")

        # Verificar resultados
        print("\n📊 Verificando resultados...")

        # Contar registros
        cursor.execute("""
            SELECT
                COUNT(*) as total_pesquisas,
                COUNT(data_entrevista) as pesquisas_com_data,
                MIN(data_entrevista) as data_mais_antiga,
                MAX(data_entrevista) as data_mais_recente
            FROM formulario_embarcadores.pesquisas
        """)

        result = cursor.fetchone()
        print(f"📈 Total de pesquisas: {result[0]}")
        print(f"📅 Com data_entrevista: {result[1]}")
        print(f"📅 Data mais antiga: {result[2]}")
        print(f"📅 Data mais recente: {result[3]}")

        # Verificar configuração da coluna
        cursor.execute("""
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_schema = 'formulario_embarcadores'
              AND table_name = 'pesquisas'
              AND column_name = 'data_entrevista'
        """)

        col_info = cursor.fetchone()
        print("\n🔧 Configuração da coluna:")
        print(f"   Nome: {col_info[0]}")
        print(f"   Tipo: {col_info[1]}")
        print(f"   Default: {col_info[2]}")

        # Fechar conexão
        cursor.close()
        conn.close()

        print("\n✅ Migração concluída com sucesso!")
        print("🎯 Agora data_entrevista será preenchida automaticamente com horário de Brasília")

    except Exception as e:
        print(f"❌ Erro durante migração: {e}")
        return False

    return True

if __name__ == "__main__":
    sucesso = executar_migracao()
    exit(0 if sucesso else 1)