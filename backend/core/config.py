from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "doemais"

    # Se preenchido no .env, tem prioridade (ex.: SQLite no local).
    # No Render fica vazio -> usa MySQL/Aiven normalmente.
    DATABASE_URL_OVERRIDE: Optional[str] = None

    SECRET_KEY: str = "troque-isso"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DB_SSL: bool = False
    DB_CA_CERT: str = ""

    @property
    def DATABASE_URL(self) -> str:
        if self.DATABASE_URL_OVERRIDE:
            return self.DATABASE_URL_OVERRIDE
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )

    model_config = {"env_file": ".env"}


settings = Settings()