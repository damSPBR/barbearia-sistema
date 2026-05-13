from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal, Agendamento

# Conexão com o banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

# Permite comunicação com o frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cria os horários automaticamente
def criar_horarios():
    db = SessionLocal()

    for i in range(24):
        hora = f"{i:02d}:00"

        existe = db.query(Agendamento).filter(Agendamento.horario == hora).first()

        if not existe:
            db.add(Agendamento(horario=hora))

    db.commit()
    db.close()

@app.on_event("startup")
def startup():
    criar_horarios()

# Lista todos os horários
@app.get("/horarios")
def listar_horarios(db: Session = Depends(get_db)):
    return db.query(Agendamento).all()

# Realiza um agendamento
@app.post("/agendar/{id}")
def agendar(id: int, cliente: str, db: Session = Depends(get_db)):

    horario = db.query(Agendamento).filter(Agendamento.id == id).first()

    if not horario:
        raise HTTPException(status_code=404, detail="Horário não encontrado")

    # Impede agendamento duplicado
    if not horario.disponivel:
        raise HTTPException(status_code=400, detail="Horário já está ocupado")

    horario.disponivel = False
    horario.cliente = cliente

    db.commit()
    db.refresh(horario)

    return horario

# Cancela um agendamento
@app.put("/cancelar/{id}")
def cancelar(id: int, db: Session = Depends(get_db)):

    horario = db.query(Agendamento).filter(Agendamento.id == id).first()

    if not horario:
        raise HTTPException(status_code=404, detail="Horário não encontrado")

    if horario.disponivel:
        raise HTTPException(status_code=400, detail="Horário já está livre")

    horario.disponivel = True
    horario.cliente = ""

    db.commit()
    db.refresh(horario)

    return horario