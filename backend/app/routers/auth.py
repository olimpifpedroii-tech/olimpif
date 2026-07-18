"""
Rotas de autenticação do painel admin.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])


@router.post("/login", response_model=schemas.TokenSaida)
def login(dados: schemas.LoginEntrada, db: Session = Depends(obter_db)):
    usuario = db.query(models.UsuarioAdmin).filter(models.UsuarioAdmin.email == dados.email).first()

    if not usuario or not auth.verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    token = auth.criar_token_acesso({"sub": str(usuario.id)})
    return schemas.TokenSaida(access_token=token)


@router.get("/me", response_model=schemas.UsuarioAdminSaida)
def obter_usuario_logado(usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual)):
    return usuario_atual
