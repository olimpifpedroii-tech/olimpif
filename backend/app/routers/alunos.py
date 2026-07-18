"""
Rotas de Alunos.

Leitura é pública. Criação, edição e exclusão exigem login admin.
O cadastro/edição é feito em duas etapas:
  1. POST/PUT com os dados (nome, turma_id) -> retorna o aluno
  2. POST /api/alunos/{id}/foto com o arquivo de imagem (multipart/form-data)

Isso mantém o formulário simples e permite trocar a foto sem reenviar tudo.
"""

import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session, joinedload

from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/alunos", tags=["Alunos"])

# Pasta onde as fotos são salvas (servida como arquivos estáticos pelo main.py)
PASTA_UPLOADS = os.path.join("static", "uploads")
EXTENSOES_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024  # 5 MB


@router.get("", response_model=list[schemas.AlunoSaida])
def listar_alunos(
    curso_id: int | None = None,
    turma_id: int | None = None,
    nome: str | None = None,
    db: Session = Depends(obter_db),
):
    consulta = db.query(models.Aluno).options(
        joinedload(models.Aluno.turma).joinedload(models.Turma.curso)
    )

    if turma_id is not None:
        consulta = consulta.filter(models.Aluno.turma_id == turma_id)
    if curso_id is not None:
        consulta = consulta.join(models.Turma).filter(models.Turma.curso_id == curso_id)
    if nome:
        consulta = consulta.filter(models.Aluno.nome.ilike(f"%{nome}%"))

    return consulta.order_by(models.Aluno.nome).all()


@router.get("/{aluno_id}", response_model=schemas.AlunoSaida)
def obter_aluno(aluno_id: int, db: Session = Depends(obter_db)):
    aluno = (
        db.query(models.Aluno)
        .options(joinedload(models.Aluno.turma).joinedload(models.Turma.curso))
        .filter(models.Aluno.id == aluno_id)
        .first()
    )
    if not aluno:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")
    return aluno


@router.post("", response_model=schemas.AlunoSaida, status_code=status.HTTP_201_CREATED)
def criar_aluno(
    dados: schemas.AlunoCriar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    turma = db.query(models.Turma).filter(models.Turma.id == dados.turma_id).first()
    if not turma:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turma não encontrada.")

    aluno = models.Aluno(**dados.model_dump())
    db.add(aluno)
    db.commit()
    db.refresh(aluno)
    return aluno


@router.put("/{aluno_id}", response_model=schemas.AlunoSaida)
def atualizar_aluno(
    aluno_id: int,
    dados: schemas.AlunoAtualizar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

    turma = db.query(models.Turma).filter(models.Turma.id == dados.turma_id).first()
    if not turma:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turma não encontrada.")

    for campo, valor in dados.model_dump().items():
        setattr(aluno, campo, valor)

    db.commit()
    db.refresh(aluno)
    return aluno


@router.post("/{aluno_id}/foto", response_model=schemas.AlunoSaida)
def enviar_foto_aluno(
    aluno_id: int,
    arquivo: UploadFile = File(...),
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

    extensao = os.path.splitext(arquivo.filename or "")[1].lower()
    if extensao not in EXTENSOES_PERMITIDAS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato de imagem não suportado. Use: {', '.join(EXTENSOES_PERMITIDAS)}",
        )

    conteudo = arquivo.file.read()
    if len(conteudo) > TAMANHO_MAXIMO_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A imagem deve ter no máximo 5 MB.")

    os.makedirs(PASTA_UPLOADS, exist_ok=True)

    # Remove a foto antiga, se existir e for um arquivo local
    if aluno.foto_url and aluno.foto_url.startswith("/static/uploads/"):
        caminho_antigo = aluno.foto_url.lstrip("/")
        if os.path.exists(caminho_antigo):
            os.remove(caminho_antigo)

    nome_arquivo = f"{uuid.uuid4().hex}{extensao}"
    caminho_arquivo = os.path.join(PASTA_UPLOADS, nome_arquivo)

    with open(caminho_arquivo, "wb") as destino:
        destino.write(conteudo)

    aluno.foto_url = f"/static/uploads/{nome_arquivo}"
    db.commit()
    db.refresh(aluno)
    return aluno


@router.delete("/{aluno_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_aluno(
    aluno_id: int,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

    # Remove a foto do disco, se houver
    if aluno.foto_url and aluno.foto_url.startswith("/static/uploads/"):
        caminho = aluno.foto_url.lstrip("/")
        if os.path.exists(caminho):
            os.remove(caminho)

    db.delete(aluno)
    db.commit()
