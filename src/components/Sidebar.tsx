import { NavLink, useNavigate } from "react-router";
import type { ReactElement } from "react";
import { clearMockSession, readMockSession } from "../utils/mockAuth";
import ufpsLogo from "../assets/logoufps.png";

// ── Íconos ──────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 flex-shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 flex-shrink-0" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

function DocumentsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 flex-shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v6h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 13h6M10 17h6" />
    </svg>
  );
}

function InterviewIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 flex-shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function TestIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 flex-shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 flex-shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 17l5-5-5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 4H5a1 1 0 00-1 1v14a1 1 0 001 1h5" />
    </svg>
  );
}

function UfpsLogoIcon() {
  return (
    <img
      src={ufpsLogo}
      alt="Universidad Francisco de Paula Santander"
      className="animate-fade-in h-9 w-auto flex-shrink-0 drop-shadow-sm"
    />
  );
}

// ── Tipos ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  to: string;
  Icon: () => ReactElement;
}

// ── Datos de navegación ──────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", to: "/aspirante/inicio", Icon: HomeIcon },
  { label: "Estado del aspirante", to: "/aspirante/estado", Icon: StatusIcon },
  { label: "Documentos", to: "/aspirante/documentos", Icon: DocumentsIcon },
  { label: "Entrevista", to: "/aspirante/entrevista", Icon: InterviewIcon },
  { label: "Prueba", to: "/aspirante/prueba", Icon: TestIcon },
];

// Delays escalonados para los ítems de nav en desktop
const NAV_DELAYS = ["delay-200", "delay-300", "delay-400", "delay-500", "delay-600"];

// ── Componente ───────────────────────────────────────────────────────────────

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const session = readMockSession();

  const handleLogout = () => {
    clearMockSession();
    navigate("/");
  };

  const sidebarContent = (
    <aside
      className="
        flex flex-col h-full w-64
        bg-white border-r border-gray-100
        shadow-sm
      "
    >
      {/* ── Header / Branding ── */}
      <div className="flex items-center gap-3 px-5 py-4 bg-red-700 text-white">
        <UfpsLogoIcon />
        <div className="min-w-0">
          <p className="animate-fade-in text-[11px] font-bold tracking-widest uppercase text-red-200 leading-none">UFPS</p>
          <p className="animate-fade-in text-[13px] font-semibold leading-tight mt-0.5 truncate">Sistema de Postgrados</p>
        </div>
        {/* Botón cerrar solo en móvil */}
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

      {/* ── Sesión activa ── */}
      {session && (
        <div className="animate-fade-in px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Sesión activa</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{session.displayName}</p>
          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-red-700 text-white rounded px-2 py-0.5">
            Aspirante
          </span>
        </div>
      )}

      {/* ── Navegación ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, to, Icon }, idx) => (
          // El wrapper div recibe la animación de entrada con su delay escalonado.
          // El NavLink queda completamente libre de delays para que el hover sea instantáneo.
          <div key={to} className={`animate-slide-left ${NAV_DELAYS[idx]}`}>
            <NavLink
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  // ✅ transition-colors en lugar de transition-all:
                  // solo anima background-color y color, nunca hereda animation-delay del padre.
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-700 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                ].join(" ")
              }
            >
              <Icon />
              <span className="truncate">{label}</span>
            </NavLink>
          </div>
        ))}
      </nav>

      {/* ── Cerrar sesión ── */}
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
      {/* ── Desktop: sidebar fija ── */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 flex flex-col h-screen sticky top-0">
          {sidebarContent}
        </div>
      </div>

      {/* ── Móvil: drawer overlay con animación ── */}
      <div
        className={[
          "fixed inset-0 z-40 md:hidden",
          "transition-all duration-300 ease-in-out",
          mobileOpen ? "visible" : "invisible",
        ].join(" ")}
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          aria-hidden="true"
          className={[
            "absolute inset-0 bg-black/40 backdrop-blur-sm",
            "transition-opacity duration-300 ease-in-out",
            mobileOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
        {/* Panel */}
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