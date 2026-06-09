# testdb.py — salve na pasta backend
import ssl
from sqlalchemy import create_engine, text
from core.config import settings

print(f"Conectando em {settings.DB_HOST}:{settings.DB_PORT} ...")

connect_args = {"connect_timeout": 10}
if settings.DB_SSL:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ctx

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

try:
    with engine.connect() as conn:
        print("✅ Conectou! SELECT 1 =", conn.execute(text("SELECT 1")).scalar())
except Exception as e:
    print("❌ ERRO:", repr(e))