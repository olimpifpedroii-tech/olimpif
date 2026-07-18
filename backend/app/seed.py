"""
Script de seed — popula o banco com dados de exemplo (mesmos usados
como mock no frontend), incluindo um usuário admin padrão.

Como rodar:
    python -m app.seed

Atenção: se os dados já existirem (mesmos nomes/emails), o script
evita duplicar a maioria dos registros, mas é pensado para rodar
em um banco recém-criado.
"""

from app.database import SessionLocal, Base, engine
from app import models, auth

Base.metadata.create_all(bind=engine)


def obter_ou_criar(db, modelo, filtros: dict, dados_extra: dict | None = None):
    instancia = db.query(modelo).filter_by(**filtros).first()
    if instancia:
        return instancia
    instancia = modelo(**filtros, **(dados_extra or {}))
    db.add(instancia)
    db.commit()
    db.refresh(instancia)
    return instancia


def rodar_seed():
    db = SessionLocal()

    try:
        # ---------- Usuário admin ----------
        admin = db.query(models.UsuarioAdmin).filter_by(email="admin@ifpi.edu.br").first()
        if not admin:
            admin = models.UsuarioAdmin(
                nome="Administrador",
                email="admin@ifpi.edu.br",
                senha_hash=auth.gerar_hash_senha("ifpi2025"),
            )
            db.add(admin)
            db.commit()
            print("✔ Usuário admin criado: admin@ifpi.edu.br / senha: ifpi2025")
        else:
            print("• Usuário admin já existe, mantendo.")

        # ---------- Cursos ----------
        cursos = {
            "Informática": obter_ou_criar(db, models.Curso, {"nome": "Informática"}),
            "Eletrotécnica": obter_ou_criar(db, models.Curso, {"nome": "Eletrotécnica"}),
            "Administração": obter_ou_criar(db, models.Curso, {"nome": "Administração"}),
            "Agropecuária": obter_ou_criar(db, models.Curso, {"nome": "Agropecuária"}),
        }
        print(f"✔ {len(cursos)} cursos garantidos.")

        # ---------- Turmas ----------
        turmas = {
            "3-info": obter_ou_criar(db, models.Turma, {"nome": "3º Informática", "curso_id": cursos["Informática"].id, "ano_serie": 3}),
            "2-eletro": obter_ou_criar(db, models.Turma, {"nome": "2º Eletrotécnica", "curso_id": cursos["Eletrotécnica"].id, "ano_serie": 2}),
            "1-admin": obter_ou_criar(db, models.Turma, {"nome": "1º Administração", "curso_id": cursos["Administração"].id, "ano_serie": 1}),
        }
        print(f"✔ {len(turmas)} turmas garantidas.")

        # ---------- Modalidades ----------
        modalidades = {
            "Futsal": obter_ou_criar(db, models.Modalidade, {"nome": "Futsal"}, {"descricao": "Disputas eliminatórias entre turmas, finais no último dia."}),
            "Xadrez": obter_ou_criar(db, models.Modalidade, {"nome": "Xadrez"}, {"descricao": "Torneio individual em sistema suíço de pontuação."}),
            "Atletismo": obter_ou_criar(db, models.Modalidade, {"nome": "Atletismo"}, {"descricao": "Provas de corrida, salto e arremesso, por categoria."}),
            "Vôlei": obter_ou_criar(db, models.Modalidade, {"nome": "Vôlei"}, {"descricao": "Disputa entre equipes formadas por turma ou curso."}),
        }
        print(f"✔ {len(modalidades)} modalidades garantidas.")

        # ---------- Edições ----------
        edicoes = {
            2025: obter_ou_criar(db, models.Edicao, {"nome": "Olimpíada IFPI 2025", "ano": 2025}, {"data": "Outubro de 2025"}),
            2024: obter_ou_criar(db, models.Edicao, {"nome": "Olimpíada IFPI 2024", "ano": 2024}, {"data": "Outubro de 2024"}),
        }
        print(f"✔ {len(edicoes)} edições garantidas.")

        # ---------- Alunos ----------
        alunos = {
            "João Pedro Lima": obter_ou_criar(db, models.Aluno, {"nome": "João Pedro Lima", "turma_id": turmas["2-eletro"].id}, {"foto_url": "https://i.pravatar.cc/150?img=12"}),
            "Ana Beatriz Souza": obter_ou_criar(db, models.Aluno, {"nome": "Ana Beatriz Souza", "turma_id": turmas["3-info"].id}, {"foto_url": "https://i.pravatar.cc/150?img=47"}),
            "Carla Mendes": obter_ou_criar(db, models.Aluno, {"nome": "Carla Mendes", "turma_id": turmas["1-admin"].id}, {"foto_url": "https://i.pravatar.cc/150?img=32"}),
            "Lucas Ferreira": obter_ou_criar(db, models.Aluno, {"nome": "Lucas Ferreira", "turma_id": turmas["2-eletro"].id}, {"foto_url": "https://i.pravatar.cc/150?img=15"}),
            "Maria Eduarda": obter_ou_criar(db, models.Aluno, {"nome": "Maria Eduarda", "turma_id": turmas["3-info"].id}, {"foto_url": "https://i.pravatar.cc/150?img=24"}),
            "Beatriz Costa": obter_ou_criar(db, models.Aluno, {"nome": "Beatriz Costa", "turma_id": turmas["3-info"].id}, {"foto_url": "https://i.pravatar.cc/150?img=29"}),
            "Rafael Souza": obter_ou_criar(db, models.Aluno, {"nome": "Rafael Souza", "turma_id": turmas["2-eletro"].id}, {"foto_url": "https://i.pravatar.cc/150?img=8"}),
            "Juliana Alves": obter_ou_criar(db, models.Aluno, {"nome": "Juliana Alves", "turma_id": turmas["1-admin"].id}, {"foto_url": "https://i.pravatar.cc/150?img=44"}),
            "Pedro Henrique": obter_ou_criar(db, models.Aluno, {"nome": "Pedro Henrique", "turma_id": turmas["1-admin"].id}, {"foto_url": "https://i.pravatar.cc/150?img=51"}),
        }
        print(f"✔ {len(alunos)} alunos garantidos.")

        # ---------- Resultados (medalhas) ----------
        resultados_seed = [
            ("João Pedro Lima", "Futsal", 2025, "1"),
            ("Ana Beatriz Souza", "Futsal", 2025, "2"),
            ("Carla Mendes", "Futsal", 2025, "3"),
            ("Maria Eduarda", "Futsal", 2025, "mh"),
            ("Maria Eduarda", "Xadrez", 2025, "1"),
            ("Lucas Ferreira", "Xadrez", 2025, "2"),
            ("Pedro Henrique", "Xadrez", 2025, "3"),
            ("Carla Mendes", "Xadrez", 2025, "mh"),
            ("Ana Beatriz Souza", "Atletismo", 2025, "mh"),
            ("Beatriz Costa", "Atletismo", 2024, "1"),
            ("Rafael Souza", "Atletismo", 2024, "2"),
            ("Juliana Alves", "Atletismo", 2024, "3"),
            ("Rafael Souza", "Futsal", 2024, "1"),
            ("Juliana Alves", "Futsal", 2024, "mh"),
            ("Lucas Ferreira", "Atletismo", 2024, "3"),
            ("Lucas Ferreira", "Futsal", 2024, "mh"),
            ("Lucas Ferreira", "Vôlei", 2024, "1"),
            ("Ana Beatriz Souza", "Vôlei", 2024, "1"),
            ("João Pedro Lima", "Futsal", 2024, "1"),
        ]

        criados = 0
        for nome_aluno, nome_modalidade, ano, posicao in resultados_seed:
            existente = (
                db.query(models.Resultado)
                .filter_by(
                    aluno_id=alunos[nome_aluno].id,
                    modalidade_id=modalidades[nome_modalidade].id,
                    edicao_id=edicoes[ano].id,
                    posicao=posicao,
                )
                .first()
            )
            if existente:
                continue

            db.add(
                models.Resultado(
                    aluno_id=alunos[nome_aluno].id,
                    modalidade_id=modalidades[nome_modalidade].id,
                    edicao_id=edicoes[ano].id,
                    posicao=posicao,
                )
            )
            criados += 1

        db.commit()
        print(f"✔ {criados} resultados (medalhas) criados.")

        # ---------- Destaques ----------
        destaques_seed = [
            ("Lucas Ferreira", 2025, "geral", "Participou de 5 modalidades diferentes e conquistou medalha em todas."),
            ("Maria Eduarda", 2025, "turma", "Liderou a turma 3º Informática na pontuação geral da olimpíada de 2025."),
            ("Pedro Henrique", 2025, "curso", "Melhor desempenho individual entre os alunos do curso de Agropecuária."),
            ("Beatriz Costa", 2024, "ano", "Conquistou medalha de ouro em atletismo e destaque do 3º ano em 2024."),
            ("Rafael Souza", 2024, "geral", "Maior pontuador individual da edição de 2024."),
        ]

        criados_destaques = 0
        for nome_aluno, ano, categoria, descricao in destaques_seed:
            existente = (
                db.query(models.Destaque)
                .filter_by(aluno_id=alunos[nome_aluno].id, edicao_id=edicoes[ano].id, categoria=categoria)
                .first()
            )
            if existente:
                continue

            db.add(
                models.Destaque(
                    aluno_id=alunos[nome_aluno].id,
                    edicao_id=edicoes[ano].id,
                    categoria=categoria,
                    descricao=descricao,
                )
            )
            criados_destaques += 1

        db.commit()
        print(f"✔ {criados_destaques} destaques criados.")

        print("\nSeed concluído com sucesso!")

    finally:
        db.close()


if __name__ == "__main__":
    rodar_seed()
