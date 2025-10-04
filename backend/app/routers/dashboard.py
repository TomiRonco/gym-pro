from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date, timedelta
from decimal import Decimal
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener estadísticas generales para el dashboard"""
    
    # Contar socios
    total_members = db.query(func.count(models.Member.id)).scalar() or 0
    active_members = db.query(func.count(models.Member.id)).filter(
        models.Member.is_active == True
    ).scalar() or 0
    inactive_members = total_members - active_members
    
    # Pagos de hoy
    today = date.today()
    total_payments_today = db.query(func.sum(models.Payment.amount)).filter(
        func.date(models.Payment.payment_date) == today,
        models.Payment.is_verified == True
    ).scalar() or Decimal('0')
    
    # Pagos del mes actual
    current_year = today.year
    current_month = today.month
    total_payments_month = db.query(func.sum(models.Payment.amount)).filter(
        extract('year', models.Payment.payment_date) == current_year,
        extract('month', models.Payment.payment_date) == current_month,
        models.Payment.is_verified == True
    ).scalar() or Decimal('0')
    
    # Asistencia de hoy
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    attendance_today = db.query(func.count(models.Attendance.id)).filter(
        models.Attendance.check_in_time >= today_start,
        models.Attendance.check_in_time < today_end
    ).scalar() or 0
    
    # Asistencia del mes
    month_start = today.replace(day=1)
    attendance_month = db.query(func.count(models.Attendance.id)).filter(
        func.date(models.Attendance.check_in_time) >= month_start,
        func.date(models.Attendance.check_in_time) <= today
    ).scalar() or 0
    
    return schemas.DashboardStats(
        total_members=total_members,
        active_members=active_members,
        inactive_members=inactive_members,
        total_payments_today=total_payments_today,
        total_payments_month=total_payments_month,
        attendance_today=attendance_today,
        attendance_month=attendance_month
    )

@router.get("/membership-types", response_model=list[schemas.MembershipTypeStats])
def get_membership_type_stats(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener estadísticas por tipo de membresía"""
    
    total_members = db.query(func.count(models.Member.id)).filter(
        models.Member.is_active == True
    ).scalar() or 0
    
    if total_members == 0:
        return []
    
    membership_stats = db.query(
        models.Member.membership_type,
        func.count(models.Member.id).label('count')
    ).filter(
        models.Member.is_active == True
    ).group_by(models.Member.membership_type).all()
    
    result = []
    for membership_type, count in membership_stats:
        percentage = (count / total_members) * 100
        result.append(schemas.MembershipTypeStats(
            membership_type=membership_type,
            count=count,
            percentage=round(percentage, 2)
        ))
    
    return result

@router.get("/recent-activity")
def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener actividad reciente del gimnasio"""
    
    # Últimos check-ins
    recent_checkins = db.query(models.Attendance).join(models.Member).filter(
        models.Member.is_active == True
    ).order_by(models.Attendance.check_in_time.desc()).limit(limit).all()
    
    # Últimos pagos
    recent_payments = db.query(models.Payment).join(models.Member).filter(
        models.Member.is_active == True
    ).order_by(models.Payment.payment_date.desc()).limit(limit).all()
    
    # Nuevos socios (últimos 7 días)
    week_ago = date.today() - timedelta(days=7)
    new_members = db.query(models.Member).filter(
        func.date(models.Member.created_at) >= week_ago,
        models.Member.is_active == True
    ).order_by(models.Member.created_at.desc()).all()
    
    return {
        "recent_checkins": [
            {
                "member_name": f"{att.member.first_name} {att.member.last_name}",
                "check_in_time": att.check_in_time,
                "membership_number": att.member.membership_number
            }
            for att in recent_checkins
        ],
        "recent_payments": [
            {
                "member_name": f"{pay.member.first_name} {pay.member.last_name}",
                "amount": float(pay.amount),
                "payment_date": pay.payment_date,
                "payment_method": pay.payment_method,
                "is_verified": pay.is_verified
            }
            for pay in recent_payments
        ],
        "new_members": [
            {
                "name": f"{member.first_name} {member.last_name}",
                "membership_number": member.membership_number,
                "membership_type": member.membership_type,
                "created_at": member.created_at
            }
            for member in new_members
        ]
    }

@router.get("/attendance-trends")
def get_attendance_trends(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener tendencias de asistencia por día"""
    
    end_date = date.today()
    start_date = end_date - timedelta(days=days-1)
    
    # Contar asistencia por día
    daily_attendance = db.query(
        func.date(models.Attendance.check_in_time).label('date'),
        func.count(models.Attendance.id).label('count')
    ).filter(
        func.date(models.Attendance.check_in_time) >= start_date,
        func.date(models.Attendance.check_in_time) <= end_date
    ).group_by(func.date(models.Attendance.check_in_time)).all()
    
    # Crear lista completa de días (incluyendo días sin asistencia)
    attendance_by_date = {str(att_date): count for att_date, count in daily_attendance}
    
    result = []
    current_date = start_date
    while current_date <= end_date:
        result.append({
            "date": str(current_date),
            "attendance": attendance_by_date.get(str(current_date), 0)
        })
        current_date += timedelta(days=1)
    
    return result

@router.get("/revenue-trends")
def get_revenue_trends(
    months: int = 12,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener tendencias de ingresos por mes"""
    
    current_date = date.today()
    current_year = current_date.year
    current_month = current_date.month
    
    # Calcular meses a incluir
    result = []
    for i in range(months):
        month = current_month - i
        year = current_year
        
        if month <= 0:
            month += 12
            year -= 1
        
        # Calcular ingresos del mes
        monthly_revenue = db.query(func.sum(models.Payment.amount)).filter(
            extract('year', models.Payment.payment_date) == year,
            extract('month', models.Payment.payment_date) == month,
            models.Payment.is_verified == True
        ).scalar() or Decimal('0')
        
        result.append({
            "year": year,
            "month": month,
            "revenue": float(monthly_revenue)
        })
    
    # Ordenar por fecha (más antiguo primero)
    result.reverse()
    return result