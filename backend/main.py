from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.database import engine, Base

# Importa os models para o Base conhecê-los antes de criar as tabelas
import models.usuario      # noqa: F401
import models.hemocentro   # noqa: F401
import models.doacao       # noqa: F401

from routers import auth, usuarios, hemocentros, doacoes

# Cria as tabelas no banco se ainda não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Doe+ API",
    description="Backend do projeto Doe Mais — doação de sangue",
    version="1.0.0",
)

# ── CORS ─────────────────────────────────────────────
# Permite que o frontend (arquivo local ou outro domínio) acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Em produção, troque pelo domínio real
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rotas ─────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(hemocentros.router)
app.include_router(doacoes.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "projeto": "Doe+"}
