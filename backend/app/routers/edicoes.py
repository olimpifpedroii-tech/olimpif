"""
Rotas de Edições (olimpíadas/anos).

Leitura é pública. Criação, edição e exclusão exigem login admin.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/edicoes", tags=["Edições"])


@router.get("", response_model=list[schemas.EdicaoSaida])
def listar_edicoes(db: Session = Depends(obter_db)):
    return db.query(models.Edicao).order_by(models.Edicao.ano.desc()).all()


@router.get("/{edicao_id}", response_model=schemas.EdicaoSaida)
def obter_edicao(edicao_id: int, db: Session = Depends(obter_db)):
    edicao = db.query(models.Edicao).filter(models.Edicao.id == edicao_id).first()
    if not edicao:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edição não encontrada.")
    return edicao


@router.post("", response_model=schemas.EdicaoSaida, status_code=status.HTTP_201_CREATED)
def criar_edicao(
    dados: schemas.EdicaoCriar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    edicao = models.Edicao(**dados.model_dump())
    db.add(edicao)
    db.commit()
    db.refresh(edicao)
    return edicao


@router.put("/{edicao_id}", response_model=schemas.EdicaoSaida)
def atualizar_edicao(
    edicao_id: int,
    dados: schemas.EdicaoAtualizar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    edicao = db.query(models.Edicao).filter(models.Edicao.id == edicao_id).first()
    if not edicao:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edição não encontrada.")

    for campo, valor in dados.model_dump().items():
        setattr(edicao, campo, valor)

    db.commit()
    db.refresh(edicao)
    return edicao


@router.delete("/{edicao_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_edicao(
    edicao_id: int,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    edicao = db.query(models.Edicao).filter(models.Edicao.id == edicao_id).first()
    if not edicao:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edição não encontrada.")

    db.delete(edicao)
    db.commit()
