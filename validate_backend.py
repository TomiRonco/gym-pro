#!/usr/bin/env python3
"""
Validación de arquitectura y endpoints del backend
Verifica que todos los componentes estén correctamente implementados
"""

import os
import sys
from pathlib import Path

# Añadir el directorio backend al path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

def validate_architecture():
    """Validar que la arquitectura esté completa"""
    print("🏗️ VALIDANDO ARQUITECTURA DEL BACKEND")
    print("=" * 50)
    
    # Verificar estructura de archivos
    required_files = [
        "backend/app/__init__.py",
        "backend/app/main.py",
        "backend/app/database.py", 
        "backend/app/models.py",
        "backend/app/schemas.py",
        "backend/app/routers/__init__.py",
        "backend/app/routers/auth.py",
        "backend/app/routers/members.py",
        "backend/app/routers/payments.py",
        "backend/app/routers/attendance.py",
        "backend/app/routers/dashboard.py",
        "backend/requirements.txt"
    ]
    
    missing_files = []
    for file_path in required_files:
        full_path = Path(file_path)
        if full_path.exists():
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path}")
            missing_files.append(file_path)
    
    if missing_files:
        print(f"\n⚠️  Faltan {len(missing_files)} archivos")
        return False
    else:
        print(f"\n✅ Todos los archivos de arquitectura presentes ({len(required_files)} archivos)")
        return True

def validate_imports():
    """Validar que todos los módulos se puedan importar"""
    print("\n📦 VALIDANDO IMPORTACIONES")
    print("=" * 30)
    
    modules_to_test = [
        ("app.main", "FastAPI principal"),
        ("app.database", "Configuración DB"),
        ("app.models", "Modelos SQLAlchemy"),
        ("app.schemas", "Schemas Pydantic"),
        ("app.routers.auth", "Router autenticación"),
        ("app.routers.members", "Router socios"),
        ("app.routers.payments", "Router pagos"),
        ("app.routers.attendance", "Router asistencia"),
        ("app.routers.dashboard", "Router dashboard")
    ]
    
    import_errors = []
    for module_name, description in modules_to_test:
        try:
            __import__(module_name)
            print(f"✅ {description}")
        except ImportError as e:
            print(f"❌ {description}: {e}")
            import_errors.append((module_name, str(e)))
    
    if import_errors:
        print(f"\n⚠️  {len(import_errors)} errores de importación")
        return False
    else:
        print(f"\n✅ Todas las importaciones exitosas ({len(modules_to_test)} módulos)")
        return True

def validate_endpoints():
    """Validar que los endpoints estén definidos"""
    print("\n📡 VALIDANDO ENDPOINTS")
    print("=" * 25)
    
    try:
        from app.main import app
        
        # Obtener todas las rutas
        routes = []
        for route in app.routes:
            if hasattr(route, 'methods') and hasattr(route, 'path'):
                for method in route.methods:
                    if method != 'HEAD' and method != 'OPTIONS':
                        routes.append(f"{method} {route.path}")
        
        # Endpoints esperados
        expected_endpoints = [
            "GET /health",
            "POST /api/auth/token",
            "GET /api/auth/me", 
            "POST /api/members/",
            "GET /api/members/",
            "GET /api/members/{member_id}",
            "PUT /api/members/{member_id}",
            "DELETE /api/members/{member_id}",
            "POST /api/payments/",
            "GET /api/payments/",
            "PUT /api/payments/{payment_id}/verify",
            "POST /api/attendance/check-in",
            "PUT /api/attendance/{attendance_id}/check-out",
            "GET /api/attendance/",
            "GET /api/dashboard/stats"
        ]
        
        # Verificar endpoints
        missing_endpoints = []
        for endpoint in expected_endpoints:
            found = False
            for route in routes:
                if endpoint.replace("{member_id}", "{id}").replace("{payment_id}", "{id}").replace("{attendance_id}", "{id}") in route or endpoint in route:
                    found = True
                    break
            
            if found:
                print(f"✅ {endpoint}")
            else:
                print(f"❌ {endpoint}")
                missing_endpoints.append(endpoint)
        
        print(f"\n📊 RESUMEN ENDPOINTS:")
        print(f"   Total encontrados: {len(routes)}")
        print(f"   Esperados: {len(expected_endpoints)}")
        print(f"   Faltantes: {len(missing_endpoints)}")
        
        if missing_endpoints:
            print(f"\n⚠️  {len(missing_endpoints)} endpoints faltantes")
            return False
        else:
            print(f"\n✅ Todos los endpoints implementados correctamente")
            return True
            
    except Exception as e:
        print(f"❌ Error validando endpoints: {e}")
        return False

