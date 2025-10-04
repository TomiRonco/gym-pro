#!/usr/bin/env python3
"""
Script de prueba simple para la API del gimnasio
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8002"

def test_basic_endpoints():
    print("🧪 Probando endpoints básicos de la API")
    print("=" * 50)
    
    # 1. Test endpoint raíz
    print("\n1. Testing endpoint raíz...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint raíz funcionando")
            print(f"   Mensaje: {data['message']}")
            print(f"   Estado: {data['status']}")
        else:
            print(f"❌ Error en endpoint raíz: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # 2. Test health check
    print("\n2. Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check funcionando")
            print(f"   Estado: {data['status']}")
            print(f"   Base de datos: {data['database']}")
        else:
            print(f"❌ Error en health check: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # 3. Test documentación
    print("\n3. Testing documentación...")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ Documentación disponible en /docs")
        else:
            print(f"❌ Error en documentación: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # 4. Test API info
    print("\n4. Testing API info...")
    try:
        response = requests.get(f"{BASE_URL}/api")
        if response.status_code == 200:
            data = response.json()
            print("✅ API info funcionando")
            print(f"   Título: {data['title']}")
            print(f"   Versión: {data['version']}")
            print("   Características:")
            for feature in data['features']:
                print(f"     {feature}")
        else:
            print(f"❌ Error en API info: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🎉 Pruebas básicas completadas!")
    print(f"📖 Documentación completa: {BASE_URL}/docs")
    print(f"🔗 API endpoints: {BASE_URL}/api")
    
    return True

if __name__ == "__main__":
    test_basic_endpoints()