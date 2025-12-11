#!/usr/bin/env python3
"""
============================================================
TESTE: Endpoint /api/submit-form-divided
============================================================
Testa o novo endpoint com payload dividido em 4 subpayloads
"""

import requests
import json
from datetime import date
import time

# Configurações
BASE_URL = "http://localhost:8000"  # Porta do FastAPI
HEADERS = {
    "Content-Type": "application/json"
}

def testar_endpoint_divided():
    """Testa o novo endpoint com payload dividido"""

    # Payload dividido conforme os novos schemas
    # CNPJ único baseado em timestamp
    cnpj_unico = str(int(time.time()))[-14:].zfill(14)
    print(f"🆔 Usando CNPJ: {cnpj_unico}")
    
    payload = {
        "empresa": {
            "tipo_empresa": "embarcador",
            "municipio": "São Paulo",
            "razao_social": f"Empresa Teste {cnpj_unico}",
            "cnpj": cnpj_unico
        },
        "entrevistado": {
            "nome": "João Silva",
            "funcao": "Gerente Logística"
        },
        "pesquisa": {
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
            "tipo_cadeia": "direta"
        },
        "produtos": [
            {"carga": "Soja em grãos"}
        ]
    }

    try:
        print("🚀 Testando endpoint /api/submit-form-divided...")
        print(f"📡 URL: {BASE_URL}/api/submit-form-divided")

        response = requests.post(
            f"{BASE_URL}/api/submit-form-divided",
            json=payload,
            headers=HEADERS,
            timeout=30
        )

        print(f"📊 Status Code: {response.status_code}")

        if response.status_code == 201:
            print("✅ SUCESSO!")
            data = response.json()
            print("📋 Resposta:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print("❌ ERRO!")
            print("📋 Resposta de erro:")
            try:
                error_data = response.json()
                print(json.dumps(error_data, indent=2, ensure_ascii=False))
            except:
                print(response.text)

    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão: {e}")
        print("💡 Verifique se o servidor está rodando em", BASE_URL)
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    testar_endpoint_divided()