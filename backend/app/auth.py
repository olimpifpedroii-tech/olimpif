"""
Autenticação: hash de senha, geração/validação de token JWT
e dependência para proteger rotas do painel admin.
"""

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import configuracoes
from app.database import obter_db
from app import models

contexto_senha = CryptContext(schemes=["bcrypt"], deprecated="auto")

# tokenUrl aponta para a rota de login (usada apenas pela documentação /docs)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def gerar_hash_senha(senha: str) -> str:
    return contexto_senha.hash(senha)


def verificar_senha(senha: str, senha_hash: str) -> bool:
    return contexto_senha.verify(senha, senha_hash)


def criar_token_acesso(dados: dict) -> str:
    para_codificar = dados.copy()
    expira_em = datetime.now(timezone.utc) + timedelta(minutes=configuracoes.ACCESS_TOKEN_EXPIRE_MINUTES)
    para_codificar.update({"exp": expira_em})
    return jwt.encode(para_codificar, configuracoes.SECRET_KEY, algorithm=configuracoes.ALGORITHM)


def obter_usuario_atual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(obter_db),
) -> models.UsuarioAdmin:
    """
    Dependência usada nas rotas protegidas do painel admin.
    Lança 401 se o token for inválido/expirado ou o usuário não existir mais.
    """
    erro_credenciais = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, configuracoes.SECRET_KEY, algorithms=[configuracoes.ALGORITHM])
        usuario_id = payload.get("sub")
        if usuario_id is None:
            raise erro_credenciais
    except JWTError:
        raise erro_credenciais

    usuario = db.query(models.UsuarioAdmin).filter(models.UsuarioAdmin.id == int(usuario_id)).first()
    if usuario is None:
        raise erro_credenciais

    return usuario
