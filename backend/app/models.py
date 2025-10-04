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
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    address = Column(Text)
    birth_date = Column(Date)
    emergency_contact_name = Column(String(100))
    emergency_contact_phone = Column(String(20))
    membership_type = Column(String(20), nullable=False)  # monthly, quarterly, annual, daily
    membership_start_date = Column(Date, nullable=False)
    membership_end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    payments = relationship("Payment", back_populates="member", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="member", cascade="all, delete-orphan")

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

class Attendance(Base):
    """Modelo para registro de asistencia"""
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    check_in_time = Column(DateTime(timezone=True), server_default=func.now())
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, nullable=True)  # Calculado automáticamente
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    member = relationship("Member", back_populates="attendance_records")