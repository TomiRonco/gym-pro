#!/usr/bin/env python3
"""
Script para probar la API del gimnasio con datos de ejemplo
"""

import requests
import json
from datetime import datetime, date, timedelta
from decimal import Decimal

BASE_URL = "http://127.0.0.1:8002/api"

def test_api():
    print("🧪 Probando API del Gimnasio")
    print("=" * 50)
    
    # 1. Registro de usuario administrador
    print("\n1. 👤 Registrando usuario administrador...")
    admin_data = {
        "username": "admin",
        "email": "admin@gym.com",
        "full_name": "Administrador Principal",
        "role": "admin",
        "phone": "+1234567890",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=admin_data)
        if response.status_code == 201:
            print("✅ Usuario administrador creado exitosamente")
            admin_user = response.json()
            print(f"   Username: {admin_user['username']}")
            print(f"   Email: {admin_user['email']}")
        else:
            print(f"⚠️  Usuario administrador ya existe o error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error al crear administrador: {e}")
        return
    
    # 2. Login para obtener token
    print("\n2. 🔐 Iniciando sesión...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/token", 
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if response.status_code == 200:
            token_data = response.json()
            token = token_data["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("✅ Login exitoso, token obtenido")
        else:
            print(f"❌ Error en login: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error en login: {e}")
        return
    
    # 3. Crear socios de ejemplo
    print("\n3. 👥 Creando socios de ejemplo...")
    members_data = [
        {
            "membership_number": "GYM2024001",
            "first_name": "Juan",
            "last_name": "Pérez",
            "email": "juan.perez@email.com",
            "phone": "+1234567891",
            "address": "Calle Principal 123",
            "birth_date": "1990-05-15",
            "emergency_contact_name": "María Pérez",
            "emergency_contact_phone": "+1234567892",
            "membership_type": "monthly",
            "membership_start_date": str(date.today()),
            "membership_end_date": str(date.today() + timedelta(days=30)),
            "notes": "Nuevo socio, interesado en musculación"
        },
        {
            "membership_number": "GYM2024002",
            "first_name": "Ana",
            "last_name": "García",
            "email": "ana.garcia@email.com",
            "phone": "+1234567893",
            "membership_type": "quarterly",
            "membership_start_date": str(date.today()),
            "membership_end_date": str(date.today() + timedelta(days=90))
        },
        {
            "membership_number": "GYM2024003",
            "first_name": "Carlos",
            "last_name": "López",
            "email": "carlos.lopez@email.com",
            "phone": "+1234567894",
            "membership_type": "annual",
            "membership_start_date": str(date.today()),
            "membership_end_date": str(date.today() + timedelta(days=365))
        }
    ]
    
    created_members = []
    for member_data in members_data:
        try:
            response = requests.post(f"{BASE_URL}/members/", json=member_data, headers=headers)
            if response.status_code == 201:
                member = response.json()
                created_members.append(member)
                print(f"✅ Socio creado: {member['first_name']} {member['last_name']} (#{member['membership_number']})")
            else:
                print(f"⚠️  Error al crear socio: {response.status_code}")
        except Exception as e:
            print(f"❌ Error al crear socio: {e}")
    
    if not created_members:
        print("❌ No se pudieron crear socios")
        return
    
    # 4. Registrar pagos
    print("\n4. 💰 Registrando pagos...")
    for member in created_members:
        payment_data = {
            "member_id": member["id"],
            "amount": 50.00 if member["membership_type"] == "monthly" else 
                     135.00 if member["membership_type"] == "quarterly" else 480.00,
            "payment_method": "card",
            "payment_concept": "membership",
            "description": f"Pago de membresía {member['membership_type']}",
            "invoice_number": f"INV-{member['membership_number']}-001"
        }
        
        try:
            response = requests.post(f"{BASE_URL}/payments/", json=payment_data, headers=headers)
            if response.status_code == 201:
                payment = response.json()
                print(f"✅ Pago registrado: ${payment['amount']} para {member['first_name']} {member['last_name']}")
                
                # Verificar el pago
                verify_response = requests.put(
                    f"{BASE_URL}/payments/{payment['id']}/verify", 
                    headers=headers
                )
                if verify_response.status_code == 200:
                    print(f"   ✅ Pago verificado")
            else:
                print(f"⚠️  Error al registrar pago: {response.status_code}")
        except Exception as e:
            print(f"❌ Error al registrar pago: {e}")
    
    # 5. Registrar asistencias
    print("\n5. 📅 Registrando asistencias...")
    for member in created_members[:2]:  # Solo los primeros 2 socios
        attendance_data = {
            "member_id": member["id"],
            "notes": "Check-in automático de prueba"
        }
        
        try:
            response = requests.post(f"{BASE_URL}/attendance/check-in", json=attendance_data, headers=headers)
            if response.status_code == 201:
                attendance = response.json()
                print(f"✅ Check-in registrado para {member['first_name']} {member['last_name']}")
                print(f"   Hora: {attendance['check_in_time']}")
            else:
                print(f"⚠️  Error en check-in: {response.status_code}")
        except Exception as e:
            print(f"❌ Error en check-in: {e}")
    
    # 6. Obtener estadísticas del dashboard
    print("\n6. 📊 Obteniendo estadísticas del dashboard...")
    try:
        response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
        if response.status_code == 200:
            stats = response.json()
            print("✅ Estadísticas obtenidas:")
            print(f"   👥 Total de socios: {stats['total_members']}")
            print(f"   ✅ Socios activos: {stats['active_members']}")
            print(f"   💰 Pagos hoy: ${stats['total_payments_today']}")
            print(f"   💰 Pagos este mes: ${stats['total_payments_month']}")
            print(f"   📅 Asistencia hoy: {stats['attendance_today']}")
        else:
            print(f"⚠️  Error al obtener estadísticas: {response.status_code}")
    except Exception as e:
        print(f"❌ Error al obtener estadísticas: {e}")
    
    # 7. Listar endpoints disponibles
    print("\n7. 🔗 Endpoints principales de la API:")
    print("   🔐 Autenticación:")
    print("     POST /api/auth/register - Registrar usuario")
    print("     POST /api/auth/token - Iniciar sesión")
    print("     GET  /api/auth/me - Perfil del usuario")
    print("   👥 Socios:")
    print("     GET  /api/members/ - Listar socios")
    print("     POST /api/members/ - Crear socio")
    print("     GET  /api/members/{id} - Obtener socio")
    print("     PUT  /api/members/{id} - Actualizar socio")
    print("   💰 Pagos:")
    print("     GET  /api/payments/ - Listar pagos")
    print("     POST /api/payments/ - Registrar pago")
    print("     PUT  /api/payments/{id}/verify - Verificar pago")
    print("   📅 Asistencia:")
    print("     POST /api/attendance/check-in - Marcar entrada")
    print("     PUT  /api/attendance/{id}/check-out - Marcar salida")
    print("     GET  /api/attendance/today - Asistencia de hoy")
    print("   📊 Dashboard:")
    print("     GET  /api/dashboard/stats - Estadísticas generales")
    
    print("\n🎉 Prueba de API completada exitosamente!")
    print(f"📖 Documentación disponible en: http://127.0.0.1:8002/docs")

if __name__ == "__main__":
    test_api()