import { NavLink, useNavigate } from "react-router";
import ufpsLogoBlanco from "../../../assets/BLANCOufps.png";
import { superadminAuthService } from "../../../services/superadminService";

// ── Íconos ───────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function CohorteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
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

// ── Tipos ────────────────────────────────────────────────────────────────────

interface SuperadminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

// ── Datos de navegación ──────────────────────────────────────────────────────

const BASE = "/superadmin";

const NAV_ITEMS = [
  { label: "Inicio",   to: `${BASE}/inicio`,   Icon: HomeIcon },
  { label: "Usuarios", to: `${BASE}/usuarios`, Icon: UsersIcon },
  { label: "Cohortes", to: `${BASE}/cohortes`, Icon: CohorteIcon },
];

const DELAYS = ["delay-100", "delay-200", "delay-300"];

// ── Componente principal ──────────────────────────────────────────────────────

export default function SuperadminSidebar({ mobileOpen, onClose }: SuperadminSidebarProps) {
  const navigate = useNavigate();
  const session = superadminAuthService.getSession();

  const handleLogout = () => {
    superadminAuthService.logout();
    navigate("/superadmin/login");
  };

  const sidebarContent = (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-900 text-white">
        <img
          src={ufpsLogoBlanco}
          alt="UFPS"
          className="animate-fade-in h-9 w-auto shrink-0 drop-shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <p className="animate-fade-in text-[11px] font-bold tracking-widest uppercase text-slate-300 leading-none">
            UFPS
          </p>
          <p className="animate-fade-in text-[13px] font-semibold leading-tight mt-0.5 truncate">
            Superadministrador
          </p>
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
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
            Sesión activa
          </p>
          <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">
            {session.displayName ?? session.username}
          </p>
          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white rounded px-2 py-0.5">
            Superadmin
          </span>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, to, Icon }, idx) => (
          <div key={to} className={`animate-slide-left ${DELAYS[idx]}`}>
            <NavLink
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
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

      {/* Cerrar sesión */}
      <div className="animate-fade-in delay-600 px-3 py-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
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
        <div className="w-64 flex flex-col h-screen sticky top-0">{sidebarContent}</div>
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