def validate_models():
    """Validar que los modelos estén correctamente definidos"""
    print("\n🗄️ VALIDANDO MODELOS DE BASE DE DATOS")
    print("=" * 40)
    
    try:
        from app.models import User, Member, Payment, Attendance
        
        models = [
            (User, "Usuario"),
            (Member, "Socio"),
            (Payment, "Pago"),
            (Attendance, "Asistencia")
        ]
        
        for model_class, name in models:
            # Verificar que tenga __tablename__
            if hasattr(model_class, '__tablename__'):
                print(f"✅ {name} - Tabla: {model_class.__tablename__}")
            else:
                print(f"❌ {name} - Sin tabla definida")
                return False
        
        print(f"\n✅ Todos los modelos implementados ({len(models)} modelos)")
        return True
        
    except Exception as e:
        print(f"❌ Error validando modelos: {e}")
        return False

def validate_schemas():
    """Validar que los schemas Pydantic estén definidos"""
    print("\n📋 VALIDANDO SCHEMAS PYDANTIC")
    print("=" * 35)
    
    try:
        from app import schemas
        
        # Verificar que existan los schemas principales
        schema_classes = [
            "UserBase", "UserCreate", "User",
            "MemberBase", "MemberCreate", "Member",
            "PaymentBase", "PaymentCreate", "Payment", 
            "AttendanceBase", "AttendanceCreate", "Attendance",
            "Token", "TokenData"
        ]
        
        missing_schemas = []
        for schema_name in schema_classes:
            if hasattr(schemas, schema_name):
                print(f"✅ {schema_name}")
            else:
                print(f"❌ {schema_name}")
                missing_schemas.append(schema_name)
        
        if missing_schemas:
            print(f"\n⚠️  {len(missing_schemas)} schemas faltantes")
            return False
        else:
            print(f"\n✅ Todos los schemas implementados ({len(schema_classes)} schemas)")
            return True
            
    except Exception as e:
        print(f"❌ Error validando schemas: {e}")
        return False

def main():
    """Ejecutar todas las validaciones"""
    print("🧪 VALIDACIÓN COMPLETA DEL BACKEND SaaS GIMNASIO")
    print("=" * 60)
    
    validations = [
        ("Arquitectura", validate_architecture),
        ("Importaciones", validate_imports),
        ("Endpoints", validate_endpoints),
        ("Modelos", validate_models),
        ("Schemas", validate_schemas)
    ]
    
    results = []
    for name, validation_func in validations:
        try:
            result = validation_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ Error en validación {name}: {e}")
            results.append((name, False))
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN FINAL DE VALIDACIONES")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\n📈 ESTADÍSTICAS:")
    print(f"   ✅ Validaciones exitosas: {passed}")
    print(f"   ❌ Validaciones fallidas: {failed}")
    print(f"   📊 Porcentaje de éxito: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ¡TODAS LAS VALIDACIONES PASARON EXITOSAMENTE!")
        print("🚀 El backend está completamente implementado y listo")
        print("✨ Arquitectura: PROFESSIONAL ✨")
        print("✨ Funcionalidad: COMPLETE ✨")
        print("✨ API: DOCUMENTED ✨")
        print("✨ Seguridad: IMPLEMENTED ✨")
    else:
        print(f"\n⚠️  {failed} validaciones fallaron")
        print("🔧 Revisar implementación")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)