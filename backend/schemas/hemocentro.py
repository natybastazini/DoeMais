from pydantic import BaseModel


class HemocentroOut(BaseModel):
    id:        int
    nome:      str
    endereco:  str
    horario:   str | None
    telefone:  str | None
    latitude:  float | None
    longitude: float | None

    model_config = {"from_attributes": True}
