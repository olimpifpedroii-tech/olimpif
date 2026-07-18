import os, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/galeria", tags=["Galeria"])
PASTA = os.path.join("static", "uploads")
EXTS = {".jpg", ".jpeg", ".png", ".webp"}

@router.get("", response_model=list[schemas.FotoGaleriaSaida])
def listar(categoria: str | None = None, db: Session = Depends(obter_db)):
    q = db.query(models.FotoGaleria)
    if categoria: q = q.filter(models.FotoGaleria.categoria == categoria)
    return q.order_by(models.FotoGaleria.id.desc()).all()

@router.post("", response_model=schemas.FotoGaleriaSaida, status_code=201)
def criar(
    titulo: str = Form(...),
    categoria: str = Form(...),
    arquivo: UploadFile = File(...),
    descricao: str = Form(None),
    data: str = Form(None),
    db: Session = Depends(obter_db),
    _=Depends(auth.obter_usuario_atual)
):
    ext = os.path.splitext(arquivo.filename or "")[1].lower()
    if ext not in EXTS: raise HTTPException(400, "Formato não suportado.")
    conteudo = arquivo.file.read()
    if len(conteudo) > 10 * 1024 * 1024: raise HTTPException(400, "Arquivo maior que 10MB.")
    os.makedirs(PASTA, exist_ok=True)
    nome = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(PASTA, nome), "wb") as f: f.write(conteudo)
    foto = models.FotoGaleria(titulo=titulo, descricao=descricao, foto_url=f"/static/uploads/{nome}", categoria=categoria, data=data)
    db.add(foto); db.commit(); db.refresh(foto)
    return foto

@router.delete("/{foto_id}", status_code=204)
def excluir(foto_id: int, db: Session = Depends(obter_db), _=Depends(auth.obter_usuario_atual)):
    foto = db.query(models.FotoGaleria).filter(models.FotoGaleria.id == foto_id).first()
    if not foto: raise HTTPException(404, "Foto não encontrada.")
    if foto.foto_url and foto.foto_url.startswith("/static/uploads/"):
        caminho = foto.foto_url.lstrip("/")
        if os.path.exists(caminho): os.remove(caminho)
    db.delete(foto); db.commit()
