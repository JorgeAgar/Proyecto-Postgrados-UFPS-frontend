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
import AspiranteCriterios from "./vistas/aspirante/AspiranteCriterios.tsx";
// import Registro from "./vistas/Registro"; agregar cuando este listo el registro

// Vistas del superadmin
import LoginSuperAdmin from "./vistas/superadmin/SuperadminLogin.tsx";
import SuperadminLayout from "./layouts/SuperadminLayout.tsx";
import SuperadminInicio from "./vistas/superadmin/SuperadminInicio.tsx";
import SuperadminUsuarios from "./vistas/superadmin/SuperadminUsuarios.tsx";
import SuperadminCohortes from "./vistas/superadmin/SuperadminCohortes.tsx";

// Recuperación de contraseña (ruta compartida por todos los roles)
import RecuperarPassword from "./vistas/RecuperarPassword.tsx";

// Vistas del director de programa
import ProgramaLogin from "./vistas/programa/ProgramaLogin.tsx";
import ProgramaInicio from "./vistas/programa/ProgramaInicio.tsx";
import ProgramaDocumentos from "./vistas/programa/documentos/ProgramaDocumentos.tsx";
import CrearCohorte from "./vistas/programa/cohorte/CrearCohorte.tsx";
import ProgramaLayout from "./layouts/ProgramaLayout.tsx";
import Cohortes from "./vistas/programa/cohorte/Cohortes.tsx";
import Criterios from "./vistas/programa/Criterios.tsx";
import ValidacionDocumentos from "./vistas/programa/validacion/ValidacionDocumentos.tsx";
import ValidacionCohorteDetalle from "./vistas/programa/validacion/ValidacionCohorteDetalle.tsx";
import ValidacionAspiranteDetalle from "./vistas/programa/validacion/ValidacionAspiranteDetalle.tsx";
import Calificacion from "./vistas/programa/calificacion/Calificacion.tsx";
import CalificacionCohorte from "./vistas/programa/calificacion/CalificacionCohorte.tsx";
import CalificacionAspirante from "./vistas/programa/calificacion/CalificacionAspirante.tsx";
import ProgramaAdmitidos from "./vistas/programa/ProgramaAdmitidos.tsx";
import EditarCohorte from "./vistas/programa/cohorte/EditarCohorte.tsx";

// Vistas de posgrados
import Posgrados from "./vistas/posgrados/Posgrados.tsx";
import PosgradosLogin from "./vistas/posgrados/PosgradosLogin.tsx";
import PosgradosLayout from "./layouts/PosgradosLayout.tsx";
import Registro from "./vistas/Registro.tsx";

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
        <Route path="registro" element={<Registro />} />
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
          <Route path="documentos" element={<ProgramaDocumentos />} />
          <Route path="editar-cohorte/:id" element={<EditarCohorte />} />
          <Route path="criterios" element={<Criterios />} />
          <Route path="validacion" element={<ValidacionDocumentos />} />
          <Route path="validacion/cohorte/:cohorteId" element={<ValidacionCohorteDetalle />} />
          <Route path="validacion/aspirantes/:cohorteId/:aspiranteId" element={<ValidacionAspiranteDetalle />} />
          <Route path="admision/calificacion" element={<Calificacion />} />
          <Route path="admision/calificacion/cohorte/:cohorteId" element={<CalificacionCohorte />} />
          <Route path="admision/calificacion/:id" element={<CalificacionAspirante />} />
          <Route path="admision/admitidos" element={<ProgramaAdmitidos />} />
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
          <Route path="criterios" element={<AspiranteCriterios />} />
          {/* <Route path="/registro" element={<Registro />} />
          descomentar y conectar cuando estén listas:
          <Route path="/recuperar-clave" element={<RecuperarClave />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
        </Route>

        {/* Rutas del usuario posgrados */}
        <Route path="posgrados/login" element={<PosgradosLogin />} />
        <Route path="posgrados" element={<PosgradosLayout />}>
          <Route index element={<Posgrados />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
