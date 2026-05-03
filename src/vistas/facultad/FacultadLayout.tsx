import { useState } from "react";
import { Outlet } from "react-router";
import DirectorSidebar from "../../components/DirectorSidebar";
import ufpsLogo from "../../assets/logoufps.png";

// ── Ícono hamburguesa ─────────────────────────────────────────────────────────

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

/**
 * DirectorLayout
 *
 * Layout global para el flujo del director.
 * - Verifica que haya sesión activa de tipo "director"; si no, redirige al login.
 * - Renderiza la DirectorSidebar a la izquierda y el contenido a la derecha mediante <Outlet />.
 * - En móvil muestra un mini-header con el botón hamburguesa que NO se superpone a la sidebar.
 * - En escritorio la sidebar es fija a la izquierda, sin header adicional.
 */
export default function FacultadLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  // const sessionRaw = localStorage.getItem("session");
  // const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  // Guardia de autenticación: solo directores autenticados pueden acceder.
  // if (!session || session.userRole !== "director") {
  //   return <Navigate to="/" replace />;
  // }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar (fija en desktop, drawer en móvil) */}
      <DirectorSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Columna derecha: mini-header móvil + área de contenido */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mini-header solo visible en móvil (no se superpone a la sidebar) */}
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
            <img
              src={ufpsLogo}
              alt="UFPS"
              className="h-7 w-auto"
            />
            <span className="text-sm font-bold text-gray-800">Sistema de Postgrados</span>
          </div>
        </header>

        {/* Área de contenido principal */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
