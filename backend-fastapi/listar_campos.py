#!/usr/bin/env python3
"""Script para listar campos NOT NULL e OPTIONAL das tabelas"""

import sys
sys.path.insert(0, '.')

from app.database import get_db
from sqlalchemy import inspect

db = next(get_db())
inspector = inspect(db.bind)

tabelas = ['empresas', 'entrevistados', 'pesquisas', 'produtos_transportados']

for tabela in tabelas:
    print(f'\n{"="*60}')
    print(f'{tabela.upper()}')
    print('='*60)
    columns = inspector.get_columns(tabela, schema='formulario_embarcadores')
    print('NOT NULL:')
    for col in columns:
        if not col['nullable'] and not col.get('autoincrement'):
            print(f'  - {col["name"]}')
    print('\nOPTIONAL:')
    for col in columns:
        if col['nullable'] or col.get('autoincrement'):
            auto = " (AUTO)" if col.get('autoincrement') else ""
            print(f'  - {col["name"]}{auto}')
