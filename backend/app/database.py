from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os

load_dotenv()

# Configuración de base de datos
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Usar SQLite para desarrollo con configuración especial para FastAPI
    DATABASE_URL = "sqlite:///./gym_db.db"
    # Configuración especial para SQLite con FastAPI async
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False,
            "timeout": 20
        },
        poolclass=NullPool,  # Sin pool para evitar problemas de threads
        echo=False
    )
else:
    # PostgreSQL para producción
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()