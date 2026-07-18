"""
Rotas de Resultados (medalhas conquistadas pelos alunos).

Leitura é pública. Criação, edição e exclusão exigem login admin.

Regra de negócio: para uma mesma edição + modalidade, as posições
1 (ouro), 2 (prata) e 3 (bronze) só podem ser ocupadas por UM aluno
cada. Já a posição "mh" (menção honrosa) pode ser concedida a vários
alunos na mesma modalidade/edição.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app import models, schemas, auth
from app.database import obter_db

router = APIRouter(prefix="/api/resultados", tags=["Resultados"])


def _carregar_relacionamentos(consulta):
    return consulta.options(
        joinedload(models.Resultado.aluno).joinedload(models.Aluno.turma).joinedload(models.Turma.curso),
        joinedload(models.Resultado.edicao),
        joinedload(models.Resultado.modalidade),
    )


def _validar_posicao_unica(db: Session, dados: schemas.ResultadoBase, resultado_id: int | None = None):
    """Garante que não haja dois resultados com a mesma posição 1/2/3
    para a mesma edição e modalidade (mh é livre)."""

    if dados.posicao == "mh":
        return

    consulta = db.query(models.Resultado).filter(
        models.Resultado.edicao_id == dados.edicao_id,
        models.Resultado.modalidade_id == dados.modalidade_id,
        models.Resultado.posicao == dados.posicao,
    )

    if resultado_id is not None:
        consulta = consulta.filter(models.Resultado.id != resultado_id)

    conflito = consulta.first()
    if conflito:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Já existe um aluno cadastrado em {dados.posicao}º lugar "
                f"para esta modalidade nesta edição. Edite ou remova o resultado existente primeiro."
            ),
        )


@router.get("", response_model=list[schemas.ResultadoSaida])
def listar_resultados(
    edicao_id: int | None = None,
    modalidade_id: int | None = None,
    turma_id: int | None = None,
    curso_id: int | None = None,
    posicao: str | None = None,
    aluno_id: int | None = None,
    db: Session = Depends(obter_db),
):
    consulta = _carregar_relacionamentos(db.query(models.Resultado))

    if edicao_id is not None:
        consulta = consulta.filter(models.Resultado.edicao_id == edicao_id)
    if modalidade_id is not None:
        consulta = consulta.filter(models.Resultado.modalidade_id == modalidade_id)
    if posicao is not None:
        consulta = consulta.filter(models.Resultado.posicao == posicao)
    if aluno_id is not None:
        consulta = consulta.filter(models.Resultado.aluno_id == aluno_id)
    if turma_id is not None:
        consulta = consulta.join(models.Aluno).filter(models.Aluno.turma_id == turma_id)
    if curso_id is not None:
        consulta = consulta.join(models.Aluno).join(models.Turma).filter(models.Turma.curso_id == curso_id)

    return consulta.all()


@router.post("", response_model=schemas.ResultadoSaida, status_code=status.HTTP_201_CREATED)
def criar_resultado(
    dados: schemas.ResultadoCriar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    for campo, modelo, mensagem in [
        (dados.aluno_id, models.Aluno, "Aluno não encontrado."),
        (dados.edicao_id, models.Edicao, "Edição não encontrada."),
        (dados.modalidade_id, models.Modalidade, "Modalidade não encontrada."),
    ]:
        if not db.query(modelo).filter(modelo.id == campo).first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=mensagem)

    _validar_posicao_unica(db, dados)

    resultado = models.Resultado(**dados.model_dump())
    db.add(resultado)
    db.commit()
    db.refresh(resultado)

    return _carregar_relacionamentos(db.query(models.Resultado)).filter(models.Resultado.id == resultado.id).first()


@router.put("/{resultado_id}", response_model=schemas.ResultadoSaida)
def atualizar_resultado(
    resultado_id: int,
    dados: schemas.ResultadoAtualizar,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    resultado = db.query(models.Resultado).filter(models.Resultado.id == resultado_id).first()
    if not resultado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resultado não encontrado.")

    _validar_posicao_unica(db, dados, resultado_id=resultado_id)

    for campo, valor in dados.model_dump().items():
        setattr(resultado, campo, valor)

    db.commit()
    db.refresh(resultado)

    return _carregar_relacionamentos(db.query(models.Resultado)).filter(models.Resultado.id == resultado.id).first()


@router.delete("/{resultado_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_resultado(
    resultado_id: int,
    db: Session = Depends(obter_db),
    usuario_atual: models.UsuarioAdmin = Depends(auth.obter_usuario_atual),
):
    resultado = db.query(models.Resultado).filter(models.Resultado.id == resultado_id).first()
    if not resultado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resultado não encontrado.")

    db.delete(resultado)
    db.commit()
