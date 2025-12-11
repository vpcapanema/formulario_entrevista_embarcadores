from app.database import engine
from sqlalchemy import inspect

insp = inspect(engine)

tabelas = ['empresas', 'entrevistados', 'pesquisas', 'produtos_transportados']

for tabela in tabelas:
    cols = insp.get_columns(tabela, schema='formulario_embarcadores')
    
    print(f"\n{'='*80}")
    print(f"TABELA: {tabela} ({len(cols)} campos)")
    print('='*80)
    
    print("\nNOT NULL:")
    not_null = [c for c in cols if not c['nullable']]
    for c in not_null:
        print(f"  {c['name']:40s} {str(c['type'])}")
    
    print(f"\nOPCIONAIS ({len([c for c in cols if c['nullable']])} campos):")
    nullable = [c for c in cols if c['nullable']]
    for c in nullable:
        print(f"  {c['name']:40s} {str(c['type'])}")
