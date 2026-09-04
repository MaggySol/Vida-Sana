from django.urls import path
from .views import (
    listar_canchas,
    ingresar_cancha,
    modificar_cancha,
    eliminar_cancha,
    ingresar_reserva,
    listar_disponibilidad,
    listar_reservas,
    cancelar_reserva,
    confirmar_reserva_utilizada,
    marcar_inasistencia,
    login,
    registro_usuario,
    listar_penalizaciones,
    listar_usuarios_administracion,
    crear_usuario_administracion,
)

urlpatterns = [
    # Canchas
    path("canchas/", listar_canchas, name="listar-canchas"),
    path("canchas/crear/", ingresar_cancha, name="ingresar-cancha"),
    path("canchas/<int:id_cancha>/", modificar_cancha, name="modificar-cancha"),
    path("canchas/<int:id_cancha>/eliminar/", eliminar_cancha, name="eliminar-cancha"),
    path("disponibilidad/", listar_disponibilidad, name="listar-disponibilidad"),

    # Reservas
    path("reservas/", listar_reservas, name="listar-reservas"),
    path("reservas/crear/", ingresar_reserva, name="ingresar-reserva"),
    path("reservas/<int:id_reserva>/cancelar/", cancelar_reserva, name="cancelar-reserva"),
    path("reservas/<int:id_reserva>/utilizar/", confirmar_reserva_utilizada, name="confirmar-reserva-utilizada"),
    path("reservas/<int:id_reserva>/inasistencia/", marcar_inasistencia, name="marcar-inasistencia"),

    # Usuarios
    path("auth/login/", login, name="login"),
    path("auth/registro/", registro_usuario, name="registro-usuario"),
    path("admin/usuarios/", listar_usuarios_administracion, name="listar-usuarios-administracion"),
    path("admin/usuarios/crear/", crear_usuario_administracion, name="crear-usuario-administracion"),

    # Penalizaciones
    path("penalizaciones/", listar_penalizaciones, name="listar-penalizaciones"),
]
