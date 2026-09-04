import { useEffect, useState } from "react";
import api from "../../services/api";

const ROLES_VALIDOS = ["cliente", "colaborador", "administrador"];

const formularioInicial = {
  rut: "",
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  email: "",
  contrasenia: "",
  telefono: "",
  rol: "cliente",
};

function GestionUsuariosAdministrador() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await api.get("/admin/usuarios/");
      setUsuarios(respuesta.data);
    } catch (errorRespuesta) {
      console.error("Error al cargar usuarios:", errorRespuesta);
      setError(
        errorRespuesta.response?.data?.mensaje ||
          "No se pudieron cargar los usuarios.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const abrirFormulario = () => {
    setFormulario(formularioInicial);
    setMensaje("");
    setError("");
    setCreando(true);
  };

  const volverAlListado = () => {
    setFormulario(formularioInicial);
    setError("");
    setCreando(false);
  };

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;
    setFormulario((datosActuales) => ({
      ...datosActuales,
      [name]: value,
    }));
  };

  const validarFormulario = () => {
    const campos = [
      ["rut", "El RUT"],
      ["nombre", "El nombre"],
      ["apellido_paterno", "El apellido paterno"],
      ["apellido_materno", "El apellido materno"],
      ["email", "El correo electrónico"],
      ["contrasenia", "La contraseña"],
    ];

    for (const [campo, etiqueta] of campos) {
      if (!formulario[campo].trim()) {
        return `${etiqueta} es obligatorio.`;
      }
    }

    if (!ROLES_VALIDOS.includes(formulario.rol)) {
      return "Selecciona un rol válido.";
    }

    return "";
  };

  const crearUsuario = async (evento) => {
    evento.preventDefault();
    setMensaje("");
    setError("");

    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    try {
      setGuardando(true);
      const respuesta = await api.post("/admin/usuarios/crear/", {
        ...formulario,
        rut: formulario.rut.trim(),
        nombre: formulario.nombre.trim(),
        apellido_paterno: formulario.apellido_paterno.trim(),
        apellido_materno: formulario.apellido_materno.trim(),
        email: formulario.email.trim(),
        telefono: formulario.telefono.trim(),
      });

      if (!respuesta.data.estado) {
        setError(respuesta.data.mensaje || "No se pudo crear el usuario.");
        return;
      }

      setCreando(false);
      setFormulario(formularioInicial);
      setMensaje(respuesta.data.mensaje || "Usuario creado correctamente.");
      await cargarUsuarios();
    } catch (errorRespuesta) {
      console.error("Error al crear usuario:", errorRespuesta);
      setError(
        errorRespuesta.response?.data?.mensaje ||
          "No se pudo crear el usuario.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const formatearRol = (rol) => {
    if (!rol) return "";
    return rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase();
  };

  const formatearEstado = (estado) => {
    if (!estado) return "";
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  };

  if (creando) {
    return (
      <div className="disponibilidad">
        <section className="confirmacion">
          <div className="confirmacion-card">
            <p className="seccion-etiqueta">Administración</p>
            <h1>Crear usuario</h1>
            <p className="confirmacion-descripcion">
              Registra un usuario y asigna el rol que le corresponde dentro del
              sistema.
            </p>

            {error && <div className="mensaje-disponibilidad">{error}</div>}

            <form onSubmit={crearUsuario}>
              <div className="formulario-usuarios">
                <div className="campo">
                  <label htmlFor="rut">RUT</label>
                  <input
                    id="rut"
                    name="rut"
                    value={formulario.rut}
                    onChange={actualizarCampo}
                    placeholder="12.345.678-9"
                    maxLength={20}
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={actualizarCampo}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="apellido_paterno">Apellido paterno</label>
                  <input
                    id="apellido_paterno"
                    name="apellido_paterno"
                    value={formulario.apellido_paterno}
                    onChange={actualizarCampo}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="apellido_materno">Apellido materno</label>
                  <input
                    id="apellido_materno"
                    name="apellido_materno"
                    value={formulario.apellido_materno}
                    onChange={actualizarCampo}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formulario.email}
                    onChange={actualizarCampo}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="telefono">
                    Teléfono <span className="campo-opcional">(opcional)</span>
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formulario.telefono}
                    onChange={actualizarCampo}
                    maxLength={20}
                  />
                </div>
                <div className="campo">
                  <label htmlFor="contrasenia">Contraseña</label>
                  <input
                    id="contrasenia"
                    name="contrasenia"
                    type="password"
                    value={formulario.contrasenia}
                    onChange={actualizarCampo}
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="rol">Rol</label>
                  <select
                    id="rol"
                    name="rol"
                    value={formulario.rol}
                    onChange={actualizarCampo}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="colaborador">Colaborador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="confirmacion-acciones">
                <button
                  className="boton-volver"
                  type="button"
                  onClick={volverAlListado}
                  disabled={guardando}
                >
                  Volver a la lista
                </button>
                <button
                  className="boton-confirmar"
                  type="submit"
                  disabled={guardando}
                >
                  {guardando ? "Creando usuario..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="disponibilidad">
      <section className="disponibilidad-encabezado">
        <p className="seccion-etiqueta">Administración</p>
        <h1>Gestión de usuarios</h1>
        <p>Consulta los usuarios registrados y crea cuentas para cada rol.</p>
      </section>

      {mensaje && (
        <div className="usuario-exito">
          <strong>✓</strong>
          <span>{mensaje}</span>
        </div>
      )}
      {error && <div className="mensaje-disponibilidad">{error}</div>}

      <section className="busqueda-card usuarios-acciones">
        <div>
          <h2>Usuarios registrados</h2>
          <p>
            La edición de usuarios no está disponible porque el paquete Oracle
            actual no incluye un procedimiento de actualización.
          </p>
        </div>
        <button className="boton-confirmar" onClick={abrirFormulario}>
          Crear usuario
        </button>
      </section>

      {cargando ? (
        <div className="busqueda-card">
          <p>Cargando usuarios...</p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="busqueda-card">
          <h2>No hay usuarios registrados</h2>
          <p>Crea el primer usuario desde el botón anterior.</p>
        </div>
      ) : (
        <section className="usuarios-lista">
          {usuarios.map((usuario) => (
            <article className="usuario-card" key={usuario.rut}>
              <div className="usuario-card-encabezado">
                <div>
                  <h2>
                    {usuario.nombre} {usuario.apellido_paterno}{" "}
                    {usuario.apellido_materno}
                  </h2>
                  <p>{usuario.email}</p>
                </div>
                <span className={`usuario-rol rol-${usuario.rol}`}>
                  {formatearRol(usuario.rol)}
                </span>
              </div>
              <div className="confirmacion-datos">
                <div>
                  <span>RUT</span>
                  <strong>{usuario.rut}</strong>
                </div>
                <div>
                  <span>Teléfono</span>
                  <strong>{usuario.telefono || "Sin teléfono"}</strong>
                </div>
                <div>
                  <span>Estado</span>
                  <strong>{formatearEstado(usuario.estado_usuario)}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default GestionUsuariosAdministrador;
