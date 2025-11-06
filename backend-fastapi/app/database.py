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

# Engine com pool otimizado para RDS
engine = create_engine(
    DATABASE_URL,
    pool_size=10,              # Conexões mantidas no pool
    max_overflow=20,           # Conexões extras permitidas
    pool_timeout=30,           # Timeout para obter conexão
    pool_recycle=1800,         # Reconectar após 30 min
    pool_pre_ping=True,        # Verificar conexão antes de usar
    echo=False,                # Logs SQL (True para debug)
    connect_args={
        "options": f"-csearch_path={SCHEMA_NAME},public",
        "sslmode": "require"   # SSL obrigatório para RDS
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

