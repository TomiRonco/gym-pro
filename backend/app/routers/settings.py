from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/api/settings",
    tags=["settings"],
    dependencies=[Depends(get_current_user)]
)

# ====== CONFIGURACIÓN GENERAL DEL GIMNASIO ======

@router.get("/gym", response_model=schemas.GymSettings)
def get_gym_settings(db: Session = Depends(get_db)):
    """Obtener configuración general del gimnasio"""
    settings = db.query(models.GymSettings).first()
    if not settings:
        # Crear configuración por defecto si no existe
        default_settings = models.GymSettings(
            gym_name="Mi Gimnasio",
            address="",
            phone="",
            email="",
            website="",
            instagram="",
            facebook="",
            whatsapp="",
            description="",
            logo_url=""
        )
        db.add(default_settings)
        db.commit()
        db.refresh(default_settings)
        return default_settings
    return settings

@router.put("/gym", response_model=schemas.GymSettings)
def update_gym_settings(
    settings_update: schemas.GymSettingsUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar configuración general del gimnasio"""
    settings = db.query(models.GymSettings).first()
    if not settings:
        # Crear configuración si no existe
        settings_data = settings_update.model_dump(exclude_unset=True)
        settings = models.GymSettings(**settings_data)
        db.add(settings)
    else:
        # Actualizar configuración existente
        settings_data = settings_update.model_dump(exclude_unset=True)
        for field, value in settings_data.items():
            setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings

# ====== HORARIOS ======

@router.get("/schedules", response_model=List[schemas.Schedule])
def get_schedules(db: Session = Depends(get_db)):
    """Obtener todos los horarios"""
    schedules = db.query(models.Schedule).order_by(models.Schedule.day_of_week).all()
    
    # Si no hay horarios, crear horarios por defecto
    if not schedules:
        default_schedules = []
        days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
        
        for i in range(7):
            if i < 6:  # Lunes a Sábado
                schedule = models.Schedule(
                    day_of_week=i,
                    opening_time="06:00",
                    closing_time="22:00",
                    is_open=True,
                    notes=f"Horario estándar {days[i]}"
                )
            else:  # Domingo
                schedule = models.Schedule(
                    day_of_week=i,
                    opening_time="08:00",
                    closing_time="20:00",
                    is_open=True,
                    notes=f"Horario {days[i]}"
                )
            
            db.add(schedule)
            default_schedules.append(schedule)
        
        db.commit()
        for schedule in default_schedules:
            db.refresh(schedule)
        return default_schedules
    
    return schedules

@router.get("/schedules/{schedule_id}", response_model=schemas.Schedule)
def get_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Obtener un horario específico"""
    schedule = db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return schedule

@router.put("/schedules/{schedule_id}", response_model=schemas.Schedule)
def update_schedule(
    schedule_id: int,
    schedule_update: schemas.ScheduleUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un horario"""
    schedule = db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    
    schedule_data = schedule_update.model_dump(exclude_unset=True)
    for field, value in schedule_data.items():
        setattr(schedule, field, value)
    
    db.commit()
    db.refresh(schedule)
    return schedule

# ====== PLANES DE MEMBRESÍA ======

@router.get("/membership-plans", response_model=List[schemas.MembershipPlan])
def get_membership_plans(db: Session = Depends(get_db)):
    """Obtener todos los planes de membresía"""
    return db.query(models.MembershipPlan).filter(models.MembershipPlan.is_active == True).all()

@router.get("/membership-plans/all", response_model=List[schemas.MembershipPlan])
def get_all_membership_plans(db: Session = Depends(get_db)):
    """Obtener todos los planes de membresía (incluidos inactivos)"""
    return db.query(models.MembershipPlan).all()

@router.get("/membership-plans/{plan_id}", response_model=schemas.MembershipPlan)
def get_membership_plan(plan_id: int, db: Session = Depends(get_db)):
    """Obtener un plan de membresía específico"""
    plan = db.query(models.MembershipPlan).filter(models.MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan de membresía no encontrado")
    return plan

@router.post("/membership-plans", response_model=schemas.MembershipPlan)
def create_membership_plan(
    plan: schemas.MembershipPlanCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo plan de membresía"""
    db_plan = models.MembershipPlan(**plan.model_dump())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.put("/membership-plans/{plan_id}", response_model=schemas.MembershipPlan)
def update_membership_plan(
    plan_id: int,
    plan_update: schemas.MembershipPlanUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un plan de membresía"""
    plan = db.query(models.MembershipPlan).filter(models.MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan de membresía no encontrado")
    
    plan_data = plan_update.model_dump(exclude_unset=True)
    for field, value in plan_data.items():
        setattr(plan, field, value)
    
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/membership-plans/{plan_id}")
def delete_membership_plan(plan_id: int, db: Session = Depends(get_db)):
    """Eliminar un plan de membresía (soft delete)"""
    plan = db.query(models.MembershipPlan).filter(models.MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan de membresía no encontrado")
    
    plan.is_active = False
    db.commit()
    return {"message": "Plan de membresía eliminado exitosamente"}