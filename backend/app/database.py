"""
Configuração da conexão com o banco de dados PostgreSQL via SQLAlchemy.

Usamos o driver psycopg (versão 3), que tem pacotes binários prontos
para versões recentes do Python (diferente do psycopg2, que exige
compilação e pode falhar em Python muito novo).

O SQLAlchemy só reconhece automaticamente o psycopg3 se a URL começar
com "postgresql+psycopg://". Para o usuário poder colar a URL padrão
("postgresql://...", igual à fornecida pelo Render ou por createdb),
ajustamos isso aqui automaticamente.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import configuracoes


def _normalizar_url(url: str) -> str:
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    return url


engine = create_engine(_normalizar_url(configuracoes.DATABASE_URL), pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def obter_db():
    """Dependência do FastAPI: abre uma sessão de banco e garante o fechamento."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
