from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import members, payments, attendance, auth, dashboard, settings
from app.database import engine
from app import models
import os

# Crear las tablas en la base de datos
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gym Management API",
    description="API completa para gestión de gimnasio - Socios, Pagos y Asistencia",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Incluir routers con prefijos
app.include_router(auth.router, prefix="/api/auth", tags=["🔐 Authentication"])
app.include_router(members.router, prefix="/api/members", tags=["👥 Members"])
app.include_router(payments.router, prefix="/api/payments", tags=["💰 Payments"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["📅 Attendance"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["📊 Dashboard"])
app.include_router(settings.router, prefix="/api/settings", tags=["⚙️ Settings"])

@app.get("/")
async def root():
    """Endpoint raíz - Estado de la API"""
    return {
        "message": "Gym Management API v2.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "auth": "/api/auth",
            "members": "/api/members", 
            "payments": "/api/payments",
            "attendance": "/api/attendance",
            "dashboard": "/api/dashboard",
            "settings": "/api/settings"
        }
    }

@app.get("/health")
async def health_check():
    """Endpoint de health check"""
    try:
        # Verificar conexión a la base de datos
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "version": "2.0.0"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

@app.get("/api")
async def api_info():
    """Información de la API"""
    return {
        "title": "Gym Management API",
        "version": "2.0.0",
        "description": "API completa para gestión de gimnasio",
        "features": [
            "🔐 Autenticación JWT",
            "👥 Gestión de socios",
            "💰 Control de pagos", 
            "📅 Registro de asistencia",
            "📊 Dashboard y estadísticas"
        ],
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        }
    }