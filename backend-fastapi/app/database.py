"""
============================================================
DATABASE CONNECTION - FastAPI PLI 2050
============================================================
Gerenciamento de conexões PostgreSQL com pool otimizado
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://sigma_admin:Malditas131533*@sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com:5432/sigma_pli"
)

# Schema name
SCHEMA_NAME = os.getenv("SCHEMA_NAME", "formulario_embarcadores")

# Engine com pool otimizado para RDS (AWS)
engine = create_engine(
    DATABASE_URL,
    # ============================================================
    # CONNECTION POOL - Otimizado para Produção
    # ============================================================
    pool_size=10,              # Conexões persistentes no pool
    max_overflow=20,           # Conexões extras sob demanda (picos de tráfego)
    pool_timeout=30,           # Timeout para obter conexão (segundos)
    pool_recycle=3600,         # ✅ OTIMIZADO: Recicla após 1h (era 30min)
    pool_pre_ping=True,        # Testa conexão antes de usar (evita "server has gone away")
    
    # ============================================================
    # PERFORMANCE
    # ============================================================
    echo=False,                # Logs SQL (True apenas em debug)
    echo_pool=False,           # Logs de pool (False em produção)
    
    # ============================================================
    # POSTGRESQL ESPECÍFICO
    # ============================================================
    connect_args={
        "options": f"-csearch_path={SCHEMA_NAME},public -c timezone=America/Sao_Paulo",
        "sslmode": "require",          # SSL obrigatório para AWS RDS
        "connect_timeout": 10,         # ✅ NOVO: Timeout de conexão
        "application_name": "PLI2050_FastAPI"  # ✅ NOVO: Identificação no pg_stat_activity
    }
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class para models
Base = declarative_base()


# Dependency para FastAPI
def get_db() -> Generator:
    """
    Dependency que fornece session do database.
    Usa yield para garantir fechamento mesmo em caso de erro.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

