import { useEffect, useState } from "react";
import api from "../../services/api";

function GestionCanchas() {
  const [canchas, setCanchas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [filtroTipo, setFiltroTipo] = useState("todas");

  const [modoFormulario, setModoFormulario] = useState(null);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("futbol");
  const [valorHora, setValorHora] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [motivo, setMotivo] = useState("");

  // ============================================================
  // CARGAR CANCHAS
  // ============================================================

  const cargarCanchas = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await api.get("/canchas/");

      setCanchas(respuesta.data);
    } catch (error) {
      console.error("Error al cargar canchas:", error);

      if (error.response) {
        setError(
          error.response.data.mensaje || "No se pudieron cargar las canchas.",
        );
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCanchas();
  }, []);

  // ============================================================
  // FORMULARIOS
  // ============================================================

  const limpiarFormulario = () => {
    setNombre("");
    setTipo("futbol");
    setValorHora("");
    setDescripcion("");
    setMotivo("");
    setCanchaSeleccionada(null);
  };

  const abrirCrear = () => {
    limpiarFormulario();

    setModoFormulario("crear");
    setMensaje("");
    setError("");
  };

  const abrirEditar = (cancha) => {
    setCanchaSeleccionada(cancha);

    setNombre(cancha.nombre || "");
    setTipo(cancha.tipo || "futbol");
    setValorHora(cancha.valor_hora || "");
    setDescripcion(cancha.descripcion || "");
    setMotivo("");

    setModoFormulario("editar");
    setMensaje("");
    setError("");
  };

  const abrirDeshabilitar = (cancha) => {
    setCanchaSeleccionada(cancha);
    setMotivo("");

    setModoFormulario("deshabilitar");
    setMensaje("");
    setError("");
  };

  const cerrarFormulario = () => {
    limpiarFormulario();

    setModoFormulario(null);
    setMensaje("");
    setError("");
  };

  // ============================================================
  // CREAR / MODIFICAR
  // ============================================================

  const guardarCancha = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    // ============================================================
    // VALIDACIONES
    // ============================================================

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!valorHora) {
      setError("El valor de hora es obligatorio.");
      return;
    }

    if (Number(valorHora) <= 0) {
      setError("El valor de la hora debe ser mayor a 0.");
      return;
    }

    if (modoFormulario === "editar" && !motivo.trim()) {
      setError("El motivo de modificación es obligatorio.");
      return;
    }

    try {
      // ============================================================
      // CREAR CANCHA
      // ============================================================

      if (modoFormulario === "crear") {
        const respuesta = await api.post("/canchas/crear/", {
          nombre: nombre.trim(),
          tipo,
          valor_hora: valorHora,
          descripcion: descripcion.trim(),
        });

        if (respuesta.data.estado) {
          const mensajeExito =
            respuesta.data.mensaje || "Cancha creada correctamente.";

          cerrarFormulario();
          setMensaje(mensajeExito);

          await cargarCanchas();
        } else {
          setError(respuesta.data.mensaje || "No se pudo crear la cancha.");
        }

        return;
      }

      // ============================================================
      // MODIFICAR CANCHA
      // ============================================================

      if (modoFormulario === "editar" && canchaSeleccionada) {
        const respuesta = await api.put(
          `/canchas/${canchaSeleccionada.id_cancha}/`,
          {
            nombre: nombre.trim(),
            valor_hora: valorHora,
            descripcion: descripcion.trim(),
            motivo: motivo.trim(),
          },
        );

        if (respuesta.data.estado) {
          const mensajeExito =
            respuesta.data.mensaje || "Cancha modificada correctamente.";

          cerrarFormulario();
          setMensaje(mensajeExito);

          await cargarCanchas();
        } else {
          setError(respuesta.data.mensaje || "No se pudo modificar la cancha.");
        }
      }
    } catch (error) {
      console.error("Error al guardar cancha:", error);

      if (error.response) {
        setError(
          error.response.data.mensaje || "No se pudo completar la operación.",
        );
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  // ============================================================
  // DESHABILITAR CANCHA
  // ============================================================

  const deshabilitarCancha = async (e) => {
    e.preventDefault();

    if (!canchaSeleccionada) {
      return;
    }

    setMensaje("");
    setError("");

    if (!motivo.trim()) {
      setError("El motivo para deshabilitar es obligatorio.");
      return;
    }

    try {
      const respuesta = await api.post(
        `/canchas/${canchaSeleccionada.id_cancha}/eliminar/`,
        {
          motivo,
        },
      );

      if (respuesta.data.estado) {
        const mensajeExito =
          respuesta.data.mensaje || "Cancha deshabilitada correctamente.";

        cerrarFormulario();
        setMensaje(mensajeExito);

        await cargarCanchas();
      } else {
        setError(
          respuesta.data.mensaje || "No se pudo deshabilitar la cancha.",
        );
      }
    } catch (error) {
      console.error("Error al deshabilitar cancha:", error);

      if (error.response) {
        setError(
          error.response.data.mensaje || "No se pudo deshabilitar la cancha.",
        );
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  // ============================================================
  // FORMATEADORES
  // ============================================================

  const formatearTipo = (tipo) => {
    if (!tipo) {
      return "";
    }

    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  };

  const formatearEstado = (estado) => {
    if (!estado) {
      return "";
    }

    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  };

  const formatearValor = (valor) => {
    return Number(valor || 0).toLocaleString("es-CL");
  };

  // ============================================================
  // FILTRO
  // ============================================================

  const canchasFiltradas =
    filtroTipo === "todas"
      ? canchas
      : canchas.filter((cancha) => cancha.tipo?.toLowerCase() === filtroTipo);

  const nombreFiltro = () => {
    if (filtroTipo === "futbol") {
      return "Fútbol";
    }

    if (filtroTipo === "tenis") {
      return "Tenis";
    }

    if (filtroTipo === "padel") {
      return "Pádel";
    }

    return "Todas las canchas";
  };

  // ============================================================
  // FORMULARIO CREAR / EDITAR
  // ============================================================

  if (modoFormulario === "crear" || modoFormulario === "editar") {
    return (
      <div className="disponibilidad">
        <section className="confirmacion">
          <div className="confirmacion-card">
            <p className="seccion-etiqueta">
              {modoFormulario === "crear" ? "Nueva cancha" : "Editar cancha"}
            </p>

            <h1>
              {modoFormulario === "crear" ? "Crear cancha" : "Modificar cancha"}
            </h1>

            <p className="confirmacion-descripcion">
              {modoFormulario === "crear"
                ? "Ingresa los datos de la nueva cancha."
                : "Modifica los datos de la cancha seleccionada."}
            </p>

            <form onSubmit={guardarCancha}>
              {/* NOMBRE */}

              <div className="campo">
                <label htmlFor="nombre">Nombre</label>

                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Cancha Fútbol 2"
                  maxLength={100}
                />
              </div>

              {/* TIPO */}

              {modoFormulario === "crear" && (
                <div className="campo">
                  <label htmlFor="tipo">Tipo</label>

                  <select
                    id="tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    <option value="futbol">Fútbol</option>

                    <option value="tenis">Tenis</option>

                    <option value="padel">Pádel</option>
                  </select>
                </div>
              )}

              {/* VALOR */}

              <div className="campo">
                <label htmlFor="valorHora">Valor por hora</label>

                <input
                  id="valorHora"
                  type="number"
                  min="1"
                  step="1"
                  value={valorHora}
                  onChange={(e) => setValorHora(e.target.value)}
                  placeholder="Ej: 15000"
                />
              </div>

              {/* DESCRIPCIÓN */}

              <div className="campo">
                <label htmlFor="descripcion">Descripción</label>

                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción de la cancha"
                  maxLength={500}
                  rows={4}
                />
              </div>

              {/* MOTIVO MODIFICACIÓN */}

              {modoFormulario === "editar" && (
                <div className="campo">
                  <label htmlFor="motivo">Motivo de modificación</label>

                  <input
                    id="motivo"
                    type="text"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Indica el motivo del cambio"
                  />
                </div>
              )}

              {error && <div className="mensaje-disponibilidad">{error}</div>}

              <div className="confirmacion-acciones">
                <button
                  type="button"
                  className="boton-volver"
                  onClick={cerrarFormulario}
                >
                  Volver
                </button>

                <button type="submit" className="boton-confirmar">
                  {modoFormulario === "crear"
                    ? "Crear cancha"
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    );
  }

  // ============================================================
  // FORMULARIO DESHABILITAR
  // ============================================================

  if (modoFormulario === "deshabilitar" && canchaSeleccionada) {
    return (
      <div className="disponibilidad">
        <section className="confirmacion">
          <div className="confirmacion-card">
            <p className="seccion-etiqueta">Deshabilitar cancha</p>

            <h1>Deshabilitar {canchaSeleccionada.nombre}</h1>

            <p className="confirmacion-descripcion">
              Esta acción cambiará el estado de la cancha. Debes ingresar el
              motivo de la deshabilitación.
            </p>

            <div className="confirmacion-datos">
              <div>
                <span>Cancha</span>

                <strong>{canchaSeleccionada.nombre}</strong>
              </div>

              <div>
                <span>Tipo</span>

                <strong>{formatearTipo(canchaSeleccionada.tipo)}</strong>
              </div>

              <div>
                <span>Valor por hora</span>

                <strong>
                  ${formatearValor(canchaSeleccionada.valor_hora)}
                </strong>
              </div>

              <div>
                <span>Estado actual</span>

                <strong>
                  {formatearEstado(canchaSeleccionada.estado_cancha)}
                </strong>
              </div>
            </div>

            <form onSubmit={deshabilitarCancha}>
              <div className="campo">
                <label htmlFor="motivoDeshabilitar">Motivo</label>

                <input
                  id="motivoDeshabilitar"
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: Mantención de la cancha"
                />
              </div>

              {error && <div className="mensaje-disponibilidad">{error}</div>}

              <div className="confirmacion-acciones">
                <button
                  type="button"
                  className="boton-volver"
                  onClick={cerrarFormulario}
                >
                  Volver
                </button>

                <button type="submit" className="boton-deshabilitar">
                  Confirmar deshabilitación
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    );
  }

  // ============================================================
  // LISTADO PRINCIPAL
  // ============================================================

  return (
    <div className="disponibilidad">
      <section className="disponibilidad-encabezado">
        <p className="seccion-etiqueta">Administración</p>

        <div className="encabezado-canchas-admin">
          <div>
            <h1>Gestión de canchas</h1>

            <p>Administra las canchas disponibles en Vida Sana.</p>
          </div>

          <button className="boton-confirmar" onClick={abrirCrear}>
            + Nueva cancha
          </button>
        </div>
      </section>

      {/* MENSAJE DE ÉXITO */}

      {mensaje && (
        <div className="reserva-exito">
          <div className="exito-icono">✓</div>

          <div>
            <h2>Operación realizada</h2>

            <p>{mensaje}</p>
          </div>
        </div>
      )}

      {/* ERROR */}

      {error && <div className="mensaje-disponibilidad">{error}</div>}

      {/* FILTROS */}

      <section className="resultados-disponibilidad">
        <div className="resultados-titulo">
          <div>
            <p className="seccion-etiqueta">Filtrar canchas</p>

            <h2>{nombreFiltro()}</h2>
          </div>

          <span className="fecha-resultados">
            {canchasFiltradas.length}{" "}
            {canchasFiltradas.length === 1 ? "cancha" : "canchas"}
          </span>
        </div>

        <div className="filtros-canchas">
          <button
            className={
              filtroTipo === "todas" ? "filtro-cancha activo" : "filtro-cancha"
            }
            onClick={() => setFiltroTipo("todas")}
          >
            Todas
          </button>

          <button
            className={
              filtroTipo === "futbol" ? "filtro-cancha activo" : "filtro-cancha"
            }
            onClick={() => setFiltroTipo("futbol")}
          >
            ⚽ Fútbol
          </button>

          <button
            className={
              filtroTipo === "tenis" ? "filtro-cancha activo" : "filtro-cancha"
            }
            onClick={() => setFiltroTipo("tenis")}
          >
            🎾 Tenis
          </button>

          <button
            className={
              filtroTipo === "padel" ? "filtro-cancha activo" : "filtro-cancha"
            }
            onClick={() => setFiltroTipo("padel")}
          >
            🏓 Pádel
          </button>
        </div>
      </section>

      {/* LISTADO */}

      {cargando ? (
        <div className="busqueda-card">
          <p>Cargando canchas...</p>
        </div>
      ) : canchasFiltradas.length === 0 ? (
        <div className="busqueda-card">
          <h2>No hay canchas</h2>

          <p>No existen canchas registradas para este tipo.</p>
        </div>
      ) : (
        <section className="resultados-disponibilidad">
          <div className="canchas-lista">
            {canchasFiltradas.map((cancha) => (
              <div className="cancha-card" key={cancha.id_cancha}>
                {/* INFORMACIÓN PRINCIPAL */}

                <div className="cancha-info">
                  <div>
                    <h3>{cancha.nombre}</h3>

                    <p>{formatearTipo(cancha.tipo)}</p>
                  </div>

                  <strong>${formatearValor(cancha.valor_hora)} / hora</strong>
                </div>

                {/* DATOS */}

                <div className="cancha-datos-admin">
                  <div>
                    <span>Estado</span>

                    <strong>{formatearEstado(cancha.estado_cancha)}</strong>
                  </div>

                  <div>
                    <span>Descripción</span>

                    <strong>{cancha.descripcion || "Sin descripción"}</strong>
                  </div>
                </div>

                {/* ACCIONES */}

                <div className="acciones-cancha">
                  <button
                    className="boton-volver"
                    onClick={() => abrirEditar(cancha)}
                  >
                    Editar
                  </button>

                  {cancha.estado_cancha?.toLowerCase() === "activa" && (
                    <button
                      className="boton-deshabilitar"
                      onClick={() => abrirDeshabilitar(cancha)}
                    >
                      Deshabilitar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default GestionCanchas;
