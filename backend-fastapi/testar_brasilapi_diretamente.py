#!/usr/bin/env python3
"""
Testar BrasilAPI diretamente
"""

import requests

cnpj_invalido = "00000000000000"
url = f"https://brasilapi.com.br/api/cnpj/v1/{cnpj_invalido}"

print(f"🔍 Testando BrasilAPI diretamente: {url}\n")

try:
    r = requests.get(url)
    print(f"Status: {r.status_code}")
    print(f"Resposta: {r.text}")
    if r.headers.get('content-type'):
        print(f"Content-Type: {r.headers['content-type']}")
except Exception as e:
    print(f"❌ Erro: {e}")
