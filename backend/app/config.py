"""
Configurações da aplicação, lidas a partir de variáveis de ambiente (.env).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Configuracoes(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    CORS_ORIGINS: str = "http://127.0.0.1:5500,http://localhost:5500"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def lista_cors_origins(self) -> list[str]:
        return [origem.strip() for origem in self.CORS_ORIGINS.split(",") if origem.strip()]


configuracoes = Configuracoes()
