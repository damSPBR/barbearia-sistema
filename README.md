# Sistema de Agendamento - Barbearia

Projeto para gerenciar agendamentos de uma barbearia em slots de 1 hora.

## 🚀 Tecnologias
- **Backend:** Python com FastAPI
- **Frontend:** ReactJS com Tailwind CSS

## 📂 Estrutura do Projeto
- `/backend`: Servidor API em Python.
- `/frontend`: Interface do usuário em React.

## 🤝 Contrato de Dados (JSON)
Os horários serão gerenciados no seguinte formato:
```json
{
  "id": 0,
  "horario": "08:00",
  "disponivel": true,
  "cliente": ""
}