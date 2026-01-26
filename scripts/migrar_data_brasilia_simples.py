#!/usr/bin/env python3
"""
Script simples para migrar data_entrevista para timezone de Brasília
"""

import sys
from pathlib import Path

# Adicionar backend-fastapi ao path
sys.path.insert(0, str(Path(__file__).parent / "backend-fastapi"))

try:
    from app.database import engine  # type: ignore  # pylint: disable=import-error
    from sqlalchemy import text

    print("🔄 Iniciando migração de data_entrevista para Brasília...")

    with engine.connect() as conn:
        # Executar migração
        SQL = """
        SET search_path TO formulario_embarcadores, public;

        -- Remover default atual
        ALTER TABLE formulario_embarcadores.pesquisas
        ALTER COLUMN data_entrevista DROP DEFAULT;

        -- Novo default com timezone de Brasília
        ALTER TABLE formulario_embarcadores.pesquisas
        ALTER COLUMN data_entrevista SET DEFAULT (NOW() AT TIME ZONE 'UTC-3');

        -- Atualizar registros existentes sem data
        UPDATE formulario_embarcadores.pesquisas
        SET data_entrevista = (NOW() AT TIME ZONE 'UTC-3')
        WHERE data_entrevista IS NULL;
        """

        conn.execute(text(SQL))
        conn.commit()

        print("✅ Migração executada com sucesso!")

        # Verificar
        result = conn.execute(text("""
            SELECT COUNT(*) as total, COUNT(data_entrevista) as com_data
            FROM formulario_embarcadores.pesquisas
        """)).fetchone()

        print(f"📊 Total de pesquisas: {result[0]}")
        print(f"📅 Com data_entrevista: {result[1]}")

except Exception as e:  # pylint: disable=broad-exception-caught
    print(f"❌ Erro: {e}")
    sys.exit(1)
