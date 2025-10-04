# Gym Pro - Sistema de Gestión de Gimnasio

Sistema SaaS completo para la gestión de gimnasios desarrollado con FastAPI (backend) y React (frontend).

## 🚀 Características

- **Gestión de Socios**: Registro, actualización y control de membresías
- **Control de Pagos**: Seguimiento de pagos y estados financieros
- **Registro de Asistencia**: Check-in/out de socios
- **Dashboard**: Estadísticas en tiempo real
- **Autenticación JWT**: Sistema seguro de login
- **API REST**: Backend completo con documentación automática

## 🛠️ Stack Tecnológico

### Backend
- **FastAPI**: Framework web moderno y rápido
- **SQLAlchemy**: ORM para base de datos
- **SQLite**: Base de datos (desarrollo)
- **JWT**: Autenticación y autorización
- **Python 3.13+**

### Frontend
- **React 19.1.1**: Biblioteca de interfaz de usuario
- **Vite 7.1.14**: Herramienta de desarrollo
- **TailwindCSS v4**: Framework CSS utility-first
- **Lucide React**: Iconos modernos

## 📁 Estructura del Proyecto

```
GyM Completo/
├── backend/
│   ├── app/
│   │   ├── models.py      # Modelos de base de datos
│   │   ├── schemas.py     # Esquemas Pydantic
│   │   ├── database.py    # Configuración de BD
│   │   ├── main.py        # Aplicación principal
│   │   └── routers/       # Rutas de la API
│   ├── venv/             # Entorno virtual Python
│   ├── requirements.txt   # Dependencias Python
│   └── reset_database.py  # Script para reiniciar BD
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Servicios API
│   │   └── App.jsx        # Componente principal
│   ├── package.json       # Dependencias Node
│   └── vite.config.js     # Configuración Vite
└── README.md
```

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/TomiRonco/gym-pro.git
cd gym-pro
```

### 2. Configurar Backend
```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Inicializar base de datos
python reset_database.py
```

### 3. Configurar Frontend
```bash
cd ../frontend

# Instalar dependencias
npm install
```

## 🚀 Ejecutar la Aplicación

### Backend (Puerto 8001)
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

### Frontend (Puerto 3000)
```bash
cd frontend
npm run dev
```

## 🔐 Acceso Inicial

Para acceder al sistema por primera vez:
1. Ejecuta el script de inicialización de la base de datos (si es necesario)
2. Usa las credenciales de administrador configuradas durante la instalación

## 📊 API Endpoints

La documentación completa de la API está disponible en:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Principales Endpoints:
- `POST /api/auth/login` - Autenticación
- `GET /api/members/` - Listar socios
- `POST /api/members/` - Crear socio
- `GET /api/payments/` - Listar pagos
- `POST /api/payments/` - Registrar pago
- `GET /api/attendance/` - Registro de asistencia

## 🏗️ Estado del Proyecto

### ✅ Completado
- Sistema de autenticación JWT
- CRUD completo de socios
- Dashboard con estadísticas reales
- API REST funcional
- Frontend responsivo
- Base de datos limpia

### 🚧 En Desarrollo
- Módulo de pagos (UI básica lista)
- Módulo de asistencia (UI básica lista)
- Reportes avanzados

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Tomás Roncoroni** - [@TomiRonco](https://github.com/TomiRonco)

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!