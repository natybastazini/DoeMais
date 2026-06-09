from datetime import date
from pydantic import BaseModel, EmailStr, field_validator
import re


class RegisterIn(BaseModel):
    nome:            str
    email:           EmailStr
    password:        str
    cpf:             str
    sexo:            str          # "M" | "F" | "O"
    data_nascimento: date
    tipo_sanguineo:  str
    aceite_termos:   bool = True

    @field_validator("cpf")
    @classmethod
    def cpf_apenas_digitos(cls, v: str) -> str:
        v = re.sub(r"\D", "", v)
        if len(v) != 11:
            raise ValueError("CPF deve ter 11 dígitos")
        return v


class UserOut(BaseModel):
    id:             int
    nome:           str
    email:          str
    cpf:            str
    sexo:           str
    data_nascimento: date
    tipo_sanguineo: str

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut

from typing import Optional


class UsuarioUpdate(BaseModel):
    nome:            Optional[str]   = None
    email:           Optional[EmailStr] = None
    sexo:            Optional[str]   = None
    data_nascimento: Optional[date]  = None
    tipo_sanguineo:  Optional[str]   = None