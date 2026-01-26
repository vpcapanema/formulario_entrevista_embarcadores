#!/usr/bin/env python3
"""
Script para criar schema formulario_embarcadores no banco Render
"""
import asyncio
import asyncpg
import ssl
import os

# Configuração do banco Render
DATABASE_URL = "postgresql://sigma_user:pzRszi7xZ4IzjehPVNdCR73DNCJ9jiq5@dpg-d5rc90pr0fns73e2q4n0-a.oregon-postgres.render.com:5432/sigma_pli_qr53"


async def main():
    print("🔗 Conectando ao banco Render...")
    
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    
    conn = await asyncpg.connect(DATABASE_URL, ssl=ssl_ctx)
    
    try:
        # Listar schemas existentes
        print("\n📋 Schemas existentes:")
        schemas = await conn.fetch("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
            ORDER BY schema_name
        """)
        for s in schemas:
            print(f"   - {s['schema_name']}")
        
        # Verificar se schema já existe
        exists = await conn.fetchval("""
            SELECT EXISTS(
                SELECT 1 FROM information_schema.schemata 
                WHERE schema_name = 'formulario_embarcadores'
            )
        """)
        
        if exists:
            print("\n⚠️ Schema 'formulario_embarcadores' já existe!")
        else:
            print("\n✅ Schema 'formulario_embarcadores' NÃO existe - pode ser criado")
        
    finally:
        await conn.close()
        print("\n🔌 Conexão fechada")


if __name__ == "__main__":
    asyncio.run(main())
