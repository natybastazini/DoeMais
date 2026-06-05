import enum
from datetime import datetime

from sqlalchemy import Enum, String, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class SexoEnum(str, enum.Enum):
    M = "M"
    F = "F"
    O = "O"


class TipoSanguineoEnum(str, enum.Enum):
    A_POS  = "A+"
    A_NEG  = "A-"
    B_POS  = "B+"
    B_NEG  = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS  = "O+"
    O_NEG  = "O-"
    NAO_SEI = "NAO_SEI"


class Usuario(Base):
    __tablename__ = "usuarios"

    id:              Mapped[int]      = mapped_column(primary_key=True, autoincrement=True)
    nome:            Mapped[str]      = mapped_column(String(150), nullable=False)
    email:           Mapped[str]      = mapped_column(String(255), unique=True, nullable=False)
    senha_hash:      Mapped[str]      = mapped_column(String(255), nullable=False)
    cpf:             Mapped[str]      = mapped_column(String(11), unique=True, nullable=False)
    data_nascimento: Mapped[datetime] = mapped_column(Date, nullable=False)
    sexo:            Mapped[str]      = mapped_column(Enum(SexoEnum), nullable=False)
    tipo_sanguineo:  Mapped[str]      = mapped_column(
                                          Enum(TipoSanguineoEnum),
                                          nullable=False,
                                          default=TipoSanguineoEnum.NAO_SEI,
                                        )
    criado_em:       Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    atualizado_em:   Mapped[datetime] = mapped_column(
                                          DateTime,
                                          server_default=func.now(),
                                          onupdate=func.now(),
                                        )

    doacoes: Mapped[list] = relationship("Doacao", back_populates="usuario")