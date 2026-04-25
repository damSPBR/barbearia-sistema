# Importa o FastAPI (framework principal)
from fastapi import FastAPI, HTTPException

# Importa o middleware de CORS (pra permitir o frontend acessar)
from fastapi.middleware.cors import CORSMiddleware

# Importa a lista de horários (dados em memória)
from data import horarios

# Cria a aplicação
app = FastAPI()

# ==============================
# CONFIGURAÇÃO DE CORS
# ==============================
# Isso permite que o frontend (React rodando no localhost:5173)
# consiga fazer requisições para o backend sem erro de bloqueio

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # endereço do frontend
    allow_credentials=True,
    allow_methods=["*"],  # permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # permite todos os headers
)

# ==============================
# ROTA GET - LISTAR HORÁRIOS
# ==============================
# Retorna todos os horários disponíveis e ocupados

@app.get("/horarios")
def listar_horarios():
    return horarios


# ==============================
# ROTA POST - AGENDAR HORÁRIO
# ==============================
# Recebe:
# - id do horário (pela URL)
# - nome do cliente (pela query)
#
# Exemplo:
# POST /agendar/5?cliente=Leonardo

@app.post("/agendar/{id}")
def agendar(id: int, cliente: str):
    
    # percorre todos os horários
    for horario in horarios:
        
        # verifica se encontrou o ID correto
        if horario.id == id:
            
            # se já estiver ocupado, retorna erro
            if not horario.disponivel:
                raise HTTPException(
                    status_code=400,
                    detail="Horário já está ocupado"
                )

            # se estiver livre, faz o agendamento
            horario.disponivel = False
            horario.cliente = cliente

            return {
                "mensagem": "Agendamento realizado com sucesso"
            }

    # se não encontrou o horário
    raise HTTPException(
        status_code=404,
        detail="Horário não encontrado"
    )