#!/usr/bin/env python3
"""
Script para resetear la base de datos SQLite
Elimina y recrea todas las tablas
"""

import os
import sys
from pathlib import Path

# Añadir el directorio app al path
sys.path.append(str(Path(__file__).parent))

from app.database import engine, Base
from app.models import User, Member, Payment, Attendance

def reset_database():
    """Elimina y recrea todas las tablas"""
    print("🔄 Reseteando base de datos...")
    
    # Eliminar archivo SQLite si existe
    db_file = Path("gym_db.db")
    if db_file.exists():
        db_file.unlink()
        print("✅ Archivo de base de datos eliminado")
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas exitosamente")
    
    # Crear usuario administrador por defecto
    from app.database import SessionLocal
    from app.auth import get_password_hash
    
    db = SessionLocal()
    try:
        # Verificar si ya existe un admin
        admin_user = db.query(User).filter(User.username == "admin_test").first()
        if not admin_user:
            admin_user = User(
                username="admin_test",
                email="admin@gym.com",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("✅ Usuario administrador creado: admin_test / admin123")
        else:
            print("✅ Usuario administrador ya existe")
    except Exception as e:
        print(f"❌ Error creando usuario administrador: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("🎉 Base de datos lista para usar!")

if __name__ == "__main__":
    reset_database()