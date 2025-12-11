#!/usr/bin/env python3
"""Script para consultar estrutura das 4 tabelas do banco"""

import sys
sys.path.insert(0, '.')

from app.database import get_db
from sqlalchemy import inspect

def consultar_estrutura():
    """Consulta e exibe estrutura das 4 tabelas"""
    
    db = next(get_db())
    inspector = inspect(db.bind)
    
    tabelas = ['empresas']
    
    for tabela in tabelas:
        print(f"\n{'='*80}")
        print(f"TABELA: formulario_embarcadores.{tabela}")
        print('='*80)
        
        columns = inspector.get_columns(tabela, schema='formulario_embarcadores')
        
        for col in columns:
            nome = col['name']
            tipo = str(col['type'])
            nullable = 'NULL' if col['nullable'] else 'NOT NULL'
            default = f" DEFAULT {col['default']}" if col['default'] else ''
            autoincrement = ' (AUTO)' if col.get('autoincrement') else ''
            
            print(f"{nome:40} {tipo:25} {nullable:10} {autoincrement}{default}")
    
    db.close()

if __name__ == "__main__":
    consultar_estrutura()
