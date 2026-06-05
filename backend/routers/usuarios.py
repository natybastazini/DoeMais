from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import decodificar_token
from models.usuario import Usuario
from schemas.auth import UserOut

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_usuario_atual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    payload = decodificar_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")

    usuario_id = payload.get("sub")
    usuario = db.get(Usuario, int(usuario_id))
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return usuario


@router.get("/me", response_model=UserOut)
def perfil(usuario: Usuario = Depends(get_usuario_atual)):
    return usuario
