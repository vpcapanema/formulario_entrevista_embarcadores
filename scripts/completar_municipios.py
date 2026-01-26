#!/usr/bin/env python3
"""Completar inserção de municípios ignorando duplicatas"""
import asyncio
import asyncpg
import ssl
import re
from pathlib import Path

async def completar_municipios():
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    
    conn = await asyncpg.connect(
        'postgresql://sigma_user:pzRszi7xZ4IzjehPVNdCR73DNCJ9jiq5@dpg-d5rc90pr0fns73e2q4n0-a.oregon-postgres.render.com:5432/sigma_pli_qr53',
        ssl=ssl_ctx
    )
    
    print('📋 Completando municípios de SP...')
    
    # Ler arquivo SQL
    sql_file = Path(__file__).parent.parent / "sql" / "municipios_sp_completo.sql"
    sql_content = sql_file.read_text(encoding="utf-8")
    
    # Encontrar todos os INSERTs - formato: ('Nome', 'codigo_ibge', 'regiao')
    inserts = re.findall(r"\('([^']+)',\s*'(\d+)',\s*'([^']+)'\)", sql_content)
    
    print(f'   Encontrados {len(inserts)} municípios no arquivo SQL')
    
    inseridos = 0
    ignorados = 0
    
    for nome, ibge, regiao in inserts:
        nome_limpo = nome.replace("''", "'")  # Tratar aspas escapadas
        try:
            await conn.execute("""
                INSERT INTO formulario_embarcadores.municipios_sp (nome_municipio, codigo_ibge, regiao) 
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING
            """, nome_limpo, ibge, regiao)
            inseridos += 1
        except Exception as e:
            ignorados += 1
    
    count = await conn.fetchval("SELECT COUNT(*) FROM formulario_embarcadores.municipios_sp")
    print(f'   ✅ Total de municípios no banco: {count}')
    
    await conn.close()

asyncio.run(completar_municipios())
