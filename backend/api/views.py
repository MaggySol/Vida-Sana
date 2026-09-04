from datetime import datetime

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .permissions import (EsUsuarioValido, EsAdministrador, EsCliente, EsColaboradorOAdministrador)

from .auth import autenticar_usuario, registrar_usuario
from .oracle.connection import get_connection

#********************************
# Endpoints de canchas
#********************************
@api_view(["GET"])
@permission_classes([IsAuthenticated, EsUsuarioValido])
def listar_canchas(request):
    conexion = None

    try:
        conexion = get_connection()

        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT
                    ID_CANCHA,
                    NOMBRE,
                    TIPO,
                    VALOR_HORA,
                    ESTADO_CANCHA
                FROM CANCHAS
                ORDER BY ID_CANCHA
            """)

            columnas = [
                columna[0].lower()
                for columna in cursor.description
            ]

            canchas = [
                dict(zip(columnas, fila))
                for fila in cursor.fetchall()
            ]

        return Response(canchas)

    except Exception as e:
        return Response({
            "estado": False,
            "mensaje": str(e)
        }, status=500)

    finally:
        if conexion:
            conexion.close()


@api_view(["POST"])
@permission_classes([IsAuthenticated, EsUsuarioValido, EsAdministrador])
def ingresar_cancha(request):
    conexion = None

    try:
        # Obtener datos enviados por el cliente
        nombre = request.data.get("nombre")
        tipo = request.data.get("tipo")
        valor_hora = request.data.get("valor_hora")
        descripcion = request.data.get("descripcion")

        # Validar campos obligatorios
        if nombre is None or nombre == "":
            return Response(
                {
                    "estado": False,
                    "mensaje": "El nombre es obligatorio."
                },
                status=400
            )

        if tipo is None or tipo == "":
            return Response(
                {
                    "estado": False,
                    "mensaje": "El tipo es obligatorio."
                },
                status=400
            )

        if valor_hora is None or valor_hora == "":
            return Response(
                {
                    "estado": False,
                    "mensaje": "El valor de hora es obligatorio."
                },
                status=400
            )

        # Validar nombre
        if not isinstance(nombre, str):
            return Response(
                {
                    "estado": False,
                    "mensaje": "El nombre debe ser texto."
                },
                status=400
            )

        if len(nombre) > 100:
            return Response(
                {
                    "estado": False,
                    "mensaje": "El nombre no debe superar los 100 caracteres."
                },
                status=400
            )

        # Validar tipo
        if not isinstance(tipo, str):
            return Response(
                {
                    "estado": False,
                    "mensaje": "El tipo debe ser texto."
                },
                status=400
            )

        tipo = tipo.lower()

        if tipo not in ["futbol", "tenis", "padel"]:
            return Response(
                {
                    "estado": False,
                    "mensaje": 'El tipo no es válido. Debe ser "futbol", "tenis" o "padel".'
                },
                status=400
            )

        # Validar valor de hora
        try:
            valor_hora = float(valor_hora)
        except (TypeError, ValueError):
            return Response(
                {
                    "estado": False,
                    "mensaje": "El valor de hora debe ser numérico."
                },
                status=400
            )

        if valor_hora <= 0:
            return Response(
                {
                    "estado": False,
                    "mensaje": "El valor de la hora debe ser mayor a 0."
                },
                status=400
            )

        # Validar descripción
        if descripcion is not None:
            if not isinstance(descripcion, str):
                return Response(
                    {
                        "estado": False,
                        "mensaje": "La descripción debe ser texto."
                    },
                    status=400
                )

            if len(descripcion) > 500:
                return Response(
                    {
                        "estado": False,
                        "mensaje": "La descripción no debe superar los 500 caracteres."
                    },
                    status=400
                )

        # Llamar al Package de Oracle
        conexion = get_connection()

        with conexion.cursor() as cursor:
            v_estado = cursor.var(str)
            v_mensaje = cursor.var(str)

            cursor.callproc(
                "PACK_CANCHAS.INGRESAR_CANCHA",
                [
                    nombre,
                    tipo,
                    valor_hora,
                    descripcion,
                    v_estado,
                    v_mensaje,
                ],
            )

            estado = v_estado.getvalue()
            mensaje = v_mensaje.getvalue()

        # Respuesta
        if estado == "TRUE":
            return Response(
                {
                    "estado": True,
                    "mensaje": mensaje
                },
                status=201
            )

        return Response(
            {
                "estado": False,
                "mensaje": mensaje
            },
            status=400
        )

    except Exception as e:
        return Response(
            {
                "estado": False,
                "mensaje": str(e)
            },
            status=500
        )

    finally:
        if conexion:
            conexion.close()


@api_view(["PUT"])
@permission_classes([IsAuthenticated, EsUsuarioValido, EsAdministrador])
def modificar_cancha(request, id_cancha):

    print("========== MODIFICAR CANCHA ==========")
    print("USER:", request.user)
    print("AUTH:", request.auth)
    print("ROL:", request.auth.get("rol") if request.auth else None)
    print("=======================================")

    conexion = None

    try:
        rut_usuario = request.auth.get("rut")
        nuevo_nombre = request.data.get("nombre")
        nuevo_valor_hora = request.data.get("valor_hora")
        nueva_descripcion = request.data.get("descripcion")
        motivo = request.data.get("motivo")

        if not nuevo_nombre:
            return Response({
                "estado": False,
                "mensaje": "El nombre es obligatorio."
            }, status=400)

        if nuevo_valor_hora is None:
            return Response({
                "estado": False,
                "mensaje": "El valor de hora es obligatorio."
            }, status=400)

        conexion = get_connection()

        with conexion.cursor() as cursor:
            v_estado = cursor.var(str)
            v_mensaje = cursor.var(str)

            cursor.callproc(
                "PACK_CANCHAS.MODIFICAR_CANCHA",
                [
                    id_cancha,
                    rut_usuario,
                    nuevo_nombre,
                    nuevo_valor_hora,
                    nueva_descripcion,
                    motivo,
                    v_estado,
                    v_mensaje,
                ],
            )

            estado = v_estado.getvalue()
            mensaje = v_mensaje.getvalue()

        return Response({
            "estado": estado == "TRUE",
            "mensaje": mensaje
        })

    except Exception as e:
        return Response({
            "estado": False,
            "mensaje": str(e)
        }, status=500)

    finally:
        if conexion:
            conexion.close()


@api_view(["POST"])
@permission_classes([IsAuthenticated, EsUsuarioValido, EsAdministrador])
def eliminar_cancha(request, id_cancha):
    conexion = None

    try:
        rut_usuario = request.auth.get("rut")
        motivo = request.data.get("motivo")

        if not motivo:
            return Response({
                "estado": False,
                "mensaje": "El motivo es obligatorio."
            }, status=400)

        conexion = get_connection()

        with conexion.cursor() as cursor:
            v_estado = cursor.var(str)
            v_mensaje = cursor.var(str)

            cursor.callproc(
                "PACK_CANCHAS.ELIMINAR_CANCHA",
                [
                    id_cancha,
                    rut_usuario,
                    motivo,
                    v_estado,
                    v_mensaje,
                ],
            )

            estado = v_estado.getvalue()
            mensaje = v_mensaje.getvalue()

        return Response({
            "estado": estado == "TRUE",
            "mensaje": mensaje
        })

    except Exception as e:
        return Response({
            "estado": False,
            "mensaje": str(e)
        }, status=500)

    finally:
        if conexion:
            conexion.close()


# Disponibilidad de canchas
@api_view(["GET"])
@permission_classes([IsAuthenticated, EsUsuarioValido])
def listar_disponibilidad(request):
    conexion = None

    try:
        fecha = request.query_params.get("fecha")
        tipo = request.query_params.get("tipo")

        # Validar fecha
        if not fecha:
            return Response({
                "estado": False,
                "mensaje": "La fecha es obligatoria."
            }, status=400)

        try:
            fecha_oracle = datetime.strptime(fecha, "%d/%m/%Y")
        except ValueError:
            return Response({
                "estado": False,
                "mensaje": "La fecha debe tener el formato DD/MM/YYYY."
            }, status=400)

        conexion = get_connection()

        with conexion.cursor() as cursor:

            if tipo:
                tipo = tipo.lower()

                if tipo not in ["futbol", "tenis", "padel"]:
                    return Response({
                        "estado": False,
                        "mensaje": 'El tipo debe ser "futbol", "tenis" o "padel".'
                    }, status=400)

                cursor.execute("""
                    SELECT
                        ID_CANCHA,
                        NOMBRE,
                        TIPO,
                        VALOR_HORA,
                        FECHA,
                        INICIO_BLOQUE,
                        FIN_BLOQUE
                    FROM VISTA_DISPONIBILIDAD_CANCHAS
                    WHERE FECHA = :fecha
                      AND LOWER(TIPO) = :tipo
                    ORDER BY ID_CANCHA, INICIO_BLOQUE
                """, {
                    "fecha": fecha_oracle,
                    "tipo": tipo
                })

            else:

                cursor.execute("""
                    SELECT
                        ID_CANCHA,
                        NOMBRE,
                        TIPO,
                        VALOR_HORA,
                        FECHA,
                        INICIO_BLOQUE,
                        FIN_BLOQUE
                    FROM VISTA_DISPONIBILIDAD_CANCHAS
                    WHERE FECHA = :fecha
                    ORDER BY ID_CANCHA, INICIO_BLOQUE
                """, {
                    "fecha": fecha_oracle
                })

            columnas = [
                columna[0].lower()
                for columna in cursor.description
            ]

            disponibilidad = [
                dict(zip(columnas, fila))
                for fila in cursor.fetchall()
            ]

        return Response(disponibilidad)

    except Exception as e:
        return Response({
            "estado": False,
            "mensaje": str(e)
        }, status=500)

    finally:
        if conexion:
            conexion.close()


#********************************
# Endpoints de reservas
#********************************
@api_view(["GET"])
@permission_classes([IsAuthenticated, EsUsuarioValido])
def listar_reservas(request):
    conexion = None

    try:
        # Obtener información del usuario desde el JWT
        rut_usuario = request.auth.get("rut")
        rol = request.auth.get("rol")

        conexion = get_connection()

        with conexion.cursor() as cursor:

            if rol in ["administrador", "colaborador"]:

                # Administradores y colaboradores pueden ver todas
                cursor.execute("""
                    SELECT
                        R.ID_RESERVA,
                        R.ID_CANCHA,
                        C.NOMBRE AS NOMBRE_CANCHA,
                        C.TIPO AS TIPO_CANCHA,
                        C.VALOR_HORA,
                        R.RUT_USUARIO,
                        R.FECHA_RESERVA,
                        R.HORA_INICIO,
                        R.HORA_FIN,
                        R.VALOR_TOTAL,
                        R.ESTADO_RESERVA,
                        R.FECHA_CREACION,
                        R.FECHA_CANCELACION,
                        R.MOTIVO_CANCELACION
                    FROM RESERVAS R
                    INNER JOIN CANCHAS C
                        ON R.ID_CANCHA = C.ID_CANCHA
                    ORDER BY R.ID_RESERVA
                """)

            else:

                # Cliente: solamente sus propias reservas
                cursor.execute("""
                    SELECT
                        R.ID_RESERVA,
                        R.ID_CANCHA,
                        C.NOMBRE AS NOMBRE_CANCHA,
                        C.TIPO AS TIPO_CANCHA,
                        C.VALOR_HORA,
                        R.RUT_USUARIO,
                        R.FECHA_RESERVA,
                        R.HORA_INICIO,
                        R.HORA_FIN,
                        R.VALOR_TOTAL,
                        R.ESTADO_RESERVA,
                        R.FECHA_CREACION,
                        R.FECHA_CANCELACION,
                        R.MOTIVO_CANCELACION
                    FROM RESERVAS R
                    INNER JOIN CANCHAS C
                        ON R.ID_CANCHA = C.ID_CANCHA
                    WHERE R.RUT_USUARIO = :rut_usuario
                    ORDER BY R.ID_RESERVA
                """, {
                    "rut_usuario": rut_usuario
                })

            columnas = [
                columna[0].lower()
                for columna in cursor.description
            ]

            reservas = [
                dict(zip(columnas, fila))
                for fila in cursor.fetchall()
            ]

        return Response(reservas)

    except Exception as e:
        return Response({
            "estado": False,
            "mensaje": str(e)
        }, status=500)

    finally:
        if conexion:
            conexion.close()


@api_view(["POST"])
@permission_classes([IsAuthenticated, EsUsuarioValido, EsCliente])
def ingresar_reserva(request):
    conexion = None

    try:
        id_cancha = request.data.get("id_cancha")
        fecha = request.data.get("fecha")
        hora_inicio = request.data.get("hora_inicio")
        hora_fin = request.data.get("hora_fin")

        # El RUT se obtiene directamente desde el JWT
        rut_usuario = request.auth.get("rut")

        # Validaciones básicas de entrada
        if id_cancha is None:
            return Response({
                "estado": False,
                "mensaje": "El ID de la cancha es obligatorio."
            }, status=400)

        if not fecha:
            return Response({
                "estado": False,
                "mensaje": "La fecha de la reserva es obligatoria."
            }, status=400)

        if not hora_inicio:
            return Response({
                "estado": False,
                "mensaje": "La hora de inicio es obligatoria."
            }, status=400)

        if not hora_fin:
            return Response({
                "estado": False,
                "mensaje": "La hora de fin es obligatoria."
            }, status=400)

        conexion = get_connection()

        with conexion.cursor() as cursor:
            v_estado = cursor.var(str)
            v_mensaje = cursor.var(str)
            v_id_reserva = cursor.var(int)

            fecha_oracle = datetime.strptime(fecha, "%d/%m/%Y")

            cursor.callproc(
                "PACK_RESERVAS.INGRESAR_RESERVA",
                [
                    id_cancha,
                    rut_usuario,
                    fecha_oracle,
                    hora_inicio,
                    hora_fin,
                    v_estado,
                    v_mensaje,
                    v_id_reserva,
                ],
            )

            estado = v_estado.getvalue()
            mensaje = v_mensaje.getvalue()
            id_reserva = v_id_reserva.getvalue()

        return Response({
            "estado": estado == "TRUE",
            "mensaje": mensaje,
            "id_reserva": id_reserva
        })

    except ValueError:
        return Response({
            "estado": False,
            "mensaje": "La fecha debe tener el formato DD/MM/YYYY."
        }, status=400)

    except Exception as e:
        return Response({
            "estado": False,
            "mensaje": str(e)
        }, status=500)

    finally:
        if conexion:
            conexion.close()


@api_view(["POST"])
@permission_classes([IsAuthenticated, EsUsuarioValido])
def cancelar_reserva(request, id_reserva):
    conexion = None
    try:
        motivo = request.data.get("motivo")

        if not motivo:
            return Response({
                "estado": False,
                "mensaje": "El motivo de cancelación es obligatorio."
            }, status=400)

        rut_usuario = request.auth.get("rut")
        rol = request.auth.get("rol")

        # Solamente clientes y administradores pueden cancelar reservas.
        if rol not in ["cliente", "administrador"]:
            return Response({
                "estado": False,
                "mensaje": "No tienes permisos para cancelar reservas."
            }, status=403)

        conexion = get_connection()

        with conexion.cursor() as cursor:
            # El cliente solamente puede cancelar sus propias reservas.
            if rol == "cliente":
                cursor.execute("""
                    SELECT RUT_USUARIO
                    FROM RESERVAS
                    WHERE ID_RESERVA = :id_reserva
                """, {
                    "id_reserva": id_reserva
                })

                reserva = cursor.fetchone()

                if not reserva:
                    return Response({
                        "estado": False,
                        "mensaje": "La reserva no existe."
                    }, status=404)

                if reserva[0] != rut_usuario:
                    return Response({
                        "estado": False,
                        "mensaje": "No puedes cancelar una reserva que no te pertenece."
                    }, status=403)

            # El administrador puede cancelar cualquier reserva.
            v_estado = cursor.var(str)
            v_mensaje = cursor.var(str)

            cursor.callproc(
                "PACK_RESERVAS.CANCELAR_RESERVA",
                [
                    id_reserva,
                    motivo,
                    v_estado,
                    v_mensaje,
                ],
            )

            estado = v_estado.getvalue()
            mensaje = v_mensaje.getvalue()

        return Response({
            "estado": estado == "TRUE",
            "mensaje": mensaje
        })

    except Exception as e:
        return Response({
        "estado": False,
        "mensaje": str(e)
    }, status=500)

    finally:
        if conexion:
            conexion.close()

@api_view(["POST"])
@permission_classes([IsAuthenticated, EsColaboradorOAdministrador])
def confirmar_reserva_utilizada(request, id_reserva):
    conexion = None

    try:
        conexion = get_connection()

        with conexion.cursor() as cursor:
            v_estado = cursor.var(str)
            v_mensaje = cursor.var(str)

            cursor.callproc(
                "PACK_RESERVAS.CONFIRMAR_RESERVA_UTILIZADA",
                [
                    id_reserva,
                    v_estado,
                    v_mensaje,
                ],
            )

            estado = v_estado.getvalue()
            mensaje = v_mensaje.getvalue()

        return Response({
            "estado": estado == "TRUE",
            "mensaje": mensaje
        })

    except Exception as e:
        return Response({
            "estado": False,
            "mensaje": str(e)
        }, status=500)

    finally:
        if conexion:
            conexion.close()


@api_view(["POST"])
@permission_classes([IsAuthenticated, EsColaboradorOAdministrador])
def marcar_inasistencia(request, id_reserva):
    conexion = None

    try:
        conexion = get_connection()

        with conexion.cursor() as cursor:
            v_estado = cursor.var(str)
            v_mensaje = cursor.var(str)

            cursor.callproc(
                "PACK_RESERVAS.MARCAR_INASISTENCIA",
                [
                    id_reserva,
                    v_estado,
                    v_mensaje,
                ],
            )

            estado = v_estado.getvalue()
            mensaje = v_mensaje.getvalue()

        return Response({
            "estado": estado == "TRUE",
            "mensaje": mensaje
        })

    except Exception as e:
        return Response({
            "estado": False,
            "mensaje": str(e)
        }, status=500)

    finally:
        if conexion:
            conexion.close()


#********************************
# Endpoint de Usuarios
#********************************
@api_view(["POST"])
def login(request):

    email = request.data.get("email")
    contrasenia = request.data.get("contrasenia")

    if not email:
        return Response({
            "estado": False,
            "mensaje": "El email es obligatorio."
        }, status=400)

    if not contrasenia:
        return Response({
            "estado": False,
            "mensaje": "La contraseña es obligatoria."
        }, status=400)

    resultado = autenticar_usuario(email, contrasenia)

    if not resultado["estado"]:
        return Response(
            resultado,
            status=401
        )

    return Response(resultado)

@api_view(["POST"])
def registro_usuario(request):
    # Registro para usuarios nuevos desde el login
    rut = request.data.get("rut")
    nombre = request.data.get("nombre")
    apellido_paterno = request.data.get("apellido_paterno")
    apellido_materno = request.data.get("apellido_materno")
    email = request.data.get("email")
    contrasenia = request.data.get("contrasenia")
    telefono = request.data.get("telefono")

    # Validaciones obligatorias

    if not rut:
        return Response({
            "estado": False,
            "mensaje": "El RUT es obligatorio."
        }, status=400)

    if not nombre:
        return Response({
            "estado": False,
            "mensaje": "El nombre es obligatorio."
        }, status=400)

    if not apellido_paterno:
        return Response({
            "estado": False,
            "mensaje": "El apellido paterno es obligatorio."
        }, status=400)

    if not apellido_materno:
        return Response({
            "estado": False,
            "mensaje": "El apellido materno es obligatorio."
        }, status=400)

    if not email:
        return Response({
            "estado": False,
            "mensaje": "El email es obligatorio."
        }, status=400)

    if not contrasenia:
        return Response({
            "estado": False,
            "mensaje": "La contraseña es obligatoria."
        }, status=400)

    resultado = registrar_usuario(
        rut,
        nombre,
        apellido_paterno,
        apellido_materno,
        email,
        contrasenia,
        telefono,
        "cliente"
    )

    if not resultado["estado"]:
        return Response(
            resultado,
            status=400
        )

    return Response(
        resultado,
        status=201
    )


#********************************
# Endpoints administrativos de usuarios
#********************************
@api_view(["GET"])
@permission_classes([IsAuthenticated, EsAdministrador])
def listar_usuarios_administracion(request):
    # Devuelve los usuarios sin exponer datos sensibles como contraseñas.
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
                    TELEFONO,
                    ROL,
                    ESTADO_USUARIO,
                    FECHA_REGISTRO
                FROM USUARIOS
                ORDER BY FECHA_REGISTRO DESC, RUT
            """)

            columnas = [columna[0].lower() for columna in cursor.description]
            usuarios = [dict(zip(columnas, fila)) for fila in cursor.fetchall()]

        return Response(usuarios)

    except Exception as e:
        return Response({
            "estado": False,
            "mensaje": str(e)
        }, status=500)

    finally:
        if conexion:
            conexion.close()


