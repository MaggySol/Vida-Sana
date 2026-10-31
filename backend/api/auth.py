import logging
from types import SimpleNamespace

from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from .oracle.connection import get_connection

logger = logging.getLogger(__name__)

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

    usuario = SimpleNamespace(
        username=email,
        email=email,
        first_name=nombre,
        last_name=f"{apellido_paterno} {apellido_materno}",
    )
    try:
        validate_password(contrasenia, user=usuario)
    except ValidationError as exc:
        return {
            "estado": False,
            "mensaje": " ".join(exc.messages),
        }

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

    except Exception:
        logger.exception("No se pudo completar el registro de usuario.")
        return {
            "estado": False,
            "mensaje": "No se pudo completar el registro. Inténtalo más tarde.",
            "_error_servidor": True,
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
                "mensaje": "Credenciales incorrectas."
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

    except Exception:
        logger.exception("No se pudo completar la autenticación de usuario.")
        return {
            "estado": False,
            "mensaje": "No se pudo iniciar sesión. Inténtalo más tarde.",
            "_error_servidor": True,
        }

    finally:
        if conexion:
            conexion.close()
