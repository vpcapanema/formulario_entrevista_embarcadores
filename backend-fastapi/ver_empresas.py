from app.database import engine
from sqlalchemy import inspect

insp = inspect(engine)
cols = insp.get_columns('empresas', schema='formulario_embarcadores')

print(f"\n=== TABELA: empresas ({len(cols)} campos) ===\n")
print("NOT NULL:")
for c in cols:
    if not c['nullable']:
        print(f"  {c['name']:40s} {str(c['type'])}")

print(f"\nOPCIONAIS ({len([c for c in cols if c['nullable']])} campos):")
for c in cols:
    if c['nullable']:
        print(f"  {c['name']:40s} {str(c['type'])}")
