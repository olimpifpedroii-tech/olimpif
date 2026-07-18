"""
Rota de Ranking — total de medalhas por aluno, com detalhamento.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.database import obter_db

router = APIRouter(prefix="/api/ranking", tags=["Ranking"])

LABEL_TIPO = {"1": "ouro", "2": "prata", "3": "bronze", "mh": "mh"}


@router.get("", response_model=list[schemas.RankingItem])
def obter_ranking(edicao_id: int | None = None, db: Session = Depends(obter_db)):
    consulta = db.query(models.Resultado).options(
        joinedload(models.Resultado.aluno),
        joinedload(models.Resultado.edicao),
        joinedload(models.Resultado.modalidade),
    )

    if edicao_id is not None:
        consulta = consulta.filter(models.Resultado.edicao_id == edicao_id)

    resultados = consulta.all()

    # Agrupa por aluno
    por_aluno: dict[int, dict] = {}
    for r in resultados:
        if r.aluno_id not in por_aluno:
            por_aluno[r.aluno_id] = {
                "aluno_id": r.aluno_id,
                "nome": r.aluno.nome,
                "foto_url": r.aluno.foto_url,
                "totais": {"ouro": 0, "prata": 0, "bronze": 0, "mh": 0},
                "medalhas": [],
            }

        tipo = LABEL_TIPO[r.posicao]
        por_aluno[r.aluno_id]["totais"][tipo] += 1
        por_aluno[r.aluno_id]["medalhas"].append(
            {"tipo": tipo, "modalidade": r.modalidade.nome, "edicao": str(r.edicao.ano)}
        )

    itens = []
    for item in por_aluno.values():
        totais = item["totais"]
        total = totais["ouro"] + totais["prata"] + totais["bronze"] + totais["mh"]
        itens.append(schemas.RankingItem(**item, total=total))

    # Ordena: total geral desc, depois ouro, prata, bronze como critério de desempate
    itens.sort(
        key=lambda i: (-i.total, -i.totais["ouro"], -i.totais["prata"], -i.totais["bronze"])
    )

    return itens
