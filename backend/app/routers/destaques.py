"""
Rotas de Destaques.

Leitura é pública. Criação, edição e exclusão exigem login admin.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/destaques", tags=["Destaques"])


def _carregar_relacionamentos(consulta):
    return consulta.options(
        joinedload(models.Destaque.aluno).joinedload(models.Aluno.turma).joinedload(models.Turma.curso),
        joinedload(models.Destaque.edicao),
    )


@router.get("", response_model=list[schemas.DestaqueSaida])
def listar_destaques(
    edicao_id: int | None = None,
    categoria: str | None = None,
    db: Session = Depends(obter_db),
):
    consulta = _carregar_relacionamentos(db.query(models.Destaque))

    if edicao_id is not None:
        consulta = consulta.filter(models.Destaque.edicao_id == edicao_id)
    if categoria is not None:
        consulta = consulta.filter(models.Destaque.categoria == categoria)

    return consulta.all()


@router.post("", response_model=schemas.DestaqueSaida, status_code=status.HTTP_201_CREATED)
def criar_destaque(
    dados: schemas.DestaqueCriar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    for campo, modelo, mensagem in [
        (dados.aluno_id, models.Aluno, "Aluno não encontrado."),
        (dados.edicao_id, models.Edicao, "Edição não encontrada."),
    ]:
        if not db.query(modelo).filter(modelo.id == campo).first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=mensagem)

    destaque = models.Destaque(**dados.model_dump())
    db.add(destaque)
    db.commit()
    db.refresh(destaque)

    return _carregar_relacionamentos(db.query(models.Destaque)).filter(models.Destaque.id == destaque.id).first()


@router.put("/{destaque_id}", response_model=schemas.DestaqueSaida)
def atualizar_destaque(
    destaque_id: int,
    dados: schemas.DestaqueAtualizar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    destaque = db.query(models.Destaque).filter(models.Destaque.id == destaque_id).first()
    if not destaque:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destaque não encontrado.")

    for campo, valor in dados.model_dump().items():
        setattr(destaque, campo, valor)

    db.commit()
    db.refresh(destaque)

    return _carregar_relacionamentos(db.query(models.Destaque)).filter(models.Destaque.id == destaque.id).first()


@router.delete("/{destaque_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_destaque(
    destaque_id: int,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    destaque = db.query(models.Destaque).filter(models.Destaque.id == destaque_id).first()
    if not destaque:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destaque não encontrado.")

    db.delete(destaque)
    db.commit()
