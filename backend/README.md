# Doe+ — Backend (FastAPI)

## Estrutura

```
backend/
├── main.py                  # Ponto de entrada
├── requirements.txt
├── .env.example             # Copie para .env e preencha
├── core/
│   ├── config.py            # Variáveis de ambiente
│   ├── database.py          # Conexão SQLAlchemy + MySQL
│   └── security.py          # Hash de senha + JWT
├── models/
│   ├── usuario.py
│   ├── hemocentro.py
│   └── doacao.py
├── schemas/
│   ├── auth.py
│   ├── hemocentro.py
│   └── doacao.py
└── routers/
    ├── auth.py              # POST /auth/register  POST /auth/login
    ├── usuarios.py          # GET  /usuarios/me
    ├── hemocentros.py       # GET  /hemocentros/
    └── doacoes.py           # GET  /doacoes/   POST /doacoes/
```

## Como rodar

### 1. Pré-requisitos
- Python 3.11+
- MySQL rodando com o banco `doemais` criado (use o `doemais.sql`)

### 2. Instalar dependências
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com seus dados do MySQL
```

### 4. Rodar o servidor
```bash
uvicorn main:app --reload --port 8000
```

O servidor sobe em `http://localhost:8000`

### 5. Documentação automática
Acesse `http://localhost:8000/docs` para ver e testar todas as rotas.

---

## Rotas

| Método | Rota               | Auth | Descrição                  |
|--------|--------------------|------|----------------------------|
| POST   | /auth/register     | ❌   | Cadastro de usuário        |
| POST   | /auth/login        | ❌   | Login (retorna JWT)        |
| GET    | /usuarios/me       | ✅   | Dados do usuário logado    |
| GET    | /hemocentros/      | ❌   | Lista todos os hemocentros |
| GET    | /doacoes/          | ✅   | Histórico de doações       |
| POST   | /doacoes/          | ✅   | Registrar nova doação      |

✅ = precisa enviar o header `Authorization: Bearer <token>`
