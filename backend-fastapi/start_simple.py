#!/usr/bin/env python3
"""
Script simples para iniciar o servidor sem reload
"""

import os
import sys
import logging

# Configurar logging mais detalhado
logging.basicConfig(level=logging.DEBUG)

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("🔄 Importando main...")
    from main import app
    print("✅ App importado com sucesso")

    print("🔄 Iniciando servidor...")
    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=3000,
        log_level="debug",
        reload=False
    )
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)