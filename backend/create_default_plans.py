#!/usr/bin/env python3
"""
Script para crear planes de membresía por defecto
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import MembershipPlan
from decimal import Decimal

def create_default_plans():
    """Crear planes de membresía por defecto"""
    db = SessionLocal()
    
    try:
        # Verificar si ya existen planes
        existing_plans = db.query(MembershipPlan).count()
        if existing_plans > 0:
            print(f"Ya existen {existing_plans} planes de membresía. No se crearán nuevos.")
            return
        
        # Planes por defecto
        default_plans = [
            {
                "name": "Pase Diario",
                "description": "Acceso completo por un día. Perfecto para visitas ocasionales.",
                "price": Decimal("1500.00"),
                "duration_days": 1,
                "plan_type": "daily",
                "max_visits_per_month": None,
                "features": "Acceso a todas las máquinas, vestuarios, duchas",
                "is_active": True
            },
            {
                "name": "Plan Mensual Básico",
                "description": "Membresía mensual con acceso completo al gimnasio.",
                "price": Decimal("25000.00"),
                "duration_days": 30,
                "plan_type": "monthly",
                "max_visits_per_month": None,
                "features": "Acceso ilimitado, vestuarios, duchas, estacionamiento",
                "is_active": True
            },
            {
                "name": "Plan Mensual Premium",
                "description": "Membresía mensual con beneficios adicionales.",
                "price": Decimal("35000.00"),
                "duration_days": 30,
                "plan_type": "monthly",
                "max_visits_per_month": None,
                "features": "Acceso ilimitado, clases grupales, asesoramiento nutricional, toalla incluida",
                "is_active": True
            },
            {
                "name": "Plan Trimestral",
                "description": "3 meses de acceso completo con descuento.",
                "price": Decimal("65000.00"),
                "duration_days": 90,
                "plan_type": "quarterly",
                "max_visits_per_month": None,
                "features": "Acceso ilimitado, clases grupales, evaluación física inicial",
                "is_active": True
            },
            {
                "name": "Plan Anual VIP",
                "description": "12 meses de acceso con todos los beneficios.",
                "price": Decimal("220000.00"),
                "duration_days": 365,
                "plan_type": "annual",
                "max_visits_per_month": None,
                "features": "Acceso ilimitado, todas las clases, entrenamiento personalizado, nutricionista, invitado gratis 2 veces/mes",
                "is_active": True
            },
            {
                "name": "Plan Estudiante",
                "description": "Plan especial para estudiantes con descuento.",
                "price": Decimal("18000.00"),
                "duration_days": 30,
                "plan_type": "monthly",
                "max_visits_per_month": None,
                "features": "Acceso completo (requiere certificado de estudios)",
                "is_active": True
            }
        ]
        
        # Crear los planes
        created_count = 0
        for plan_data in default_plans:
            plan = MembershipPlan(**plan_data)
            db.add(plan)
            created_count += 1
        
        db.commit()
        print(f"✅ Se crearon {created_count} planes de membresía por defecto:")
        
        # Mostrar los planes creados
        plans = db.query(MembershipPlan).all()
        for plan in plans:
            print(f"   - {plan.name}: ${plan.price} ({plan.duration_days} días)")
            
    except Exception as e:
        print(f"❌ Error creando planes: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Creando planes de membresía por defecto...")
    create_default_plans()
    print("✅ Proceso completado!")