import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import "./index.css";
import Login from "./vistas/Login.tsx";
import FuncionarioHome from "./vistas/funcionario/FuncionarioHome.tsx";
import FuncionarioDashboard from "./vistas/funcionario/FuncionarioDashboard.tsx";

// Layout global del aspirante (incluye Sidebar)
import AspiranteLayout from "./layouts/AspiranteLayout.tsx";

// Vistas del aspirante (se renderizan dentro del layout)
import AspiranteInicio from "./vistas/aspirante/AspiranteInicio.tsx";
import AspiranteEstado from "./vistas/aspirante/AspiranteEstado.tsx";
import AspiranteDocumentos from "./vistas/aspirante/AspiranteDocumentos.tsx";
import AspiranteEntrevista from "./vistas/aspirante/AspiranteEntrevista.tsx";
import AspirantePrueba from "./vistas/aspirante/AspirantePrueba.tsx";
import FormInscripcion from "./vistas/FormInscripcion.tsx";
// import Registro from "./vistas/Registro"; agregar cuando este listo el registro

/**
 * Punto de entrada de la aplicación.
 *
 * Rutas definidas:
 *   /                        → Vista de login (autenticación)
 *   /funcionario/home        → Home del funcionario
 *   /funcionario/dashboard   → Dashboard del funcionario
 *
 *   /aspirante/*             → Rutas anidadas bajo AspiranteLayout (con Sidebar)
 *     /aspirante/inicio      → Home del aspirante
 *     /aspirante/estado      → Estado del proceso del aspirante
 *     /aspirante/documentos  → Gestión de documentos
 *     /aspirante/entrevista  → Información de entrevista
 *     /aspirante/prueba      → Prueba de admisión
 *
 *    /registro                   → Formulario de inscripción (público)
 * TODO: agregar /recuperar-clave cuando estén listos.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ── Rutas públicas ── */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<FormInscripcion />} />

        {/* ── Rutas del funcionario (sin sidebar del aspirante) ── */}
        <Route path="/funcionario/home" element={<FuncionarioHome />} />
        <Route path="/funcionario/dashboard" element={<FuncionarioDashboard />} />

        {/* ── Rutas del aspirante: layout con Sidebar ── */}
        <Route path="/aspirante" element={<AspiranteLayout />}>
          {/* /aspirante → redirige automáticamente a /aspirante/inicio */}
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<AspiranteInicio />} />
          <Route path="estado" element={<AspiranteEstado />} />
          <Route path="documentos" element={<AspiranteDocumentos />} />
          <Route path="entrevista" element={<AspiranteEntrevista />} />
          <Route path="prueba" element={<AspirantePrueba />} />
          {/* <Route path="/registro" element={<Registro />} />
          descomentar y conectar cuando estén listas:
          <Route path="/recuperar-clave" element={<RecuperarClave />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
