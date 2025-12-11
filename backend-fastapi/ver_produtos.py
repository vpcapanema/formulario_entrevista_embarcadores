from app.database import engine
from sqlalchemy import inspect

insp = inspect(engine)
cols = insp.get_columns('produtos_transportados', schema='formulario_embarcadores')

print("\n=== TABELA: produtos_transportados ===\n")
for c in cols:
    nullable_str = "NULLABLE" if c['nullable'] else "NOT NULL"
    print(f"{c['name']:30s} {str(c['type']):20s} {nullable_str}")
