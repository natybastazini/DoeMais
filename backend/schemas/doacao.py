from datetime import date
from pydantic import BaseModel


class DoacaoIn(BaseModel):
    hemocentro_id: int
    data_doacao:   date
    observacoes:   str | None = None


class DoacaoOut(BaseModel):
    id:            int
    hemocentro_id: int
    data_doacao:   date
    observacoes:   str | None

    model_config = {"from_attributes": True}