@api_view(["POST"])
@permission_classes([IsAuthenticated, EsAdministrador])
def crear_usuario_administracion(request):
    # Crea un usuario con el rol elegido por un administrador autenticado.
    rut = request.data.get("rut")
    nombre = request.data.get("nombre")
    apellido_paterno = request.data.get("apellido_paterno")
    apellido_materno = request.data.get("apellido_materno")
    email = request.data.get("email")
    contrasenia = request.data.get("contrasenia")
    telefono = request.data.get("telefono")
    rol = request.data.get("rol")

    campos_obligatorios = {
        "RUT": rut,
        "nombre": nombre,
        "apellido paterno": apellido_paterno,
        "apellido materno": apellido_materno,
        "email": email,
        "contraseña": contrasenia,
        "rol": rol,
    }

    for campo, valor in campos_obligatorios.items():
        if not isinstance(valor, str) or not valor.strip():
            return Response({
                "estado": False,
                "mensaje": (
                    f"{'La' if campo in ['contraseña'] else 'El'} "
                    f"{campo} es obligatorio."
                )
            }, status=400)

    rol = rol.strip().lower()
    if rol not in ["cliente", "colaborador", "administrador"]:
        return Response({
            "estado": False,
            "mensaje": 'El rol no es válido. Debe ser "cliente", "colaborador" o "administrador".'
        }, status=400)

    resultado = registrar_usuario(
        rut.strip(),
        nombre.strip(),
        apellido_paterno.strip(),
        apellido_materno.strip(),
        email.strip(),
        contrasenia,
        telefono.strip() if isinstance(telefono, str) else telefono,
        rol,
    )

    if not resultado["estado"]:
        mensaje = resultado.get("mensaje", "No se pudo crear el usuario.")
        estado_http = 409 if "ya está registrado" in mensaje.lower() else 400
        return Response(resultado, status=estado_http)

    return Response(resultado, status=201)


