import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import SidebarPrograma from "../vistas/programa/components/SidebarPrograma";

export default function ProgramaLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SidebarPrograma mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-30">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">Sistema de Postgrados</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* CrearCohorte ahora se renderiza vía la ruta /programa/crear-cohorte como componente del Outlet */}
    </div>
  );
}
