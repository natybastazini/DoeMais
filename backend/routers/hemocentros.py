from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from models.hemocentro import Hemocentro
from schemas.hemocentro import HemocentroOut

router = APIRouter(prefix="/hemocentros", tags=["Hemocentros"])


@router.get("/", response_model=list[HemocentroOut])
def listar(db: Session = Depends(get_db)):
    return db.query(Hemocentro).filter(Hemocentro.ativo == True).all()
