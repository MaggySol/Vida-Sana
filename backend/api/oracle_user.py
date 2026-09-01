from .oracle.connection import get_connection


class OracleUser:
    def __init__(
        self,
        rut,
        nombre,
        apellido_paterno,
        apellido_materno,
        email,
        rol,
        estado_usuario
    ):
        self.rut = rut
        self.nombre = nombre
        self.apellido_paterno = apellido_paterno
        self.apellido_materno = apellido_materno
        self.email = email
        self.rol = rol
        self.estado_usuario = estado_usuario

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return self.rut


def obtener_usuario_oracle(rut):
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
                    ROL,
                    ESTADO_USUARIO
                FROM USUARIOS
                WHERE RUT = :rut
            """, {
                "rut": rut
            })

            usuario = cursor.fetchone()

        if not usuario:
            return None

        return OracleUser(*usuario)

    finally:
        if conexion:
            conexion.close()