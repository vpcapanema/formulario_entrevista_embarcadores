# ============================================
# Dockerfile - PLI 2050 Backend FastAPI
# Para deploy em Render.com / Railway / Fly.io
# ============================================

FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar requirements e instalar dependências
COPY backend-fastapi/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY backend-fastapi/ .

# Expor porta (variável de ambiente $PORT no Render)
EXPOSE 8000

# Comando de inicialização
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
