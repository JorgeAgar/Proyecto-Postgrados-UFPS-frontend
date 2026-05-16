import { useState } from "react";
import { Outlet, Navigate } from "react-router";
import SuperadminSidebar from "../vistas/superadmin/components/Sidebar";
import ufpsLogo from "../assets/logoufps.png";
import { superadminAuthService } from "../services/superadminService";

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function SuperadminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = superadminAuthService.getSession();

  if (!session) {
    return <Navigate to="/superadmin/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <SuperadminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mini-header solo en móvil */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-30">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="p-2 rounded-lg text-gray-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <img src={ufpsLogo} alt="UFPS" className="h-7 w-auto" />
            <span className="text-sm font-bold text-gray-800">Superadministrador</span>
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
