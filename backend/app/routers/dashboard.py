"""
Rota de Dashboard — contadores gerais para o painel admin.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/resumo", response_model=schemas.DashboardResumo)
def resumo_dashboard(
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    return schemas.DashboardResumo(
        alunos=db.query(models.Aluno).count(),
        modalidades=db.query(models.Modalidade).count(),
        edicoes=db.query(models.Edicao).count(),
        medalhas=db.query(models.Resultado).count(),
        destaques=db.query(models.Destaque).count(),
    )
