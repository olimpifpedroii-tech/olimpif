from app.database import engine, Base
from app import models
from app.seed import popular_banco
from sqlalchemy import text

def inicializar():
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        resultado = conn.execute(text("SELECT COUNT(*) FROM usuarios_admin"))
        total = resultado.scalar()
        if total == 0:
            popular_banco()

inicializar()
