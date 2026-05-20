import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import "./index.css";

// Layout global del aspirante (incluye Sidebar)
import AspiranteLayout from "./layouts/AspiranteLayout.tsx";

// Vistas del aspirante (se renderizan dentro del layout)
import AspiranteLogin from "./vistas/aspirante/AspiranteLogin.tsx";
import AspiranteInicio from "./vistas/aspirante/AspiranteInicio.tsx";
import AspiranteEstado from "./vistas/aspirante/AspiranteEstado.tsx";
import AspiranteDocumentos from "./vistas/aspirante/AspiranteDocumentos.tsx";
import AspiranteEntrevista from "./vistas/aspirante/AspiranteEntrevista.tsx";
import AspirantePrueba from "./vistas/aspirante/AspirantePrueba.tsx";
import FormInscripcion from "./vistas/FormInscripcion.tsx";
// import Registro from "./vistas/Registro"; agregar cuando este listo el registro

// Vistas del superadmin
import LoginSuperAdmin from "./vistas/superadmin/SuperadminLogin.tsx";
import SuperadminLayout from "./layouts/SuperadminLayout.tsx";
import SuperadminInicio from "./vistas/superadmin/SuperadminInicio.tsx";
import SuperadminUsuarios from "./vistas/superadmin/SuperadminUsuarios.tsx";
import SuperadminCohortes from "./vistas/superadmin/SuperadminCohortes.tsx";

// Recuperación de contraseña (ruta compartida por todos los roles)
import RecuperarPassword from "./vistas/RecuperarPassword.tsx";
import ProgramaLogin from "./vistas/programa/ProgramaLogin.tsx";
import ProgramaInicio from "./vistas/programa/ProgramaInicio.tsx";
import CrearCohorte from "./vistas/programa/CrearCohorte.tsx";
import ProgramaLayout from "./layouts/ProgramaLayout.tsx";

import Cohortes from "./vistas/programa/Cohortes.tsx";
import Calificacion from "./vistas/programa/calificacion/Calificacion.tsx";
import CalificacionAspirante from "./vistas/programa/calificacion/CalificacionAspirante.tsx";

// Vistas del director de facultad
import FacultadLogin from "./vistas/facultad/FacultadLogin.tsx";
import FacultadLayout from "./vistas/facultad/FacultadLayout.tsx";
import FacultadProgramas from "./vistas/facultad/FacultadProgramas.tsx";
import FacultadProgramaDetalle from "./vistas/facultad/FacultadProgramaDetalle.tsx";
import FacultadCrearPrograma from "./vistas/facultad/FacultadCrearPrograma.tsx";
import EditarCohorte from "./vistas/programa/EditarCohorte.tsx";
import ValidacionDocumentos from "./vistas/programa/validacion/ValidacionDocumentos.tsx";
import ValidacionCohorteDetalle from "./vistas/programa/validacion/ValidacionCohorteDetalle.tsx";
import ValidacionAspiranteDetalle from "./vistas/programa/validacion/ValidacionAspiranteDetalle.tsx";

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
        {/* ── Raíz: redirige al login del aspirante ── */}
        <Route path="/" element={<Navigate to="/programa/login" replace />} />
        {/* ── Rutas públicas ── */}
        <Route path="aspirante/login" element={<AspiranteLogin />} />
        <Route path="registro" element={<FormInscripcion />} />
        {/* Recuperación de contraseña — ruta compartida por todos los roles        */}
        {/* Recibe query params: ?loginRuta=/ruta-del-login&rol=NombreRol            */}
        {/* Ejemplo: /recuperar-password?loginRuta=/comite/login&rol=... */}
        <Route path="recuperar-password" element={<RecuperarPassword />} />

        {/* ── Rutas del superadmin ── */}
        <Route path="superadmin/login" element={<LoginSuperAdmin />} />
        <Route path="superadmin" element={<SuperadminLayout />}>
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<SuperadminInicio />} />
          <Route path="usuarios" element={<SuperadminUsuarios />} />
          <Route path="cohortes" element={<SuperadminCohortes />} />
        </Route>

        {/* Rutas del director de programa ── */}
        <Route path="programa/login" element={<ProgramaLogin />} />
        <Route path="programa" element={<ProgramaLayout />}>
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<ProgramaInicio />} />
          <Route path="crear-cohorte" element={<CrearCohorte />} />
          <Route path="cohortes" element={<Cohortes />} />
          <Route path="editar-cohorte/:id" element={<EditarCohorte />} />
          <Route path="admision/calificacion" element={<Calificacion />} />
          <Route path="admision/calificacion/:id" element={<CalificacionAspirante />} />
          <Route path="admision/admitidos" element={<span className="p-8 text-gray-500">Admitidos — próximamente</span>} />
          <Route path="validacion" element={<ValidacionDocumentos />} />
          <Route path="validacion/cohortes/:cohorteId" element={<ValidacionCohorteDetalle />} />
          <Route path="validacion/aspirantes/:aspiranteId" element={<ValidacionAspiranteDetalle />} />
        </Route>

        {/* ── Rutas del aspirante: layout con Sidebar ── */}
        <Route path="/aspirante" element={<AspiranteLayout />}>
          {/* /aspirante → redirige automáticamente a /aspirante/inicio */}
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<AspiranteInicio />} />
          <Route path="estado" element={<AspiranteEstado />} />
          <Route path="documentos" element={<AspiranteDocumentos />} />
          <Route path="entrevista" element={<AspiranteEntrevista />} />
          <Route path="pagos" element={<span className="p-8 block text-gray-500">Pagos — próximamente</span>} />
          <Route path="prueba" element={<AspirantePrueba />} />
          {/* <Route path="/registro" element={<Registro />} />
          descomentar y conectar cuando estén listas:
          <Route path="/recuperar-clave" element={<RecuperarClave />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
        </Route>

        {/* ── Rutas del director de facultad: layout con DirectorSidebar ── */}
        <Route path="facultad">
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<FacultadLogin />} />
          <Route element={<FacultadLayout />}>
            <Route index element={<Navigate to="inicio" replace />} />
            <Route path="inicio" element={<span>director inicio</span>} />
            <Route path="programas" element={<FacultadProgramas />} />
            <Route
              path="programa/:programa"
              element={<FacultadProgramaDetalle />}
            />
            <Route path="crear-programa" element={<FacultadCrearPrograma />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
