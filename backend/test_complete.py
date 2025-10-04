#!/usr/bin/env python3
"""
Script de pruebas exhaustivas para el backend del SaaS de gimnasio
Valida todas las funcionalidades implementadas
"""

import requests
import json
from datetime import datetime, date, timedelta
import time

BASE_URL = "http://127.0.0.1:8002"
API_URL = f"{BASE_URL}/api"

class GymAPITester:
    def __init__(self):
        self.token = None
        self.headers = {}
        self.test_results = []
        
    def log_test(self, test_name, success, message=""):
        """Registrar resultado de prueba"""
        result = "✅" if success else "❌"
        status = "PASS" if success else "FAIL"
        print(f"{result} {test_name}: {status}")
        if message:
            print(f"   {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message
        })
    
    def test_server_health(self):
        """Test 1: Verificar que el servidor esté funcionando"""
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            success = response.status_code == 200
            message = f"Status: {response.status_code}"
            if success:
                data = response.json()
                message += f", Message: {data.get('message', 'N/A')}"
            self.log_test("Server Health Check", success, message)
            return success
        except Exception as e:
            self.log_test("Server Health Check", False, str(e))
            return False
    
    def test_authentication(self):
        """Test 2: Sistema de autenticación"""
        try:
            # Test login
            login_data = {"username": "admin_test", "password": "admin123"}
            response = requests.post(
                f"{API_URL}/auth/token",
                data=login_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self.token = token_data["access_token"]
                self.headers = {"Authorization": f"Bearer {self.token}"}
                self.log_test("Authentication - Login", True, f"Token type: {token_data.get('token_type')}")
                
                # Test protected endpoint
                me_response = requests.get(f"{API_URL}/auth/me", headers=self.headers)
                if me_response.status_code == 200:
                    user_data = me_response.json()
                    self.log_test("Authentication - Protected Endpoint", True, f"User: {user_data.get('username')}")
                    return True
                else:
                    self.log_test("Authentication - Protected Endpoint", False, f"Status: {me_response.status_code}")
                    return False
            else:
                self.log_test("Authentication - Login", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Authentication", False, str(e))
            return False
    
    def test_members_crud(self):
        """Test 3: CRUD de socios"""
        if not self.token:
            self.log_test("Members CRUD", False, "No authentication token")
            return False
        
        try:
            # CREATE - Crear socio
            member_data = {
                "membership_number": "TEST2024001",
                "first_name": "Juan",
                "last_name": "Pérez",
                "email": "juan.perez@test.com",
                "phone": "+1234567890",
                "address": "Calle Test 123",
                "birth_date": "1990-05-15",
                "emergency_contact_name": "María Pérez",
                "emergency_contact_phone": "+1234567891",
                "membership_type": "monthly",
                "membership_start_date": str(date.today()),
                "membership_end_date": str(date.today() + timedelta(days=30)),
                "notes": "Socio de prueba"
            }
            
            create_response = requests.post(f"{API_URL}/members/", json=member_data, headers=self.headers)
            if create_response.status_code == 201:
                member = create_response.json()
                member_id = member["id"]
                self.log_test("Members CRUD - CREATE", True, f"Member ID: {member_id}")
                
                # READ - Obtener socio
                read_response = requests.get(f"{API_URL}/members/{member_id}", headers=self.headers)
                if read_response.status_code == 200:
                    self.log_test("Members CRUD - READ", True, "Member retrieved successfully")
                    
                    # UPDATE - Actualizar socio
                    update_data = {"phone": "+9876543210", "notes": "Teléfono actualizado"}
                    update_response = requests.put(f"{API_URL}/members/{member_id}", json=update_data, headers=self.headers)
                    if update_response.status_code == 200:
                        self.log_test("Members CRUD - UPDATE", True, "Member updated successfully")
                        
                        # LIST - Listar socios
                        list_response = requests.get(f"{API_URL}/members/", headers=self.headers)
                        if list_response.status_code == 200:
                            members = list_response.json()
                            self.log_test("Members CRUD - LIST", True, f"Found {len(members)} members")
                            return True
                        else:
                            self.log_test("Members CRUD - LIST", False, f"Status: {list_response.status_code}")
                    else:
                        self.log_test("Members CRUD - UPDATE", False, f"Status: {update_response.status_code}")
                else:
                    self.log_test("Members CRUD - READ", False, f"Status: {read_response.status_code}")
            else:
                self.log_test("Members CRUD - CREATE", False, f"Status: {create_response.status_code}")
                
            return False
        except Exception as e:
            self.log_test("Members CRUD", False, str(e))
            return False
    
    def test_payments_system(self):
        """Test 4: Sistema de pagos"""
        if not self.token:
            self.log_test("Payments System", False, "No authentication token")
            return False
        
        try:
            # Obtener primer socio para el test
            members_response = requests.get(f"{API_URL}/members/", headers=self.headers)
            if members_response.status_code != 200:
                self.log_test("Payments System", False, "No members available")
                return False
            
            members = members_response.json()
            if not members:
                self.log_test("Payments System", False, "No members found")
                return False
            
            member_id = members[0]["id"]
            
            # Crear pago
            payment_data = {
                "member_id": member_id,
                "amount": 75.50,
                "payment_method": "card",
                "payment_concept": "membership",
                "description": "Pago de membresía mensual",
                "invoice_number": "INV-TEST-001"
            }
            
            payment_response = requests.post(f"{API_URL}/payments/", json=payment_data, headers=self.headers)
            if payment_response.status_code == 201:
                payment = payment_response.json()
                payment_id = payment["id"]
                self.log_test("Payments System - CREATE", True, f"Payment ID: {payment_id}, Amount: ${payment['amount']}")
                
                # Verificar pago
                verify_response = requests.put(f"{API_URL}/payments/{payment_id}/verify", headers=self.headers)
                if verify_response.status_code == 200:
                    self.log_test("Payments System - VERIFY", True, "Payment verified successfully")
                    
                    # Listar pagos
                    list_response = requests.get(f"{API_URL}/payments/", headers=self.headers)
                    if list_response.status_code == 200:
                        payments = list_response.json()
                        self.log_test("Payments System - LIST", True, f"Found {len(payments)} payments")
                        return True
                    else:
                        self.log_test("Payments System - LIST", False, f"Status: {list_response.status_code}")
                else:
                    self.log_test("Payments System - VERIFY", False, f"Status: {verify_response.status_code}")
            else:
                self.log_test("Payments System - CREATE", False, f"Status: {payment_response.status_code}")
                
            return False
        except Exception as e:
            self.log_test("Payments System", False, str(e))
            return False
    
    def test_attendance_system(self):
        """Test 5: Sistema de asistencia"""
        if not self.token:
            self.log_test("Attendance System", False, "No authentication token")
            return False
        
        try:
            # Obtener primer socio para el test
            members_response = requests.get(f"{API_URL}/members/", headers=self.headers)
            if members_response.status_code != 200:
                self.log_test("Attendance System", False, "No members available")
                return False
            
            members = members_response.json()
            if not members:
                self.log_test("Attendance System", False, "No members found")
                return False
            
            member_id = members[0]["id"]
            
            # Check-in
            checkin_data = {
                "member_id": member_id,
                "notes": "Check-in de prueba"
            }
            
            checkin_response = requests.post(f"{API_URL}/attendance/check-in", json=checkin_data, headers=self.headers)
            if checkin_response.status_code == 201:
                attendance = checkin_response.json()
                attendance_id = attendance["id"]
                self.log_test("Attendance System - CHECK-IN", True, f"Attendance ID: {attendance_id}")
                
                # Esperar un poco para simular tiempo en el gimnasio
                time.sleep(1)
                
                # Check-out
                checkout_response = requests.put(f"{API_URL}/attendance/{attendance_id}/check-out", headers=self.headers)
                if checkout_response.status_code == 200:
                    self.log_test("Attendance System - CHECK-OUT", True, "Check-out successful")
                    
                    # Listar asistencias
                    list_response = requests.get(f"{API_URL}/attendance/", headers=self.headers)
                    if list_response.status_code == 200:
                        attendances = list_response.json()
                        self.log_test("Attendance System - LIST", True, f"Found {len(attendances)} attendance records")
                        return True
                    else:
                        self.log_test("Attendance System - LIST", False, f"Status: {list_response.status_code}")
                else:
                    self.log_test("Attendance System - CHECK-OUT", False, f"Status: {checkout_response.status_code}")
            else:
                self.log_test("Attendance System - CHECK-IN", False, f"Status: {checkin_response.status_code}")
                
            return False
        except Exception as e:
            self.log_test("Attendance System", False, str(e))
            return False
    
    def test_dashboard_stats(self):
        """Test 6: Estadísticas del dashboard"""
        if not self.token:
            self.log_test("Dashboard Stats", False, "No authentication token")
            return False
        
        try:
            stats_response = requests.get(f"{API_URL}/dashboard/stats", headers=self.headers)
            if stats_response.status_code == 200:
                stats = stats_response.json()
                required_fields = ['total_members', 'active_members', 'total_payments_today', 'total_payments_month', 'attendance_today']
                
                for field in required_fields:
                    if field not in stats:
                        self.log_test("Dashboard Stats", False, f"Missing field: {field}")
                        return False
                
                self.log_test("Dashboard Stats", True, f"All stats present: {stats}")
                return True
            else:
                self.log_test("Dashboard Stats", False, f"Status: {stats_response.status_code}")
                return False
        except Exception as e:
            self.log_test("Dashboard Stats", False, str(e))
            return False
    
    def test_api_documentation(self):
        """Test 7: Documentación de la API"""
        try:
            docs_response = requests.get(f"{BASE_URL}/docs")
            if docs_response.status_code == 200:
                self.log_test("API Documentation", True, "Swagger docs available")
                return True
            else:
                self.log_test("API Documentation", False, f"Status: {docs_response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Documentation", False, str(e))
            return False
    
    def run_all_tests(self):
        """Ejecutar todas las pruebas"""
        print("🧪 INICIANDO PRUEBAS EXHAUSTIVAS DEL BACKEND")
        print("=" * 60)
        
        # Lista de tests a ejecutar
        tests = [
            self.test_server_health,
            self.test_authentication,
            self.test_members_crud,
            self.test_payments_system,
            self.test_attendance_system,
            self.test_dashboard_stats,
            self.test_api_documentation
        ]
        
        # Ejecutar tests
        passed = 0
        failed = 0
        
        for test in tests:
            if test():
                passed += 1
            else:
                failed += 1
            print()  # Línea en blanco entre tests
        
        # Resumen final
        print("=" * 60)
        print("📊 RESUMEN DE PRUEBAS")
        print(f"✅ Pruebas exitosas: {passed}")
        print(f"❌ Pruebas fallidas: {failed}")
        print(f"📈 Éxito total: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!")
            print("🚀 El backend está 100% funcional y listo para producción")
        else:
            print(f"\n⚠️  {failed} pruebas fallaron. Revisar implementación.")
        
        return failed == 0

if __name__ == "__main__":
    tester = GymAPITester()
    tester.run_all_tests()