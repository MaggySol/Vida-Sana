import { useState } from "react";
import api from "../../services/api";

function Disponibilidad() {
  const [tipoCancha, setTipoCancha] = useState("");
  const [fecha, setFecha] = useState("");
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [seleccion, setSeleccion] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [reservaRealizada, setReservaRealizada] = useState(false);

  const seleccionarTipo = (tipo) => {
    setTipoCancha(tipo);
    setFecha("");
    setDisponibilidad([]);
    setSeleccion([]);
    setMensaje("");
    setConfirmando(false);
    setReservaRealizada(false);
  };

  const buscarDisponibilidad = async () => {
    if (!tipoCancha) {
      setMensaje("Debes seleccionar un tipo de cancha.");
      return;
    }

    if (!fecha) {
      setMensaje("Debes seleccionar una fecha.");
      return;
    }

    try {
      setMensaje("");
      setSeleccion([]);
      setReservaRealizada(false);

      const partes = fecha.split("-");
      const fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`;

      const respuesta = await api.get("/disponibilidad/", {
        params: {
          fecha: fechaFormateada,
          tipo: tipoCancha,
        },
      });

      setDisponibilidad(respuesta.data);

      if (respuesta.data.length === 0) {
        setMensaje(
          `No hay disponibilidad de ${tipoCancha} para la fecha seleccionada.`,
        );
      }
    } catch (error) {
      console.error("Error al consultar disponibilidad:", error);

      if (error.response) {
        setMensaje(
          error.response.data.mensaje ||
            "No se pudo consultar la disponibilidad.",
        );
      } else {
        setMensaje("No se pudo conectar con el servidor.");
      }
    }
  };

  const convertirHoraAMinutos = (hora) => {
    const [horas, minutos] = hora.split(":").map(Number);
    return horas * 60 + minutos;
  };

  const seleccionarBloque = (bloque) => {
    setMensaje("");
    setReservaRealizada(false);

    if (seleccion.length === 0) {
      setSeleccion([bloque]);
      return;
    }

    if (bloque.id_cancha !== seleccion[0].id_cancha) {
      setMensaje("Debes seleccionar los horarios de una misma cancha.");
      return;
    }

    const primeraHora = seleccion[0].inicio_bloque;
    const ultimaHora = seleccion[seleccion.length - 1].fin_bloque;

    const yaSeleccionado = seleccion.some(
      (item) =>
        item.inicio_bloque === bloque.inicio_bloque &&
        item.fin_bloque === bloque.fin_bloque,
    );

    if (yaSeleccionado) {
      setSeleccion([bloque]);
      return;
    }

    if (bloque.fin_bloque === primeraHora) {
      setSeleccion([bloque, ...seleccion]);
      return;
    }

    if (bloque.inicio_bloque === ultimaHora) {
      setSeleccion([...seleccion, bloque]);
      return;
    }

    const bloquesCancha = disponibilidad.filter(
      (item) => item.id_cancha === seleccion[0].id_cancha,
    );

    const inicio = Math.min(
      convertirHoraAMinutos(bloque.inicio_bloque),
      convertirHoraAMinutos(primeraHora),
    );

    const fin = Math.max(
      convertirHoraAMinutos(bloque.fin_bloque),
      convertirHoraAMinutos(ultimaHora),
    );

    const rango = bloquesCancha
      .filter((item) => {
        const inicioBloque = convertirHoraAMinutos(item.inicio_bloque);
        const finBloque = convertirHoraAMinutos(item.fin_bloque);

        return inicioBloque >= inicio && finBloque <= fin;
      })
      .sort(
        (a, b) =>
          convertirHoraAMinutos(a.inicio_bloque) -
          convertirHoraAMinutos(b.inicio_bloque),
      );

    for (let i = 1; i < rango.length; i++) {
      if (rango[i - 1].fin_bloque !== rango[i].inicio_bloque) {
        setMensaje(
          "No puedes seleccionar un rango que contenga horarios no disponibles.",
        );
        return;
      }
    }

    setSeleccion(rango);
  };

  const bloqueEstaSeleccionado = (bloque) => {
    return seleccion.some(
      (item) =>
        item.id_cancha === bloque.id_cancha &&
        item.inicio_bloque === bloque.inicio_bloque &&
        item.fin_bloque === bloque.fin_bloque,
    );
  };

  const obtenerHoraInicio = () => {
    if (seleccion.length === 0) {
      return null;
    }

    return seleccion[0].inicio_bloque;
  };

  const obtenerHoraFin = () => {
    if (seleccion.length === 0) {
      return null;
    }

    return seleccion[seleccion.length - 1].fin_bloque;
  };

  const obtenerCantidadHoras = () => {
    return seleccion.length;
  };

  const obtenerValorTotal = () => {
    if (seleccion.length === 0) {
      return 0;
    }

    return seleccion.length * Number(seleccion[0].valor_hora);
  };

  const continuarReserva = () => {
    if (seleccion.length === 0) {
      setMensaje("Debes seleccionar un horario.");
      return;
    }

    setConfirmando(true);
    setMensaje("");
  };

  const cancelarConfirmacion = () => {
    setConfirmando(false);
  };

  const confirmarReserva = async () => {
    if (seleccion.length === 0) {
      return;
    }

    try {
      setMensaje("");

      const partes = fecha.split("-");
      const fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`;

      const respuesta = await api.post("/reservas/crear/", {
        id_cancha: seleccion[0].id_cancha,
        fecha: fechaFormateada,
        hora_inicio: obtenerHoraInicio(),
        hora_fin: obtenerHoraFin(),
      });

      if (respuesta.data.estado) {
        const mensajeExito = respuesta.data.mensaje;

        setConfirmando(false);
        setSeleccion([]);
        setReservaRealizada(true);
        setMensaje(mensajeExito);

        try {
          const disponibilidadActualizada = await api.get("/disponibilidad/", {
            params: {
              fecha: fechaFormateada,
              tipo: tipoCancha,
            },
          });

          setDisponibilidad(disponibilidadActualizada.data);
        } catch (error) {
          console.error("Error actualizando disponibilidad:", error);
        }
      } else {
        setMensaje(respuesta.data.mensaje || "No se pudo realizar la reserva.");

        setConfirmando(false);
      }
    } catch (error) {
      console.error("Error al crear reserva:", error);

      if (error.response) {
        setMensaje(
          error.response.data.mensaje || "No se pudo realizar la reserva.",
        );
      } else {
        setMensaje("No se pudo conectar con el servidor.");
      }

      setConfirmando(false);
    }
  };

  return (
    <div className="disponibilidad">
      {!confirmando ? (
        <>
          <section className="disponibilidad-encabezado">
            <p className="seccion-etiqueta">Reservas</p>

            <h1>Disponibilidad de canchas</h1>

            <p>
              Selecciona el tipo de cancha y la fecha para consultar los
              horarios disponibles.
            </p>
          </section>

          <section className="busqueda-card">
            <h2>Buscar disponibilidad</h2>

            <div className="tipos-cancha">
              <button
                className={tipoCancha === "futbol" ? "tipo-activo" : ""}
                onClick={() => seleccionarTipo("futbol")}
              >
                <span>⚽</span>
                Fútbol
              </button>

              <button
                className={tipoCancha === "tenis" ? "tipo-activo" : ""}
                onClick={() => seleccionarTipo("tenis")}
              >
                <span>🎾</span>
                Tenis
              </button>

              <button
                className={tipoCancha === "padel" ? "tipo-activo" : ""}
                onClick={() => seleccionarTipo("padel")}
              >
                <span>🏓</span>
                Pádel
              </button>
            </div>

            {tipoCancha && (
              <div className="busqueda-fecha">
                <div className="campo-disponibilidad">
                  <label htmlFor="fecha">Fecha</label>

                  <input
                    id="fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>

                <button className="boton-buscar" onClick={buscarDisponibilidad}>
                  Buscar disponibilidad
                </button>
              </div>
            )}
          </section>

          {reservaRealizada && (
            <div className="reserva-exito">
              <div className="exito-icono">✓</div>

              <div>
                <h2>Reserva realizada</h2>

                <p>Tu reserva fue registrada correctamente.</p>
              </div>
            </div>
          )}

          {mensaje && <div className="mensaje-disponibilidad">{mensaje}</div>}

          {disponibilidad.length > 0 && (
            <section className="resultados-disponibilidad">
              <div className="resultados-titulo">
                <div>
                  <p className="seccion-etiqueta">Horarios disponibles</p>

                  <h2>
                    {tipoCancha.charAt(0).toUpperCase() + tipoCancha.slice(1)}
                  </h2>
                </div>

                <span className="fecha-resultados">
                  {fecha.split("-").reverse().join("/")}
                </span>
              </div>

              <div className="canchas-lista">
                {Object.values(
                  disponibilidad.reduce((grupos, bloque) => {
                    if (!grupos[bloque.id_cancha]) {
                      grupos[bloque.id_cancha] = {
                        cancha: bloque,
                        bloques: [],
                      };
                    }

                    grupos[bloque.id_cancha].bloques.push(bloque);

                    return grupos;
                  }, {}),
                ).map(({ cancha, bloques }) => (
                  <div className="cancha-card" key={cancha.id_cancha}>
                    <div className="cancha-info">
                      <div>
                        <h3>{cancha.nombre}</h3>

                        <p>
                          {cancha.tipo} · $
                          {Number(cancha.valor_hora).toLocaleString("es-CL")} /
                          hora
                        </p>
                      </div>
                    </div>

                    <div className="horarios">
                      <p className="horarios-titulo">
                        Selecciona uno o más horarios consecutivos
                      </p>

                      <div className="horarios-grid">
                        {bloques.map((bloque, index) => {
                          const seleccionado = bloqueEstaSeleccionado(bloque);

                          return (
                            <button
                              key={index}
                              className={
                                seleccionado
                                  ? "horario-boton horario-seleccionado"
                                  : "horario-boton"
                              }
                              onClick={() => seleccionarBloque(bloque)}
                            >
                              <span>{bloque.inicio_bloque}</span>

                              <small>a {bloque.fin_bloque}</small>

                              {seleccionado && <strong>✓</strong>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {seleccion.length > 0 && (
            <section className="reserva-resumen">
              <div>
                <p className="seccion-etiqueta">Tu selección</p>

                <h2>Resumen de reserva</h2>

                <p>
                  <strong>Cancha:</strong> {seleccion[0].nombre}
                </p>

                <p>
                  <strong>Fecha:</strong> {fecha.split("-").reverse().join("/")}
                </p>

                <p>
                  <strong>Horario:</strong> {obtenerHoraInicio()} -{" "}
                  {obtenerHoraFin()}
                </p>

                <p>
                  <strong>Duración:</strong> {obtenerCantidadHoras()}{" "}
                  {obtenerCantidadHoras() === 1 ? "hora" : "horas"}
                </p>
              </div>

              <div className="reserva-total">
                <span>Total</span>

                <strong>${obtenerValorTotal().toLocaleString("es-CL")}</strong>

                <button onClick={continuarReserva} className="boton-continuar">
                  Continuar
                </button>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="confirmacion">
          <div className="confirmacion-card">
            <p className="seccion-etiqueta">Confirmación</p>

            <h1>Confirmar reserva</h1>

            <p className="confirmacion-descripcion">
              Revisa los datos antes de confirmar tu reserva.
            </p>

            <div className="confirmacion-datos">
              <div>
                <span>Cancha</span>
                <strong>{seleccion[0].nombre}</strong>
              </div>

              <div>
                <span>Tipo</span>
                <strong>{seleccion[0].tipo}</strong>
              </div>

              <div>
                <span>Fecha</span>
                <strong>{fecha.split("-").reverse().join("/")}</strong>
              </div>

              <div>
                <span>Horario</span>
                <strong>
                  {obtenerHoraInicio()} - {obtenerHoraFin()}
                </strong>
              </div>

              <div>
                <span>Duración</span>
                <strong>
                  {obtenerCantidadHoras()}{" "}
                  {obtenerCantidadHoras() === 1 ? "hora" : "horas"}
                </strong>
              </div>
            </div>

            <div className="confirmacion-total">
              <span>Total a pagar</span>

              <strong>${obtenerValorTotal().toLocaleString("es-CL")}</strong>
            </div>

            {mensaje && <div className="mensaje-disponibilidad">{mensaje}</div>}

            <div className="confirmacion-acciones">
              <button className="boton-volver" onClick={cancelarConfirmacion}>
                Volver
              </button>

              <button className="boton-confirmar" onClick={confirmarReserva}>
                Confirmar reserva
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Disponibilidad;
