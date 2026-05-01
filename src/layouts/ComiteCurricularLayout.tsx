import { useState } from "react";
import { Outlet, Navigate } from "react-router";
import SidebarComite from "../vistas/comite/SidebarComite";
import ufpsLogo from "../assets/logoufps.png";
import { comiteAuthService } from "../services/comiteService";

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

/**
 * ComiteCurricularLayout
 *
 * Layout protegido para el módulo Comité Curricular.
 * - Verifica sesión activa en ufps_comite_session; si no existe, redirige al login.
 * - Sidebar a la izquierda con submenús animados.
 * - En móvil: mini-header con hamburguesa que abre el drawer.
 */
export default function ComiteCurricularLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = comiteAuthService.getSession();

  if (!session) {
    return <Navigate to="/comite/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <SidebarComite mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Columna principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mini-header solo en móvil */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-30">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-700 transition-colors"
          >
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <img src={ufpsLogo} alt="UFPS" className="h-7 w-auto" />
            <span className="text-sm font-bold text-gray-800">Comité Curricular</span>
          </div>
        </header>

        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
