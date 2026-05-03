from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./barbearia.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()


class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    horario = Column(String)
    disponivel = Column(Boolean, default=True)
    cliente = Column(String, default="")


Base.metadata.create_all(bind=engine)