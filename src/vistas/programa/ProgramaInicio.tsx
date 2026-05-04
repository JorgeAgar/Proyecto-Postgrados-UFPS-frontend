import { useState } from "react";
import SidebarPrograma from "./components/SidebarPrograma";
import type { ComponentType } from "react";
import ufpsLogo from "../../assets/logoufps.png";

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

interface ShortcutCardProps {
  title: string;
  desc: string;
  Icon: ComponentType<unknown>;
}

function ShortcutCard({ title, desc, Icon }: ShortcutCardProps) {
  return (
    <div className="h-full rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-start gap-4">
        <div className="rounded-lg p-3 bg-red-100 text-red-700">
          <Icon />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{desc}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-md bg-red-700 px-3 py-2 text-white font-semibold hover:bg-red-800">Abrir</button>
      </div>
    </div>
  );
}

function CreateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21v-3l11-11 3 3L7 21H4z" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 14h3v4H7zM11 10h3v8h-3zM15 6h3v12h-3z" />
    </svg>
  );
}

export default function ProgramaInicio() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SidebarPrograma mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-30">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-700 transition-colors">
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <img src={ufpsLogo} alt="UFPS" className="h-7 w-auto" />
            <span className="text-sm font-bold text-gray-800">Sistema de Postgrados</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Inicio</h1>
              <p className="text-sm text-gray-600 mt-1">Panel de control — accesos rápidos</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              <ShortcutCard title="Crear cohorte" desc="Inicia el proceso para crear una nueva cohorte." Icon={CreateIcon} />
              <ShortcutCard title="Editar cohorte" desc="Busca y edita cohorte existentes." Icon={EditIcon} />
              <ShortcutCard title="Reportes" desc="Genera y descarga reportes del programa." Icon={ReportIcon} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
