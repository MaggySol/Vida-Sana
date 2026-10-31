import { useState } from "react";
import api from "../../services/api";

function DisponibilidadAdministrador() {
  const [tipoCancha, setTipoCancha] = useState("");
  const [fecha, setFecha] = useState("");
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const seleccionarTipo = (tipo) => {
    setTipoCancha(tipo);
    setFecha("");
    setDisponibilidad([]);
    setMensaje("");
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
      setDisponibilidad([]);

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

  return (
    <div className="disponibilidad">
      <section className="disponibilidad-encabezado">
        <p className="seccion-etiqueta">Administración</p>

        <h1>Disponibilidad de canchas</h1>

        <p>
          Consulta las canchas y horarios disponibles para una fecha
          determinada.
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
              <label htmlFor="fecha-administrador">Fecha</label>

              <input
                id="fecha-administrador"
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
                      {Number(cancha.valor_hora).toLocaleString("es-CL")} / hora
                    </p>
                  </div>
                </div>

                <div className="horarios">
                  <p className="horarios-titulo">Horarios disponibles</p>

                  <div className="horarios-grid">
                    {bloques.map((bloque, index) => (
                      <div className="horario-boton" key={index}>
                        <span>{bloque.inicio_bloque}</span>

                        <small>a {bloque.fin_bloque}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default DisponibilidadAdministrador;
