# Importa o FastAPI (framework para criar a API)
from fastapi import FastAPI, HTTPException, Depends

# Importa o CORS (permite comunicação com frontend)
from fastapi.middleware.cors import CORSMiddleware

# Importa ferramentas do banco (SQLAlchemy)
from sqlalchemy.orm import Session

# Importa conexão e modelo do banco
from database import SessionLocal, Agendamento

# ==============================
# CONEXÃO COM BANCO
# ==============================

# Função que cria uma conexão com o banco
def get_db():
    db = SessionLocal()
    try:
        yield db  # entrega o banco para a rota
    finally:
        db.close()  # fecha a conexão depois do uso

# ==============================
# APP
# ==============================

# Cria a aplicação FastAPI
app = FastAPI()

# ==============================
# CORS
# ==============================

# Permite que o frontend acesse o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # endereço do React
    allow_credentials=True,
    allow_methods=["*"],  # permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # permite todos os headers
)

# ==============================
# CRIAR HORÁRIOS AUTOMÁTICOS
# ==============================

# Cria os horários de 00:00 até 23:00 no banco
def criar_horarios():
    db = SessionLocal()

    for i in range(24):
        hora = f"{i:02d}:00"

        # verifica se o horário já existe
        existe = db.query(Agendamento).filter(Agendamento.horario == hora).first()

        # se não existir, adiciona no banco
        if not existe:
            db.add(Agendamento(horario=hora))

    db.commit()  # salva no banco
    db.close()

# Executa quando o sistema inicia
@app.on_event("startup")
def startup():
    criar_horarios()

# ==============================
# ROTAS
# ==============================

# Rota para listar todos os horários
@app.get("/horarios")
def listar_horarios(db: Session = Depends(get_db)):
    return db.query(Agendamento).all()

# Rota para agendar um horário
@app.post("/agendar/{id}")
def agendar(id: int, cliente: str, db: Session = Depends(get_db)):

    # busca o horário pelo ID
    horario = db.query(Agendamento).filter(Agendamento.id == id).first()

    # verifica se existe
    if not horario:
        raise HTTPException(status_code=404, detail="Horário não encontrado")

    # verifica se já está ocupado
    if not horario.disponivel:
        raise HTTPException(status_code=400, detail="Horário já está ocupado")

    # realiza o agendamento
    horario.disponivel = False
    horario.cliente = cliente

    db.commit()          # salva no banco
    db.refresh(horario)  # atualiza os dados

    return horario

# Rota para cancelar um agendamento
@app.put("/cancelar/{id}")
def cancelar(id: int, db: Session = Depends(get_db)):

    # busca o horário pelo ID
    horario = db.query(Agendamento).filter(Agendamento.id == id).first()

    # verifica se existe
    if not horario:
        raise HTTPException(status_code=404, detail="Horário não encontrado")

    # verifica se já está livre
    if horario.disponivel:
        raise HTTPException(status_code=400, detail="Horário já está livre")

    # cancela o agendamento
    horario.disponivel = True
    horario.cliente = ""

    db.commit()          # salva no banco
    db.refresh(horario)  # atualiza os dados

    return horario