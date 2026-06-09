from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import decodificar_token
from models.usuario import Usuario, SexoEnum, TipoSanguineoEnum
from schemas.auth import UserOut, UsuarioUpdate

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


@router.put("/me", response_model=UserOut)
def atualizar_perfil(
    dados: UsuarioUpdate,
    usuario: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    # só os campos que vieram no corpo (não sobrescreve o resto com None)
    payload = dados.model_dump(exclude_unset=True)

    # se mudou o email, garante que não tá em uso por outra pessoa
    novo_email = payload.get("email")
    if novo_email and novo_email != usuario.email:
        if db.query(Usuario).filter(Usuario.email == novo_email).first():
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    for campo, valor in payload.items():
        # converte as strings pros enums certos
        if campo == "sexo":
            valor = SexoEnum(valor)
        elif campo == "tipo_sanguineo":
            valor = TipoSanguineoEnum(valor)
        setattr(usuario, campo, valor)

    db.commit()
    db.refresh(usuario)
    return usuario