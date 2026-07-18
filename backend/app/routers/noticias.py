import os, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/noticias", tags=["Noticias"])
PASTA = os.path.join("static", "uploads")
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

@router.get("", response_model=list[schemas.NoticiaSaida])
def listar(apenas_publicadas: bool = True, db: Session = Depends(obter_db)):
    q = db.query(models.Noticia)
    if apenas_publicadas: q = q.filter(models.Noticia.publicada == 1)
    return q.order_by(models.Noticia.id.desc()).all()

@router.get("/{slug}", response_model=schemas.NoticiaSaida)
def obter(slug: str, db: Session = Depends(obter_db)):
    n = db.query(models.Noticia).filter(models.Noticia.slug == slug).first()
    if not n: raise HTTPException(404, "Notícia não encontrada.")
    return n

@router.post("", response_model=schemas.NoticiaSaida, status_code=201)
def criar(dados: schemas.NoticiaCriar, db: Session = Depends(obter_db), _=Depends(auth.obter_usuario_atual)):
    if db.query(models.Noticia).filter(models.Noticia.slug == dados.slug).first(): raise HTTPException(400, "Já existe uma notícia com esse slug.")
    n = models.Noticia(**dados.model_dump()); db.add(n); db.commit(); db.refresh(n)
    return n

@router.put("/{noticia_id}", response_model=schemas.NoticiaSaida)
def atualizar(noticia_id: int, dados: schemas.NoticiaAtualizar, db: Session = Depends(obter_db), _=Depends(auth.obter_usuario_atual)):
    n = db.query(models.Noticia).filter(models.Noticia.id == noticia_id).first()
    if not n: raise HTTPException(404, "Notícia não encontrada.")
    for k, v in dados.model_dump().items(): setattr(n, k, v)
    db.commit(); db.refresh(n); return n

@router.post("/{noticia_id}/foto", response_model=schemas.NoticiaSaida)
def enviar_foto(noticia_id: int, arquivo: UploadFile = File(...), db: Session = Depends(obter_db), _=Depends(auth.obter_usuario_atual)):
    n = db.query(models.Noticia).filter(models.Noticia.id == noticia_id).first()
    if not n: raise HTTPException(404, "Notícia não encontrada.")
    ext = os.path.splitext(arquivo.filename or "")[1].lower()
    if ext not in EXTS: raise HTTPException(400, "Formato não suportado.")
    conteudo = arquivo.file.read()
    if len(conteudo) > 10 * 1024 * 1024: raise HTTPException(400, "Arquivo maior que 10MB.")
    os.makedirs(PASTA, exist_ok=True)
    if n.foto_url and n.foto_url.startswith("/static/uploads/"):
        c = n.foto_url.lstrip("/")
        if os.path.exists(c): os.remove(c)
    nome = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(PASTA, nome), "wb") as f: f.write(conteudo)
    n.foto_url = f"/static/uploads/{nome}"; db.commit(); db.refresh(n); return n

@router.delete("/{noticia_id}", status_code=204)
def excluir(noticia_id: int, db: Session = Depends(obter_db), _=Depends(auth.obter_usuario_atual)):
    n = db.query(models.Noticia).filter(models.Noticia.id == noticia_id).first()
    if not n: raise HTTPException(404, "Notícia não encontrada.")
    if n.foto_url and n.foto_url.startswith("/static/uploads/"):
        c = n.foto_url.lstrip("/")
        if os.path.exists(c): os.remove(c)
    db.delete(n); db.commit()
