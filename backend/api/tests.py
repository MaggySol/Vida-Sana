from unittest.mock import patch

from django.test import SimpleTestCase
from rest_framework.test import APIClient

from .auth import registrar_usuario


class AuthenticationSecurityTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("api.auth.get_connection")
    def test_registration_rejects_weak_password_before_database_access(
        self, get_connection
    ):
        result = registrar_usuario(
            "12345678-9",
            "Ana",
            "Pérez",
            "Gómez",
            "ana@example.com",
            "password",
            "912345678",
            "cliente",
        )

        self.assertFalse(result["estado"])
        get_connection.assert_not_called()

    @patch("api.views.autenticar_usuario")
    def test_login_database_failure_returns_safe_service_error(self, autenticar):
        autenticar.return_value = {
            "estado": False,
            "mensaje": "No se pudo iniciar sesión. Inténtalo más tarde.",
            "_error_servidor": True,
        }

        response = self.client.post(
            "/api/auth/login/",
            {"email": "ana@example.com", "contrasenia": "secreto"},
            format="json",
        )

        self.assertEqual(response.status_code, 503)
        self.assertNotIn("_error_servidor", response.data)
        self.assertNotIn("database", response.data["mensaje"].lower())

    @patch("api.views.registrar_usuario")
    def test_registration_database_failure_returns_safe_service_error(
        self, registrar
    ):
        registrar.return_value = {
            "estado": False,
            "mensaje": "No se pudo completar el registro. Inténtalo más tarde.",
            "_error_servidor": True,
        }

        response = self.client.post(
            "/api/auth/registro/",
            {
                "rut": "12345678-9",
                "nombre": "Ana",
                "apellido_paterno": "Pérez",
                "apellido_materno": "Gómez",
                "email": "ana@example.com",
                "contrasenia": "Unica-Cancha_2026!",
                "telefono": "912345678",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 503)
        self.assertNotIn("_error_servidor", response.data)
        self.assertNotIn("database", response.data["mensaje"].lower())
