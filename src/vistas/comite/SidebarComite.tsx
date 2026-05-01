import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import type { ReactElement } from "react";
import ufpsLogo from "../../assets/logoufps.png";
import { comiteAuthService } from "../../services/comiteService";

// ── Íconos ───────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
    </svg>
  );
}

function CriteriosIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M9 17h6" />
    </svg>
  );
}

function EntrevistaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function PruebaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
}

function AdmisionIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 17l5-5-5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 4H5a1 1 0 00-1 1v14a1 1 0 001 1h5" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Tipos ────────────────────────────────────────────────────────────────────

interface SidebarComiteProps {
  mobileOpen: boolean;
  onClose: () => void;
}

interface SubItem {
  label: string;
  to: string;
}

interface NavGroup {
  label: string;
  Icon: () => ReactElement;
  base: string; // ruta base para detectar si el grupo está activo
  items: SubItem[];
}

// ── Datos de navegación ──────────────────────────────────────────────────────

const BASE = "/comite";

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Criterios de evaluación",
    Icon: CriteriosIcon,
    base: `${BASE}/criterios`,
    items: [
      { label: "Ver criterios", to: `${BASE}/criterios` },
      { label: "Definir criterio", to: `${BASE}/criterios/definir` },
      // { label: "Editar criterio", to: `${BASE}/criterios/editar` },
    ],
  },
  {
    label: "Entrevista",
    Icon: EntrevistaIcon,
    base: `${BASE}/entrevista`,
    items: [
      { label: "Ver entrevistas", to: `${BASE}/entrevista` },
      { label: "Agendar entrevista", to: `${BASE}/entrevista/agendar` },
      // { label: "Reagendar entrevista", to: `${BASE}/entrevista/reagendar` },
    ],
  },
  {
    label: "Prueba de admisión",
    Icon: PruebaIcon,
    base: `${BASE}/prueba`,
    items: [
      { label: "Ver pruebas", to: `${BASE}/prueba` },
      { label: "Crear prueba", to: `${BASE}/prueba/crear` },
      // { label: "Editar prueba", to: `${BASE}/prueba/editar` },
    ],
  },
  {
    label: "Admisión",
    Icon: AdmisionIcon,
    base: `${BASE}/admision`,
    items: [
      { label: "Admitir / Rechazar aspirantes", to: `${BASE}/admision` },
      { label: "Generar lista de admitidos", to: `${BASE}/admision/lista` },
      { label: "Notificar admitidos", to: `${BASE}/admision/notificar` },
    ],
  },
];

// ── Subcomponente: grupo colapsable con animación de apertura Y cierre ────────

function NavGroupItem({
  group,
  delay,
  onClose,
}: {
  group: NavGroup;
  delay: string;
  onClose: () => void;
}) {
  const { Icon, label, items, base } = group;
  const isGroupActive = window.location.pathname.startsWith(base);
  const [open, setOpen] = useState(isGroupActive);

  return (
    <div className={`animate-slide-left ${delay}`}>
      {/* Botón del grupo */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={[
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isGroupActive && !open
            ? "bg-red-50 text-red-700"
            : open
            ? "bg-red-50 text-red-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        ].join(" ")}
      >
        <Icon />
        <span className="flex-1 text-left truncate">{label}</span>
        <ChevronIcon open={open} />
      </button>

      {/*
        Submenú con animación fluida de apertura y cierre.
        Usamos max-height + opacity + translate-y para un efecto suave en ambas
        direcciones. No hay display:none, así la transición CSS puede ejecutarse
        completamente tanto al abrir como al cerrar.
      */}
      <div
        className={[
          "ml-4 pl-3 border-l-2 border-red-100 mt-0.5 mb-0.5 space-y-0.5 overflow-hidden",
          "transition-all duration-300 ease-in-out",
          open
            ? "max-h-64 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-1 pointer-events-none",
        ].join(" ")}
      >
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={onClose}
            className={({ isActive }) =>
              [
                "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                isActive
                  ? "bg-red-700 text-white shadow-sm"
                  : "text-gray-500 hover:bg-red-50 hover:text-red-700",
              ].join(" ")
            }
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function SidebarComite({ mobileOpen, onClose }: SidebarComiteProps) {
  const navigate = useNavigate();
  const session = comiteAuthService.getSession();

  const handleLogout = () => {
    comiteAuthService.logout();
    navigate("/comite/login");
  };

  const DELAYS = ["delay-200", "delay-300", "delay-400", "delay-500"];

  const sidebarContent = (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-red-700 text-white">
        <img src={ufpsLogo} alt="UFPS" className="animate-fade-in h-9 w-auto shrink-0 drop-shadow-sm" />
        <div className="min-w-0">
          <p className="animate-fade-in text-[11px] font-bold tracking-widest uppercase text-red-200 leading-none">UFPS</p>
          <p className="animate-fade-in text-[13px] font-semibold leading-tight mt-0.5 truncate">Comité Curricular</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="ml-auto p-1 rounded hover:bg-white/20 transition-colors md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Sesión activa */}
      {session && (
        <div className="animate-fade-in px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Sesión activa</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{session.displayName}</p>
          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-red-700 text-white rounded px-2 py-0.5">
            Comité Curricular
          </span>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {/* Home */}
        <div className="animate-slide-left delay-100">
          <NavLink
            to={`${BASE}/inicio`}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-red-700 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              ].join(" ")
            }
          >
            <HomeIcon />
            <span className="truncate">Inicio</span>
          </NavLink>
        </div>

        {/* Grupos con submenús */}
        {NAV_GROUPS.map((group, idx) => (
          <NavGroupItem
            key={group.base}
            group={group}
            delay={DELAYS[idx]}
            onClose={onClose}
          />
        ))}
      </nav>

      {/* Cerrar sesión */}
      <div className="animate-fade-in delay-600 px-3 py-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogoutIcon />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: sidebar fija */}
      <div className="hidden md:flex md:shrink-0">
        <div className="w-64 flex flex-col h-screen sticky top-0">
          {sidebarContent}
        </div>
      </div>

      {/* Móvil: drawer overlay */}
      <div
        className={[
          "fixed inset-0 z-40 md:hidden",
          "transition-all duration-300 ease-in-out",
          mobileOpen ? "visible" : "invisible",
        ].join(" ")}
      >
        <div
          onClick={onClose}
          aria-hidden="true"
          className={[
            "absolute inset-0 bg-black/40 backdrop-blur-sm",
            "transition-opacity duration-300 ease-in-out",
            mobileOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
        <div
          className={[
            "absolute left-0 top-0 h-full w-64 z-50 shadow-2xl",
            "transition-transform duration-300 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}