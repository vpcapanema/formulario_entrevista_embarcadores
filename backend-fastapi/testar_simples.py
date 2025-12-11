#!/usr/bin/env python3
"""
Teste simplificado com campos obrigatórios conforme DDL
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

# CNPJ único
cnpj = str(int(time.time()))[-14:].zfill(14)

payload = {
    "empresa": {
        # NOT NULL (conforme banco real)
        "tipo_empresa": "embarcador",
        "municipio": "São Paulo",
        "razao_social": f"Teste Empresa {cnpj}",
        # Opcionais
        "cnpj": cnpj
    },
    "entrevistado": {
        # NOT NULL (DDL)
        "nome": "João Teste",
        "funcao": "Gerente Logística"
    },
    "pesquisa": {
        # NOT NULL - 29 campos obrigatórios (conforme banco real)
        "tipo_responsavel": "entrevistador",
        "id_responsavel": 1,
        "produto_principal": "Soja",
        "agrupamento_produto": "Grãos",
        "tipo_transporte": "local",
        "origem_pais": "Brasil",
        "destino_pais": "Brasil",
        "distancia": 450.5,
        "tem_paradas": "nao",
        "modos": ["rodoviario"],
        "peso_carga": 25000.0,
        "unidade_peso": "kg",
        "custo_transporte": 5000.0,
        "valor_carga": 50000.0,
        "tipo_embalagem": "Granel",
        "carga_perigosa": "nao",
        "tempo_dias": 2,
        "tempo_horas": 6,
        "tempo_minutos": 30,
        "frequencia": "semanal",
        "importancia_custo": "alta",
        "variacao_custo": 10.0,
        "importancia_tempo": "alta",
        "variacao_tempo": 15.0,
        "importancia_confiabilidade": "alta",
        "variacao_confiabilidade": 5.0,
        "importancia_seguranca": "alta",
        "variacao_seguranca": 3.0,
        "importancia_capacidade": "media",
        "variacao_capacidade": 20.0,
        "tipo_cadeia": "direta",
        # Opcionais
        "origem_estado": "SP",
        "origem_municipio": "Campinas",
        "destino_estado": "SP",
        "destino_municipio": "Santos"
    },
    "produtos": [
        {
            # NOT NULL (DDL)
            "carga": "Soja em grãos"
        }
    ]
}

print(f"🆔 CNPJ: {cnpj}")
print(f"🚀 Testando: {BASE_URL}/api/submit-form-divided")

try:
    response = requests.post(
        f"{BASE_URL}/api/submit-form-divided",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    print(f"📊 Status: {response.status_code}")
    
    if response.status_code == 201:
        print("✅ SUCESSO!")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    else:
        print("❌ ERRO!")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        
except Exception as e:
    print(f"❌ Exceção: {e}")
