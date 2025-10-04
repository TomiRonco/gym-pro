# 🏋️ GyM Pro - Sistema de Gestión de Gimnasio

**Sistema profesional de gestión para gimnasios** desarrollado con tecnologías modernas y arquitectura escalable.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)

## 📋 Descripción

GyM Pro es una solución completa SaaS para la gestión integral de gimnasios que incluye:

- 👥 **Gestión de Socios** - Control completo de membresías y datos personales
- 💰 **Sistema de Pagos** - Registro y seguimiento de pagos y facturación
- 📅 **Control de Asistencia** - Check-in digital y estadísticas de uso
- 📊 **Dashboard Ejecutivo** - Métricas y análisis en tiempo real
- 🔐 **Autenticación Segura** - Sistema de login con JWT

## 🚀 Tecnologías

### Backend
- **FastAPI** 0.104+ - Framework web moderno y rápido
- **SQLAlchemy** - ORM para base de datos
- **SQLite/PostgreSQL** - Base de datos escalable
- **JWT** - Autenticación segura
- **Uvicorn** - Servidor ASGI de alto rendimiento

### Frontend
- **React** 19.1.1 - Biblioteca de UI moderna
- **Vite** 7.1.14 - Build tool ultrarrápido
- **TailwindCSS** v4 - Framework de estilos utilitarios
- **Lucide React** - Iconografía moderna
- **Context API** - Gestión de estado

## 📁 Estructura del Proyecto

```
GyM Completo/
├── backend/                 # API Backend con FastAPI
│   ├── app/
│   │   ├── routers/        # Endpoints de la API
│   │   ├── models.py       # Modelos de base de datos
│   │   ├── schemas.py      # Esquemas Pydantic
│   │   ├── database.py     # Configuración de BD
│   │   └── main.py         # Aplicación principal
│   ├── requirements.txt    # Dependencias Python
│   └── .env.example       # Variables de entorno
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── context/       # Contextos (Auth, etc.)
│   │   └── services/      # Servicios API
│   ├── package.json       # Dependencias Node.js
│   └── tailwind.config.js # Configuración TailwindCSS
└── README.md              # Este archivo
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Backend (FastAPI)

1. **Navegar al directorio del backend**:
   ```bash
   cd backend
   ```

2. **Crear entorno virtual**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

3. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

5. **Configurar base de datos PostgreSQL**:
   ```sql
   CREATE DATABASE gym_db;
   CREATE USER gym_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE gym_db TO gym_user;
   ```

6. **Ejecutar el servidor**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend (React)

1. **Navegar al directorio del frontend**:
   ```bash
   cd frontend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno** (opcional):
   ```bash
   # Crear .env.local
   REACT_APP_API_URL=http://localhost:8000/api
   ```

4. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm start
   ```

## 🚀 Uso

1. **Accede a la aplicación**: http://localhost:3000
2. **API Documentation**: http://localhost:8000/docs (Swagger UI)
3. **Crear primer usuario admin**: Usar endpoint `/api/auth/register`

### Endpoints Principales

#### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/token` - Iniciar sesión
- `GET /api/auth/me` - Información del usuario actual

#### Socios
- `GET /api/members` - Listar socios
- `POST /api/members` - Crear socio
- `PUT /api/members/{id}` - Actualizar socio
- `DELETE /api/members/{id}` - Eliminar socio

#### Pagos
- `GET /api/payments` - Listar pagos
- `POST /api/payments` - Registrar pago
- `PUT /api/payments/{id}/verify` - Verificar pago

#### Asistencia
- `POST /api/attendance/check-in` - Check-in
- `PUT /api/attendance/check-out/{id}` - Check-out
- `GET /api/attendance/today` - Asistencia del día

## 🔧 Desarrollo

### Comandos Útiles

**Backend**:
```bash
# Ejecutar tests
pytest

# Generar migración
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head
```

**Frontend**:
```bash
# Ejecutar tests
npm test

# Build para producción
npm run build

# Analizar bundle
npm run build && npx serve -s build
```

## 🚀 Despliegue

### Opciones Recomendadas
- **Railway**: Despliegue rápido para prototipos
- **Render**: Para aplicaciones en producción
- **Vercel**: Para el frontend React
- **Heroku**: Opción tradicional

### Variables de Entorno para Producción
```bash
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=your-super-secret-key-for-jwt
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 📋 Roadmap

### Fase 2 - Funcionalidades Avanzadas
- [ ] Dashboard con gráficos y estadísticas
- [ ] Notificaciones automáticas
- [ ] Gestión de rutinas de ejercicios
- [ ] Sistema de reservas de clases
- [ ] Reportes y análisis

### Fase 3 - Escalabilidad
- [ ] API Rate Limiting
- [ ] Caching con Redis
- [ ] Websockets para actualizaciones en tiempo real
- [ ] App móvil con React Native

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte y preguntas:
- 📧 Email: support@gymmanagement.com
- 📱 Documentación: http://localhost:8000/docs
- 🐛 Issues: GitHub Issues

---

**Desarrollado con ❤️ para la comunidad fitness**