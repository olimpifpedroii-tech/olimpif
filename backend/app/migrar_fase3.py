"""
Migração Fase 3 — rodar uma vez:
    python -m app.migrar_fase3
"""
from app.database import engine, Base
from app import models
from sqlalchemy import text

def rodar_migracao():
    Base.metadata.create_all(bind=engine)
    print("Tabelas novas criadas.")
    colunas = [
        ("modalidades", "estado", "VARCHAR(50)"),
        ("alunos", "layout_perfil", "VARCHAR(20) DEFAULT 'classico'"),
        ("alunos", "biografia", "TEXT"),
        ("alunos", "frase", "VARCHAR(300)"),
        ("alunos", "cor_tema", "VARCHAR(7)"),
        ("alunos", "ano_ingresso", "INTEGER"),
        ("alunos", "destaque_especial", "INTEGER DEFAULT 0"),
    ]
    with engine.connect() as conn:
        for tabela, coluna, tipo in colunas:
            res = conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name='{tabela}' AND column_name='{coluna}'"))
            if not res.fetchone():
                conn.execute(text(f"ALTER TABLE {tabela} ADD COLUMN {coluna} {tipo}"))
                print(f"Coluna '{coluna}' adicionada em '{tabela}'.")
            else:
                print(f"'{tabela}.{coluna}' já existe.")
        conn.commit()
    print("Migração fase 3 concluída!")

if __name__ == "__main__":
    rodar_migracao()
