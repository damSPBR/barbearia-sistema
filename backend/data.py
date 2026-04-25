# Importa o modelo Horario que criamos no models.py
from models import Horario

# ==============================
# LISTA DE HORÁRIOS (EM MEMÓRIA)
# ==============================
# Aqui estamos criando automaticamente 24 horários
# de 00:00 até 23:00

horarios = [
    Horario(
        id=i,  # ID do horário (0 até 23)

        # Formata o horário com dois dígitos
        # Ex: 0 vira "00:00", 8 vira "08:00"
        horario=f"{i:02d}:00",

        # Todos começam como disponíveis
        disponivel=True,

        # Nenhum cliente no início
        cliente=""
    )
    for i in range(24)
]