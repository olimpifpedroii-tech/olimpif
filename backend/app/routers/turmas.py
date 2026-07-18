"""
Rotas de Turmas.

Leitura é pública. Criação, edição e exclusão exigem login admin.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/turmas", tags=["Turmas"])


@router.get("", response_model=list[schemas.TurmaSaida])
def listar_turmas(
    curso_id: int | None = None,
    ano_serie: int | None = None,
    db: Session = Depends(obter_db),
):
    consulta = db.query(models.Turma).options(joinedload(models.Turma.curso))

    if curso_id is not None:
        consulta = consulta.filter(models.Turma.curso_id == curso_id)
    if ano_serie is not None:
        consulta = consulta.filter(models.Turma.ano_serie == ano_serie)

    return consulta.order_by(models.Turma.ano_serie, models.Turma.nome).all()


@router.post("", response_model=schemas.TurmaSaida, status_code=status.HTTP_201_CREATED)
def criar_turma(
    dados: schemas.TurmaCriar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    curso = db.query(models.Curso).filter(models.Curso.id == dados.curso_id).first()
    if not curso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curso não encontrado.")

    turma = models.Turma(**dados.model_dump())
    db.add(turma)
    db.commit()
    db.refresh(turma)
    return turma


@router.put("/{turma_id}", response_model=schemas.TurmaSaida)
def atualizar_turma(
    turma_id: int,
    dados: schemas.TurmaAtualizar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    turma = db.query(models.Turma).filter(models.Turma.id == turma_id).first()
    if not turma:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turma não encontrada.")

    for campo, valor in dados.model_dump().items():
        setattr(turma, campo, valor)

    db.commit()
    db.refresh(turma)
    return turma


@router.delete("/{turma_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_turma(
    turma_id: int,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    turma = db.query(models.Turma).filter(models.Turma.id == turma_id).first()
    if not turma:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turma não encontrada.")

    db.delete(turma)
    db.commit()
