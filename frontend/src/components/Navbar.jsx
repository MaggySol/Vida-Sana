import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const cerrarSesion = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("usuario");

    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-contenido">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <strong>Vida Sana</strong>
          <span>Complejo deportivo</span>
        </div>

        {usuario && (
          <div className="navbar-usuario">
            <div>
              <strong>{usuario.nombre}</strong>
              <span>{usuario.rol}</span>
            </div>

            <button onClick={cerrarSesion}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
