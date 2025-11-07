# ============================================
# Dockerfile - PLI 2050 Sistema de Formulários
# Backend FastAPI + Frontend Estático
# ============================================

# Estágio 1: Build (compilação e preparação)
FROM python:3.11-slim AS builder

LABEL maintainer="PLI 2050 Team"
LABEL description="Sistema de Formulários de Entrevista - Backend FastAPI"

# Variáveis de ambiente para otimização Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar apenas requirements primeiro (cache do Docker)
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# ============================================
# Estágio 2: Runtime (imagem final leve)
# ============================================
FROM python:3.11-slim

# Variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Criar usuário não-root para segurança
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app && \
    chown appuser:appuser /app

WORKDIR /app

# Instalar apenas postgresql-client (para healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependências Python do estágio builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copiar código da aplicação
COPY --chown=appuser:appuser ./app ./app
COPY --chown=appuser:appuser ./main.py .
COPY --chown=appuser:appuser ../.env.example ./.env.example

# Copiar frontend estático (servido pelo FastAPI)
COPY --chown=appuser:appuser ../frontend ./frontend

# Mudar para usuário não-root
USER appuser

# Expor porta
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Comando de inicialização
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--log-level", "info"]
