#!/usr/bin/env python3
"""
Script para inicializar la base de datos
Crea todas las tablas y el usuario administrador por defecto
Incluye socios de ejemplo para probar numeración automática
"""

import sys
import os
from pathlib import Path
from passlib.context import CryptContext
from datetime import datetime, date
import hashlib

# Añadir el directorio actual al path para importar los módulos
sys.path.insert(0, str(Path(__file__).parent))

from app.database import engine, SessionLocal, Base
from app.models import User, Member, Payment, Attendance

# Configuración de hash de contraseñas (usamos SHA256 como en el auth router)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_membership_number(db):
    """Generar número de membresía único e incremental"""
    current_year = datetime.now().year
    
    # Buscar el último número de socio del año actual
    last_member = db.query(Member).filter(
        Member.membership_number.like(f"GYM{current_year}%")
    ).order_by(Member.membership_number.desc()).first()
    
    if last_member and last_member.membership_number:
        # Extraer el número secuencial del último socio
        try:
            last_number = int(last_member.membership_number.replace(f"GYM{current_year}", ""))
            next_number = last_number + 1
        except ValueError:
            # Si hay error en el formato, empezar desde 1
            next_number = 1
    else:
        # Si no hay socios del año actual, empezar desde 1
        next_number = 1
    
    # Formatear con ceros a la izquierda (4 dígitos)
    return f"GYM{current_year}{next_number:04d}"

def create_admin_user(db):
    """Crear usuario administrador por defecto"""
    
    # Verificar si ya existe
    existing_admin = db.query(User).filter(User.email == "admin@gym.com").first()
    if existing_admin:
        print("✅ Usuario admin ya existe")
        return existing_admin
    
    # Crear usuario admin
    admin_user = User(
        username="admin",
        email="admin@gym.com",
        full_name="Administrador",
        role="admin",
        phone="555-0123",
        hashed_password=hash_password("admin123"),
        is_active=True,
        is_admin=True
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print("✅ Usuario admin creado exitosamente")
    return admin_user

def create_sample_members(db):
    """Crear algunos socios de ejemplo para probar la numeración automática"""
    
    # Verificar si ya existen socios
    existing_members = db.query(Member).count()
    if existing_members > 0:
        print(f"✅ Ya existen {existing_members} socios en la base de datos")
        return
    
    # Crear socios de ejemplo
    sample_members = [
        {
            "first_name": "Juan",
            "last_name": "Pérez",
            "dni": "12345678",
            "email": "juan.perez@email.com",
            "phone": "555-0001",
            "address": "Calle Falsa 123",
            "birth_date": date(1990, 5, 15),
            "emergency_contact_name": "María Pérez",
            "emergency_contact_phone": "555-0002",
            "membership_type": "monthly",
            "membership_start_date": date(2025, 1, 1),
            "membership_end_date": date(2025, 2, 1),
            "notes": "Socio regular"
        },
        {
            "first_name": "Ana",
            "last_name": "García",
            "dni": "23456789",
            "email": "ana.garcia@email.com",
            "phone": "555-0003",
            "address": "Avenida Principal 456",
            "birth_date": date(1985, 8, 22),
            "emergency_contact_name": "Carlos García",
            "emergency_contact_phone": "555-0004",
            "membership_type": "quarterly",
            "membership_start_date": date(2025, 1, 15),
            "membership_end_date": date(2025, 4, 15),
            "notes": "Entrenamiento personalizado"
        },
        {
            "first_name": "Carlos",
            "last_name": "López",
            "dni": "34567890",
            "email": "carlos.lopez@email.com",
            "phone": "555-0005",
            "membership_type": "yearly",
            "membership_start_date": date(2025, 1, 1),
            "membership_end_date": date(2026, 1, 1),
            "notes": "Socio VIP"
        }
    ]
    
    for i, member_data in enumerate(sample_members):
        # Generar número de socio automático
        membership_number = generate_membership_number(db)
        
        member = Member(
            membership_number=membership_number,
            **member_data
        )
        
        db.add(member)
        db.commit()
        db.refresh(member)
        
        print(f"✅ Socio creado: {member.first_name} {member.last_name} - #{member.membership_number}")

def init_database():
    """Inicializa la base de datos con tablas y datos básicos"""
    print("🔄 Inicializando base de datos...")
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas exitosamente")
    
    # Crear sessión
    db = SessionLocal()
    try:
        # Crear usuario admin
        create_admin_user(db)
        
        # Crear socios de ejemplo
        create_sample_members(db)
        
        print("\n🎉 Base de datos inicializada correctamente!")
        print("📧 Admin: admin@gym.com")
        print("🔑 Password: admin123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()
    
    print("🎉 Base de datos inicializada correctamente!")

if __name__ == "__main__":
    init_database()