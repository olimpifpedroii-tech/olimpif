from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/monitores", tags=["Monitores"])

@router.post("/login", response_model=schemas.TokenSaida)
def login(dados: schemas.LoginEntrada, db: Session = Depends(obter_db)):
    monitor = db.query(models.UsuarioMonitor).filter(models.UsuarioMonitor.email == dados.email).first()
    if not monitor or not auth.verificar_senha(dados.senha, monitor.senha_hash):
        raise HTTPException(401, "E-mail ou senha incorretos.")
    token = auth.criar_token_acesso({"sub": f"monitor:{monitor.id}"})
    return schemas.TokenSaida(access_token=token)

@router.get("", response_model=list[schemas.MonitorSaida])
def listar(db: Session = Depends(obter_db), _=Depends(auth.obter_usuario_atual)):
    return db.query(models.UsuarioMonitor).all()

@router.post("", response_model=schemas.MonitorSaida, status_code=201)
def criar(dados: schemas.MonitorCriar, db: Session = Depends(obter_db), _=Depends(auth.obter_usuario_atual)):
    if db.query(models.UsuarioMonitor).filter(models.UsuarioMonitor.email == dados.email).first():
        raise HTTPException(400, "E-mail já cadastrado.")
    m = models.UsuarioMonitor(nome=dados.nome, email=dados.email, senha_hash=auth.gerar_hash_senha(dados.senha))
    db.add(m); db.commit(); db.refresh(m); return m

@router.delete("/{monitor_id}", status_code=204)
def excluir(monitor_id: int, db: Session = Depends(obter_db), _=Depends(auth.obter_usuario_atual)):
    m = db.query(models.UsuarioMonitor).filter(models.UsuarioMonitor.id == monitor_id).first()
    if not m: raise HTTPException(404, "Monitor não encontrado.")
    db.delete(m); db.commit()
