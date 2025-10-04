<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
	<!-- Proyecto SaaS de gimnasio con FastAPI backend y React frontend especificado -->

- [x] Scaffold the Project
	<!--
	Estructura creada exitosamente:
	- Backend FastAPI con modelos, routers y configuración
	- Frontend React con TailwindCSS
	- Configuración de base de datos (SQLite para desarrollo)
	- Sistema de autenticación JWT básico
	- Interfaces para gestión de socios, pagos y asistencia
	-->

- [x] Customize the Project
	<!--
	Personalización completada:
	- API REST para gimnasio con endpoints básicos
	- Frontend React con routing y autenticación
	- Layout responsivo con sidebar
	- Páginas principales: Dashboard, Members, Payments, Attendance
	- Configuración de CORS para desarrollo
	-->

- [x] Install Required Extensions
	<!-- No se requieren extensiones específicas para este proyecto -->

- [x] Compile the Project
	<!--
	Compilación exitosa:
	- Backend: Python virtual environment configurado, dependencias instaladas
	- Frontend: Node.js dependencies instaladas, compilación sin errores
	- Ambos servidores funcionando correctamente
	-->

- [x] Create and Run Task
	<!--
	Tareas de desarrollo creadas exitosamente:
	- Backend Task: Ejecutar servidor FastAPI en puerto 8000
	- Frontend Task: Ejecutar servidor React en puerto 3000
	- Ambos servidores ejecutándose correctamente en modo desarrollo
	 -->

- [ ] Launch the Project
	<!--
	Verify that all previous steps have been completed.
	Prompt user for debug mode, launch only if confirmed.
	 -->

- [ ] Ensure Documentation is Complete
	<!--
	Verify that all previous steps have been completed.
	Verify that README.md and the copilot-instructions.md file in the .github directory exists and contains current project information.
	Clean up the copilot-instructions.md file in the .github directory by removing all HTML comments.
	 -->

## SaaS Gym Management System
**Stack:** FastAPI + PostgreSQL + React + TailwindCSS
**MVP Features:** 
- Gestión de socios (ABM)
- Control de pagos
- Registro de asistencia (check-in)