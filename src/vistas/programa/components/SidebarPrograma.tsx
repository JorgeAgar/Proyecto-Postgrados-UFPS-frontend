import { NavLink, useNavigate } from "react-router";
//import type { ReactElement } from "react";
import ufpsLogo from "../../../assets/logoufps.png";

function InicioIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
    </svg>
  );
}

function CohorteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M7 17h10" />
    </svg>
  );
}

function CrearCohorteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />
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

function UfpsLogoIcon() {
  return <img src={ufpsLogo} alt="UFPS" className="h-9 w-auto shrink-0 drop-shadow-sm" />;
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Inicio", to: "/programa/inicio", Icon: InicioIcon },
  { label: "Crear cohorte", to: "/programa/crear-cohorte", Icon: CrearCohorteIcon },
  { label: "Cohortes", to: "/programa/cohortes", Icon: CohorteIcon },
];

export default function SidebarPrograma({ mobileOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const sessionRaw = localStorage.getItem("ufps_programa_session");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  const handleLogout = () => {
    localStorage.removeItem("ufps_programa_session");
    localStorage.removeItem("ufps_programa_access_token");
    localStorage.removeItem("ufps_programa_refresh_token");
    navigate("/");
  };

  const sidebarContent = (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 bg-red-700 text-white">
        <UfpsLogoIcon />
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-widest uppercase text-red-200 leading-none">UFPS</p>
          <p className="text-[13px] font-semibold leading-tight mt-0.5 truncate">Sistema de Postgrados</p>
        </div>
      </div>

      {session && (
        <div className="animate-fade-in px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Sesión activa</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{session.displayName ?? session.username}</p>
          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-red-700 text-white rounded px-2 py-0.5">Director</span>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, to, Icon }, idx) => (
          <div key={to} className={`animate-slide-left delay-${200 + idx * 100}`}>
            <NavLink to={to} onClick={onClose} className={({ isActive }) => [
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive ? "bg-red-700 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            ].join(" ") }>
              <Icon />
              <span className="truncate">{label}</span>
            </NavLink>
          </div>
        ))}
      </nav>

      <div className="animate-fade-in delay-600 px-3 py-3 border-t border-gray-100">
        <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors">
          <LogoutIcon />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden md:flex md:shrink-0">
        <div className="w-64 flex flex-col h-screen sticky top-0">{sidebarContent}</div>
      </div>

      <div className={["fixed inset-0 z-40 md:hidden", "transition-all duration-300 ease-in-out", mobileOpen ? "visible" : "invisible"].join(" ") }>
        <div onClick={onClose} aria-hidden className={["absolute inset-0 bg-black/40 backdrop-blur-sm", mobileOpen ? "opacity-100" : "opacity-0"].join(" ") } />
        <div className={["absolute left-0 top-0 h-full w-64 z-50 shadow-2xl", mobileOpen ? "translate-x-0" : "-translate-x-full", "transition-transform duration-300 ease-in-out"].join(" ") }>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
