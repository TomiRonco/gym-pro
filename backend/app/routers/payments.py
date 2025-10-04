from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.Payment, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: schemas.PaymentCreate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Registrar nuevo pago"""
    
    # Verificar que el socio existe
    member = db.query(models.Member).filter(models.Member.id == payment.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Verificar que el socio esté activo
    if not member.is_active:
        raise HTTPException(status_code=400, detail="Cannot register payment for inactive member")
    
    db_payment = models.Payment(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/", response_model=List[schemas.PaymentWithMember])
def list_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_verified: Optional[bool] = Query(None),
    payment_method: Optional[str] = Query(None),
    payment_concept: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    member_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Listar pagos con filtros opcionales"""
    
    query = db.query(models.Payment).join(models.Member)
    
    # Filtros
    if is_verified is not None:
        query = query.filter(models.Payment.is_verified == is_verified)
    
    if payment_method:
        query = query.filter(models.Payment.payment_method == payment_method)
    
    if payment_concept:
        query = query.filter(models.Payment.payment_concept == payment_concept)
    
    if member_id:
        query = query.filter(models.Payment.member_id == member_id)
    
    if start_date:
        query = query.filter(models.Payment.payment_date >= start_date)
    
    if end_date:
        query = query.filter(models.Payment.payment_date <= end_date)
    
    payments = query.order_by(
        models.Payment.payment_date.desc()
    ).offset(skip).limit(limit).all()
    
    return payments

@router.get("/{payment_id}", response_model=schemas.PaymentWithMember)
def get_payment(
    payment_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener pago por ID"""
    
    payment = db.query(models.Payment).join(models.Member).filter(
        models.Payment.id == payment_id
    ).first()
    
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return payment

@router.put("/{payment_id}", response_model=schemas.Payment)
def update_payment(
    payment_id: int,
    payment_update: schemas.PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Actualizar pago"""
    
    db_payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    update_data = payment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_payment, field, value)
    
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.put("/{payment_id}/verify", response_model=schemas.Payment)
def verify_payment(
    payment_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Verificar pago"""
    
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.is_verified:
        raise HTTPException(status_code=400, detail="Payment already verified")
    
    payment.is_verified = True
    payment.verified_by = current_user.id
    payment.verified_at = datetime.utcnow()
    
    db.commit()
    db.refresh(payment)
    return payment

@router.put("/{payment_id}/unverify", response_model=schemas.Payment)
def unverify_payment(
    payment_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Desverificar pago"""
    
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if not payment.is_verified:
        raise HTTPException(status_code=400, detail="Payment is not verified")
    
    payment.is_verified = False
    payment.verified_by = None
    payment.verified_at = None
    
    db.commit()
    db.refresh(payment)
    return payment

@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Eliminar pago"""
    
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Solo permitir eliminar pagos no verificados
    if payment.is_verified:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete verified payment. Unverify first."
        )
    
    db.delete(payment)
    db.commit()
    
    return {"message": "Payment deleted successfully"}

@router.get("/stats/today", response_model=dict)
def get_today_payment_stats(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener estadísticas de pagos del día"""
    
    today = date.today()
    
    # Total de pagos del día
    total_amount = db.query(func.sum(models.Payment.amount)).filter(
        func.date(models.Payment.payment_date) == today,
        models.Payment.is_verified == True
    ).scalar() or Decimal('0')
    
    # Cantidad de pagos
    total_payments = db.query(func.count(models.Payment.id)).filter(
        func.date(models.Payment.payment_date) == today
    ).scalar() or 0
    
    # Pagos verificados
    verified_payments = db.query(func.count(models.Payment.id)).filter(
        func.date(models.Payment.payment_date) == today,
        models.Payment.is_verified == True
    ).scalar() or 0
    
    # Pagos pendientes
    pending_payments = total_payments - verified_payments
    
    return {
        "date": today,
        "total_amount": float(total_amount),
        "total_payments": total_payments,
        "verified_payments": verified_payments,
        "pending_payments": pending_payments
    }

@router.get("/stats/month", response_model=dict)
def get_month_payment_stats(
    year: int = Query(default=datetime.now().year),
    month: int = Query(default=datetime.now().month, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener estadísticas de pagos del mes"""
    
    # Total de pagos del mes
    total_amount = db.query(func.sum(models.Payment.amount)).filter(
        extract('year', models.Payment.payment_date) == year,
        extract('month', models.Payment.payment_date) == month,
        models.Payment.is_verified == True
    ).scalar() or Decimal('0')
    
    # Cantidad de pagos
    total_payments = db.query(func.count(models.Payment.id)).filter(
        extract('year', models.Payment.payment_date) == year,
        extract('month', models.Payment.payment_date) == month
    ).scalar() or 0
    
    # Pagos por método
    payment_methods = db.query(
        models.Payment.payment_method,
        func.count(models.Payment.id).label('count'),
        func.sum(models.Payment.amount).label('amount')
    ).filter(
        extract('year', models.Payment.payment_date) == year,
        extract('month', models.Payment.payment_date) == month,
        models.Payment.is_verified == True
    ).group_by(models.Payment.payment_method).all()
    
    return {
        "year": year,
        "month": month,
        "total_amount": float(total_amount),
        "total_payments": total_payments,
        "payment_methods": [
            {
                "method": method,
                "count": count,
                "amount": float(amount or 0)
            }
            for method, count, amount in payment_methods
        ]
    }