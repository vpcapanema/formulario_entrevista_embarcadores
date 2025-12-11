from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routers.submit.routes import router as submit_router
import json
import time

app = FastAPI()
app.include_router(submit_router)

client = TestClient(app)

cnpj_unico = str(int(time.time()))[-14:].zfill(14)

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

print(f"Usando CNPJ: {cnpj_unico}")
resp = client.post("/api/submit-form-divided", json=payload)
print("Status code:", resp.status_code)
try:
    print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
except Exception:
    print(resp.text)
