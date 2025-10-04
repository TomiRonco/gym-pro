from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

# Esquemas para Users
class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    role: str = "admin"
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Esquemas para Members
class MemberBase(BaseModel):
    membership_number: str
    first_name: str
    last_name: str
    dni: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    birth_date: Optional[date] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    membership_type: str
    membership_start_date: date
    membership_end_date: date
    trainer_id: Optional[int] = None
    notes: Optional[str] = None

class MemberCreate(BaseModel):
    membership_number: Optional[str] = None  # Opcional para auto-generación
    first_name: str
    last_name: str
    dni: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    birth_date: Optional[date] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    membership_type: str
    membership_start_date: date
    membership_end_date: date
    trainer_id: Optional[int] = None
    notes: Optional[str] = None

class MemberUpdate(BaseModel):
    membership_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dni: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    birth_date: Optional[date] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    membership_type: Optional[str] = None
    membership_start_date: Optional[date] = None
    membership_end_date: Optional[date] = None
    trainer_id: Optional[int] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class Member(MemberBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MemberWithStats(Member):
    total_payments: Decimal = 0
    total_visits: int = 0
    last_visit: Optional[datetime] = None

# Esquemas para Payments
class PaymentBase(BaseModel):
    member_id: int
    amount: Decimal
    payment_method: str
    payment_concept: str
    description: Optional[str] = None
    invoice_number: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    amount: Optional[Decimal] = None
    payment_method: Optional[str] = None
    payment_concept: Optional[str] = None
    description: Optional[str] = None
    invoice_number: Optional[str] = None
    is_verified: Optional[bool] = None

class Payment(PaymentBase):
    id: int
    payment_date: datetime
    is_verified: bool
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaymentWithMember(Payment):
    member: Member

# Esquemas para Attendance
class AttendanceBase(BaseModel):
    member_id: int
    notes: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceCheckOut(BaseModel):
    notes: Optional[str] = None

class Attendance(AttendanceBase):
    id: int
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AttendanceWithMember(Attendance):
    member: Member

# Esquemas para Auth
class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Esquemas para estadísticas y dashboard
class DashboardStats(BaseModel):
    total_members: int
    active_members: int
    inactive_members: int
    total_payments_today: Decimal
    total_payments_month: Decimal
    attendance_today: int
    attendance_month: int

class MembershipTypeStats(BaseModel):
    membership_type: str
    count: int
    percentage: float

# Esquemas para configuración del gimnasio
class GymSettingsBase(BaseModel):
    gym_name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    whatsapp: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None

class GymSettingsCreate(GymSettingsBase):
    pass

class GymSettingsUpdate(BaseModel):
    gym_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    whatsapp: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None

class GymSettings(GymSettingsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Esquemas para horarios
class ScheduleBase(BaseModel):
    day_of_week: int  # 0=Lunes, 1=Martes, ..., 6=Domingo
    opening_time: str  # Formato HH:MM
    closing_time: str  # Formato HH:MM
    is_open: bool = True
    notes: Optional[str] = None

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(BaseModel):
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    is_open: Optional[bool] = None
    notes: Optional[str] = None

class Schedule(ScheduleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Esquemas para planes de membresía
class MembershipPlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    duration_days: int
    is_active: bool = True
    features: Optional[str] = None
    max_visits_per_month: Optional[int] = None
    plan_type: str = "monthly"

class MembershipPlanCreate(MembershipPlanBase):
    pass

class MembershipPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    duration_days: Optional[int] = None
    is_active: Optional[bool] = None
    features: Optional[str] = None
    max_visits_per_month: Optional[int] = None
    plan_type: Optional[str] = None

class MembershipPlan(MembershipPlanBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True