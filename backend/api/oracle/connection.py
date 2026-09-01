import os
import oracledb
from dotenv import load_dotenv

load_dotenv()

def get_connection():

    # Crea y devuelve una conexión a Oracle.
    usuario = os.getenv("ORACLE_USER")
    password = os.getenv("ORACLE_PASSWORD")
    dsn = os.getenv("ORACLE_DSN")

    if not usuario or not password or not dsn:
        raise ValueError(
            "Faltan variables de conexión a Oracle en el archivo .env"
        )

    return oracledb.connect(
        user=usuario,
        password=password,
        dsn=dsn
    )