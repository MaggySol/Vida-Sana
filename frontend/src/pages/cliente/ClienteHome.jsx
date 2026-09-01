import { useNavigate } from "react-router-dom";

function ClienteHome() {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  return (
    <div className="cliente-home">
      <section className="cliente-bienvenida">
        <div>
          <p className="cliente-etiqueta">Portal del cliente</p>

          <h1>Bienvenido, {usuario?.nombre || "cliente"}</h1>

          <p>
            Gestiona tus reservas y consulta la disponibilidad de nuestras
            canchas.
          </p>
        </div>
      </section>

      <section className="cliente-opciones">
        <div className="opcion-card">
          <div className="opcion-icono">📅</div>

          <h2>Reservar una cancha</h2>

          <p>
            Consulta los horarios disponibles para la cancha que quieres
            reservar.
          </p>

          <button onClick={() => navigate("/cliente/disponibilidad")}>
            Ver disponibilidad
          </button>
        </div>

        <div className="opcion-card">
          <div className="opcion-icono">📋</div>

          <h2>Mis reservas</h2>

          <p>
            Consulta tus reservas actuales y el historial de reservas
            realizadas.
          </p>

          <button onClick={() => navigate("/cliente/reservas")}>
            Mis reservas
          </button>
        </div>
      </section>
    </div>
  );
}

export default ClienteHome;
