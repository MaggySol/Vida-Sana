import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import ClienteHome from "./pages/cliente/ClienteHome";
import ColaboradorHome from "./pages/colaborador/ColaboradorHome";
import AdministradorHome from "./pages/administrador/AdministradorHome";
import Disponibilidad from "./pages/cliente/Disponibilidad";
import MisReservas from "./pages/cliente/MisReservas";
import ReservasColaborador from "./pages/colaborador/ReservasColaborador";
import DisponibilidadColaborador from "./pages/colaborador/DisponibilidadColaborador";
import Registro from "./pages/Registro";
import GestionCanchas from "./pages/administrador/GestionCanchas";
import GestionReservas from "./pages/administrador/GestionReservas";
import DisponibilidadAdministrador from "./pages/administrador/DisponibilidadAdministrador";
import GestionUsuariosAdministrador from "./pages/administrador/GestionUsuariosAdministrador";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      {" "}
      <Routes>
        {/* Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Cliente */}
        <Route
          path="/cliente"
          element={
            <ProtectedRoute roles={["cliente"]}>
              <Layout>
                <ClienteHome />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente/disponibilidad"
          element={
            <ProtectedRoute roles={["cliente"]}>
              <Layout>
                <Disponibilidad />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente/reservas"
          element={
            <ProtectedRoute roles={["cliente"]}>
              <Layout>
                <MisReservas />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Colaborador */}
        <Route
          path="/colaborador"
          element={
            <ProtectedRoute roles={["colaborador"]}>
              <Layout>
                <ColaboradorHome />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/colaborador/reservas"
          element={
            <ProtectedRoute roles={["colaborador"]}>
              <Layout>
                <ReservasColaborador />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/colaborador/disponibilidad"
          element={
            <ProtectedRoute roles={["colaborador"]}>
              <Layout>
                <DisponibilidadColaborador />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Administrador */}
        <Route
          path="/administrador"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <Layout>
                <AdministradorHome />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/administrador/canchas"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <Layout>
                <GestionCanchas />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/administrador/reservas"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <Layout>
                <GestionReservas />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/administrador/disponibilidad"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <Layout>
                <DisponibilidadAdministrador />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/administrador/usuarios"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <Layout>
                <GestionUsuariosAdministrador />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
