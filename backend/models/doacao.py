from datetime import datetime

from sqlalchemy import ForeignKey, Date, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class Doacao(Base):
    __tablename__ = "doacoes"

    id:            Mapped[int]      = mapped_column(primary_key=True, autoincrement=True)
    usuario_id:    Mapped[int]      = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"))
    hemocentro_id: Mapped[int]      = mapped_column(ForeignKey("hemocentros.id", ondelete="RESTRICT"))
    data_doacao:   Mapped[datetime] = mapped_column(Date, nullable=False)
    observacoes:   Mapped[str | None] = mapped_column(Text)
    criado_em:     Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    usuario    = relationship("Usuario",    back_populates="doacoes")
    hemocentro = relationship("Hemocentro")
