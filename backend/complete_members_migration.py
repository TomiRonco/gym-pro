#!/usr/bin/env python3
"""
Script para completar la migración de la tabla members
"""
import sys
import os
import sqlite3

# Agregar el directorio padre al path para importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def complete_members_migration():
    """Completar la migración de la tabla members"""
    print("🔄 Completando migración de la tabla members...")
    
    try:
        # Conectar a la base de datos directamente con sqlite3
        db_path = os.path.join(os.path.dirname(__file__), 'gym_db.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 1. Crear tabla temporal con la nueva estructura
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS members_new (
                id INTEGER PRIMARY KEY,
                membership_number VARCHAR(20) UNIQUE NOT NULL,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                dni VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                birth_date DATE,
                emergency_contact_name VARCHAR(100),
                emergency_contact_phone VARCHAR(20),
                membership_plan_id INTEGER NOT NULL,
                membership_start_date DATE NOT NULL,
                membership_end_date DATE NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                trainer_id INTEGER,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                FOREIGN KEY (membership_plan_id) REFERENCES membership_plans (id),
                FOREIGN KEY (trainer_id) REFERENCES users (id)
            )
        ''')
        
        # 2. Verificar si hay datos en la tabla antigua
        cursor.execute("SELECT COUNT(*) FROM members")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"📦 Migrando {count} registros existentes...")
            
            # 3. Migrar datos existentes (asignar plan por defecto)
            cursor.execute('''
                INSERT INTO members_new 
                (id, membership_number, first_name, last_name, dni, email, phone, address, 
                 birth_date, emergency_contact_name, emergency_contact_phone, membership_plan_id,
                 membership_start_date, membership_end_date, is_active, trainer_id, notes, 
                 created_at, updated_at)
                SELECT 
                    id, membership_number, first_name, last_name, dni, email, phone, address,
                    birth_date, emergency_contact_name, emergency_contact_phone, 1,
                    membership_start_date, membership_end_date, is_active, trainer_id, notes,
                    created_at, updated_at
                FROM members
            ''')
            
            print(f"✅ {count} registros migrados exitosamente")
        
        # 4. Eliminar tabla antigua
        cursor.execute('DROP TABLE IF EXISTS members')
        
        # 5. Renombrar tabla nueva
        cursor.execute('ALTER TABLE members_new RENAME TO members')
        
        # 6. Crear índices
        cursor.execute('CREATE INDEX IF NOT EXISTS ix_members_id ON members (id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS ix_members_membership_number ON members (membership_number)')
        cursor.execute('CREATE INDEX IF NOT EXISTS ix_members_dni ON members (dni)')
        cursor.execute('CREATE INDEX IF NOT EXISTS ix_members_email ON members (email)')
        
        # 7. También actualizar otras tablas que referencian members
        print("🔄 Actualizando tablas relacionadas...")
        
        # Verificar estructura de payments
        cursor.execute("PRAGMA table_info(payments)")
        payments_columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Columnas en payments: {payments_columns}")
        
        # Verificar estructura de attendance
        cursor.execute("PRAGMA table_info(attendance)")
        attendance_columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Columnas en attendance: {attendance_columns}")
        
        # Confirmar cambios
        conn.commit()
        
        print("✅ Migración de members completada exitosamente!")
        print("📋 Nueva estructura de members:")
        print("   • Removida columna: membership_type")
        print("   • Agregada columna: membership_plan_id (FK a membership_plans)")
        print("   • Todos los miembros existentes asignados al plan ID 1")
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        if 'conn' in locals():
            conn.rollback()
        return False
        
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🏋️ Completando Migración de Members - Gym Management System")
    print("=" * 65)
    print()
    
    if complete_members_migration():
        print()
        print("🎉 ¡Migración completada exitosamente!")
        print()
        print("💡 Ahora puedes:")
        print("   1. Reiniciar el servidor backend")
        print("   2. Probar crear nuevos miembros con planes reales")
        print("   3. Los miembros existentes están asignados al Plan 1 Día Semanal")
    else:
        print("❌ Migración fallida")