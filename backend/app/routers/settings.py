from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter(
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
    schedules = db.query(models.Schedule).order_by(models.Schedule.day_of_week, models.Schedule.opening_time).all()
    return schedules
    
    return schedules

@router.get("/schedules/day/{day}", response_model=List[schemas.Schedule])
def get_schedules_by_day(day: int, db: Session = Depends(get_db)):
    """Obtener horarios de un día específico (0=Lunes, 1=Martes, ..., 6=Domingo)"""
    if day < 0 or day > 6:
        raise HTTPException(status_code=400, detail="Día inválido. Debe ser entre 0 (Lunes) y 6 (Domingo)")
    
    schedules = db.query(models.Schedule).filter(
        models.Schedule.day_of_week == day
    ).order_by(models.Schedule.opening_time).all()
    
    return schedules

@router.post("/schedules", response_model=schemas.Schedule)
def create_schedule(
    schedule_data: schemas.ScheduleCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo horario"""
    # Validar formato de tiempo
    try:
        from datetime import datetime
        datetime.strptime(schedule_data.opening_time, "%H:%M")
        datetime.strptime(schedule_data.closing_time, "%H:%M")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de hora inválido. Use HH:MM")
    
    # Validar que la hora de apertura sea menor que la de cierre
    if schedule_data.opening_time >= schedule_data.closing_time:
        raise HTTPException(status_code=400, detail="La hora de apertura debe ser menor que la hora de cierre")
    
    # Validar día de la semana
    if schedule_data.day_of_week < 0 or schedule_data.day_of_week > 6:
        raise HTTPException(status_code=400, detail="Día inválido. Debe ser entre 0 (Lunes) y 6 (Domingo)")
    
    # Verificar solapamiento de horarios en el mismo día (solo advertencia para horarios con nombres diferentes)
    existing_schedules = db.query(models.Schedule).filter(
        models.Schedule.day_of_week == schedule_data.day_of_week,
        models.Schedule.is_open == True
    ).all()
    
    for existing in existing_schedules:
        # Convertir strings a minutos para comparación más fácil
        def time_to_minutes(time_str):
            h, m = map(int, time_str.split(':'))
            return h * 60 + m
        
        new_start = time_to_minutes(schedule_data.opening_time)
        new_end = time_to_minutes(schedule_data.closing_time)
        existing_start = time_to_minutes(existing.opening_time)
        existing_end = time_to_minutes(existing.closing_time)
        
        # Verificar solapamiento - solo bloquear si es exactamente el mismo horario
        if not (new_end <= existing_start or new_start >= existing_end):
            # Si el nombre es diferente, permitir el solapamiento (podría ser un reemplazo)
            if existing.name.lower().strip() == schedule_data.name.lower().strip():
                raise HTTPException(
                    status_code=400, 
                    detail=f"Ya existe un horario con el nombre '{existing.name}' en este día"
                )
            # Si solo se solapa parcialmente y tiene nombres diferentes, permitir pero con advertencia en logs
            print(f"ADVERTENCIA: Horario '{schedule_data.name}' se solapa con '{existing.name}' el mismo día")
    
    schedule = models.Schedule(**schedule_data.model_dump())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule

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
    
    # Validar formato de tiempo si se está actualizando
    if schedule_update.opening_time or schedule_update.closing_time:
        opening_time = schedule_update.opening_time or schedule.opening_time
        closing_time = schedule_update.closing_time or schedule.closing_time
        
        try:
            from datetime import datetime
            datetime.strptime(opening_time, "%H:%M")
            datetime.strptime(closing_time, "%H:%M")
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de hora inválido. Use HH:MM")
        
        if opening_time >= closing_time:
            raise HTTPException(status_code=400, detail="La hora de apertura debe ser menor que la hora de cierre")
    
    schedule_data = schedule_update.model_dump(exclude_unset=True)
    for field, value in schedule_data.items():
        setattr(schedule, field, value)
    
    db.commit()
    db.refresh(schedule)
    return schedule

@router.delete("/schedules/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Eliminar un horario"""
    schedule = db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    
    db.delete(schedule)
    db.commit()
    return {"message": "Horario eliminado exitosamente"}

@router.delete("/schedules/clear/all")
def clear_all_schedules(db: Session = Depends(get_db)):
    """Eliminar todos los horarios (útil para empezar desde cero)"""
    deleted_count = db.query(models.Schedule).delete()
    db.commit()
    return {"message": f"Se eliminaron {deleted_count} horarios"}

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