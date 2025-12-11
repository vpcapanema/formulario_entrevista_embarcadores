#!/usr/bin/env python3
"""
Teste do endpoint legado `/api/submit-form` usando payload camelCase (compatibilidade).
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

cnpj = str(int(time.time()))[-14:].zfill(14)

payload = {
    "nome": "João Silva",
    "funcao": "Gerente",
    "telefone": "",
    "email": "teste+legacy@example.com",
    "nomeEmpresa": f"Empresa Legado {cnpj}",
    "tipoEmpresa": "embarcador",
    "outroTipo": None,
    "municipio": "São Paulo",
    # Omite CNPJ (opcional no payload legado) para evitar validação de dígitos
    "tipoResponsavel": "entrevistador",
    "idResponsavel": 1,
    "produtoPrincipal": "Soja",
    "agrupamentoProduto": "Grãos",
    "tipoTransporte": "local",
    "origemPais": "Brasil",
    "destinoPais": "Brasil",
    "distancia": 120.5,
    "temParadas": "nao",
    "modos": ["rodoviario"],
    "configVeiculo": "3-eixos",
    "pesoCarga": 10000,
    "unidadePeso": "kg",
    "custoTransporte": 2000,
    "valorCarga": 15000,
    "tipoEmbalagem": "Granel",
    "cargaPerigosa": "nao",
    "tempoDias": 1,
    "tempoHoras": 5,
    "tempoMinutos": 0,
    "frequencia": "mensal",
    "importanciaCusto": "alta",
    "variacaoCusto": 10.0,
    "importanciaTempo": "media",
    "variacaoTempo": 5.0,
    "importanciaConfiabilidade": "alta",
    "variacaoConfiabilidade": 2.0,
    "importanciaSeguranca": "nao",
    "variacaoSeguranca": 0.0,
    "importanciaCapacidade": "media",
    "variacaoCapacidade": 8.0,
    "tipoCadeia": "direta",
    "produtos": [
        {"carga": "Soja em grãos"}
    ]
}


def main():
    print(f"🆔 CNPJ de teste: {cnpj}")
    print("🚀 Testando endpoint legado /api/submit-form...")
    try:
        resp = requests.post(f"{BASE_URL}/api/submit-form", json=payload, headers=HEADERS, timeout=30)
        print(f"📊 Status: {resp.status_code}")
        try:
            print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
        except Exception:
            print(resp.text)
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão: {e}")


if __name__ == '__main__':
    main()
