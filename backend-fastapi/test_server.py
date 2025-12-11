#!/usr/bin/env python3
"""
Servidor mínimo para testar se FastAPI funciona
"""

from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Test Server", description="Servidor mínimo para teste")

@app.get("/")
def root():
    return {"message": "Servidor de teste funcionando!"}

@app.get("/health")
def health():
    return {"status": "OK", "message": "Health check successful"}

@app.post("/test-divided")
def test_divided(data: dict):
    return {
        "success": True,
        "message": "Endpoint dividido funcionando!",
        "received": data
    }

if __name__ == "__main__":
    print("🚀 Iniciando servidor de teste...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")