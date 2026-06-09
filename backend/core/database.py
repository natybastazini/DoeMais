import os
import ssl as ssl_lib
import tempfile

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from core.config import settings

connect_args = {}
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if is_sqlite:
    # SQLite local: nada de SSL, só liberar uso entre threads.
    connect_args["check_same_thread"] = False
else:
    # MySQL/Aiven (produção)
    if settings.DB_CA_CERT:
        ca_path = os.path.join(tempfile.gettempdir(), "aiven_ca.pem")
        with open(ca_path, "w") as cert_file:
            cert_file.write(settings.DB_CA_CERT)
        connect_args["ssl"] = {"ca": ca_path}
    elif settings.DB_SSL:
        ssl_context = ssl_lib.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl_lib.CERT_NONE
        connect_args["ssl"] = ssl_context

# pool_pre_ping/recycle só fazem sentido no MySQL
engine_kwargs = {"connect_args": connect_args}
if not is_sqlite:
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 3600

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()