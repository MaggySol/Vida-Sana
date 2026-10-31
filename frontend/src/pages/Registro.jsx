import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function Registro() {
  const [rut, setRut] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [email, setEmail] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [telefono, setTelefono] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setRegistroExitoso(false);
    setCargando(true);

    try {
      const respuesta = await api.post("/auth/registro/", {
        rut,
        nombre,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        email,
        contrasenia,
        telefono,
      });

      if (respuesta.data.estado) {
        setRegistroExitoso(true);

        setRut("");
        setNombre("");
        setApellidoPaterno("");
        setApellidoMaterno("");
        setEmail("");
        setContrasenia("");
        setTelefono("");
      } else {
        setMensaje(respuesta.data.mensaje || "No se pudo crear la cuenta.");
      }
    } catch (error) {

      if (error.response) {
        setMensaje(
          error.response.data.mensaje || "No se pudo crear la cuenta.",
        );
      } else {
        setMensaje("No se pudo conectar con el servidor.");
      }
    } finally {
      setCargando(false);
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
            <h2>Crear una cuenta</h2>
            <p>Regístrate como cliente para comenzar a reservar.</p>
          </div>

          {registroExitoso ? (
            <div className="registro-exito">
              <div className="registro-exito-icono">✓</div>

              <div>
                <h3>Cuenta creada correctamente</h3>

                <p>
                  Tu cuenta fue registrada. Ya puedes iniciar sesión para
                  comenzar a utilizar el sistema.
                </p>
              </div>

              <button
                type="button"
                className="login-boton"
                onClick={() => navigate("/")}
              >
                Ir al inicio de sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="campo">
                <label htmlFor="rut">RUT</label>

                <input
                  id="rut"
                  type="text"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  placeholder="12.345.678-9"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="nombre">Nombre</label>

                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ingresa tu nombre"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="apellidoPaterno">Apellido paterno</label>

                <input
                  id="apellidoPaterno"
                  type="text"
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                  placeholder="Ingresa tu apellido paterno"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="apellidoMaterno">Apellido materno</label>

                <input
                  id="apellidoMaterno"
                  type="text"
                  value={apellidoMaterno}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                  placeholder="Ingresa tu apellido materno"
                  required
                />
              </div>

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
                  placeholder="Ingresa una contraseña"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="telefono">
                  Teléfono <span className="campo-opcional">(opcional)</span>
                </label>

                <input
                  id="telefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="912345678"
                />
              </div>

              {mensaje && <div className="login-mensaje">{mensaje}</div>}

              <button className="login-boton" type="submit" disabled={cargando}>
                {cargando ? "Creando cuenta..." : "Crear cuenta"}
              </button>

              <div className="login-registro">
                <p>¿Ya tienes una cuenta?</p>

                <button type="button" onClick={() => navigate("/")}>
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="login-pie">Sistema de gestión de reservas</p>
      </div>
    </div>
  );
}

export default Registro;
