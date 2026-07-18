from app.startup import inicializar
inicializar()

"""
Aplicação principal — Olimpíadas IFPI.

Para rodar localmente:
    uvicorn app.main:app --reload

Documentação interativa disponível em /docs
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import configuracoes
from app.database import Base, engine
from app.routers import (
    auth,
    edicoes,
    cursos,
    turmas,
    modalidades,
    alunos,
    resultados,
    destaques,
    ranking,
    dashboard,
)

# Cria as tabelas automaticamente se ainda não existirem.
# Para projetos maiores, prefira usar migrações (ex: Alembic).
Base.metadata.create_all(bind=engine)

# Garante que a pasta de uploads exista
os.makedirs(os.path.join("static", "uploads"), exist_ok=True)

app = FastAPI(
    title="Olimpíadas IFPI — API",
    description="API para gerenciar medalhistas, destaques, modalidades e edições das Olimpíadas do IFPI.",
    version="1.0.0",
)

# CORS — permite que o frontend (HTML/CSS/JS puro) acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=configuracoes.lista_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Arquivos estáticos (fotos dos alunos)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Rotas
app.include_router(auth.router)
app.include_router(edicoes.router)
app.include_router(cursos.router)
app.include_router(turmas.router)
app.include_router(modalidades.router)
app.include_router(alunos.router)
app.include_router(resultados.router)
app.include_router(destaques.router)
app.include_router(ranking.router)
app.include_router(dashboard.router)


@app.get("/api/saude", tags=["Saúde"])
def verificar_saude():
    """Rota simples para checar se a API está no ar."""
    return {"status": "ok"}

from app.routers import hall_fama, galeria, noticias, monitores

app.include_router(hall_fama.router)
app.include_router(galeria.router)
app.include_router(noticias.router)
app.include_router(monitores.router)
