#!/usr/bin/env python3
"""
Teste completo de todos os endpoints da API
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

print("=" * 70)
print("🧪 TESTE COMPLETO DE TODAS AS APIs")
print("=" * 70)
print(f"⏰ Início: {datetime.now().strftime('%H:%M:%S')}")
print(f"🌐 Base URL: {BASE_URL}\n")

resultados = []

def testar_endpoint(nome, metodo, url, payload=None, esperado=200):
    """Testa um endpoint e registra resultado"""
    print(f"\n{'─' * 70}")
    print(f"📍 {nome}")
    print(f"   {metodo} {url}")
    
    try:
        inicio = time.time()
        
        if metodo == "GET":
            response = requests.get(url, timeout=10)
        elif metodo == "POST":
            response = requests.post(url, json=payload, timeout=30)
        else:
            raise ValueError(f"Método {metodo} não suportado")
        
        tempo = round((time.time() - inicio) * 1000, 1)
        status = response.status_code
        sucesso = status == esperado
        
        if sucesso:
            print(f"   ✅ Status: {status} (esperado: {esperado}) - {tempo}ms")
        else:
            print(f"   ❌ Status: {status} (esperado: {esperado}) - {tempo}ms")
        
        # Mostrar resposta resumida
        try:
            data = response.json()
            if isinstance(data, dict):
                keys = list(data.keys())[:5]
                print(f"   📦 Resposta: {keys}...")
            elif isinstance(data, list):
                print(f"   📦 Resposta: Lista com {len(data)} itens")
        except:
            print(f"   📦 Resposta: {response.text[:100]}...")
        
        resultados.append({
            "nome": nome,
            "metodo": metodo,
            "url": url.replace(BASE_URL, ""),
            "status": status,
            "esperado": esperado,
            "sucesso": sucesso,
            "tempo_ms": tempo
        })
        
        return sucesso
        
    except Exception as e:
        print(f"   ❌ ERRO: {str(e)}")
        resultados.append({
            "nome": nome,
            "metodo": metodo,
            "url": url.replace(BASE_URL, ""),
            "status": "ERRO",
            "esperado": esperado,
            "sucesso": False,
            "erro": str(e)
        })
        return False

# ============================================================
# 1. HEALTH CHECKS
# ============================================================
print("\n" + "=" * 70)
print("1️⃣ HEALTH CHECKS")
print("=" * 70)

testar_endpoint(
    "Root Endpoint",
    "GET",
    f"{BASE_URL}/",
    esperado=200
)

testar_endpoint(
    "Health Check",
    "GET",
    f"{BASE_URL}/health",
    esperado=200
)

# ============================================================
# 2. LISTAS ESTÁTICAS (JSON)
# ============================================================
print("\n" + "=" * 70)
print("2️⃣ LISTAS ESTÁTICAS (JSON)")
print("=" * 70)

listas = [
    ("Países", "/lists/paises.json"),
    ("Estados", "/lists/estados.json"),
    ("Funções", "/lists/funcoes.json"),
    ("Entrevistadores", "/lists/entrevistadores.json"),
    ("Municípios SP", "/lists/municipios_por_uf/SP.json"),
    ("Municípios MG", "/lists/municipios_por_uf/MG.json"),
]

for nome, url in listas:
    testar_endpoint(nome, "GET", f"{BASE_URL}{url}")

# ============================================================
# 3. CNPJ API (EXTERNA)
# ============================================================
print("\n" + "=" * 70)
print("3️⃣ CNPJ API (BRASILAPI)")
print("=" * 70)

# Teste com CNPJ válido do Magazine Luiza
testar_endpoint(
    "Consultar CNPJ (Magazine Luiza)",
    "GET",
    f"{BASE_URL}/api/external/cnpj/47960950000121",
    esperado=200
)

# Teste com CNPJ inválido
testar_endpoint(
    "Consultar CNPJ Inválido",
    "GET",
    f"{BASE_URL}/api/external/cnpj/00000000000000",
    esperado=404
)

testar_endpoint(
    "Validar CNPJ",
    "GET",
    f"{BASE_URL}/api/external/cnpj/47960950000121/validar",
    esperado=200
)

# ============================================================
# 4. SUBMISSÃO DE FORMULÁRIO
# ============================================================
print("\n" + "=" * 70)
print("4️⃣ SUBMISSÃO DE FORMULÁRIO")
print("=" * 70)

# Criar CNPJ único
cnpj = str(int(time.time()))[-14:].zfill(14)

payload_completo = {
    "empresa": {
        "tipo_empresa": "embarcador",
        "municipio": "São Paulo",
        "razao_social": f"Teste API Completa {cnpj}",
        "cnpj": cnpj
    },
    "entrevistado": {
        "nome": "João Silva Teste",
        "funcao": "Gerente de Logística"
    },
    "pesquisa": {
        "tipo_responsavel": "entrevistador",
        "id_responsavel": 1,
        "produto_principal": "Soja em grãos",
        "agrupamento_produto": "Grãos",
        "tipo_transporte": "local",
        "origem_pais": "Brasil",
        "origem_estado": "SP",
        "origem_municipio": "Campinas",
        "destino_pais": "Brasil",
        "destino_estado": "SP",
        "destino_municipio": "Santos",
        "distancia": 150.5,
        "tem_paradas": "nao",
        "modos": ["rodoviario", "ferroviario"],
        "config_veiculo": "semirreboque",
        "peso_carga": 30000.0,
        "unidade_peso": "kg",
        "custo_transporte": 8000.0,
        "valor_carga": 120000.0,
        "tipo_embalagem": "Granel",
        "carga_perigosa": "nao",
        "tempo_dias": 1,
        "tempo_horas": 8,
        "tempo_minutos": 0,
        "frequencia": "semanal",
        "importancia_custo": "alta",
        "variacao_custo": 12.0,
        "importancia_tempo": "alta",
        "variacao_tempo": 18.0,
        "importancia_confiabilidade": "alta",
        "variacao_confiabilidade": 8.0,
        "importancia_seguranca": "alta",
        "variacao_seguranca": 5.0,
        "importancia_capacidade": "media",
        "variacao_capacidade": 25.0,
        "tipo_cadeia": "direta",
        "transporta_carga": True,
        "consentimento": True
    },
    "produtos": [
        {
            "carga": "Soja em grãos",
            "movimentacao_anual": 50000.0,
            "origem_pais": "Brasil",
            "origem_estado": "SP",
            "origem_municipio": "Campinas",
            "destino_pais": "Brasil",
            "destino_estado": "SP",
            "destino_municipio": "Santos",
            "distancia": 150.5,
            "modalidade": "rodoviario",
            "acondicionamento": "Granel"
        }
    ]
}

testar_endpoint(
    "Submissão Completa (Dividido)",
    "POST",
    f"{BASE_URL}/api/submit-form-divided",
    payload=payload_completo,
    esperado=201
)

# ============================================================
# 5. BUSCA DE DADOS
# ============================================================
print("\n" + "=" * 70)
print("5️⃣ BUSCA DE DADOS")
print("=" * 70)

testar_endpoint(
    "Listar Empresas",
    "GET",
    f"{BASE_URL}/api/empresas",
    esperado=200
)

testar_endpoint(
    "Listar Pesquisas",
    "GET",
    f"{BASE_URL}/api/pesquisas",
    esperado=200
)

testar_endpoint(
    "Buscar Pesquisa por ID",
    "GET",
    f"{BASE_URL}/api/pesquisas/1",
    esperado=200
)

# ============================================================
# 6. RESUMO FINAL
# ============================================================
print("\n" + "=" * 70)
print("📊 RESUMO FINAL")
print("=" * 70)

total = len(resultados)
sucesso = sum(1 for r in resultados if r["sucesso"])
falha = total - sucesso
taxa_sucesso = (sucesso / total * 100) if total > 0 else 0

print(f"\n✅ Sucessos: {sucesso}/{total} ({taxa_sucesso:.1f}%)")
print(f"❌ Falhas: {falha}/{total}")

if falha > 0:
    print("\n⚠️ ENDPOINTS COM FALHA:")
    for r in resultados:
        if not r["sucesso"]:
            print(f"   • {r['nome']} ({r['metodo']} {r['url']}) - Status: {r['status']}")

print(f"\n⏰ Fim: {datetime.now().strftime('%H:%M:%S')}")
print("=" * 70)

# Retornar código de saída
exit(0 if falha == 0 else 1)
