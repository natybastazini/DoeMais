from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "doemais"

    SECRET_KEY: str = "troque-isso"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── SSL do banco (necessário na Aiven) ──────────────
    # DB_SSL=true liga o TLS. Se você colar o certificado da Aiven
    # em DB_CA_CERT, a conexão é verificada de forma completa.
    DB_SSL: bool = False
    DB_CA_CERT: str = ""

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )

    model_config = {"env_file": ".env"}


settings = Settings()
