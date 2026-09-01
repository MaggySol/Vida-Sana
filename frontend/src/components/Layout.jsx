import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <>
      {" "}
      <Navbar />
      <main className="contenido-principal">{children}</main>
    </>
  );
}

export default Layout;
