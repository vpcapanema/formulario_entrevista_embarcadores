#!/usr/bin/env python3
"""
Teste rápido da API de CNPJ
"""

import requests

BASE_URL = "http://localhost:8000"

print("🧪 Testando API de CNPJ\n")

# 1. CNPJ válido (Magazine Luiza)
print("1. CNPJ válido (Magazine Luiza):")
r = requests.get(f"{BASE_URL}/api/external/cnpj/47960950000121")
print(f"   Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"   ✅ {data['data']['razao_social']}")
print()

# 2. CNPJ inválido
print("2. CNPJ inválido (00000000000000):")
r = requests.get(f"{BASE_URL}/api/external/cnpj/00000000000000")
print(f"   Status: {r.status_code}")
if r.status_code == 404:
    print(f"   ✅ Retornou 404 corretamente")
else:
    print(f"   ❌ Deveria retornar 404, mas retornou {r.status_code}")
print()

# 3. Validar CNPJ
print("3. Validar CNPJ:")
r = requests.get(f"{BASE_URL}/api/external/cnpj/47960950000121/validar")
print(f"   Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"   ✅ Válido: {data['valido']}, Ativo: {data['ativo']}")
