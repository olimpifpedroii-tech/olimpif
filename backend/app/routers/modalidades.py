"""
Rotas de Modalidades.

Leitura é pública. Criação, edição e exclusão exigem login admin.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/modalidades", tags=["Modalidades"])


@router.get("", response_model=list[schemas.ModalidadeSaida])
def listar_modalidades(db: Session = Depends(obter_db)):
    return db.query(models.Modalidade).order_by(models.Modalidade.nome).all()


@router.get("/{modalidade_id}", response_model=schemas.ModalidadeSaida)
def obter_modalidade(modalidade_id: int, db: Session = Depends(obter_db)):
    modalidade = db.query(models.Modalidade).filter(models.Modalidade.id == modalidade_id).first()
    if not modalidade:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modalidade não encontrada.")
    return modalidade


@router.post("", response_model=schemas.ModalidadeSaida, status_code=status.HTTP_201_CREATED)
def criar_modalidade(
    dados: schemas.ModalidadeCriar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    existente = db.query(models.Modalidade).filter(models.Modalidade.nome == dados.nome).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Já existe uma modalidade com esse nome.")

    modalidade = models.Modalidade(**dados.model_dump())
    db.add(modalidade)
    db.commit()
    db.refresh(modalidade)
    return modalidade


@router.put("/{modalidade_id}", response_model=schemas.ModalidadeSaida)
def atualizar_modalidade(
    modalidade_id: int,
    dados: schemas.ModalidadeAtualizar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    modalidade = db.query(models.Modalidade).filter(models.Modalidade.id == modalidade_id).first()
    if not modalidade:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modalidade não encontrada.")

    for campo, valor in dados.model_dump().items():
        setattr(modalidade, campo, valor)

    db.commit()
    db.refresh(modalidade)
    return modalidade


@router.delete("/{modalidade_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_modalidade(
    modalidade_id: int,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    modalidade = db.query(models.Modalidade).filter(models.Modalidade.id == modalidade_id).first()
    if not modalidade:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modalidade não encontrada.")

    db.delete(modalidade)
    db.commit()
