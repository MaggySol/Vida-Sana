from rest_framework.permissions import BasePermission

class EsUsuarioValido(BasePermission):
    message = "No tienes un rol válido para realizar esta operación."

    def has_permission(self, request, view):
        return request.auth.get("rol") in ["cliente", "colaborador", "administrador"]

class EsColaboradorOAdministrador(BasePermission):
    message = "No tienes permisos para realizar esta operación."

    def has_permission(self, request, view):
        return request.auth.get("rol") in ["colaborador", "administrador"]


class EsCliente(BasePermission):
    message = "Solo los clientes pueden realizar esta operación."

    def has_permission(self, request, view):
        return request.auth.get("rol") == "cliente"

class EsAdministrador(BasePermission):
    message = "Solo los administradores pueden realizar esta operación."

    def has_permission(self, request, view):
        return request.auth.get("rol") == "administrador"

class EsColaborador(BasePermission):
    message = "Solo los colaboradores pueden realizar esta operación."

    def has_permission(self, request, view):
        return request.auth.get("rol") == "colaborador"



