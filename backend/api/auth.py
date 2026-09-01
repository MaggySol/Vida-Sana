from django.contrib.auth.hashers import check_password, make_password
from rest_framework_simplejwt.tokens import RefreshToken

from .oracle.connection import get_connection

#****************************************
# Función para registrar un usuario
def registrar_usuario(
    rut,
    nombre,
    apellido_paterno,
    apellido_materno,
    email,
    contrasenia,
    telefono,
    rol
):
    conexion = None

    try:
        # Django genera el hash de la contraseña
        hash_contrasenia = make_password(contrasenia)

        conexion = get_connection()

        with conexion.cursor() as cursor:
            v_estado = cursor.var(str)
            v_mensaje = cursor.var(str)

            cursor.callproc(
                "PACK_USUARIOS.INGRESAR_USUARIO",
                [
                    rut,
                    nombre,
                    apellido_paterno,
                    apellido_materno,
                    email,
                    hash_contrasenia,
                    telefono,
                    rol,
                    v_estado,
                    v_mensaje,
                ],
            )

            estado = v_estado.getvalue()
            mensaje = v_mensaje.getvalue()

        return {
            "estado": estado == "TRUE",
            "mensaje": mensaje
        }

    except Exception as e:
        return {
            "estado": False,
            "mensaje": str(e)
        }

    finally:
        if conexion:
            conexion.close()

#************************************
# Función para autenticar usuario            
def autenticar_usuario(email, contrasenia):
    conexion = None

    try:
        conexion = get_connection()

        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT
                    RUT,
                    NOMBRE,
                    APELLIDO_PATERNO,
                    APELLIDO_MATERNO,
                    EMAIL,
                    CONTRASENIA,
                    ROL,
                    ESTADO_USUARIO
                FROM USUARIOS
                WHERE EMAIL = :email
            """, {
                "email": email
            })

            usuario = cursor.fetchone()

        if not usuario:
            return {
                "estado": False,
                "mensaje": "Credenciales incorrectas."
            }

        (
            rut_bd,
            nombre,
            apellido_paterno,
            apellido_materno,
            email_bd,
            hash_contrasenia,
            rol,
            estado_usuario
        ) = usuario

        # Verificar contraseña
        if not check_password(contrasenia, hash_contrasenia):
            return {
                "estado": False,
                "mensaje": "Credenciales incorrectas."
            }

        # Verificar que el usuario esté activo
        if estado_usuario != "activo":
            return {
                "estado": False,
                "mensaje": "El usuario no está activo."
            }

        # Crear JWT
        refresh = RefreshToken()

        refresh["rut"] = rut_bd
        refresh["rol"] = rol
        refresh["nombre"] = nombre

        return {
            "estado": True,
            "mensaje": "Inicio de sesión exitoso.",
            "usuario": {
                "rut": rut_bd,
                "nombre": nombre,
                "apellido_paterno": apellido_paterno,
                "apellido_materno": apellido_materno,
                "email": email_bd,
                "rol": rol
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            }
        }

    except Exception as e:
        return {
            "estado": False,
            "mensaje": f"Error al autenticar usuario: {str(e)}"
        }

    finally:
        if conexion:
            conexion.close()