"""
Script para executar migração do schema:
Remover constraint NOT NULL de origem/destino estado/municipio
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.database import DATABASE_URL, SCHEMA_NAME

engine = create_engine(DATABASE_URL)

def executar_migracao():
    """
    Remove constraint NOT NULL dos campos:
    - origem_estado
    - origem_municipio  
    - destino_estado
    - destino_municipio
    
    MOTIVO: Esses campos só são obrigatórios quando país = 'Brasil'
    """
    
    print("\n" + "="*70)
    print("🔧 MIGRAÇÃO: Corrigir campos nullable origem/destino")
    print("="*70)
    
    with engine.connect() as conn:
        # Iniciar transação
        trans = conn.begin()
        
        try:
            # 1. Remover NOT NULL de origem_estado
            print("\n📝 Alterando origem_estado para nullable...")
            conn.execute(text(f"""
                ALTER TABLE {SCHEMA_NAME}.pesquisas 
                ALTER COLUMN origem_estado DROP NOT NULL
            """))
            print("   ✅ origem_estado agora aceita NULL")
            
            # 2. Remover NOT NULL de origem_municipio
            print("\n📝 Alterando origem_municipio para nullable...")
            conn.execute(text(f"""
                ALTER TABLE {SCHEMA_NAME}.pesquisas 
                ALTER COLUMN origem_municipio DROP NOT NULL
            """))
            print("   ✅ origem_municipio agora aceita NULL")
            
            # 3. Remover NOT NULL de destino_estado
            print("\n📝 Alterando destino_estado para nullable...")
            conn.execute(text(f"""
                ALTER TABLE {SCHEMA_NAME}.pesquisas 
                ALTER COLUMN destino_estado DROP NOT NULL
            """))
            print("   ✅ destino_estado agora aceita NULL")
            
            # 4. Remover NOT NULL de destino_municipio
            print("\n📝 Alterando destino_municipio para nullable...")
            conn.execute(text(f"""
                ALTER TABLE {SCHEMA_NAME}.pesquisas 
                ALTER COLUMN destino_municipio DROP NOT NULL
            """))
            print("   ✅ destino_municipio agora aceita NULL")
            
            # 5. Adicionar comentários
            print("\n📝 Adicionando comentários explicativos...")
            conn.execute(text(f"""
                COMMENT ON COLUMN {SCHEMA_NAME}.pesquisas.origem_estado IS 
                'Estado de origem (obrigatório apenas se origem_pais = ''Brasil'')'
            """))
            
            conn.execute(text(f"""
                COMMENT ON COLUMN {SCHEMA_NAME}.pesquisas.origem_municipio IS 
                'Município de origem (obrigatório apenas se origem_pais = ''Brasil'')'
            """))
            
            conn.execute(text(f"""
                COMMENT ON COLUMN {SCHEMA_NAME}.pesquisas.destino_estado IS 
                'Estado de destino (obrigatório apenas se destino_pais = ''Brasil'')'
            """))
            
            conn.execute(text(f"""
                COMMENT ON COLUMN {SCHEMA_NAME}.pesquisas.destino_municipio IS 
                'Município de destino (obrigatório apenas se destino_pais = ''Brasil'')'
            """))
            print("   ✅ Comentários adicionados")
            
            # Commit
            trans.commit()
            
            print("\n" + "="*70)
            print("✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
            print("="*70)
            
            # Verificar mudanças
            print("\n📊 Verificando alterações...")
            result = conn.execute(text(f"""
                SELECT 
                    column_name,
                    is_nullable,
                    data_type
                FROM information_schema.columns 
                WHERE table_schema = '{SCHEMA_NAME}'
                  AND table_name = 'pesquisas'
                  AND column_name IN ('origem_estado', 'origem_municipio', 'destino_estado', 'destino_municipio')
                ORDER BY column_name
            """))
            
            print("\nColuna                 | Nullable | Tipo")
            print("-" * 50)
            for row in result:
                nullable_icon = "✅" if row[1] == "YES" else "❌"
                print(f"{row[0]:22} | {nullable_icon:8} | {row[2]}")
            
            print("\n" + "="*70)
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ ERRO ao executar migração: {str(e)}")
            raise

if __name__ == "__main__":
    executar_migracao()
