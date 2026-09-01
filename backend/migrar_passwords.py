import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth.hashers import make_password
from api.oracle.connection import get_connection

# Función para cambiar el texto plano de las contraseñas en los datos de prueba
def main():
    conexion = get_connection()

    try:
        with conexion.cursor() as cursor:

            cursor.execute("""
                SELECT RUT, CONTRASENIA
                FROM USUARIOS
            """)

            usuarios = cursor.fetchall()

            for rut, contrasenia in usuarios:

                nuevo_hash = make_password(contrasenia)

                cursor.execute("""
                    UPDATE USUARIOS
                    SET CONTRASENIA = :hash
                    WHERE RUT = :rut
                """, {
                    "hash": nuevo_hash,
                    "rut": rut
                })

                print(f"Contraseña convertida a hash: {rut}")

        conexion.commit()

        print("\nMigración de contraseñas completada.")

    except Exception as e:
        conexion.rollback()
        print("Error:", e)

    finally:
        conexion.close()


if __name__ == "__main__":
    main()