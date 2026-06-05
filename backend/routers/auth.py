from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import hash_senha, verificar_senha, criar_access_token
from models.usuario import Usuario
from schemas.auth import RegisterIn, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenOut, status_code=201)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    # Verifica duplicatas
    if db.query(Usuario).filter(Usuario.email == body.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    if db.query(Usuario).filter(Usuario.cpf == body.cpf).first():
        raise HTTPException(status_code=400, detail="CPF já cadastrado.")

    usuario = Usuario(
        nome=body.nome,
        email=body.email,
        senha_hash=hash_senha(body.password),
        cpf=body.cpf,
        sexo=body.sexo,
        data_nascimento=body.data_nascimento,
        tipo_sanguineo=body.tipo_sanguineo,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    token = criar_access_token({"sub": str(usuario.id)})
    return TokenOut(
        access_token=token,
        user=UserOut.model_validate(usuario),
    )


@router.post("/login", response_model=TokenOut)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # O frontend envia "username" = email (padrão OAuth2)
    usuario = db.query(Usuario).filter(Usuario.email == form.username).first()

    if not usuario or not verificar_senha(form.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    token = criar_access_token({"sub": str(usuario.id)})
    return TokenOut(
        access_token=token,
        user=UserOut.model_validate(usuario),
    )
