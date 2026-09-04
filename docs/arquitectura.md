# Arquitectura

Vida Sana gestiona reservas de canchas deportivas. El frontend presenta las vistas para clientes, colaboradores y administradores; el backend aplica la autenticación y coordina las operaciones con la base de datos.

```text
React / Vite
     |
     | HTTP + JWT
     v
Django REST Framework
     |
     | oracledb
     v
Oracle Database
     |
     +-- tablas
     +-- vistas
     +-- paquetes PL/SQL
     +-- triggers
```

El inicio de sesión entrega tokens JWT que la API usa para identificar al usuario y validar su rol. Los clientes administran sus reservas; los colaboradores operan reservas y disponibilidad; los administradores además gestionan canchas y usuarios.

La lógica persistida y las operaciones de datos se ejecutan mediante los paquetes y procedimientos PL/SQL incluidos en `database/`. Django se conecta a Oracle con `oracledb` usando las variables definidas en `backend/.env`.
