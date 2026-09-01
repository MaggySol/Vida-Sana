import { useNavigate } from "react-router-dom";

function ColaboradorHome() {
  const navigate = useNavigate();

  return (
    <div className="cliente-home">
      {" "}
      <section className="cliente-bienvenida">
        {" "}
        <p className="cliente-etiqueta">Panel de colaborador</p>
        <h1>Bienvenido a Vida Sana</h1>
        <p>
          Desde aquí puedes consultar las reservas de los clientes y gestionar
          el uso de las canchas.
        </p>
      </section>
      <section className="cliente-opciones">
        <div className="opcion-card">
          <div className="opcion-icono">📋</div>

          <h2>Reservas</h2>

          <p>
            Consulta las reservas de los clientes y revisa sus fechas, horarios,
            canchas y estados.
          </p>

          <button onClick={() => navigate("/colaborador/reservas")}>
            Ver reservas
          </button>
        </div>

        <div className="opcion-card">
          <div className="opcion-icono">🏟️</div>

          <h2>Disponibilidad</h2>

          <p>
            Consulta los horarios disponibles de las canchas según la fecha y el
            tipo de cancha seleccionado.
          </p>

          <button onClick={() => navigate("/colaborador/disponibilidad")}>
            Ver disponibilidad
          </button>
        </div>
      </section>
    </div>
  );
}

export default ColaboradorHome;