#********************************
# Endpoint de Penalizaciones
#********************************
@api_view(["GET"])
@permission_classes([IsAuthenticated, EsUsuarioValido])
def listar_penalizaciones(request):
    conexion = None

    try:
        rut_usuario = request.auth.get("rut")
        rol = request.auth.get("rol")

        conexion = get_connection()

        with conexion.cursor() as cursor:

            if rol in ["administrador", "colaborador"]:

                cursor.execute("""
                    SELECT
                        ID_PENALIZACION,
                        RUT_USUARIO,
                        NOMBRE,
                        APELLIDO_PATERNO,
                        APELLIDO_MATERNO,
                        ID_RESERVA,
                        FECHA_PENALIZACION,
                        TIPO_PENALIZACION,
                        MOTIVO,
                        ESTADO_PENALIZACION,
                        COMENTARIOS_ADMIN
                    FROM VISTA_PENALIZACIONES
                    ORDER BY ID_PENALIZACION
                """)

            else:

                cursor.execute("""
                    SELECT
                        ID_PENALIZACION,
                        RUT_USUARIO,
                        NOMBRE,
                        APELLIDO_PATERNO,
                        APELLIDO_MATERNO,
                        ID_RESERVA,
                        FECHA_PENALIZACION,
                        TIPO_PENALIZACION,
                        MOTIVO,
                        ESTADO_PENALIZACION,
                        COMENTARIOS_ADMIN
                    FROM VISTA_PENALIZACIONES
                    WHERE RUT_USUARIO = :rut_usuario
                    ORDER BY ID_PENALIZACION
                """, {
                    "rut_usuario": rut_usuario
                })

            columnas = [
                columna[0].lower()
                for columna in cursor.description
            ]

            penalizaciones = [
                dict(zip(columnas, fila))
                for fila in cursor.fetchall()
            ]

        return Response(penalizaciones)

    except Exception as e:
        return Response({
            "estado": False,
            "mensaje": str(e)
        }, status=500)

    finally:
        if conexion:
            conexion.close()
