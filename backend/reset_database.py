#!/usr/bin/env python3
"""
Script para reiniciar completamente la base de datos del gimnasio
"""
import os
import sqlite3
from app.database import engine
from app.models import Base
from sqlalchemy.orm import sessionmaker
from app.models import User
from passlib.context import CryptContext

# Configuración para hash de passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def reset_database():
    """Reinicia completamente la base de datos"""
    print("🔄 Reiniciando base de datos...")
    
    # Eliminar archivos de base de datos existentes
    db_files = ["gym_db.db", "gym_management.db"]
    for db_file in db_files:
        if os.path.exists(db_file):
            os.remove(db_file)
            print(f"   ❌ Eliminado: {db_file}")
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    print("   ✅ Tablas creadas")
    
    # Crear usuario administrador por defecto
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Verificar si ya existe el admin
        existing_admin = db.query(User).filter(User.email == "admin@gym.com").first()
        if not existing_admin:
            hashed_password = pwd_context.hash("admin123")
            admin_user = User(
                email="admin@gym.com",
                hashed_password=hashed_password,
                full_name="Administrador",
                role="admin",
                is_active=True,
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            print("   👤 Usuario administrador creado (admin@gym.com / admin123)")
        else:
            print("   👤 Usuario administrador ya existe")
            
    except Exception as e:
        print(f"   ❌ Error creando administrador: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("✅ Base de datos reiniciada exitosamente")
    print("\n📊 Estado inicial:")
    print("   - Tablas: users, members, payments, attendance")
    print("   - Usuario admin: admin@gym.com / admin123")
    print("   - Miembros: 0")
    print("   - Pagos: 0")
    print("   - Asistencias: 0")

if __name__ == "__main__":
    reset_database()