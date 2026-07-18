from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/hall-fama", tags=["Hall da Fama"])

def _q(db): return db.query(models.HallFama).options(joinedload(models.HallFama.aluno).joinedload(models.Aluno.turma).joinedload(models.Turma.curso))

@router.get("", response_model=list[schemas.HallFamaSaida])
def listar(ano: int | None = None, categoria: str | None = None, db: Session = Depends(obter_db)):
    q = _q(db)
    if ano: q = q.filter(models.HallFama.ano == ano)
    if categoria: q = q.filter(models.HallFama.categoria == categoria)
    return q.all()

@router.post("", response_model=schemas.HallFamaSaida, status_code=201)
def criar(dados: schemas.HallFamaCriar, db: Session = Depends(obter_db), _=Depends(auth.obter_usuario_atual)):
    if not db.query(models.Aluno).filter(models.Aluno.id == dados.aluno_id).first(): raise HTTPException(404, "Aluno não encontrado.")
    item = models.HallFama(**dados.model_dump()); db.add(item); db.commit(); db.refresh(item)
    return _q(db).filter(models.HallFama.id == item.id).first()

@router.put("/{item_id}", response_model=schemas.HallFamaSaida)
def atualizar(item_id: int, dados: schemas.HallFamaAtualizar, db: Session = Depends(obter_db), _=Depends(auth.obter_usuario_atual)):
    item = db.query(models.HallFama).filter(models.HallFama.id == item_id).first()
    if not item: raise HTTPException(404, "Item não encontrado.")
    for k, v in dados.model_dump().items(): setattr(item, k, v)
    db.commit(); db.refresh(item)
    return _q(db).filter(models.HallFama.id == item.id).first()

@router.delete("/{item_id}", status_code=204)
def excluir(item_id: int, db: Session = Depends(obter_db), _=Depends(auth.obter_usuario_atual)):
    item = db.query(models.HallFama).filter(models.HallFama.id == item_id).first()
    if not item: raise HTTPException(404, "Item não encontrado.")
    db.delete(item); db.commit()
