from sqlalchemy import String, Numeric, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class Hemocentro(Base):
    __tablename__ = "hemocentros"

    id:        Mapped[int]   = mapped_column(primary_key=True, autoincrement=True)
    nome:      Mapped[str]   = mapped_column(String(200), nullable=False)
    endereco:  Mapped[str]   = mapped_column(String(300), nullable=False)
    horario:   Mapped[str | None] = mapped_column(String(150))
    telefone:  Mapped[str | None] = mapped_column(String(20))
    latitude:  Mapped[float | None] = mapped_column(Numeric(10, 7))
    longitude: Mapped[float | None] = mapped_column(Numeric(10, 7))
    ativo:     Mapped[bool]  = mapped_column(Boolean, default=True)
