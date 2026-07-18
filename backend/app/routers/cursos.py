"""
Rotas de Cursos.

Leitura é pública. Criação e exclusão exigem login admin.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/cursos", tags=["Cursos"])


@router.get("", response_model=list[schemas.CursoSaida])
def listar_cursos(db: Session = Depends(obter_db)):
    return db.query(models.Curso).order_by(models.Curso.nome).all()


@router.post("", response_model=schemas.CursoSaida, status_code=status.HTTP_201_CREATED)
def criar_curso(
    dados: schemas.CursoCriar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    existente = db.query(models.Curso).filter(models.Curso.nome == dados.nome).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Já existe um curso com esse nome.")

    curso = models.Curso(**dados.model_dump())
    db.add(curso)
    db.commit()
    db.refresh(curso)
    return curso


@router.delete("/{curso_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_curso(
    curso_id: int,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    curso = db.query(models.Curso).filter(models.Curso.id == curso_id).first()
    if not curso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curso não encontrado.")

    db.delete(curso)
    db.commit()
