from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from .oracle_user import obtener_usuario_oracle


class OracleJWTAuthentication(JWTAuthentication):

    def get_user(self, validated_token):

        rut = validated_token.get("rut")

        if not rut:
            raise AuthenticationFailed(
                "El token no contiene el RUT del usuario.",
                code="token_not_valid"
            )

        usuario = obtener_usuario_oracle(rut)

        if not usuario:
            raise AuthenticationFailed(
                "El usuario no existe.",
                code="user_not_found"
            )

        if usuario.estado_usuario != "activo":
            raise AuthenticationFailed(
                "El usuario no está activo.",
                code="user_inactive"
            )

        return usuario