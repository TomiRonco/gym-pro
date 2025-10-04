#!/usr/bin/env python3
"""
Script de migración para actualizar la estructura de la base de datos
de membership_plans para usar days_per_week en lugar de duration_days, plan_type, etc.
"""
import sys
import os
import sqlite3

# Agregar el directorio padre al path para importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models import Base

# Crear sesión de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def migrate_membership_plans():
    """Migrar la tabla membership_plans a la nueva estructura"""
    print("🔄 Iniciando migración de la tabla membership_plans...")
    
    try:
        # Conectar a la base de datos directamente con sqlite3
        db_path = os.path.join(os.path.dirname(__file__), 'gym_db.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 1. Crear tabla temporal con la nueva estructura
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS membership_plans_new (
                id INTEGER PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                days_per_week INTEGER NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                features TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME
            )
        ''')
        
        # 2. Eliminar tabla antigua si existe
        cursor.execute('DROP TABLE IF EXISTS membership_plans')
        
        # 3. Renombrar tabla nueva
        cursor.execute('ALTER TABLE membership_plans_new RENAME TO membership_plans')
        
        # 4. Crear índices
        cursor.execute('CREATE INDEX IF NOT EXISTS ix_membership_plans_id ON membership_plans (id)')
        
        # 5. Actualizar tabla members para usar membership_plan_id
        print("🔄 Actualizando tabla members...")
        
        # Verificar si la columna membership_plan_id ya existe
        cursor.execute("PRAGMA table_info(members)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'membership_plan_id' not in columns:
            # Agregar nueva columna
            cursor.execute('ALTER TABLE members ADD COLUMN membership_plan_id INTEGER')
            
            # Crear una clave foránea temporal (SQLite no soporta ADD CONSTRAINT)
            # Esto se manejará a nivel de aplicación
            
        # Confirmar cambios
        conn.commit()
        
        print("✅ Migración completada exitosamente!")
        print("📋 Cambios realizados:")
        print("   • Recreada tabla membership_plans con nueva estructura")
        print("   • Columnas: id, name, description, price, days_per_week, is_active, features")
        print("   • Agregada columna membership_plan_id a tabla members")
        print("   • Removidas columnas: duration_days, plan_type, max_visits_per_month")
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        if 'conn' in locals():
            conn.rollback()
        return False
        
    finally:
        if 'conn' in locals():
            conn.close()

def create_tables_from_models():
    """Crear todas las tablas usando SQLAlchemy models"""
    print("🔄 Creando tablas desde los modelos...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas/actualizadas desde los modelos!")
        return True
    except Exception as e:
        print(f"❌ Error al crear tablas: {e}")
        return False

if __name__ == "__main__":
    print("🏋️ Migración de Base de Datos - Gym Management System")
    print("=" * 60)
    print()
    
    # Ejecutar migración
    if migrate_membership_plans():
        print()
        # Crear/actualizar tablas con SQLAlchemy
        if create_tables_from_models():
            print()
            print("🎉 ¡Migración completada exitosamente!")
            print()
            print("💡 Siguientes pasos:")
            print("   1. Ejecutar create_weekly_plans.py para crear los nuevos planes")
            print("   2. Actualizar los socios existentes para asignar membership_plan_id")
            print("   3. Probar la aplicación con la nueva estructura")
        else:
            print("❌ Error al crear tablas con SQLAlchemy")
    else:
        print("❌ Migración fallida")