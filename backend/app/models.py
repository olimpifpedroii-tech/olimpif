"""
Modelos SQLAlchemy — representam as tabelas do banco de dados.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class UsuarioAdmin(Base):
    __tablename__ = "usuarios_admin"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)


class Edicao(Base):
    __tablename__ = "edicoes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    ano = Column(Integer, nullable=False, index=True)
    data = Column(String(100), nullable=False)  # texto livre, ex: "Outubro de 2025"

    resultados = relationship("Resultado", back_populates="edicao", cascade="all, delete-orphan")
    destaques = relationship("Destaque", back_populates="edicao", cascade="all, delete-orphan")


class Curso(Base):
    __tablename__ = "cursos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False, unique=True)

    turmas = relationship("Turma", back_populates="curso", cascade="all, delete-orphan")


class Turma(Base):
    __tablename__ = "turmas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)  # ex: "3º Informática"
    ano_serie = Column(Integer, nullable=False)  # 1, 2 ou 3
    curso_id = Column(Integer, ForeignKey("cursos.id"), nullable=False)

    curso = relationship("Curso", back_populates="turmas")
    alunos = relationship("Aluno", back_populates="turma")

    __table_args__ = (UniqueConstraint("nome", "curso_id", name="uq_turma_nome_curso"),)


class Modalidade(Base):
    __tablename__ = "modalidades"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False, unique=True)
    descricao = Column(Text, nullable=True)

    resultados = relationship("Resultado", back_populates="modalidade", cascade="all, delete-orphan")


class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False, index=True)
    foto_url = Column(String(255), nullable=True)
    turma_id = Column(Integer, ForeignKey("turmas.id"), nullable=False)

    # Campos de perfil personalizado
    biografia = Column(Text, nullable=True)
    frase = Column(String(300), nullable=True)
    cor_tema = Column(String(7), nullable=True)      # ex: "#8B2FC9"
    ano_ingresso = Column(Integer, nullable=True)
    destaque_especial = Column(Integer, default=0)   # 0 = não, 1 = sim
    layout_perfil = Column(String(20), default="classico")  # "classico" ou "editorial"

    turma = relationship("Turma", back_populates="alunos")
    resultados = relationship("Resultado", back_populates="aluno", cascade="all, delete-orphan")
    destaques = relationship("Destaque", back_populates="aluno", cascade="all, delete-orphan")


class Resultado(Base):
    """Representa uma medalha conquistada por um aluno."""

    __tablename__ = "resultados"

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    edicao_id = Column(Integer, ForeignKey("edicoes.id"), nullable=False)
    modalidade_id = Column(Integer, ForeignKey("modalidades.id"), nullable=False)

    # "1", "2", "3" (ouro/prata/bronze) ou "mh" (menção honrosa)
    posicao = Column(String(2), nullable=False)

    aluno = relationship("Aluno", back_populates="resultados")
    edicao = relationship("Edicao", back_populates="resultados")
    modalidade = relationship("Modalidade", back_populates="resultados")


class Destaque(Base):
    __tablename__ = "destaques"

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    edicao_id = Column(Integer, ForeignKey("edicoes.id"), nullable=False)

    # "geral", "turma", "curso" ou "ano"
    categoria = Column(String(20), nullable=False)
    descricao = Column(Text, nullable=False)

    aluno = relationship("Aluno", back_populates="destaques")
    edicao = relationship("Edicao", back_populates="destaques")

class HallFama(Base):
    __tablename__ = "hall_fama"
    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    categoria = Column(String(50), nullable=False)
    descricao = Column(Text, nullable=True)
    ano = Column(Integer, nullable=True)
    aluno = relationship("Aluno")

class FotoGaleria(Base):
    __tablename__ = "fotos_galeria"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text, nullable=True)
    foto_url = Column(String(255), nullable=False)
    categoria = Column(String(30), nullable=False)
    data = Column(String(20), nullable=True)

class Noticia(Base):
    __tablename__ = "noticias"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(250), nullable=False)
    slug = Column(String(250), unique=True, nullable=False, index=True)
    resumo = Column(Text, nullable=True)
    conteudo = Column(Text, nullable=False)
    foto_url = Column(String(255), nullable=True)
    publicada = Column(Integer, default=0)
    data_publicacao = Column(String(20), nullable=True)

class UsuarioMonitor(Base):
    __tablename__ = "usuarios_monitor"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
