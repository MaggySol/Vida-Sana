import { useNavigate } from "react-router-dom";

function AdministradorHome() {
  const navigate = useNavigate();

  return (
    <div className="cliente-home">
      {" "}
      <section className="cliente-bienvenida">
        {" "}
        <p className="cliente-etiqueta">Administración</p>
        <h1>Panel del Administrador</h1>
        <p>
          Gestiona las canchas, reservas y disponibilidad del complejo deportivo
          Vida Sana.
        </p>
      </section>
      <section className="cliente-opciones">
        <div className="opcion-card">
          <div className="opcion-icono">🏟️</div>

          <h2>Gestión de canchas</h2>

          <p>
            Crea, modifica y deshabilita las canchas del complejo deportivo.
          </p>

          <button onClick={() => navigate("/administrador/canchas")}>
            Gestionar canchas
          </button>
        </div>

        <div className="opcion-card">
          <div className="opcion-icono">📋</div>

          <h2>Gestión de reservas</h2>

          <p>
            Consulta las reservas y registra aquellas que hayan sido utilizadas.
          </p>

          <button onClick={() => navigate("/administrador/reservas")}>
            Gestionar reservas
          </button>
        </div>

        <div className="opcion-card">
          <div className="opcion-icono">🔎</div>

          <h2>Disponibilidad</h2>

          <p>Consulta la disponibilidad de las canchas según tipo y fecha.</p>

          <button onClick={() => navigate("/administrador/disponibilidad")}>
            Consultar disponibilidad
          </button>
        </div>

        <div className="opcion-card">
          <div className="opcion-icono">👥</div>

          <h2>Gestión de usuarios</h2>

          <p>Administra los usuarios y sus roles dentro del sistema.</p>

          <button onClick={() => navigate("/administrador/usuarios")}>
            Gestionar usuarios
          </button>
        </div>
      </section>
    </div>
  );
}

export default AdministradorHome;
