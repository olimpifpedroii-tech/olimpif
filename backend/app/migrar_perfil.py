"""
Migração: adiciona campos de perfil personalizado à tabela alunos.

Como rodar (uma única vez):
    python -m app.migrar_perfil
"""

from app.database import engine
from sqlalchemy import text


def rodar_migracao():
    colunas_novas = [
        ("biografia", "TEXT"),
        ("frase", "VARCHAR(300)"),
        ("cor_tema", "VARCHAR(7)"),
        ("ano_ingresso", "INTEGER"),
        ("destaque_especial", "INTEGER DEFAULT 0"),
        ("layout_perfil", "VARCHAR(20) DEFAULT 'classico'"),
    ]

    with engine.connect() as conn:
        resultado = conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'alunos'"
        ))
        colunas_existentes = {row[0] for row in resultado}

        for nome_coluna, tipo in colunas_novas:
            if nome_coluna not in colunas_existentes:
                conn.execute(text(f"ALTER TABLE alunos ADD COLUMN {nome_coluna} {tipo}"))
                print(f"✔ Coluna '{nome_coluna}' adicionada.")
            else:
                print(f"• Coluna '{nome_coluna}' já existe, mantendo.")

        conn.commit()

    print("\nMigração concluída com sucesso!")


if __name__ == "__main__":
    rodar_migracao()
