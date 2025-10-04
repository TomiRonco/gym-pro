#!/usr/bin/env python3
"""
Script para crear planes de membresía basados en días por semana
"""
import sys
import os

# Agregar el directorio padre al path para importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models import MembershipPlan

# Crear sesión de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_weekly_plans():
    """Crear planes de membresía basados en días por semana"""
    db = SessionLocal()
    
    try:
        # Limpiar planes existentes
        db.query(MembershipPlan).delete()
        db.commit()
        
        # Definir los nuevos planes basados en días por semana
        plans_data = [
            {
                "name": "Plan 1 Día Semanal",
                "description": "Acceso 1 día por semana al gimnasio. Ideal para principiantes o complemento de otras actividades.",
                "price": 8000.00,
                "days_per_week": 1,
                "features": '["Acceso 1 día por semana", "Uso de equipos básicos", "Vestuarios"]'
            },
            {
                "name": "Plan 2 Días Semanales", 
                "description": "Acceso 2 días por semana. Perfecto para mantener una rutina básica de ejercicio.",
                "price": 15000.00,
                "days_per_week": 2,
                "features": '["Acceso 2 días por semana", "Uso de equipos básicos", "Vestuarios", "Rutina personalizada"]'
            },
            {
                "name": "Plan 3 Días Semanales",
                "description": "Acceso 3 días por semana. Ideal para rutinas de fuerza y cardio balanceadas.",
                "price": 22000.00,
                "days_per_week": 3,
                "features": '["Acceso 3 días por semana", "Uso completo de equipos", "Vestuarios", "Rutina personalizada", "Asesoramiento básico"]'
            },
            {
                "name": "Plan 4 Días Semanales",
                "description": "Acceso 4 días por semana. Para entrenamientos más intensivos y constantes.",
                "price": 28000.00,
                "days_per_week": 4,
                "features": '["Acceso 4 días por semana", "Uso completo de equipos", "Vestuarios", "Rutina personalizada", "Asesoramiento técnico"]'
            },
            {
                "name": "Plan 5 Días Semanales",
                "description": "Acceso 5 días por semana. Perfecto para deportistas y entusiastas del fitness.",
                "price": 34000.00,
                "days_per_week": 5,
                "features": '["Acceso 5 días por semana", "Uso completo de equipos", "Vestuarios", "Rutina personalizada", "Asesoramiento técnico", "Evaluación física mensual"]'
            },
            {
                "name": "Plan Libre (7 Días)",
                "description": "Acceso completo todos los días de la semana. Máxima flexibilidad para tu entrenamiento.",
                "price": 45000.00,
                "days_per_week": 7,
                "features": '["Acceso libre 7 días", "Uso completo de equipos", "Vestuarios", "Rutina personalizada", "Asesoramiento técnico", "Evaluación física mensual", "Clases grupales incluidas"]'
            }
        ]
        
        # Crear los planes
        created_plans = []
        for plan_data in plans_data:
            plan = MembershipPlan(**plan_data)
            db.add(plan)
            created_plans.append(plan)
        
        # Guardar en la base de datos
        db.commit()
        
        print("✅ Planes de membresía basados en días por semana creados exitosamente:")
        print("-" * 80)
        
        for plan in created_plans:
            db.refresh(plan)
            print(f"🏋️  {plan.name}")
            print(f"   💰 Precio: ${plan.price:,.0f}")
            print(f"   📅 Días por semana: {plan.days_per_week}")
            print(f"   📝 {plan.description}")
            print()
        
        return created_plans
        
    except Exception as e:
        print(f"❌ Error al crear los planes: {e}")
        db.rollback()
        return []
        
    finally:
        db.close()

if __name__ == "__main__":
    print("🏋️ Creando planes de membresía basados en días por semana...")
    print()
    
    plans = create_weekly_plans()
    
    if plans:
        print(f"🎉 Se crearon {len(plans)} planes exitosamente!")
        print()
        print("💡 Características del nuevo sistema:")
        print("   • Los planes se basan en días por semana (1-7 días)")
        print("   • El vencimiento es siempre a 1 mes de la fecha de inicio")
        print("   • Precios escalados según la cantidad de días")
        print("   • Características específicas para cada plan")
    else:
        print("❌ No se pudieron crear los planes")