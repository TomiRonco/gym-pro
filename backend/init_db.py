#!/usr/bin/env python3
"""
Script para inicializar la base de datos
Crea todas las tablas y el usuario administrador por defecto
"""

import sys
import os
from pathlib import Path
from passlib.context import CryptContext

# Añadir el directorio actual al path para importar los módulos
sys.path.insert(0, str(Path(__file__).parent))

from app.database import engine, SessionLocal, Base
from app.models import User, Member, Payment, Attendance

# Configuración de hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hashear contraseña"""
    return pwd_context.hash(password)

def init_database():
    """Inicializa la base de datos con tablas y datos básicos"""
    print("🔄 Inicializando base de datos...")
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas exitosamente")
    
    # Crear usuario administrador por defecto
    db = SessionLocal()
    try:
        # Verificar si ya existe un admin
        admin_user = db.query(User).filter(User.username == "admin_test").first()
        if not admin_user:
            admin_user = User(
                username="admin_test",
                email="admin@gym.com",
                full_name="Administrador",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("✅ Usuario administrador creado:")
            print("   Username: admin_test")
            print("   Password: admin123")
        else:
            print("✅ Usuario administrador ya existe")
    except Exception as e:
        print(f"❌ Error creando usuario administrador: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("🎉 Base de datos inicializada correctamente!")

if __name__ == "__main__":
    init_database()