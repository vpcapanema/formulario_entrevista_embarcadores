#!/usr/bin/env python3
"""Verificar estado do schema"""
import asyncio
import asyncpg
import ssl

async def verificar():
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    
    conn = await asyncpg.connect(
        'postgresql://sigma_user:pzRszi7xZ4IzjehPVNdCR73DNCJ9jiq5@dpg-d5rc90pr0fns73e2q4n0-a.oregon-postgres.render.com:5432/sigma_pli_qr53',
        ssl=ssl_ctx
    )
    
    print('=== RESUMO DO SCHEMA formulario_embarcadores ===\n')
    
    tables = await conn.fetch("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'formulario_embarcadores'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)
    
    print(f'Total de tabelas: {len(tables)}\n')
    
    for t in tables:
        tname = t['table_name']
        count = await conn.fetchval(f"SELECT COUNT(*) FROM formulario_embarcadores.{tname}")
        print(f'  - {tname}: {count} registros')
    
    await conn.close()

asyncio.run(verificar())
