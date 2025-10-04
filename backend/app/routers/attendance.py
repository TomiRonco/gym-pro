from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from typing import List, Optional
from datetime import datetime, date, timedelta
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter()

@router.post("/check-in", response_model=schemas.Attendance, status_code=status.HTTP_201_CREATED)
def check_in(
    attendance: schemas.AttendanceCreate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Registrar entrada (check-in) de un socio"""
    
    # Verificar que el socio existe
    member = db.query(models.Member).filter(models.Member.id == attendance.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Verificar que el socio esté activo
    if not member.is_active:
        raise HTTPException(status_code=400, detail="Member is not active")
    
    # Verificar si la membresía está vigente
    today = date.today()
    if member.membership_end_date < today:
        raise HTTPException(
            status_code=400, 
            detail=f"Membership expired on {member.membership_end_date}"
        )
    
    # Verificar si ya hizo check-in hoy sin check-out
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    existing_checkin = db.query(models.Attendance).filter(
        models.Attendance.member_id == attendance.member_id,
        models.Attendance.check_in_time >= today_start,
        models.Attendance.check_out_time.is_(None)
    ).first()
    
    if existing_checkin:
        raise HTTPException(
            status_code=400, 
            detail=f"Member already checked in today at {existing_checkin.check_in_time.strftime('%H:%M')}"
        )
    
    db_attendance = models.Attendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.put("/{attendance_id}/check-out", response_model=schemas.Attendance)
def check_out(
    attendance_id: int, 
    checkout_data: schemas.AttendanceCheckOut,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Registrar salida (check-out) de un socio"""
    
    attendance = db.query(models.Attendance).filter(
        models.Attendance.id == attendance_id
    ).first()
    
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    if attendance.check_out_time:
        raise HTTPException(
            status_code=400, 
            detail=f"Already checked out at {attendance.check_out_time.strftime('%H:%M')}"
        )
    
    # Registrar check-out
    checkout_time = datetime.utcnow()
    attendance.check_out_time = checkout_time
    
    # Calcular duración en minutos
    duration = checkout_time - attendance.check_in_time
    attendance.duration_minutes = int(duration.total_seconds() / 60)
    
    # Actualizar notas si se proporcionan
    if checkout_data.notes:
        attendance.notes = checkout_data.notes
    
    db.commit()
    db.refresh(attendance)
    return attendance

@router.put("/member/{member_id}/check-out", response_model=schemas.Attendance)
def check_out_by_member(
    member_id: int,
    checkout_data: schemas.AttendanceCheckOut,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Registrar salida usando ID del socio (busca el check-in activo)"""
    
    # Buscar check-in activo (sin check-out) del socio
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    attendance = db.query(models.Attendance).filter(
        models.Attendance.member_id == member_id,
        models.Attendance.check_in_time >= today_start,
        models.Attendance.check_out_time.is_(None)
    ).first()
    
    if not attendance:
        raise HTTPException(
            status_code=404, 
            detail="No active check-in found for this member today"
        )
    
    return check_out(attendance.id, checkout_data, db, current_user)

@router.get("/", response_model=List[schemas.AttendanceWithMember])
def list_attendance(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    member_id: Optional[int] = Query(None),
    only_active: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Listar registros de asistencia con filtros"""
    
    query = db.query(models.Attendance).join(models.Member)
    
    # Filtros
    if member_id:
        query = query.filter(models.Attendance.member_id == member_id)
    
    if start_date:
        query = query.filter(models.Attendance.check_in_time >= start_date)
    
    if end_date:
        # Incluir todo el día final
        end_datetime = datetime.combine(end_date, datetime.max.time())
        query = query.filter(models.Attendance.check_in_time <= end_datetime)
    
    if only_active:
        query = query.filter(models.Attendance.check_out_time.is_(None))
    
    attendance = query.order_by(
        models.Attendance.check_in_time.desc()
    ).offset(skip).limit(limit).all()
    
    return attendance

@router.get("/today", response_model=List[schemas.AttendanceWithMember])
def get_today_attendance(
    only_active: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener asistencia del día actual"""
    
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    query = db.query(models.Attendance).join(models.Member).filter(
        models.Attendance.check_in_time >= today_start,
        models.Attendance.check_in_time < today_end
    )
    
    if only_active:
        query = query.filter(models.Attendance.check_out_time.is_(None))
    
    attendance = query.order_by(models.Attendance.check_in_time.desc()).all()
    return attendance

@router.get("/{attendance_id}", response_model=schemas.AttendanceWithMember)
def get_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener registro de asistencia por ID"""
    
    attendance = db.query(models.Attendance).join(models.Member).filter(
        models.Attendance.id == attendance_id
    ).first()
    
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    return attendance

@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Eliminar registro de asistencia"""
    
    attendance = db.query(models.Attendance).filter(
        models.Attendance.id == attendance_id
    ).first()
    
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    db.delete(attendance)
    db.commit()
    
    return {"message": "Attendance record deleted successfully"}

@router.get("/stats/today", response_model=dict)
def get_today_attendance_stats(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener estadísticas de asistencia del día"""
    
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    # Total de visitas hoy
    total_visits = db.query(func.count(models.Attendance.id)).filter(
        models.Attendance.check_in_time >= today_start,
        models.Attendance.check_in_time < today_end
    ).scalar() or 0
    
    # Personas actualmente en el gimnasio
    currently_in_gym = db.query(func.count(models.Attendance.id)).filter(
        models.Attendance.check_in_time >= today_start,
        models.Attendance.check_in_time < today_end,
        models.Attendance.check_out_time.is_(None)
    ).scalar() or 0
    
    # Duración promedio de las visitas completadas
    avg_duration = db.query(func.avg(models.Attendance.duration_minutes)).filter(
        models.Attendance.check_in_time >= today_start,
        models.Attendance.check_in_time < today_end,
        models.Attendance.check_out_time.is_not(None)
    ).scalar()
    
    # Hora pico (hora con más check-ins)
    peak_hour_data = db.query(
        extract('hour', models.Attendance.check_in_time).label('hour'),
        func.count(models.Attendance.id).label('count')
    ).filter(
        models.Attendance.check_in_time >= today_start,
        models.Attendance.check_in_time < today_end
    ).group_by(extract('hour', models.Attendance.check_in_time)).order_by(
        func.count(models.Attendance.id).desc()
    ).first()
    
    peak_hour = peak_hour_data.hour if peak_hour_data else None
    
    return {
        "date": today_start.date(),
        "total_visits": total_visits,
        "currently_in_gym": currently_in_gym,
        "average_duration_minutes": int(avg_duration) if avg_duration else 0,
        "peak_hour": int(peak_hour) if peak_hour is not None else None
    }

@router.get("/stats/member/{member_id}", response_model=dict)
def get_member_attendance_stats(
    member_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener estadísticas de asistencia de un socio específico"""
    
    # Verificar que el socio existe
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Calcular fechas
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Total de visitas en el período
    total_visits = db.query(func.count(models.Attendance.id)).filter(
        models.Attendance.member_id == member_id,
        models.Attendance.check_in_time >= start_date,
        models.Attendance.check_in_time <= end_date
    ).scalar() or 0
    
    # Duración promedio
    avg_duration = db.query(func.avg(models.Attendance.duration_minutes)).filter(
        models.Attendance.member_id == member_id,
        models.Attendance.check_in_time >= start_date,
        models.Attendance.check_in_time <= end_date,
        models.Attendance.check_out_time.is_not(None)
    ).scalar()
    
    # Última visita
    last_visit = db.query(func.max(models.Attendance.check_in_time)).filter(
        models.Attendance.member_id == member_id
    ).scalar()
    
    # Frecuencia (visitas por semana)
    weeks = days / 7
    frequency_per_week = total_visits / weeks if weeks > 0 else 0
    
    return {
        "member_id": member_id,
        "period_days": days,
        "total_visits": total_visits,
        "average_duration_minutes": int(avg_duration) if avg_duration else 0,
        "frequency_per_week": round(frequency_per_week, 2),
        "last_visit": last_visit
    }