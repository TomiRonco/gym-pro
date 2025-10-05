from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Numeric, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    """Modelo para usuarios del sistema (administradores, entrenadores)"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="admin")  # admin, trainer, staff
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    phone = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Member(Base):
    """Modelo para socios del gimnasio"""
    __tablename__ = "members"
    
    id = Column(Integer, primary_key=True, index=True)
    membership_number = Column(String(20), unique=True, nullable=False, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    dni = Column(String(20), unique=True, nullable=False, index=True)  # DNI agregado
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    address = Column(Text)
    birth_date = Column(Date)
    emergency_contact_name = Column(String(100))
    emergency_contact_phone = Column(String(20))
    membership_plan_id = Column(Integer, ForeignKey("membership_plans.id"), nullable=False)
    membership_start_date = Column(Date, nullable=False)
    membership_end_date = Column(Date, nullable=False)  # Se calcula automáticamente (start_date + 1 mes)
    is_active = Column(Boolean, default=True)
    trainer_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Entrenador asignado
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    membership_plan = relationship("MembershipPlan")
    payments = relationship("Payment", back_populates="member", cascade="all, delete-orphan")
    trainer = relationship("User", foreign_keys=[trainer_id])  # Entrenador asignado

class Payment(Base):
    """Modelo para pagos de membresías"""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_date = Column(DateTime(timezone=True), server_default=func.now())
    payment_method = Column(String(20), nullable=False)  # cash, card, transfer, check
    payment_concept = Column(String(50), nullable=False)  # membership, registration, personal_training
    description = Column(Text)
    invoice_number = Column(String(50))
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    member = relationship("Member", back_populates="payments")
    verifier = relationship("User", foreign_keys=[verified_by])

class GymSettings(Base):
    """Modelo para configuración general del gimnasio"""
    __tablename__ = "gym_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    gym_name = Column(String(100), nullable=False, default="Mi Gimnasio")
    address = Column(Text)
    phone = Column(String(20))
    email = Column(String(100))
    website = Column(String(200))
    instagram = Column(String(100))
    facebook = Column(String(100))
    whatsapp = Column(String(20))
    description = Column(Text)
    logo_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Schedule(Base):
    """Modelo para horarios del gimnasio"""
    __tablename__ = "schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Lunes, 1=Martes, ..., 6=Domingo
    name = Column(String(100), nullable=False)  # Nombre del horario (ej: "Horario Mañana", "Horario Tarde")
    opening_time = Column(String(5), nullable=False)  # Formato HH:MM
    closing_time = Column(String(5), nullable=False)  # Formato HH:MM
    is_open = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class MembershipPlan(Base):
    """Modelo para planes de membresía"""
    __tablename__ = "membership_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    days_per_week = Column(Integer, nullable=False)  # Días por semana (1, 2, 3, 4, 5, 6, 7)
    is_active = Column(Boolean, default=True)
    features = Column(Text)  # JSON string con las características del plan
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())