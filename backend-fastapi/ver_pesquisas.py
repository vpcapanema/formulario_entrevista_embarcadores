from app.database import engine
from sqlalchemy import inspect

insp = inspect(engine)
cols = insp.get_columns('pesquisas', schema='formulario_embarcadores')

print("\n=== TABELA: pesquisas ===\n")
print("NOT NULL FIELDS:")
for c in cols:
    if not c['nullable']:
        print(f"  {c['name']:35s} {str(c['type'])}")

print("\nNULLABLE FIELDS:")
for c in cols:
    if c['nullable']:
        print(f"  {c['name']:35s} {str(c['type'])}")
