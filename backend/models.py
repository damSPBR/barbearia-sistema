# Importa o BaseModel do Pydantic
# Ele serve para criar modelos de dados com validação automática
from pydantic import BaseModel

# ==============================
# MODELO DE DADOS - HORÁRIO
# ==============================
# Esse modelo define como um horário deve ser estruturado
# Segue exatamente o contrato JSON

class Horario(BaseModel):
    
    # ID do horário (ex: 0, 1, 2...)
    id: int
    
    # Horário em formato texto (ex: "08:00")
    horario: str
    
    # Indica se está disponível ou não
    # True = livre | False = ocupado
    disponivel: bool
    
    # Nome do cliente que agendou
    # Se estiver vazio ("") significa que ninguém agendou
    cliente: str