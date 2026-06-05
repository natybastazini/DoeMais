from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from models.doacao import Doacao
from models.hemocentro import Hemocentro
from routers.usuarios import get_usuario_atual
from models.usuario import Usuario
from schemas.doacao import DoacaoIn, DoacaoOut

router = APIRouter(prefix="/doacoes", tags=["Doações"])


@router.get("/", response_model=list[DoacaoOut])
def listar_doacoes(
    usuario: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    return (
        db.query(Doacao)
        .filter(Doacao.usuario_id == usuario.id)
        .order_by(Doacao.data_doacao.desc())
        .all()
    )


@router.post("/", response_model=DoacaoOut, status_code=201)
def registrar_doacao(
    body: DoacaoIn,
    usuario: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    hemocentro = db.get(Hemocentro, body.hemocentro_id)
    if not hemocentro or not hemocentro.ativo:
        raise HTTPException(status_code=404, detail="Hemocentro não encontrado.")

    doacao = Doacao(
        usuario_id=usuario.id,
        hemocentro_id=body.hemocentro_id,
        data_doacao=body.data_doacao,
        observacoes=body.observacoes,
    )
    db.add(doacao)
    db.commit()
    db.refresh(doacao)
    return doacao
