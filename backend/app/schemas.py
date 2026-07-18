"""
Schemas Pydantic — formato dos dados que entram e saem da API.
"""

from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator


# =========================================================
# Auth
# =========================================================

class LoginEntrada(BaseModel):
    email: EmailStr
    senha: str


class TokenSaida(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioAdminSaida(BaseModel):
    id: int
    nome: str
    email: EmailStr

    class Config:
        from_attributes = True


# =========================================================
# Edições
# =========================================================

class EdicaoBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=150)
    ano: int = Field(..., ge=2000, le=2100)
    data: str = Field(..., min_length=1, max_length=100)


class EdicaoCriar(EdicaoBase):
    pass


class EdicaoAtualizar(EdicaoBase):
    pass


class EdicaoSaida(EdicaoBase):
    id: int

    class Config:
        from_attributes = True


# =========================================================
# Cursos
# =========================================================

class CursoBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=120)


class CursoCriar(CursoBase):
    pass


class CursoSaida(CursoBase):
    id: int

    class Config:
        from_attributes = True


# =========================================================
# Turmas
# =========================================================

class TurmaBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=120)
    ano_serie: int = Field(..., ge=1, le=3)
    curso_id: int


class TurmaCriar(TurmaBase):
    pass


class TurmaAtualizar(TurmaBase):
    pass


class TurmaSaida(TurmaBase):
    id: int
    curso: CursoSaida

    class Config:
        from_attributes = True


# =========================================================
# Modalidades
# =========================================================

class ModalidadeBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=120)
    descricao: Optional[str] = None


class ModalidadeCriar(ModalidadeBase):
    pass


class ModalidadeAtualizar(ModalidadeBase):
    pass


class ModalidadeSaida(ModalidadeBase):
    id: int

    class Config:
        from_attributes = True


# =========================================================
# Alunos
# =========================================================

class AlunoBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=150)
    turma_id: int
    biografia: Optional[str] = None
    frase: Optional[str] = Field(None, max_length=300)
    cor_tema: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    ano_ingresso: Optional[int] = Field(None, ge=2000, le=2100)
    destaque_especial: Optional[int] = Field(0, ge=0, le=1)
    layout_perfil: Optional[str] = Field("classico", pattern=r'^(classico|editorial)$')


class AlunoCriar(AlunoBase):
    pass


class AlunoAtualizar(AlunoBase):
    pass


class AlunoSaida(AlunoBase):
    id: int
    foto_url: Optional[str] = None
    turma: TurmaSaida

    class Config:
        from_attributes = True


# =========================================================
# Resultados (medalhas)
# =========================================================

PosicaoTipo = Literal["1", "2", "3", "mh"]


class ResultadoBase(BaseModel):
    aluno_id: int
    edicao_id: int
    modalidade_id: int
    posicao: PosicaoTipo

    @field_validator("posicao")
    @classmethod
    def validar_posicao(cls, valor: str) -> str:
        if valor not in ("1", "2", "3", "mh"):
            raise ValueError("posicao deve ser '1', '2', '3' ou 'mh'")
        return valor


class ResultadoCriar(ResultadoBase):
    pass


class ResultadoAtualizar(ResultadoBase):
    pass


class ResultadoSaida(BaseModel):
    id: int
    posicao: str
    aluno: AlunoSaida
    edicao: EdicaoSaida
    modalidade: ModalidadeSaida

    class Config:
        from_attributes = True


# =========================================================
# Destaques
# =========================================================

CategoriaDestaque = Literal["geral", "turma", "curso", "ano"]


class DestaqueBase(BaseModel):
    aluno_id: int
    edicao_id: int
    categoria: CategoriaDestaque
    descricao: str = Field(..., min_length=1)


class DestaqueCriar(DestaqueBase):
    pass


class DestaqueAtualizar(DestaqueBase):
    pass


class DestaqueSaida(BaseModel):
    id: int
    categoria: str
    descricao: str
    aluno: AlunoSaida
    edicao: EdicaoSaida

    class Config:
        from_attributes = True


# =========================================================
# Ranking
# =========================================================

class MedalhaDetalhe(BaseModel):
    tipo: str  # "ouro", "prata", "bronze", "mh"
    modalidade: str
    edicao: str


class RankingItem(BaseModel):
    aluno_id: int
    nome: str
    foto_url: Optional[str] = None
    totais: dict[str, int]
    total: int
    medalhas: list[MedalhaDetalhe]


# =========================================================
# Dashboard
# =========================================================

class DashboardResumo(BaseModel):
    alunos: int
    modalidades: int
    edicoes: int
    medalhas: int
    destaques: int

class HallFamaBase(BaseModel):
    aluno_id: int
    categoria: str
    descricao: Optional[str] = None
    ano: Optional[int] = None

class HallFamaCriar(HallFamaBase): pass
class HallFamaAtualizar(HallFamaBase): pass

class HallFamaSaida(BaseModel):
    id: int
    categoria: str
    descricao: Optional[str] = None
    ano: Optional[int] = None
    aluno: AlunoSaida
    class Config:
        from_attributes = True

class FotoGaleriaBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    categoria: str
    data: Optional[str] = None

class FotoGaleriaCriar(FotoGaleriaBase): pass
class FotoGaleriaAtualizar(FotoGaleriaBase): pass

class FotoGaleriaSaida(FotoGaleriaBase):
    id: int
    foto_url: str
    class Config:
        from_attributes = True

class NoticiaBase(BaseModel):
    titulo: str
    slug: str
    resumo: Optional[str] = None
    conteudo: str
    publicada: Optional[int] = 0
    data_publicacao: Optional[str] = None

class NoticiaCriar(NoticiaBase): pass
class NoticiaAtualizar(NoticiaBase): pass

class NoticiaSaida(NoticiaBase):
    id: int
    foto_url: Optional[str] = None
    class Config:
        from_attributes = True

class MonitorBase(BaseModel):
    nome: str
    email: str

class MonitorCriar(MonitorBase):
    senha: str

class MonitorSaida(MonitorBase):
    id: int
    class Config:
        from_attributes = True
