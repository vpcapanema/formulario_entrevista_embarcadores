import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def check_tables():
    conn = await asyncpg.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    
    # Estrutura da tabela entrevistadores
    print('=== TABELA: entrevistadores ===')
    cols = await conn.fetch('''
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'formulario_embarcadores' 
        AND table_name = 'entrevistadores'
        ORDER BY ordinal_position
    ''')
    for c in cols:
        print(f"  {c['column_name']}: {c['data_type']} (null: {c['is_nullable']})")
    
    # Estrutura da tabela instituicoes
    print('\n=== TABELA: instituicoes ===')
    cols = await conn.fetch('''
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'formulario_embarcadores' 
        AND table_name = 'instituicoes'
        ORDER BY ordinal_position
    ''')
    for c in cols:
        print(f"  {c['column_name']}: {c['data_type']} (null: {c['is_nullable']})")
    
    # Dados existentes
    print('\n=== ENTREVISTADORES EXISTENTES ===')
    rows = await conn.fetch('SELECT * FROM formulario_embarcadores.entrevistadores LIMIT 3')
    for r in rows:
        print(f"  ID {r['id_entrevistador']}: {dict(r)}")
    
    print('\n=== INSTITUICOES EXISTENTES ===')
    rows = await conn.fetch('SELECT * FROM formulario_embarcadores.instituicoes')
    for r in rows:
        print(f"  ID {r['id_instituicao']}: {dict(r)}")
    
    await conn.close()

asyncio.run(check_tables())
