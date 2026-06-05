import os
import ssl as ssl_lib
import tempfile

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from core.config import settings

# ── SSL ──────────────────────────────────────────────
# A Aiven exige conexão TLS. Montamos os argumentos de conexão
# conforme as variáveis de ambiente.
connect_args = {}

if settings.DB_CA_CERT:
    # Certificado da Aiven informado: TLS com verificação completa.
    ca_path = os.path.join(tempfile.gettempdir(), "aiven_ca.pem")
    with open(ca_path, "w") as cert_file:
        cert_file.write(settings.DB_CA_CERT)
    connect_args["ssl"] = {"ca": ca_path}
elif settings.DB_SSL:
    # TLS ligado sem verificar o certificado (mais simples, conecta na Aiven).
    ssl_context = ssl_lib.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl_lib.CERT_NONE
    connect_args["ssl"] = ssl_context

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # reconecta se a conexão cair
    pool_recycle=3600,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# Dependência do FastAPI — injeta e fecha a sessão automaticamente
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
