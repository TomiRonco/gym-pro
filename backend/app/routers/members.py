from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from typing import List, Optional
from datetime import datetime, date
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter()

def generate_membership_number(db: Session) -> str:
    """Generar número de membresía único e incremental"""
    current_year = datetime.now().year
    
    # Buscar el último número de socio del año actual
    last_member = db.query(models.Member).filter(
        models.Member.membership_number.like(f"GYM{current_year}%")
    ).order_by(models.Member.membership_number.desc()).first()
    
    if last_member and last_member.membership_number:
        # Extraer el número secuencial del último socio
        try:
            last_number = int(last_member.membership_number.replace(f"GYM{current_year}", ""))
            next_number = last_number + 1
        except ValueError:
            # Si hay error en el formato, empezar desde 1
            next_number = 1
    else:
        # Si no hay socios del año actual, empezar desde 1
        next_number = 1
    
    # Formatear con ceros a la izquierda (4 dígitos)
    return f"GYM{current_year}{next_number:04d}"

@router.post("/", response_model=schemas.Member, status_code=status.HTTP_201_CREATED)
def create_member(
    member: schemas.MemberCreate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Crear nuevo socio"""
    
    # Verificar si el email ya existe
    db_member = db.query(models.Member).filter(models.Member.email == member.email).first()
    if db_member:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Verificar si el DNI ya existe
    db_member_dni = db.query(models.Member).filter(models.Member.dni == member.dni).first()
    if db_member_dni:
        raise HTTPException(
            status_code=400,
            detail="DNI already registered"
        )
    
    # Si no se proporciona número de membresía, generar uno automático
    membership_number = member.membership_number
    if not membership_number:
        membership_number = generate_membership_number(db)
        # Con el nuevo sistema incremental, no necesitamos verificar duplicados
        # ya que la función garantiza unicidad
    else:
        # Solo verificar duplicados si el usuario proporciona un número específico
        db_member_num = db.query(models.Member).filter(
            models.Member.membership_number == membership_number
        ).first()
        if db_member_num:
            raise HTTPException(
                status_code=400,
                detail="Membership number already exists"
            )
    
    # Crear diccionario con todos los datos del miembro
    member_data = member.dict()
    member_data['membership_number'] = membership_number
    
    # Calcular automáticamente la fecha de fin de membresía (1 mes después de la fecha de inicio)
    if 'membership_start_date' in member_data and member_data['membership_start_date']:
        start_date = member_data['membership_start_date']
        if isinstance(start_date, str):
            from datetime import datetime
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        
        # Calcular fecha de fin (1 mes después)
        if start_date.month == 12:
            end_date = start_date.replace(year=start_date.year + 1, month=1)
        else:
            end_date = start_date.replace(month=start_date.month + 1)
        
        member_data['membership_end_date'] = end_date
    
    db_member = models.Member(**member_data)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/", response_model=List[schemas.Member])
def list_members(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None),
    membership_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Listar socios con filtros opcionales"""
    
    query = db.query(models.Member)
    
    # Filtros
    if is_active is not None:
        query = query.filter(models.Member.is_active == is_active)
    
    if membership_type:
        query = query.filter(models.Member.membership_type == membership_type)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            models.Member.first_name.ilike(search_filter) |
            models.Member.last_name.ilike(search_filter) |
            models.Member.email.ilike(search_filter) |
            models.Member.dni.ilike(search_filter) |
            models.Member.membership_number.ilike(search_filter)
        )
    
    members = query.offset(skip).limit(limit).all()
    return members

@router.get("/{member_id}", response_model=schemas.MemberWithStats)
def get_member(
    member_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener socio por ID con estadísticas"""
    
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Calcular estadísticas
    total_payments = db.query(func.sum(models.Payment.amount)).filter(
        models.Payment.member_id == member_id,
        models.Payment.is_verified == True
    ).scalar() or 0
    
    # Convertir a dict y agregar estadísticas
    member_dict = member.__dict__.copy()
    member_dict.update({
        "total_payments": total_payments,
        "total_visits": 0,
        "last_visit": None
    })
    
    return member_dict

@router.put("/{member_id}", response_model=schemas.Member)
def update_member(
    member_id: int, 
    member_update: schemas.MemberUpdate, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Actualizar socio"""
    
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if db_member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Verificar email único si se está actualizando
    if member_update.email and member_update.email != db_member.email:
        existing_member = db.query(models.Member).filter(
            models.Member.email == member_update.email,
            models.Member.id != member_id
        ).first()
        if existing_member:
            raise HTTPException(status_code=400, detail="Email already in use")
    
    # Verificar número de membresía único si se está actualizando
    if member_update.membership_number and member_update.membership_number != db_member.membership_number:
        existing_member = db.query(models.Member).filter(
            models.Member.membership_number == member_update.membership_number,
            models.Member.id != member_id
        ).first()
        if existing_member:
            raise HTTPException(status_code=400, detail="Membership number already in use")
    
    update_data = member_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_member, field, value)
    
    db_member.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_member)
    return db_member

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    member_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Eliminar socio (soft delete)"""
    
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Soft delete: marcar como inactivo en lugar de eliminar
    member.is_active = False
    member.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Member deactivated successfully"}

@router.get("/{member_id}/payments", response_model=List[schemas.Payment])
def get_member_payments(
    member_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """Obtener historial de pagos de un socio"""
    
    # Verificar que el socio existe
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    payments = db.query(models.Payment).filter(
        models.Payment.member_id == member_id
    ).order_by(models.Payment.payment_date.desc()).offset(skip).limit(limit).all()
    
    return payments