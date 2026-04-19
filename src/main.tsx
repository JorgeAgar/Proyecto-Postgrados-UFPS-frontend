import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import Login from "./vistas/Login.tsx";
import FuncionarioHome from "./vistas/funcionario/FuncionarioHome.tsx";
import FuncionarioDashboard from "./vistas/funcionario/FuncionarioDashboard.tsx";
// import Registro from "./vistas/Registro"; agregar cuando este listo el registro

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <BrowserRouter>
//       <Login />
//     </BrowserRouter>
//   </StrictMode>,
// );

/**
 * Punto de entrada de la aplicación.
 *
 * Rutas definidas:
 *   /           → Vista de login (autenticación)
 *   /registro   → Vista de registro (pendiente de implementar por el equipo)
 *
 * TODO: agregar aquí las rutas de las demás vistas a medida que se desarrollen,
 * por ejemplo: /recuperar-clave, /dashboard, etc.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/funcionario/home" element={<FuncionarioHome />} />
        <Route path="/funcionario/dashboard" element={<FuncionarioDashboard />} />
        {/* <Route path="/registro" element={<Registro />} />
          descomentar y conectar cuando estén listas:
          <Route path="/recuperar-clave" element={<RecuperarClave />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
