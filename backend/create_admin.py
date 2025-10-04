#!/usr/bin/env python3
"""
Script para crear usuario administrador en la base de datos
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine, get_db
from app import models
from app.routers.auth import get_password_hash

def create_admin_user():
    """Crear usuario administrador si no existe"""
    db = Session(bind=engine)
    
    try:
        # Verificar si ya existe un admin
        admin_user = db.query(models.User).filter(models.User.email == "admin@gym.com").first()
        
        if admin_user:
            print("✅ Usuario administrador ya existe")
            print(f"   Email: {admin_user.email}")
            print(f"   Username: {admin_user.username}")
            return admin_user
        
        # Crear usuario administrador
        hashed_password = get_password_hash("admin123")
        admin_user = models.User(
            username="admin",
            email="admin@gym.com",
            full_name="Administrador",
            hashed_password=hashed_password,
            is_active=True,
            is_superuser=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Usuario administrador creado exitosamente")
        print(f"   Email: admin@gym.com")
        print(f"   Password: admin123")
        print(f"   Username: admin")
        
        return admin_user
        
    except Exception as e:
        print(f"❌ Error al crear usuario administrador: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    # Crear las tablas si no existen
    models.Base.metadata.create_all(bind=engine)
    
    # Crear usuario administrador
    create_admin_user()