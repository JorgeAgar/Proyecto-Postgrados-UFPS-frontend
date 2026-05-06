import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import "./index.css";
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

// Vistas del superadmin
import LoginSuperAdmin from "./vistas/superadmin/SuperadminLogin.tsx";
import SuperAdminDashboard from "./vistas/superadmin/SuperadminInicio.tsx";

// Comite Curricular
import LoginComiteCurricular from "./vistas/comite/ComiteLogin.tsx";
import ComiteCurricularLayout from "./layouts/ComiteCurricularLayout.tsx";
import ComiteInicio from "./vistas/comite/ComiteInicio.tsx";
import VerCriterios from "./vistas/comite/criterios/ComiteCriterios.tsx";
import DefinirCriterio from "./vistas/comite/criterios/ComiteDefinirCriterio.tsx";
import EditarCriterio from "./vistas/comite/criterios/ComiteEditarCriterio.tsx";
import VerEntrevistas from "./vistas/comite/entrevista/ComiteEntrevistas.tsx";
import AgendarEntrevista from "./vistas/comite/entrevista/ComiteAgendarEntrevista.tsx";
import ReagendarEntrevista from "./vistas/comite/entrevista/ComiteReagendarEntrevista.tsx";
import ComitePruebas from "./vistas/comite/prueba/ComitePruebas.tsx";
import ComiteCrearPrueba from "./vistas/comite/prueba/ComiteCrearPrueba.tsx";
import ComiteEditarPrueba from "./vistas/comite/prueba/ComiteEditarPrueba.tsx";
import {
  DecisionAdmision,
  ListaAdmitidos,
  NotificarAdmitidos,
} from "./vistas/comite/admision/AdmisionViews.tsx";

// Recuperación de contraseña (ruta compartida por todos los roles)
import RecuperarPassword from "./vistas/RecuperarPassword.tsx";
import ProgramaLogin from "./vistas/programa/ProgramaLogin.tsx";
import ProgramaInicio from "./vistas/programa/ProgramaInicio.tsx";
import CrearCohorte from "./vistas/programa/CrearCohorte.tsx";
import ProgramaLayout from "./layouts/ProgramaLayout.tsx";

import Cohortes from "./vistas/programa/Cohortes.tsx";

// Vistas del director de facultad
import FacultadLogin from "./vistas/facultad/FacultadLogin.tsx";
import FacultadLayout from "./vistas/facultad/FacultadLayout.tsx";
import FacultadProgramas from "./vistas/facultad/FacultadProgramas.tsx";
import FacultadProgramaDetalle from "./vistas/facultad/FacultadProgramaDetalle.tsx";
import FacultadCrearPrograma from "./vistas/facultad/FacultadCrearPrograma.tsx";
import EditarCohorte from "./vistas/programa/EditarCohorte.tsx";

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
        <Route path="/registro" element={<FormInscripcion />} />
        {/* Recuperación de contraseña — ruta compartida por todos los roles        */}
        {/* Recibe query params: ?loginRuta=/ruta-del-login&rol=NombreRol            */}
        {/* Ejemplo: /recuperar-password?loginRuta=/comite/login&rol=... */}
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        {/* ── Rutas del superadmin ── */}
        <Route path="/superadmin/login" element={<LoginSuperAdmin />} />
        <Route path="/superadmin/inicio" element={<SuperAdminDashboard />} />
        {/* ── Rutas del funcionario (sin sidebar del aspirante) ── */}
        <Route path="/funcionario/home" element={<FuncionarioHome />} />
        <Route
          path="/funcionario/dashboard"
          element={<FuncionarioDashboard />}
        />
        {/* Rutas del director de programa ── */}
        <Route path="programa/login" element={<ProgramaLogin />} />
        <Route path="programa" element={<ProgramaLayout />}>
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<ProgramaInicio />} />
          <Route path="crear-cohorte" element={<CrearCohorte />} />
          <Route path="cohortes" element={<Cohortes />} />
          <Route path="editar-cohorte/:id" element={<EditarCohorte />} />
        </Route>
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
        <Route path="/comite/login" element={<LoginComiteCurricular />} />
        //Rutas del comité curricular: layout con sidebar específico
        <Route path="/comite" element={<ComiteCurricularLayout />}>
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<ComiteInicio />} />
          <Route path="criterios" element={<VerCriterios />} />
          <Route path="criterios/definir" element={<DefinirCriterio />} />
          <Route path="criterios/editar" element={<EditarCriterio />} />
          <Route path="entrevista" element={<VerEntrevistas />} />
          <Route path="entrevista/agendar" element={<AgendarEntrevista />} />
          <Route
            path="entrevista/reagendar"
            element={<ReagendarEntrevista />}
          />
          <Route path="prueba" element={<ComitePruebas />} />
          <Route path="prueba/crear" element={<ComiteCrearPrueba />} />
          <Route path="prueba/editar" element={<ComiteEditarPrueba />} />
          <Route path="admision" element={<DecisionAdmision />} />
          <Route path="admision/lista" element={<ListaAdmitidos />} />
          <Route path="admision/notificar" element={<NotificarAdmitidos />} />
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
