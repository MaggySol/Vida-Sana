import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [mensaje, setMensaje] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const respuesta = await api.post("/auth/login/", {
        email,
        contrasenia,
      });

      console.log("Respuesta del servidor:", respuesta.data);

      const { access, refresh } = respuesta.data.tokens;
      const usuario = respuesta.data.usuario;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      if (usuario.rol === "cliente") {
        navigate("/cliente");
      } else if (usuario.rol === "colaborador") {
        navigate("/colaborador");
      } else if (usuario.rol === "administrador") {
        navigate("/administrador");
      } else {
        setMensaje("El usuario tiene un rol no válido.");
      }
    } catch (error) {
      console.error("Error en login:", error);

      if (error.response) {
        setMensaje(error.response.data.mensaje || "Error al iniciar sesión.");
      } else {
        setMensaje("No se pudo conectar con el servidor.");
      }
    }
  };

  return (
    <div className="login-pagina">
      <div className="login-contenedor">
        <div className="login-marca">
          <h1>Vida Sana</h1>
          <p>Complejo deportivo</p>
        </div>

        <div className="login-tarjeta">
          <div className="login-encabezado">
            <h2>Bienvenido</h2>
            <p>Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="campo">
              <label htmlFor="email">Correo electrónico</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@email.com"
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="contrasenia">Contraseña</label>

              <input
                id="contrasenia"
                type="password"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            {mensaje && <div className="login-mensaje">{mensaje}</div>}

            <button className="login-boton" type="submit">
              Ingresar
            </button>
          </form>

          <div className="login-registro">
            <p>¿No tienes una cuenta?</p>

            <button type="button" onClick={() => navigate("/registro")}>
              Crear una cuenta
            </button>
          </div>
        </div>

        <p className="login-pie">Sistema de gestión de reservas</p>
      </div>
    </div>
  );
}

export default Login;
