"""
Script para executar migração: adicionar coluna observacoes_produto_principal
"""
import os
import sys
import psycopg2
from dotenv import load_dotenv

# Carregar variáveis de ambiente
env_path = os.path.join(os.path.dirname(__file__), '..', 'backend-fastapi', '.env')
load_dotenv(env_path)

def main():
    print("=== EXECUTAR MIGRAÇÃO: observacoes_produto_principal ===\n")
    
    # Conectar ao banco
    try:
        conn = psycopg2.connect(
            host=os.getenv('PGHOST'),
            port=os.getenv('PGPORT'),
            database=os.getenv('PGDATABASE'),
            user=os.getenv('PGUSER'),
            password=os.getenv('PGPASSWORD')
        )
        cursor = conn.cursor()
        print("✅ Conectado ao banco de dados RDS\n")
        
        # SQL da migração
        sql = """
        ALTER TABLE formulario_embarcadores.pesquisas 
        ADD COLUMN IF NOT EXISTS observacoes_produto_principal TEXT;
        """
        
        print("📝 Executando migração...")
        print(sql)
        cursor.execute(sql)
        conn.commit()
        print("\n✅ Migração executada com sucesso!")
        
        # Verificar se a coluna existe
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'formulario_embarcadores'
            AND table_name = 'pesquisas'
            AND column_name = 'observacoes_produto_principal';
        """)
        result = cursor.fetchone()
        
        if result:
            print(f"\n✅ Verificação OK:")
            print(f"   Coluna: {result[0]}")
            print(f"   Tipo: {result[1]}")
            print(f"   Nullable: {result[2]}")
        else:
            print("\n⚠️ AVISO: Coluna não encontrada após migração")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ ERRO: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
