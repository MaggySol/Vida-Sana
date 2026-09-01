import { useEffect, useState } from "react";
import api from "../../services/api";

function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [cancelacionRealizada, setCancelacionRealizada] = useState(false);

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setCargando(true);
      setMensaje("");

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

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "";
    }

    const fechaObjeto = new Date(fecha);

    if (Number.isNaN(fechaObjeto.getTime())) {
      return fecha;
    }

    return fechaObjeto.toLocaleDateString("es-CL");
  };

  const formatearHora = (hora) => {
    if (!hora) {
      return "";
    }

    return String(hora).substring(0, 5);
  };

  const formatearValor = (valor) => {
    return Number(valor || 0).toLocaleString("es-CL");
  };

  const obtenerEstadoClase = (estado) => {
    if (!estado) {
      return "estado-reserva";
    }

    const estadoNormalizado = estado.toLowerCase();

    if (estadoNormalizado === "activa") {
      return "estado-reserva estado-activa";
    }

    if (estadoNormalizado === "cancelada") {
      return "estado-reserva estado-cancelada";
    }

    return "estado-reserva";
  };

  const iniciarCancelacion = (reserva) => {
    setReservaSeleccionada(reserva);
    setMotivo("");
    setMensaje("");
    setCancelacionRealizada(false);
    setConfirmando(true);
  };

  const cancelarConfirmacion = () => {
    setConfirmando(false);
    setReservaSeleccionada(null);
    setMotivo("");
    setMensaje("");
  };

  const confirmarCancelacion = async () => {
    if (!reservaSeleccionada) {
      return;
    }

    if (!motivo.trim()) {
      setMensaje("Debes ingresar un motivo de cancelación.");
      return;
    }

    try {
      setCancelando(true);
      setMensaje("");

      const respuesta = await api.post(
        `/reservas/${reservaSeleccionada.id_reserva}/cancelar/`,
        {
          motivo: motivo.trim(),
        },
      );

      if (respuesta.data.estado) {
        setConfirmando(false);
        setReservaSeleccionada(null);
        setMotivo("");
        setCancelacionRealizada(true);
        setMensaje(
          respuesta.data.mensaje || "Reserva cancelada correctamente.",
        );

        await cargarReservas();
      } else {
        setMensaje(respuesta.data.mensaje || "No se pudo cancelar la reserva.");
      }
    } catch (error) {
      console.error("Error al cancelar reserva:", error);

      if (error.response) {
        setMensaje(
          error.response.data.mensaje || "No se pudo cancelar la reserva.",
        );
      } else {
        setMensaje("No se pudo conectar con el servidor.");
      }
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="mis-reservas">
      {!confirmando ? (
        <>
          <section className="mis-reservas-encabezado">
            <p className="seccion-etiqueta">Reservas</p>

            <h1>Mis reservas</h1>

            <p>Consulta y administra las reservas que has realizado.</p>
          </section>

          {cancelacionRealizada && (
            <div className="cancelacion-exito">
              <div className="exito-icono">✓</div>

              <div>
                <h2>Reserva cancelada</h2>

                <p>{mensaje || "La reserva fue cancelada correctamente."}</p>
              </div>
            </div>
          )}

          {!cancelacionRealizada && mensaje && (
            <div className="mensaje-reservas">{mensaje}</div>
          )}

          {cargando ? (
            <div className="reservas-vacio">
              <p>Cargando tus reservas...</p>
            </div>
          ) : reservas.length === 0 ? (
            <div className="reservas-vacio">
              <div className="reservas-vacio-icono">📅</div>

              <h2>No tienes reservas</h2>

              <p>Cuando realices una reserva, aparecerá aquí.</p>
            </div>
          ) : (
            <>
              <section className="reservas-resumen">
                <div>
                  <p className="seccion-etiqueta">Resumen</p>

                  <h2>Mis reservas</h2>

                  <p>
                    Tienes <strong>{reservas.length}</strong>{" "}
                    {reservas.length === 1
                      ? "reserva registrada."
                      : "reservas registradas."}
                  </p>
                </div>

                <div className="reservas-contador">
                  <strong>{reservas.length}</strong>
                  <span>{reservas.length === 1 ? "reserva" : "reservas"}</span>
                </div>
              </section>

              <section className="lista-mis-reservas">
                {reservas.map((reserva) => {
                  const estado = reserva.estado_reserva
                    ? reserva.estado_reserva.toLowerCase()
                    : "";

                  const puedeCancelar = estado === "activa";

                  return (
                    <article className="reserva-card" key={reserva.id_reserva}>
                      <div className="reserva-card-encabezado">
                        <div>
                          <p className="seccion-etiqueta">
                            Reserva #{reserva.id_reserva}
                          </p>

                          <h2>{reserva.nombre_cancha}</h2>
                        </div>

                        <span className={obtenerEstadoClase(estado)}>
                          {reserva.estado_reserva}
                        </span>
                      </div>

                      <div className="reserva-card-tipo">
                        {reserva.tipo_cancha}
                      </div>

                      <div className="reserva-datos">
                        <div>
                          <span>Fecha</span>

                          <strong>
                            {formatearFecha(reserva.fecha_reserva)}
                          </strong>
                        </div>

                        <div>
                          <span>Horario</span>

                          <strong>
                            {formatearHora(reserva.hora_inicio)} -{" "}
                            {formatearHora(reserva.hora_fin)}
                          </strong>
                        </div>

                        <div>
                          <span>Duración</span>

                          <strong>
                            {(() => {
                              const inicio = formatearHora(reserva.hora_inicio);
                              const fin = formatearHora(reserva.hora_fin);

                              if (!inicio || !fin) {
                                return "-";
                              }

                              const [horaInicio, minutoInicio] = inicio
                                .split(":")
                                .map(Number);

                              const [horaFin, minutoFin] = fin
                                .split(":")
                                .map(Number);

                              const minutosInicio =
                                horaInicio * 60 + minutoInicio;

                              const minutosFin = horaFin * 60 + minutoFin;

                              const horas = (minutosFin - minutosInicio) / 60;

                              return `${horas} ${
                                horas === 1 ? "hora" : "horas"
                              }`;
                            })()}
                          </strong>
                        </div>

                        <div>
                          <span>Valor total</span>

                          <strong>
                            ${formatearValor(reserva.valor_total)}
                          </strong>
                        </div>
                      </div>

                      {estado === "cancelada" && reserva.motivo_cancelacion && (
                        <div className="motivo-cancelacion">
                          <span>Motivo de cancelación</span>

                          <p>{reserva.motivo_cancelacion}</p>
                        </div>
                      )}

                      {puedeCancelar && (
                        <div className="reserva-card-acciones">
                          <button
                            className="boton-cancelar"
                            onClick={() => iniciarCancelacion(reserva)}
                          >
                            Cancelar reserva
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </section>
            </>
          )}
        </>
      ) : (
        <section className="confirmacion">
          <div className="confirmacion-card">
            <p className="seccion-etiqueta">Cancelación</p>

            <h1>Confirmar cancelación</h1>

            <p className="confirmacion-descripcion">
              Revisa los datos de la reserva e indica el motivo antes de
              cancelar.
            </p>

            {reservaSeleccionada && (
              <>
                <div className="confirmacion-datos">
                  <div>
                    <span>Reserva</span>

                    <strong>#{reservaSeleccionada.id_reserva}</strong>
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
                      {formatearHora(reservaSeleccionada.hora_inicio)} -{" "}
                      {formatearHora(reservaSeleccionada.hora_fin)}
                    </strong>
                  </div>

                  <div>
                    <span>Valor total</span>

                    <strong>
                      ${formatearValor(reservaSeleccionada.valor_total)}
                    </strong>
                  </div>
                </div>

                <div className="campo-motivo">
                  <label htmlFor="motivo">Motivo de cancelación</label>

                  <textarea
                    id="motivo"
                    value={motivo}
                    onChange={(e) => {
                      setMotivo(e.target.value);
                      setMensaje("");
                    }}
                    placeholder="Ingresa el motivo de la cancelación..."
                    rows="4"
                    disabled={cancelando}
                  />
                </div>

                {mensaje && (
                  <div className="mensaje-cancelacion">{mensaje}</div>
                )}

                <div className="confirmacion-acciones">
                  <button
                    className="boton-volver"
                    onClick={cancelarConfirmacion}
                    disabled={cancelando}
                  >
                    Volver
                  </button>

                  <button
                    className="boton-confirmar-cancelacion"
                    onClick={confirmarCancelacion}
                    disabled={cancelando}
                  >
                    {cancelando ? "Cancelando..." : "Confirmar cancelación"}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default MisReservas;
