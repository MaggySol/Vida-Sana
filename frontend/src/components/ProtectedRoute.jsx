import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("access_token");
  const usuarioGuardado = localStorage.getItem("usuario");

  // No hay sesión
  if (!token || !usuarioGuardado) {
    return <Navigate to="/" replace />;
  }

  const usuario = JSON.parse(usuarioGuardado);

  // El usuario no tiene el rol permitido
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
