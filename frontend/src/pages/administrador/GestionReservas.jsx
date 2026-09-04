import { useEffect, useState } from "react";
import api from "../../services/api";

function GestionReservas() {
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  const [filtroEstado, setFiltroEstado] = useState("ACTIVA");
  const [busquedaRut, setBusquedaRut] = useState("");

  const [confirmando, setConfirmando] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [accionSeleccionada, setAccionSeleccionada] = useState(null);
  const [mensajeEsExito, setMensajeEsExito] = useState(false);

  const cargarReservas = async (limpiarMensaje = true) => {
    try {
      setCargando(true);
      if (limpiarMensaje) {
        setMensaje("");
        setMensajeEsExito(false);
      }

      const respuesta = await api.get("/reservas/");

      setReservas(respuesta.data);
    } catch (error) {
      console.error("Error al cargar reservas:", error);

      if (error.response) {
        setMensaje(
          error.response.data.mensaje || "No se pudieron cargar las reservas.",
        );
      } else {
        setMensaje("No se pudo conectar con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const abrirConfirmacion = (reserva, accion) => {
    setReservaSeleccionada(reserva);
    setAccionSeleccionada(accion);
    setConfirmando(true);
    setMensaje("");
    setMensajeEsExito(false);
  };

  const cancelarConfirmacion = () => {
    setReservaSeleccionada(null);
    setAccionSeleccionada(null);
    setConfirmando(false);
    setMensaje("");
    setMensajeEsExito(false);
  };

  const confirmarAccion = async () => {
    if (!reservaSeleccionada || !accionSeleccionada) {
      return;
    }

    const esInasistencia = accionSeleccionada === "inasistencia";
    const endpoint = esInasistencia ? "inasistencia" : "utilizar";
    const accion = esInasistencia ? "inasistencia" : "utilizada";

    try {
      setMensaje("");
      setMensajeEsExito(false);

      const respuesta = await api.post(
        `/reservas/${reservaSeleccionada.id_reserva}/${endpoint}/`,
      );

      if (respuesta.data.estado) {
        setConfirmando(false);
        setReservaSeleccionada(null);
        setAccionSeleccionada(null);

        await cargarReservas(false);
        setMensaje(respuesta.data.mensaje || `Reserva marcada como ${accion}.`);
        setMensajeEsExito(true);
      } else {
        setMensaje(
          respuesta.data.mensaje ||
            `No se pudo marcar la reserva como ${accion}.`,
        );
      }
    } catch (error) {
      console.error(`Error al marcar reserva como ${accion}:`, error);

      if (error.response) {
        setMensaje(
          error.response.data.mensaje ||
            `No se pudo marcar la reserva como ${accion}.`,
        );
      } else {
        setMensaje("No se pudo conectar con el servidor.");
      }
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "";
    }

    const fechaTexto = String(fecha);

    if (fechaTexto.includes("T")) {
      return fechaTexto.split("T")[0].split("-").reverse().join("/");
    }

    if (fechaTexto.includes("-")) {
      return fechaTexto.split("-").reverse().join("/");
    }

    return fechaTexto;
  };

  const formatearEstado = (estado) => {
    if (!estado) {
      return "";
    }

    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  };

  const reservaActiva = (estado) => {
    return estado?.toUpperCase() === "ACTIVA";
  };

  const contarPorEstado = (estado) => {
    return reservas.filter(
      (reserva) => reserva.estado_reserva?.toUpperCase() === estado,
    ).length;
  };

  const reservasFiltradas = reservas.filter((reserva) => {
    const estado = reserva.estado_reserva?.toUpperCase() || "";

    const coincideEstado = filtroEstado === "TODAS" || estado === filtroEstado;

    const rut = String(reserva.rut_usuario || "").toLowerCase();

    const busqueda = busquedaRut.trim().toLowerCase();

    const coincideRut = busqueda === "" || rut.includes(busqueda);

    return coincideEstado && coincideRut;
  });

  /*
   * Pantalla de confirmación
   */
  if (confirmando && reservaSeleccionada) {
    const esInasistencia = accionSeleccionada === "inasistencia";
    const accion = esInasistencia ? "inasistencia" : "utilizada";

    return (
      <div className="disponibilidad">
        <section className="confirmacion">
          <div className="confirmacion-card">
            <p className="seccion-etiqueta">Confirmación</p>

            <h1>Marcar reserva como {accion}</h1>

            <p className="confirmacion-descripcion">
              Revisa los datos antes de confirmar que esta reserva fue marcada
              como {accion}.
            </p>

            <div className="confirmacion-datos">
              <div>
                <span>Cliente</span>
                <strong>{reservaSeleccionada.rut_usuario}</strong>
              </div>

              <div>
                <span>Cancha</span>
                <strong>{reservaSeleccionada.nombre_cancha}</strong>
              </div>

              <div>
                <span>Tipo</span>
                <strong>{reservaSeleccionada.tipo_cancha}</strong>
              </div>

              <div>
                <span>Fecha</span>
                <strong>
                  {formatearFecha(reservaSeleccionada.fecha_reserva)}
                </strong>
              </div>

              <div>
                <span>Horario</span>
                <strong>
                  {reservaSeleccionada.hora_inicio} -{" "}
                  {reservaSeleccionada.hora_fin}
                </strong>
              </div>

              <div>
                <span>Valor total</span>
                <strong>
                  $
                  {Number(reservaSeleccionada.valor_total).toLocaleString(
                    "es-CL",
                  )}
                </strong>
              </div>
            </div>

            <div className="confirmacion-total">
              <span>Estado actual</span>

              <strong>
                {formatearEstado(reservaSeleccionada.estado_reserva)}
              </strong>
            </div>

            {mensaje && (
              <div
                className={
                  mensajeEsExito
                    ? "mensaje-disponibilidad mensaje-exito"
                    : "mensaje-disponibilidad"
                }
              >
                {mensaje}
              </div>
            )}

            <div className="confirmacion-acciones">
              <button className="boton-volver" onClick={cancelarConfirmacion}>
                Volver
              </button>

              <button
                className={
                  esInasistencia
                    ? "boton-confirmar boton-inasistencia"
                    : "boton-confirmar"
                }
                onClick={confirmarAccion}
              >
                Confirmar {accion}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /*
   * Listado de reservas
   */
  return (
    <div className="disponibilidad">
      <section className="disponibilidad-encabezado">
        <p className="seccion-etiqueta">Administración</p>

        <h1>Gestión de reservas</h1>

        <p>Consulta y gestiona las reservas realizadas por los clientes.</p>
      </section>

      {mensaje && <div className="mensaje-disponibilidad">{mensaje}</div>}

      <section className="busqueda-card">
        <h2>Filtrar reservas</h2>

        <div className="filtros-reservas">
          <button
            className={
              filtroEstado === "ACTIVA"
                ? "filtro-reserva filtro-activo"
                : "filtro-reserva"
            }
            onClick={() => setFiltroEstado("ACTIVA")}
          >
            <span>Activas</span>
            <strong>{contarPorEstado("ACTIVA")}</strong>
          </button>

          <button
            className={
              filtroEstado === "UTILIZADA"
                ? "filtro-reserva filtro-activo"
                : "filtro-reserva"
            }
            onClick={() => setFiltroEstado("UTILIZADA")}
          >
            <span>Utilizadas</span>
            <strong>{contarPorEstado("UTILIZADA")}</strong>
          </button>

          <button
            className={
              filtroEstado === "CANCELADA"
                ? "filtro-reserva filtro-activo"
                : "filtro-reserva"
            }
            onClick={() => setFiltroEstado("CANCELADA")}
          >
            <span>Canceladas</span>
            <strong>{contarPorEstado("CANCELADA")}</strong>
          </button>

          <button
            className={
              filtroEstado === "INASISTENCIA"
                ? "filtro-reserva filtro-activo"
                : "filtro-reserva"
            }
            onClick={() => setFiltroEstado("INASISTENCIA")}
          >
            <span>Inasistencias</span>
            <strong>{contarPorEstado("INASISTENCIA")}</strong>
          </button>

          <button
            className={
              filtroEstado === "TODAS"
                ? "filtro-reserva filtro-activo"
                : "filtro-reserva"
            }
            onClick={() => setFiltroEstado("TODAS")}
          >
            <span>Todas</span>
            <strong>{reservas.length}</strong>
          </button>
        </div>

        <div className="busqueda-rut">
          <label htmlFor="buscar-rut">Buscar por RUT</label>

          <input
            id="buscar-rut"
            type="text"
            placeholder="Ej: 55.555.555-5"
            value={busquedaRut}
            onChange={(e) => setBusquedaRut(e.target.value)}
          />
        </div>
      </section>

      {cargando ? (
        <div className="busqueda-card">
          <p>Cargando reservas...</p>
        </div>
      ) : reservasFiltradas.length === 0 ? (
        <div className="busqueda-card">
          <h2>No hay reservas</h2>

          <p>
            No existen reservas que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <section className="resultados-disponibilidad">
          <div className="resultados-titulo">
            <div>
              <p className="seccion-etiqueta">Listado</p>

              <h2>
                {filtroEstado === "ACTIVA"
                  ? "Reservas activas"
                  : filtroEstado === "UTILIZADA"
                    ? "Reservas utilizadas"
                    : filtroEstado === "CANCELADA"
                      ? "Reservas canceladas"
                      : filtroEstado === "INASISTENCIA"
                        ? "Reservas con inasistencia"
                      : "Todas las reservas"}
              </h2>
            </div>

            <span className="fecha-resultados">
              {reservasFiltradas.length}{" "}
              {reservasFiltradas.length === 1 ? "reserva" : "reservas"}
            </span>
          </div>

          <div className="canchas-lista">
            {reservasFiltradas.map((reserva) => (
              <div className="cancha-card" key={reserva.id_reserva}>
                <div className="cancha-info">
                  <div>
                    <h3>Reserva #{reserva.id_reserva}</h3>

                    <p>
                      {reserva.nombre_cancha} · {reserva.tipo_cancha}
                    </p>
                  </div>
                </div>

                <div className="confirmacion-datos">
                  <div>
                    <span>Cliente</span>
                    <strong>{reserva.rut_usuario}</strong>
                  </div>

                  <div>
                    <span>Fecha</span>
                    <strong>{formatearFecha(reserva.fecha_reserva)}</strong>
                  </div>

                  <div>
                    <span>Horario</span>
                    <strong>
                      {reserva.hora_inicio} - {reserva.hora_fin}
                    </strong>
                  </div>

                  <div>
                    <span>Valor total</span>
                    <strong>
                      ${Number(reserva.valor_total).toLocaleString("es-CL")}
                    </strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong
                      className={`estado-reserva estado-${reserva.estado_reserva?.toLowerCase()}`}
                    >
                      {formatearEstado(reserva.estado_reserva)}
                    </strong>
                  </div>

                  <div>
                    <span>Cancha</span>
                    <strong>{reserva.nombre_cancha}</strong>
                  </div>
                </div>

                {reservaActiva(reserva.estado_reserva) && (
                  <div className="confirmacion-acciones">
                    <button
                      className="boton-confirmar"
                      onClick={() => abrirConfirmacion(reserva, "utilizar")}
                    >
                      ✓ Marcar como utilizada
                    </button>

                    <button
                      className="boton-confirmar boton-inasistencia"
                      onClick={() => abrirConfirmacion(reserva, "inasistencia")}
                    >
                      ✕ Marcar inasistencia
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default GestionReservas;
