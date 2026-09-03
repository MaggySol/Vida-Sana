# Vida Sana

Aplicación web para administrar la reserva de canchas deportivas. Permite a los clientes consultar disponibilidad y gestionar sus reservas, mientras que colaboradores y administradores disponen de vistas y acciones acorde a su rol.

## Funcionalidades

- Registro e inicio de sesión mediante JWT.
- Consulta de canchas y bloques horarios disponibles.
- Creación y cancelación de reservas para clientes.
- Confirmación de uso y registro de inasistencias por colaboradores o administradores.
- Administración de canchas y consulta global de reservas para administradores.
- Registro de penalizaciones y auditoría de cambios en canchas.

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 19, Vite, React Router y Axios |
| Backend | Python, Django, Django REST Framework y Simple JWT |
| Base de datos | Oracle Database, PL/SQL, vistas, paquetes y triggers |

## Estructura del repositorio

```text
Vida-Sana/
├── frontend/             # Interfaz React/Vite
├── backend/              # API REST en Django
├── database/             # Esquema, datos, vistas, triggers y paquetes Oracle
└── docs/                 # Documentación complementaria
```

## Requisitos

- Node.js 20 o superior y npm.
- Python 3.11 o superior.
- Una instancia accesible de Oracle Database.

## Configuración de la base de datos

Conéctate con el usuario/esquema que utilizará la aplicación y ejecuta los scripts en este orden:

1. `database/tablas.sql`
2. `database/constraints.sql`
3. `database/data.sql` (opcional, para cargar datos iniciales)
4. `database/packages/pack_usuarios.sql`
5. `database/packages/pack_canchas.sql`
6. `database/packages/pack_disponibilidad.sql`
7. `database/packages/pack_reservas.sql`
8. `database/triggers.sql`
9. `database/views.sql`

Después de ejecutar los paquetes, genera los bloques horarios iniciales:

```sql
BEGIN
  PACK_DISPONIBILIDAD.GENERAR_BLOQUES_DISPONIBILIDAD;
END;
/
```

> Los datos incluidos en `database/data.sql` son datos de muestra. Para iniciar sesión con ellos, ejecuta una sola vez `python migrar_passwords.py` desde `backend/`, después de configurar el archivo `.env`. El script convierte las contraseñas existentes a hashes compatibles con Django.

## Configuración del backend

Desde la carpeta `backend`, crea y activa un entorno virtual, instala las dependencias y configura las credenciales de Oracle:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers oracledb python-dotenv
```

Crea un archivo `backend/.env` con los valores de tu instancia:

```env
ORACLE_USER=tu_usuario
ORACLE_PASSWORD=tu_contrasena
ORACLE_DSN=host:puerto/servicio
```

Inicia la API:

```powershell
python manage.py runserver
```

La API queda disponible en `http://127.0.0.1:8000/api/`.

## Configuración del frontend

En otra terminal, instala las dependencias y levanta Vite:

```powershell
cd frontend
npm install
npm run dev
```

Abre la URL que indique Vite, normalmente `http://localhost:5173`. El cliente está configurado para consumir la API local en `http://127.0.0.1:8000/api`.

Para generar una compilación de producción:

```powershell
npm run build
```

## Roles

| Rol | Capacidades principales |
| --- | --- |
| Cliente | Registrarse, consultar disponibilidad, crear y cancelar sus reservas, y revisar sus penalizaciones. |
| Colaborador | Consultar reservas y disponibilidad; confirmar uso o marcar inasistencias. |
| Administrador | Gestionar canchas, consultar y cancelar reservas, revisar disponibilidad y penalizaciones. |

## Endpoints principales

Las rutas se encuentran bajo el prefijo `/api/`:

| Recurso | Rutas principales |
| --- | --- |
| Autenticación | `POST /auth/login/`, `POST /auth/registro/` |
| Canchas | `GET /canchas/`, `POST /canchas/crear/`, `PUT /canchas/{id}/` |
| Disponibilidad | `GET /disponibilidad/?fecha=DD/MM/YYYY&tipo={tipo}` |
| Reservas | `GET /reservas/`, `POST /reservas/crear/`, `POST /reservas/{id}/cancelar/` |
| Operación de reservas | `POST /reservas/{id}/utilizar/`, `POST /reservas/{id}/inasistencia/` |
| Penalizaciones | `GET /penalizaciones/` |

Las rutas protegidas requieren el encabezado `Authorization: Bearer <access_token>` obtenido al iniciar sesión.
