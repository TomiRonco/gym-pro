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
    
    return schemas.DashboardStats(
        total_members=total_members,
        active_members=active_members,
        inactive_members=inactive_members,
        total_payments_today=total_payments_today,
        total_payments_month=total_payments_month,
        attendance_today=0,
        attendance_month=0
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
        "recent_checkins": [],
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